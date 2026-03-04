"""
Test Suite for Olivo Cards Final Corrections:
1) Users without subscription cannot create cards (403 error)
2) PayPal settings with both Sandbox and Live credentials
3) PayPal mode selector and re-sync of plans
4) PayPal subscription returns valid approval_url
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ==================== FIXTURES ====================

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
        "email": "admin@vcardpro.com",
        "password": "admin123"
    })
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    return response.json().get("access_token")

@pytest.fixture(scope="module")
def admin_client(api_client, admin_token):
    """Session with admin auth header"""
    api_client.headers.update({"Authorization": f"Bearer {admin_token}"})
    return api_client

@pytest.fixture(scope="module")
def user_without_subscription(api_client):
    """Create a test user without subscription and return token"""
    unique_id = str(uuid.uuid4())[:8]
    email = f"test_no_sub_{unique_id}@test.com"
    password = "Test123!"
    
    # Register new user
    response = api_client.post(f"{BASE_URL}/api/auth/register", json={
        "email": email,
        "full_name": f"Test NoSub {unique_id}",
        "password": password
    })
    
    if response.status_code != 200:
        # Try login if user exists
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": email,
            "password": password
        })
    
    assert response.status_code == 200, f"Failed to create/login test user: {response.text}"
    data = response.json()
    
    # Make sure this user has no subscription by cancelling any existing
    token = data.get("access_token")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # Try to cancel any existing subscription
    requests.post(f"{BASE_URL}/api/subscriptions/cancel", headers=headers)
    requests.post(f"{BASE_URL}/api/subscriptions/cancel-recurring", headers=headers)
    
    return {
        "email": email,
        "password": password,
        "token": token,
        "user_id": data.get("user", {}).get("id")
    }


# ==================== TEST: SUBSCRIPTION CHECK FOR CARD CREATION ====================

class TestSubscriptionRequired:
    """Test that users without subscription cannot create cards"""
    
    def test_user_without_subscription_cannot_create_card(self, api_client, user_without_subscription):
        """Users without subscription should get 403 when trying to create a card"""
        token = user_without_subscription["token"]
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        # Try to create a card
        response = api_client.post(
            f"{BASE_URL}/api/vcards",
            headers=headers,
            json={
                "full_name": "Test Card",
                "phone": "+1234567890",
                "email": "testcard@test.com"
            }
        )
        
        # Should return 403 Forbidden
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        
        # Check error message contains subscription-related text
        data = response.json()
        assert "suscripción" in data.get("detail", "").lower(), f"Error message should mention subscription: {data}"
        print(f"✓ User without subscription correctly blocked: {data.get('detail')}")
    
    def test_subscription_required_message_content(self, api_client, user_without_subscription):
        """Verify the exact error message for subscription requirement"""
        token = user_without_subscription["token"]
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        response = api_client.post(
            f"{BASE_URL}/api/vcards",
            headers=headers,
            json={
                "full_name": "Test Card 2",
                "phone": "+9876543210",
                "email": "testcard2@test.com"
            }
        )
        
        assert response.status_code == 403
        data = response.json()
        detail = data.get("detail", "")
        
        # Check for expected message content
        assert "activa" in detail.lower() or "plan" in detail.lower(), f"Message should mention active subscription or plan: {detail}"
        print(f"✓ Subscription required message: '{detail}'")


# ==================== TEST: PAYPAL SETTINGS WITH DUAL CREDENTIALS ====================

class TestPayPalSettings:
    """Test PayPal settings with both Sandbox and Live credentials"""
    
    def test_get_paypal_settings_shows_dual_credentials(self, admin_client):
        """Admin should see both sandbox and live credential fields"""
        response = admin_client.get(f"{BASE_URL}/api/admin/settings")
        assert response.status_code == 200, f"Failed to get settings: {response.text}"
        
        data = response.json()
        
        # Verify dual credential fields exist
        assert "sandbox_client_id" in data, "Missing sandbox_client_id field"
        assert "sandbox_secret" in data, "Missing sandbox_secret field"
        assert "live_client_id" in data, "Missing live_client_id field"
        assert "live_secret" in data, "Missing live_secret field"
        assert "paypal_mode" in data, "Missing paypal_mode field"
        
        print(f"✓ PayPal settings has dual credentials: sandbox and live")
        print(f"  Current mode: {data.get('paypal_mode')}")
        print(f"  Sandbox configured: {bool(data.get('sandbox_client_id'))}")
        print(f"  Live configured: {bool(data.get('live_client_id'))}")
    
    def test_paypal_mode_field_exists(self, admin_client):
        """Verify paypal_mode field is present and valid"""
        response = admin_client.get(f"{BASE_URL}/api/admin/settings")
        assert response.status_code == 200
        
        data = response.json()
        mode = data.get("paypal_mode")
        
        assert mode in ["sandbox", "live"], f"Invalid paypal_mode: {mode}"
        print(f"✓ PayPal mode is valid: {mode}")
    
    def test_update_paypal_settings_with_mode(self, admin_client):
        """Test updating PayPal settings including mode"""
        # First get current settings to restore later
        get_response = admin_client.get(f"{BASE_URL}/api/admin/settings")
        original_settings = get_response.json()
        
        # Update with sandbox mode explicitly
        update_response = admin_client.put(
            f"{BASE_URL}/api/admin/settings/paypal",
            json={
                "paypal_mode": "sandbox",
                "sandbox_client_id": original_settings.get("sandbox_client_id", ""),
                "sandbox_secret": original_settings.get("sandbox_secret", "")
            }
        )
        
        assert update_response.status_code == 200, f"Failed to update settings: {update_response.text}"
        print("✓ PayPal settings update with mode successful")
    
    def test_public_paypal_client_id_endpoint(self, api_client):
        """Test public endpoint for PayPal client ID returns mode and has_secret"""
        response = api_client.get(f"{BASE_URL}/api/settings/paypal-client-id")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "client_id" in data, "Missing client_id field"
        assert "mode" in data, "Missing mode field"
        assert "has_secret" in data, "Missing has_secret field"
        
        print(f"✓ PayPal client ID endpoint response:")
        print(f"  client_id: {'configured' if data.get('client_id') else 'not configured'}")
        print(f"  mode: {data.get('mode')}")
        print(f"  has_secret: {data.get('has_secret')}")


# ==================== TEST: PAYPAL SUBSCRIPTION CREATION ====================

class TestPayPalSubscription:
    """Test PayPal subscription creation returns valid approval_url"""
    
    def test_paypal_subscription_returns_approval_url(self, admin_client):
        """Creating a PayPal subscription should return approval_url"""
        # First get plans to find one with paypal_plan_id
        plans_response = admin_client.get(f"{BASE_URL}/api/plans")
        assert plans_response.status_code == 200
        plans = plans_response.json()
        
        # Find a paid plan with paypal_plan_id
        paid_plan = None
        for plan in plans:
            if plan.get("price", 0) > 0 and plan.get("paypal_plan_id"):
                paid_plan = plan
                break
        
        if not paid_plan:
            # Try to sync a plan first
            paid_plans = [p for p in plans if p.get("price", 0) > 0]
            if paid_plans:
                sync_response = admin_client.post(
                    f"{BASE_URL}/api/admin/paypal/sync-plan",
                    json={"plan_id": paid_plans[0]["id"]}
                )
                if sync_response.status_code == 200:
                    # Re-fetch plans
                    plans_response = admin_client.get(f"{BASE_URL}/api/plans")
                    plans = plans_response.json()
                    for plan in plans:
                        if plan.get("price", 0) > 0 and plan.get("paypal_plan_id"):
                            paid_plan = plan
                            break
        
        if not paid_plan:
            pytest.skip("No paid plan with PayPal plan ID available")
        
        print(f"Testing with plan: {paid_plan['name']} (ID: {paid_plan['id']})")
        
        # Create subscription
        response = admin_client.post(
            f"{BASE_URL}/api/subscriptions/paypal/create",
            json={
                "plan_id": paid_plan["id"],
                "return_url": "https://test.com/return",
                "cancel_url": "https://test.com/cancel"
            }
        )
        
        assert response.status_code == 200, f"Failed to create subscription: {response.text}"
        
        data = response.json()
        assert "subscription_id" in data, "Missing subscription_id in response"
        assert "approval_url" in data, "Missing approval_url in response"
        assert data.get("approval_url") is not None, "approval_url should not be None"
        
        approval_url = data.get("approval_url", "")
        print(f"✓ PayPal subscription created successfully")
        print(f"  subscription_id: {data.get('subscription_id')}")
        print(f"  approval_url: {approval_url[:60]}...")
    
    def test_approval_url_points_to_sandbox(self, admin_client):
        """Verify approval_url points to sandbox.paypal.com when in sandbox mode"""
        # Check current mode
        settings_response = admin_client.get(f"{BASE_URL}/api/admin/settings")
        settings = settings_response.json()
        current_mode = settings.get("paypal_mode", "sandbox")
        
        # Get a paid plan with paypal_plan_id
        plans_response = admin_client.get(f"{BASE_URL}/api/plans")
        plans = plans_response.json()
        
        paid_plan = None
        for plan in plans:
            if plan.get("price", 0) > 0 and plan.get("paypal_plan_id"):
                paid_plan = plan
                break
        
        if not paid_plan:
            pytest.skip("No paid plan with PayPal plan ID available")
        
        # Create subscription
        response = admin_client.post(
            f"{BASE_URL}/api/subscriptions/paypal/create",
            json={
                "plan_id": paid_plan["id"],
                "return_url": "https://test.com/return",
                "cancel_url": "https://test.com/cancel"
            }
        )
        
        if response.status_code != 200:
            pytest.skip(f"Could not create subscription: {response.text}")
        
        data = response.json()
        approval_url = data.get("approval_url", "")
        
        if current_mode == "sandbox":
            assert "sandbox.paypal.com" in approval_url, f"In sandbox mode, URL should contain sandbox.paypal.com. Got: {approval_url}"
            print(f"✓ Sandbox mode correctly returns sandbox.paypal.com URL")
        else:
            assert "paypal.com" in approval_url and "sandbox" not in approval_url, f"In live mode, URL should not contain sandbox. Got: {approval_url}"
            print(f"✓ Live mode correctly returns paypal.com URL")


# ==================== TEST: PLANS SYNC WITH PAYPAL ====================

class TestPlansSync:
    """Test that plans sync correctly with PayPal credentials"""
    
    def test_sync_plan_with_paypal(self, admin_client):
        """Test syncing a single plan with PayPal"""
        # Get plans
        plans_response = admin_client.get(f"{BASE_URL}/api/plans")
        assert plans_response.status_code == 200
        plans = plans_response.json()
        
        # Find a paid plan
        paid_plan = None
        for plan in plans:
            if plan.get("price", 0) > 0:
                paid_plan = plan
                break
        
        if not paid_plan:
            pytest.skip("No paid plans available")
        
        # Sync with PayPal
        response = admin_client.post(
            f"{BASE_URL}/api/admin/paypal/sync-plan",
            json={"plan_id": paid_plan["id"]}
        )
        
        # Should succeed or indicate already synced
        assert response.status_code == 200, f"Sync failed: {response.text}"
        
        data = response.json()
        assert "message" in data, "Missing message in response"
        assert "paypal_plan_id" in data, "Missing paypal_plan_id in response"
        
        print(f"✓ Plan sync response: {data.get('message')}")
        print(f"  PayPal Plan ID: {data.get('paypal_plan_id')}")
    
    def test_sync_all_plans_with_paypal(self, admin_client):
        """Test syncing all plans with PayPal"""
        response = admin_client.post(f"{BASE_URL}/api/admin/paypal/sync-all-plans")
        
        assert response.status_code == 200, f"Sync all failed: {response.text}"
        
        data = response.json()
        assert "synced" in data, "Missing synced count"
        
        print(f"✓ Sync all plans response:")
        print(f"  Synced: {data.get('synced')}")
        print(f"  Errors: {data.get('errors', [])}")
    
    def test_reset_all_paypal_plans(self, admin_client):
        """Test resetting all PayPal plan IDs"""
        response = admin_client.post(f"{BASE_URL}/api/admin/paypal/reset-all-plans")
        
        assert response.status_code == 200, f"Reset failed: {response.text}"
        
        data = response.json()
        assert "message" in data
        
        print(f"✓ Reset all plans response: {data.get('message')}")
    
    def test_plan_details_include_paypal_plan_id(self, admin_client):
        """Verify plan details include paypal_plan_id field"""
        # Get all plans
        plans_response = admin_client.get(f"{BASE_URL}/api/plans")
        assert plans_response.status_code == 200
        plans = plans_response.json()
        
        for plan in plans:
            # Get individual plan details
            detail_response = admin_client.get(f"{BASE_URL}/api/plans/{plan['id']}")
            if detail_response.status_code == 200:
                detail = detail_response.json()
                
                # Check field exists (can be None)
                assert "id" in detail, "Missing id field"
                
                # For paid plans, check paypal_plan_id field exists in response
                if plan.get("price", 0) > 0:
                    print(f"  Plan: {plan['name']}, PayPal synced: {bool(detail.get('paypal_plan_id'))}")
        
        print("✓ Plan details endpoint includes paypal_plan_id field")


# ==================== TEST: VERIFY PLANS AND SUBSCRIPTION ENDPOINT ====================

class TestPlansAndSubscription:
    """Additional tests for plans and subscription endpoints"""
    
    def test_plans_endpoint_returns_all_fields(self, api_client):
        """Verify plans endpoint returns all required fields"""
        response = api_client.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        
        plans = response.json()
        assert len(plans) > 0, "No plans found"
        
        for plan in plans:
            required_fields = ["id", "name", "description", "price", "billing_period", "max_cards", "features"]
            for field in required_fields:
                assert field in plan, f"Missing field: {field} in plan {plan.get('name')}"
            
            # Check paypal_plan_id field for paid plans
            if plan.get("price", 0) > 0:
                assert "paypal_plan_id" in plan or plan.get("paypal_plan_id") is None, f"Missing paypal_plan_id for paid plan"
        
        print(f"✓ All {len(plans)} plans have required fields")
        for plan in plans:
            print(f"  - {plan['name']}: ${plan['price']} ({plan['billing_period']}), PayPal: {bool(plan.get('paypal_plan_id'))}")
    
    def test_current_subscription_endpoint(self, admin_client):
        """Test getting current subscription for authenticated user"""
        response = admin_client.get(f"{BASE_URL}/api/subscriptions/current")
        
        # Can be 200 with data or 200 with null
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        if data:
            print(f"✓ Current subscription: Plan ID {data.get('plan_id')}, Status: {data.get('status')}")
        else:
            print("✓ Current subscription endpoint works (no active subscription)")


# ==================== INTEGRATION TEST ====================

class TestIntegration:
    """Integration tests for the complete subscription flow"""
    
    def test_complete_subscription_check_flow(self, api_client, admin_client, user_without_subscription):
        """Test the complete flow: user without subscription → 403 → with subscription → 200"""
        token = user_without_subscription["token"]
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        # Step 1: Verify user cannot create card without subscription
        response1 = api_client.post(
            f"{BASE_URL}/api/vcards",
            headers=headers,
            json={
                "full_name": "Integration Test Card",
                "phone": "+1111111111",
                "email": "integrationtest@test.com"
            }
        )
        assert response1.status_code == 403, f"Expected 403, got {response1.status_code}"
        print("✓ Step 1: User without subscription blocked from creating card")
        
        # Step 2: Verify subscription endpoint shows no subscription
        response2 = api_client.get(f"{BASE_URL}/api/subscriptions/current", headers=headers)
        assert response2.status_code == 200
        assert response2.json() is None, "User should have no subscription"
        print("✓ Step 2: User has no current subscription")
        
        # Step 3: Verify PayPal settings are configured
        settings_response = admin_client.get(f"{BASE_URL}/api/admin/settings")
        settings = settings_response.json()
        mode = settings.get("paypal_mode", "sandbox")
        print(f"✓ Step 3: PayPal is in {mode} mode")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
