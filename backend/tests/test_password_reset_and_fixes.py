"""
Test suite for Password Reset, Image Upload URL, and PayPal Live Mode
Testing the correcciones for Olivo Cards:
1. Image upload returns correct URL (olivo-cards-preview.preview.emergentagent.com)
2. Password reset endpoints work correctly
3. Plans show correct trial info (Profesional has 15 days trial)
"""

import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@vcardpro.com"
ADMIN_PASSWORD = "admin123"
TEST_USER_EMAIL = "testpwreset@test.com"
TEST_USER_PASSWORD = "Test123!"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def admin_token(api_client):
    """Get admin authentication token"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Admin authentication failed - skipping admin tests")


@pytest.fixture(scope="module")
def admin_client(api_client, admin_token):
    """Session with admin auth header"""
    api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
    return api_client


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_api_root(self, api_client):
        """Test API root endpoint is accessible"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ API root accessible: {data.get('message')}")


class TestPasswordReset:
    """Password reset endpoint tests"""
    
    def test_request_password_reset_endpoint_exists(self, api_client):
        """Test that request-password-reset endpoint exists"""
        response = api_client.post(f"{BASE_URL}/api/auth/request-password-reset", json={
            "email": "test@example.com"
        })
        # Should return 200 even for non-existent emails (security)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ Request password reset endpoint works: {data.get('message')}")
    
    def test_request_password_reset_with_admin_email(self, api_client):
        """Test request password reset with admin email"""
        response = api_client.post(f"{BASE_URL}/api/auth/request-password-reset", json={
            "email": ADMIN_EMAIL
        })
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ Password reset request for admin email: {data.get('message')}")
    
    def test_reset_password_endpoint_exists(self, api_client):
        """Test that reset-password endpoint exists"""
        response = api_client.post(f"{BASE_URL}/api/auth/reset-password", json={
            "email": "nonexistent@test.com",
            "new_password": "NewPass123!"
        })
        # Should return 404 for non-existent user
        assert response.status_code == 404
        print("✅ Reset password endpoint exists (returns 404 for non-existent user)")
    
    def test_reset_password_validation_short_password(self, api_client):
        """Test password validation - too short"""
        response = api_client.post(f"{BASE_URL}/api/auth/reset-password", json={
            "email": ADMIN_EMAIL,
            "new_password": "12345"  # Too short (< 6 chars)
        })
        assert response.status_code == 400
        data = response.json()
        assert "6 caracteres" in data.get("detail", "")
        print("✅ Password validation works - rejects short password")
    
    def test_reset_password_for_admin(self, api_client):
        """Test resetting password for admin user (then restore)"""
        # Reset to a new password
        new_pass = "TempPass123!"
        response = api_client.post(f"{BASE_URL}/api/auth/reset-password", json={
            "email": ADMIN_EMAIL,
            "new_password": new_pass
        })
        assert response.status_code == 200
        print("✅ Password reset successful")
        
        # Verify login with new password
        login_response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": new_pass
        })
        assert login_response.status_code == 200
        print("✅ Login with new password works")
        
        # Restore original password
        restore_response = api_client.post(f"{BASE_URL}/api/auth/reset-password", json={
            "email": ADMIN_EMAIL,
            "new_password": ADMIN_PASSWORD
        })
        assert restore_response.status_code == 200
        print("✅ Original password restored")
        
        # Verify original password works
        final_login = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert final_login.status_code == 200
        print("✅ Login with original password works")


class TestImageUpload:
    """Image upload URL correctness tests"""
    
    def test_image_upload_returns_correct_url(self, admin_client):
        """Test that image upload returns URL with correct domain"""
        # Create a simple test image (1x1 pixel PNG)
        png_bytes = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,  # bit depth, color type
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  # IDAT chunk
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
            0x01, 0x01, 0x00, 0x05, 0xFE, 0xCD, 0xA1, 0x3E,
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,  # IEND chunk
            0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {'file': ('test_image.png', io.BytesIO(png_bytes), 'image/png')}
        
        # Remove content-type header for multipart upload
        headers = dict(admin_client.headers)
        headers.pop('Content-Type', None)
        
        response = requests.post(
            f"{BASE_URL}/api/upload/image",
            files=files,
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "url" in data
        url = data["url"]
        
        # Check that URL contains correct domain
        expected_domain = "olivo-cards-preview.preview.emergentagent.com"
        assert expected_domain in url, f"URL should contain {expected_domain}, got: {url}"
        
        # Check URL format
        assert url.startswith("https://")
        assert "/uploads/" in url
        
        print(f"✅ Image upload returns correct URL: {url}")


class TestPlans:
    """Plans endpoint tests"""
    
    def test_plans_endpoint_returns_data(self, api_client):
        """Test that plans endpoint returns plan data"""
        response = api_client.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✅ Plans endpoint returns {len(data)} plans")
    
    def test_profesional_plan_has_15_days_trial(self, api_client):
        """Test that Profesional plan has 15 days trial"""
        response = api_client.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        plans = response.json()
        
        profesional_plan = None
        for plan in plans:
            if plan.get("name") == "Profesional":
                profesional_plan = plan
                break
        
        assert profesional_plan is not None, "Profesional plan not found"
        trial_days = profesional_plan.get("trial_days", 0)
        assert trial_days == 15, f"Expected 15 trial days, got {trial_days}"
        print(f"✅ Profesional plan has {trial_days} days trial")
    
    def test_plans_have_required_fields(self, api_client):
        """Test that plans have required fields"""
        response = api_client.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        plans = response.json()
        
        required_fields = ["id", "name", "price", "features", "max_cards"]
        
        for plan in plans:
            for field in required_fields:
                assert field in plan, f"Plan {plan.get('name')} missing field: {field}"
        
        print("✅ All plans have required fields")


class TestPayPalSettings:
    """PayPal settings tests"""
    
    def test_paypal_client_id_endpoint(self, api_client):
        """Test public PayPal client ID endpoint"""
        response = api_client.get(f"{BASE_URL}/api/settings/paypal-client-id")
        assert response.status_code == 200
        data = response.json()
        
        assert "mode" in data
        assert "has_secret" in data
        
        # Check if configured
        if data.get("client_id"):
            print(f"✅ PayPal configured - Mode: {data.get('mode')}, Has Secret: {data.get('has_secret')}")
        else:
            print("⚠️ PayPal not configured (client_id is null)")
    
    def test_admin_paypal_settings(self, admin_client):
        """Test admin PayPal settings endpoint"""
        # Need to use admin token
        response = admin_client.get(f"{BASE_URL}/api/admin/settings")
        assert response.status_code == 200
        data = response.json()
        
        assert "paypal_mode" in data
        mode = data.get("paypal_mode")
        print(f"✅ Admin PayPal settings - Mode: {mode}")
        
        # According to agent note, it should be in live mode now
        if mode == "live":
            print("✅ PayPal is in LIVE mode as expected")
        else:
            print(f"⚠️ PayPal is in {mode} mode (expected: live)")


class TestPayPalSubscription:
    """PayPal subscription creation tests"""
    
    def test_paypal_subscription_create_returns_approval_url(self, admin_client):
        """Test PayPal subscription creation returns approval URL"""
        # First get a paid plan
        plans_response = admin_client.get(f"{BASE_URL}/api/plans")
        assert plans_response.status_code == 200
        plans = plans_response.json()
        
        # Find a paid plan with PayPal plan ID
        paid_plan = None
        for plan in plans:
            if plan.get("price", 0) > 0 and plan.get("paypal_plan_id"):
                paid_plan = plan
                break
        
        if not paid_plan:
            pytest.skip("No paid plan with PayPal plan ID found")
        
        # Try to create subscription
        response = admin_client.post(f"{BASE_URL}/api/subscriptions/paypal/create", json={
            "plan_id": paid_plan["id"],
            "return_url": "https://example.com/return",
            "cancel_url": "https://example.com/cancel"
        })
        
        if response.status_code == 400 and "no está configurado" in response.json().get("detail", "").lower():
            pytest.skip("PayPal not configured for recurring payments")
        
        assert response.status_code == 200, f"Failed to create PayPal subscription: {response.text}"
        data = response.json()
        
        assert "subscription_id" in data
        assert "approval_url" in data
        
        approval_url = data.get("approval_url")
        assert approval_url is not None
        assert "paypal.com" in approval_url
        
        print(f"✅ PayPal subscription created with approval URL")
        print(f"   Subscription ID: {data.get('subscription_id')}")


class TestVCardForm:
    """VCard form related tests"""
    
    def test_vcards_endpoint_requires_auth(self, api_client):
        """Test that VCards endpoint requires authentication"""
        # Remove auth header
        api_client.headers.pop("Authorization", None)
        
        response = api_client.get(f"{BASE_URL}/api/vcards")
        assert response.status_code in [401, 403]
        print("✅ VCards endpoint requires authentication")
    
    def test_vcards_endpoint_with_auth(self, admin_client):
        """Test VCards endpoint with authentication"""
        response = admin_client.get(f"{BASE_URL}/api/vcards")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ VCards endpoint returns {len(data)} cards")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
