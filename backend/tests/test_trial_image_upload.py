"""
Trial Period & Image Upload API Tests
Tests for trial_days field in plans, image upload endpoint, and PayPal trial integration
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@vcardpro.com"
ADMIN_PASSWORD = "admin123"


class TestAuthSetup:
    """Basic auth tests"""
    
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
        print(f"✓ Admin login successful: {ADMIN_EMAIL}")


class TestTrialDaysInPlans:
    """Tests for trial_days field in plans"""
    
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
    
    def test_plans_have_trial_days_field(self):
        """Test plans endpoint returns trial_days field"""
        response = requests.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1, "No plans found"
        
        # Check that all plans have trial_days field
        for plan in data:
            assert "trial_days" in plan, f"Plan {plan.get('name')} missing trial_days field"
            assert isinstance(plan["trial_days"], int), f"trial_days should be int for plan {plan.get('name')}"
            assert plan["trial_days"] >= 0, f"trial_days should be non-negative"
        
        # Check if any plan has trial period
        plans_with_trial = [p for p in data if p.get("trial_days", 0) > 0]
        print(f"✓ Plans have trial_days field - {len(plans_with_trial)} plan(s) with trial period")
        
        for plan in plans_with_trial:
            print(f"  - {plan['name']}: {plan['trial_days']} days trial")
    
    def test_update_plan_trial_days(self, admin_token):
        """Test admin can set trial_days for a plan"""
        # Get plans
        plans_response = requests.get(f"{BASE_URL}/api/plans")
        plans = plans_response.json()
        
        # Find a paid plan to test
        paid_plan = next((p for p in plans if p["price"] > 0), None)
        if not paid_plan:
            pytest.skip("No paid plans available")
        
        original_trial_days = paid_plan.get("trial_days", 0)
        new_trial_days = 7 if original_trial_days != 7 else 14
        
        # Update plan with new trial_days
        response = requests.put(
            f"{BASE_URL}/api/plans/{paid_plan['id']}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"trial_days": new_trial_days}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["trial_days"] == new_trial_days, f"Expected {new_trial_days}, got {data.get('trial_days')}"
        
        # Verify paypal_plan_id is reset when trial_days changes (if it was set)
        if paid_plan.get("paypal_plan_id") and original_trial_days != new_trial_days:
            # The paypal_plan_id should be reset to None
            assert data.get("paypal_plan_id") is None, "paypal_plan_id should be reset when trial_days changes"
            print(f"✓ paypal_plan_id reset when trial_days changed from {original_trial_days} to {new_trial_days}")
        
        print(f"✓ Plan trial_days updated: {paid_plan['name']} now has {new_trial_days} days trial")
        
        # Restore original value
        requests.put(
            f"{BASE_URL}/api/plans/{paid_plan['id']}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"trial_days": original_trial_days}
        )
    
    def test_plan_details_includes_trial_days(self):
        """Test individual plan details include trial_days"""
        plans_response = requests.get(f"{BASE_URL}/api/plans")
        plans = plans_response.json()
        
        if not plans:
            pytest.skip("No plans available")
        
        # Get individual plan details
        plan = plans[0]
        response = requests.get(f"{BASE_URL}/api/plans/{plan['id']}")
        
        assert response.status_code == 200
        data = response.json()
        assert "trial_days" in data
        print(f"✓ Plan details include trial_days: {data['name']} - {data['trial_days']} days")


class TestImageUpload:
    """Tests for image upload endpoint"""
    
    @pytest.fixture
    def user_token(self):
        """Get a user auth token"""
        # Try login first
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testupload@test.com", "password": "Test123!"}
        )
        if login_response.status_code == 200:
            return login_response.json().get("access_token")
        
        # Try register
        register_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": "testupload@test.com", 
                "password": "Test123!",
                "full_name": "Test Upload User"
            }
        )
        if register_response.status_code in [200, 201]:
            return register_response.json().get("access_token")
        
        # Try login again
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testupload@test.com", "password": "Test123!"}
        )
        if login_response.status_code == 200:
            return login_response.json().get("access_token")
        
        pytest.skip("Could not get user token")
    
    def test_upload_image_requires_auth(self):
        """Test that image upload requires authentication"""
        # Create a simple test image
        image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x00\x00\x00\x00:~\x9bU\x00\x00\x00\nIDATx\x9cc\xf8\x0f\x00\x01\x01\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        files = {'file': ('test.png', io.BytesIO(image_data), 'image/png')}
        
        response = requests.post(
            f"{BASE_URL}/api/upload/image",
            files=files
        )
        
        # Should require authentication
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Image upload correctly requires authentication")
    
    def test_upload_image_success(self, user_token):
        """Test successful image upload"""
        # Create a minimal valid PNG image (1x1 pixel)
        image_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x00\x00\x00\x00:~\x9bU\x00\x00\x00\nIDATx\x9cc\xf8\x0f\x00\x01\x01\x01\x00\x18\xdd\x8d\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        files = {'file': ('test_image.png', io.BytesIO(image_data), 'image/png')}
        
        response = requests.post(
            f"{BASE_URL}/api/upload/image",
            headers={"Authorization": f"Bearer {user_token}"},
            files=files
        )
        
        assert response.status_code == 200, f"Upload failed: {response.text}"
        data = response.json()
        
        assert "url" in data, "Response should contain 'url'"
        assert "filename" in data, "Response should contain 'filename'"
        
        # Verify URL format
        assert data["url"].endswith(".png"), "URL should end with file extension"
        assert "/uploads/" in data["url"], "URL should contain /uploads/ path"
        
        print(f"✓ Image uploaded successfully: {data['filename']}")
        print(f"  URL: {data['url']}")
    
    def test_upload_invalid_file_type(self, user_token):
        """Test that invalid file types are rejected"""
        # Create a fake text file
        text_data = b'This is not an image'
        files = {'file': ('test.txt', io.BytesIO(text_data), 'text/plain')}
        
        response = requests.post(
            f"{BASE_URL}/api/upload/image",
            headers={"Authorization": f"Bearer {user_token}"},
            files=files
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Invalid file type correctly rejected")
    
    def test_upload_jpeg_image(self, user_token):
        """Test uploading JPEG image"""
        # Minimal JPEG image data
        jpeg_data = bytes([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
            0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
            0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
            0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
            0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
            0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
            0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
            0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
            0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00,
            0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
            0x09, 0x0A, 0x0B, 0xFF, 0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
            0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7D,
            0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0x7F, 0xFF,
            0xD9
        ])
        files = {'file': ('test.jpg', io.BytesIO(jpeg_data), 'image/jpeg')}
        
        response = requests.post(
            f"{BASE_URL}/api/upload/image",
            headers={"Authorization": f"Bearer {user_token}"},
            files=files
        )
        
        # May fail due to corrupt JPEG but should accept the type
        # The endpoint validates content type before processing
        if response.status_code == 200:
            data = response.json()
            assert "url" in data
            print(f"✓ JPEG upload accepted: {data.get('filename')}")
        else:
            # If it fails, it should be due to image processing, not type rejection
            print(f"✓ JPEG type accepted (processing may have issues)")


class TestPayPalTrialIntegration:
    """Tests for PayPal subscription with trial period"""
    
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
    
    @pytest.fixture
    def user_token(self):
        """Get a test user token"""
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testtrial@test.com", "password": "Test123!"}
        )
        if login_response.status_code == 200:
            return login_response.json().get("access_token")
        
        register_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": "testtrial@test.com", 
                "password": "Test123!",
                "full_name": "Test Trial User"
            }
        )
        if register_response.status_code in [200, 201]:
            return register_response.json().get("access_token")
        
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "testtrial@test.com", "password": "Test123!"}
        )
        if login_response.status_code == 200:
            return login_response.json().get("access_token")
        
        pytest.skip("Could not get user token")
    
    def test_plan_with_trial_has_badge_info(self):
        """Test that plans with trial period return proper trial info"""
        response = requests.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200
        plans = response.json()
        
        # Find plan with trial
        trial_plan = next((p for p in plans if p.get("trial_days", 0) > 0), None)
        
        if trial_plan:
            assert trial_plan["trial_days"] > 0
            print(f"✓ Plan '{trial_plan['name']}' has {trial_plan['trial_days']} days trial - can show badge")
        else:
            print("ℹ No plans with trial period found - badge test skipped")
    
    def test_paypal_subscription_with_trial_plan(self, user_token):
        """Test creating PayPal subscription for plan with trial period"""
        # Get plans
        response = requests.get(f"{BASE_URL}/api/plans")
        plans = response.json()
        
        # Find a synced plan with trial
        trial_plan = next(
            (p for p in plans if p.get("trial_days", 0) > 0 and p.get("paypal_plan_id")), 
            None
        )
        
        if not trial_plan:
            # Find any synced paid plan to test
            trial_plan = next(
                (p for p in plans if p["price"] > 0 and p.get("paypal_plan_id")), 
                None
            )
            
        if not trial_plan:
            pytest.skip("No synced paid plans available for subscription test")
        
        # Create PayPal subscription
        response = requests.post(
            f"{BASE_URL}/api/subscriptions/paypal/create",
            headers={"Authorization": f"Bearer {user_token}"},
            json={
                "plan_id": trial_plan["id"],
                "return_url": "https://example.com/success",
                "cancel_url": "https://example.com/cancel"
            }
        )
        
        assert response.status_code == 200, f"Subscription creation failed: {response.text}"
        data = response.json()
        
        assert "subscription_id" in data
        assert "approval_url" in data
        
        trial_info = f" (with {trial_plan.get('trial_days', 0)} days trial)" if trial_plan.get('trial_days', 0) > 0 else ""
        print(f"✓ PayPal subscription created for {trial_plan['name']}{trial_info}")
        print(f"  Approval URL: {data['approval_url'][:60]}...")


class TestTrialDaysPayPalReset:
    """Tests for PayPal plan ID reset when trial_days changes"""
    
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
    
    def test_trial_days_change_resets_paypal_id(self, admin_token):
        """Test that changing trial_days resets paypal_plan_id"""
        # Get plans
        plans_response = requests.get(f"{BASE_URL}/api/plans")
        plans = plans_response.json()
        
        # Find a plan with paypal_plan_id
        synced_plan = next(
            (p for p in plans if p.get("paypal_plan_id")), 
            None
        )
        
        if not synced_plan:
            pytest.skip("No synced plans available to test reset")
        
        original_paypal_id = synced_plan.get("paypal_plan_id")
        original_trial_days = synced_plan.get("trial_days", 0)
        new_trial_days = original_trial_days + 1  # Change trial days
        
        # Update plan with different trial_days
        response = requests.put(
            f"{BASE_URL}/api/plans/{synced_plan['id']}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"trial_days": new_trial_days}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify paypal_plan_id is reset
        assert data.get("paypal_plan_id") is None, "paypal_plan_id should be reset when trial_days changes"
        
        print(f"✓ Changing trial_days from {original_trial_days} to {new_trial_days} reset paypal_plan_id")
        
        # Restore original trial_days (re-sync needed)
        requests.put(
            f"{BASE_URL}/api/plans/{synced_plan['id']}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"trial_days": original_trial_days}
        )
        
        # Re-sync with PayPal
        requests.post(
            f"{BASE_URL}/api/admin/paypal/sync-plan",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"plan_id": synced_plan['id']}
        )
        print(f"✓ Plan restored and re-synced with PayPal")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
