import requests
import sys
import json
from datetime import datetime

class VCardAPITester:
    def __init__(self, base_url="https://offline-qr-cards.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_vcard_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Raw response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_seed_plans(self):
        """Test seeding plans"""
        return self.run_test("Seed Plans", "POST", "seed-plans", 200)

    def test_get_plans(self):
        """Test getting all plans"""
        success, response = self.run_test("Get Plans", "GET", "plans", 200)
        if success and response:
            print(f"   Found {len(response)} plans")
            if len(response) >= 3:
                print(f"   Plans: {[p['name'] for p in response]}")
        return success, response

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"test_user_{timestamp}@example.com",
            "password": "TestPass123!",
            "full_name": f"Test User {timestamp}"
        }
        
        success, response = self.run_test(
            "User Registration", 
            "POST", 
            "auth/register", 
            200,
            data=user_data
        )
        
        if success and response:
            self.token = response.get('access_token')
            user_info = response.get('user', {})
            self.user_id = user_info.get('id')
            print(f"   Registered user: {user_info.get('email')}")
            print(f"   User ID: {self.user_id}")
        
        return success, response

    def test_user_login(self):
        """Test user login with existing credentials"""
        if not hasattr(self, '_test_email'):
            print("   Skipping login test - no test user created")
            return True, {}
            
        login_data = {
            "email": self._test_email,
            "password": "TestPass123!"
        }
        
        return self.run_test("User Login", "POST", "auth/login", 200, data=login_data)

    def test_get_me(self):
        """Test getting current user info"""
        if not self.token:
            print("   Skipping - no auth token")
            return False, {}
        
        return self.run_test("Get Me", "GET", "auth/me", 200)

    def test_create_vcard(self):
        """Test creating a new vCard"""
        if not self.token:
            print("   Skipping - no auth token")
            return False, {}
        
        vcard_data = {
            "full_name": "Juan Pérez",
            "phone": "+52 55 1234 5678",
            "email": "juan.perez@example.com",
            "company": "TechCorp Inc.",
            "job_title": "Desarrollador Senior",
            "address": "Av. Insurgentes 123",
            "city": "Ciudad de México",
            "country": "México",
            "photo_url": "https://images.unsplash.com/photo-1576558656222-ba66febe3dec?w=200",
            "social_links": {
                "website": "https://juanperez.com",
                "linkedin": "https://linkedin.com/in/juanperez",
                "twitter": "https://twitter.com/juanperez"
            },
            "notes": "Especialista en desarrollo web y aplicaciones móviles"
        }
        
        success, response = self.run_test(
            "Create VCard", 
            "POST", 
            "vcards", 
            200,
            data=vcard_data
        )
        
        if success and response:
            self.created_vcard_id = response.get('id')
            print(f"   Created vCard ID: {self.created_vcard_id}")
        
        return success, response

    def test_get_user_vcards(self):
        """Test getting user's vCards"""
        if not self.token:
            print("   Skipping - no auth token")
            return False, {}
        
        success, response = self.run_test("Get User VCards", "GET", "vcards", 200)
        
        if success and response:
            print(f"   Found {len(response)} vCards")
        
        return success, response

    def test_get_vcard(self):
        """Test getting a specific vCard"""
        if not self.token or not self.created_vcard_id:
            print("   Skipping - no auth token or vCard ID")
            return False, {}
        
        return self.run_test(
            "Get VCard", 
            "GET", 
            f"vcards/{self.created_vcard_id}", 
            200
        )

    def test_update_vcard(self):
        """Test updating a vCard"""
        if not self.token or not self.created_vcard_id:
            print("   Skipping - no auth token or vCard ID")
            return False, {}
        
        update_data = {
            "job_title": "Director de Tecnología",
            "notes": "Especialista en desarrollo web, aplicaciones móviles y arquitectura de sistemas"
        }
        
        return self.run_test(
            "Update VCard", 
            "PUT", 
            f"vcards/{self.created_vcard_id}", 
            200,
            data=update_data
        )

    def test_public_vcard(self):
        """Test public vCard endpoint (no auth required)"""
        if not self.created_vcard_id:
            print("   Skipping - no vCard ID")
            return False, {}
        
        success, response = self.run_test(
            "Public VCard", 
            "GET", 
            f"vcard/{self.created_vcard_id}/public", 
            200
        )
        
        if success and response:
            print(f"   VCard has vcard_string: {'vcard_string' in response}")
            print(f"   Views count: {response.get('views_count', 0)}")
        
        return success, response

    def test_delete_vcard(self):
        """Test deleting a vCard"""
        if not self.token or not self.created_vcard_id:
            print("   Skipping - no auth token or vCard ID")
            return False, {}
        
        return self.run_test(
            "Delete VCard", 
            "DELETE", 
            f"vcards/{self.created_vcard_id}", 
            200
        )

    def test_admin_login(self):
        """Test admin login"""
        admin_data = {
            "email": "admin@vcardpro.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login", 
            "POST", 
            "auth/login", 
            200,
            data=admin_data
        )
        
        if success and response:
            self.admin_token = response.get('access_token')
            user_info = response.get('user', {})
            print(f"   Admin user: {user_info.get('email')}")
            print(f"   Admin role: {user_info.get('role')}")
        
        return success, response

    def test_admin_stats(self):
        """Test admin stats endpoint"""
        if not self.admin_token:
            print("   Skipping - no admin token")
            return False, {}
        
        # Temporarily set admin token for this test
        original_token = self.token
        self.token = self.admin_token
        
        success, response = self.run_test("Admin Stats", "GET", "admin/stats", 200)
        
        if success and response:
            print(f"   Total users: {response.get('total_users', 0)}")
            print(f"   Total vCards: {response.get('total_vcards', 0)}")
            print(f"   Active subscriptions: {response.get('active_subscriptions', 0)}")
        
        # Restore original token
        self.token = original_token
        return success, response

    def test_admin_settings_get(self):
        """Test admin settings GET endpoint"""
        if not self.admin_token:
            print("   Skipping - no admin token")
            return False, {}
        
        # Temporarily set admin token for this test
        original_token = self.token
        self.token = self.admin_token
        
        success, response = self.run_test("Admin Settings GET", "GET", "admin/settings", 200)
        
        if success and response:
            print(f"   PayPal Client ID present: {'paypal_client_id' in response and response['paypal_client_id']}")
            print(f"   PayPal Mode: {response.get('paypal_mode', 'sandbox')}")
        
        # Restore original token
        self.token = original_token
        return success, response

    def test_admin_settings_update(self):
        """Test admin PayPal settings update"""
        if not self.admin_token:
            print("   Skipping - no admin token")
            return False, {}
        
        # Temporarily set admin token for this test
        original_token = self.token
        self.token = self.admin_token
        
        settings_data = {
            "paypal_client_id": "test_client_id_12345",
            "paypal_mode": "sandbox"
        }
        
        success, response = self.run_test(
            "Admin PayPal Settings Update", 
            "PUT", 
            "admin/settings/paypal", 
            200,
            data=settings_data
        )
        
        # Restore original token
        self.token = original_token
        return success, response

    def test_paypal_client_id_endpoint(self):
        """Test public PayPal client ID endpoint"""
        success, response = self.run_test(
            "Get PayPal Client ID", 
            "GET", 
            "settings/paypal-client-id", 
            200
        )
        
        if success and response:
            print(f"   Client ID present: {'client_id' in response and response['client_id']}")
            print(f"   Mode: {response.get('mode', 'sandbox')}")
        
        return success, response

def main():
    print("🚀 Starting Olivo Cards API Testing...")
    print("=" * 50)
    
    tester = VCardAPITester()
    
    # Test API endpoints in logical order
    print("\n📋 BASIC API TESTS")
    tester.test_root_endpoint()
    
    print("\n🎯 PLANS TESTS")
    tester.test_seed_plans()
    tester.test_get_plans()
    
    print("\n⚙️ SETTINGS TESTS (Public)")
    tester.test_paypal_client_id_endpoint()
    
    print("\n👤 USER AUTHENTICATION TESTS")
    tester.test_user_registration()
    tester.test_get_me()
    
    print("\n🔐 ADMIN AUTHENTICATION TESTS")
    tester.test_admin_login()
    
    print("\n👑 ADMIN FUNCTIONALITY TESTS")
    tester.test_admin_stats()
    tester.test_admin_settings_get()
    tester.test_admin_settings_update()
    tester.test_admin_settings_get()  # Test again to verify persistence
    tester.test_paypal_client_id_endpoint()  # Test public endpoint after admin update
    
    print("\n📇 VCARD CRUD TESTS")
    tester.test_create_vcard()
    tester.test_get_user_vcards()
    tester.test_get_vcard()
    tester.test_update_vcard()
    
    print("\n🌐 PUBLIC ACCESS TESTS")
    tester.test_public_vcard()
    
    print("\n🗑️ CLEANUP TESTS")
    tester.test_delete_vcard()
    
    # Print results summary
    print("\n" + "=" * 50)
    print(f"📊 TEST RESULTS")
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())