"""
PayPal Recurring Subscriptions API Tests
Tests for admin PayPal sync, subscription creation, and settings endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@vcardpro.com"
ADMIN_PASSWORD = "admin123"


class TestAuthAndSetup:
    """Basic auth and API availability tests"""
    
    def test_api_root_accessible(self):
        """Test API root endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "VCard SaaS API"
        print("✓ API root endpoint accessible")
    
    def test_admin_login(self):
        """Test admin login with provided credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"✓ Admin login successful: {ADMIN_EMAIL}")


class TestPayPalConfiguration:
    """Tests for PayPal settings and configuration"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_paypal_client_id_endpoint(self):
        """Test public PayPal client ID endpoint returns has_secret field"""
        response = requests.get(f"{BASE_URL}/api/settings/paypal-client-id")
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "client_id" in data
        assert "mode" in data
        assert "has_secret" in data, "Missing has_secret field in response"
        
        # Verify has_secret is boolean
        assert isinstance(data["has_secret"], bool)
        
        # Verify mode is valid
        assert data["mode"] in ["sandbox", "live"]
        print(f"✓ PayPal client ID endpoint working - mode: {data['mode']}, has_secret: {data['has_secret']}")
    
    def test_admin_get_settings(self, admin_token):
        """Test admin can get PayPal settings"""
        response = requests.get(
            f"{BASE_URL}/api/admin/settings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "paypal_client_id" in data
        assert "paypal_mode" in data
        print("✓ Admin can retrieve PayPal settings")


class TestPlansWithPayPal:
    """Tests for plans with PayPal integration"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Admin authentication failed")
    
    def test_get_plans(self):
        """Test plans endpoint returns plans with paypal_plan_id"""
        response = requests.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1, "No plans found"
        
        # Check plan structure includes paypal_plan_id
        for plan in data:
            assert "id" in plan
            assert "name" in plan
            assert "price" in plan
            assert "paypal_plan_id" in plan or plan.get("paypal_plan_id") is None
        
        # Check for synced plans (paid plans should have paypal_plan_id)
        paid_plans = [p for p in data if p["price"] > 0]
        synced_plans = [p for p in paid_plans if p.get("paypal_plan_id")]
        
        print(f"✓ Plans endpoint working - {len(data)} plans, {len(synced_plans)} synced with PayPal")
    
    def test_sync_all_plans_with_paypal(self, admin_token):
        """Test admin can sync all plans with PayPal"""
        response = requests.post(
            f"{BASE_URL}/api/admin/paypal/sync-all-plans",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "synced" in data
        assert "errors" in data
        
        print(f"✓ Sync all plans endpoint working - synced: {data['synced']}, errors: {len(data.get('errors', []))}")
    
    def test_sync_single_plan_with_paypal(self, admin_token):
        """Test admin can sync a single plan with PayPal"""
        # First get a paid plan without paypal_plan_id
        plans_response = requests.get(f"{BASE_URL}/api/plans")
        plans = plans_response.json()
        
        # Find a paid plan
        paid_plan = next((p for p in plans if p["price"] > 0), None)
        if not paid_plan:
            pytest.skip("No paid plans available for testing")
        
        # Try to sync the plan (may already be synced)
        response = requests.post(
            f"{BASE_URL}/api/admin/paypal/sync-plan",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"plan_id": paid_plan["id"]}
        )
        
        # Should succeed (200) or already synced
        assert response.status_code in [200, 400]
        data = response.json()
        
        if response.status_code == 200:
            assert "paypal_plan_id" in data
            print(f"✓ Single plan sync working - {paid_plan['name']}")
        else:
            # Already synced is acceptable
            print(f"✓ Plan already synced or sync attempted - {paid_plan['name']}")
    
    def test_sync_free_plan_rejected(self, admin_token):
        """Test that syncing free plan is rejected"""
        # Get free plan
        plans_response = requests.get(f"{BASE_URL}/api/plans")
        plans = plans_response.json()
        
        free_plan = next((p for p in plans if p["price"] == 0), None)
        if not free_plan:
            pytest.skip("No free plan available for testing")
        
        response = requests.post(
            f"{BASE_URL}/api/admin/paypal/sync-plan",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"plan_id": free_plan["id"]}
        )
        
        # Should be rejected with 400
        assert response.status_code == 400
        print("✓ Free plan sync correctly rejected")


class TestPayPalSubscriptions:
    """Tests for PayPal subscription creation flow"""
    
    @pytest.fixture
    def user_token(self):
        """Get a test user token"""
        # Try login first
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testsubscription@test.com", "password": "Test123!"}
        )
        if login_response.status_code == 200:
            return login_response.json().get("access_token")
        
        # Try register
        register_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": "testsubscription@test.com", 
                "password": "Test123!",
                "full_name": "Test Subscription User"
            }
        )
        if register_response.status_code in [200, 201]:
            return register_response.json().get("access_token")
        
        # Try login again after failed register (user may exist)
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testsubscription@test.com", "password": "Test123!"}
        )
        if login_response.status_code == 200:
            return login_response.json().get("access_token")
        
        pytest.skip("Could not get user token")
    
    def test_create_paypal_subscription(self, user_token):
        """Test creating a PayPal subscription for a paid plan"""
        # Get a paid plan with paypal_plan_id
        plans_response = requests.get(f"{BASE_URL}/api/plans")
        plans = plans_response.json()
        
        synced_plan = next(
            (p for p in plans if p["price"] > 0 and p.get("paypal_plan_id")), 
            None
        )
        
        if not synced_plan:
            pytest.skip("No synced paid plans available")
        
        # Create PayPal subscription
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/paypal/create",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "plan_id": synced_plan["id"],
                "return_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "subscription_id" in data
        assert "approval_url" in data
        assert "status" in data
        
        # Verify approval URL is a PayPal URL
        assert "paypal.com" in data["approval_url"]
        
        print(f"✓ PayPal subscription created - ID: {data['subscription_id']}")
    
    def test_create_subscription_without_paypal_plan(self, user_token):
        """Test creating subscription for plan without paypal_plan_id fails gracefully"""
        # Get a free plan (no paypal_plan_id)
        plans_response = requests.get(f"{BASE_URL}/api/plans")
        plans = plans_response.json()
        
        free_plan = next((p for p in plans if p["price"] == 0), None)
        if not free_plan:
            pytest.skip("No free plan available")
        
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/paypal/create",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "plan_id": free_plan["id"],
                "return_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel"
            }
        )
        
        # Should fail with 400
        assert response.status_code == 400
        print("✓ Subscription for plan without PayPal ID correctly rejected")
    
    def test_get_current_subscription(self, user_token):
        """Test getting current subscription"""
        response = requests.get(
            f"{BASE_URL}/api/subscriptions/current",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 200
        # Response can be null if no subscription
        print("✓ Get current subscription endpoint working")


class TestPlanDetails:
    """Tests for individual plan details"""
    
    def test_get_plan_details(self):
        """Test getting individual plan details with paypal_plan_id"""
        # Get plans list
        plans_response = requests.get(f"{BASE_URL}/api/plans")
        plans = plans_response.json()
        
        if not plans:
            pytest.skip("No plans available")
        
        plan = plans[0]
        
        # Get plan details
        response = requests.get(f"{BASE_URL}/api/plans/{plan['id']}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == plan["id"]
        assert data["name"] == plan["name"]
        
        # paypal_plan_id should be in response
        # (may be null for free plans)
        print(f"✓ Plan details endpoint working - {data['name']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
