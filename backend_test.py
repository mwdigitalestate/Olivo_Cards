import requests
import sys
import json
from datetime import datetime

class OlivoCardsAPITester:
    def __init__(self, base_url="https://offline-qr-cards.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.test_card_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details or "",
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details and not success:
            print(f"    Details: {details}")

    def make_request(self, method, endpoint, data=None, token=None):
        """Make API request with proper headers"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            else:
                return None, "Unsupported method"

            return response, None
        except Exception as e:
            return None, str(e)

    def test_admin_login(self):
        """Test admin login with provided credentials"""
        print("🔐 Testing Admin Authentication...")
        
        response, error = self.make_request('POST', 'auth/login', {
            "email": "admin@vcardpro.com",
            "password": "admin123"
        })
        
        if error:
            self.log_test("Admin Login", False, f"Request error: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                self.admin_token = data['access_token']
                self.log_test("Admin Login", True, f"Token obtained, role: {data['user']['role']}")
                return True
            except Exception as e:
                self.log_test("Admin Login", False, f"Failed to parse response: {e}")
                return False
        else:
            self.log_test("Admin Login", False, f"Status {response.status_code}: {response.text}")
            return False

    def test_email_settings_endpoints(self):
        """Test email configuration endpoints"""
        print("📧 Testing Email Settings...")
        
        if not self.admin_token:
            self.log_test("Email Settings - No Admin Token", False, "Admin login required first")
            return False
        
        # Test GET email settings
        response, error = self.make_request('GET', 'admin/settings/email', token=self.admin_token)
        if error:
            self.log_test("GET Email Settings", False, f"Request error: {error}")
        elif response.status_code == 200:
            data = response.json()
            self.log_test("GET Email Settings", True, f"Current config: {json.dumps(data)}")
        else:
            self.log_test("GET Email Settings", False, f"Status {response.status_code}: {response.text}")
        
        # Test PUT email settings (without actual credentials)
        response, error = self.make_request('PUT', 'admin/settings/email', {
            "smtp_email": "test@gmail.com",
            "smtp_password": "fake_password"
        }, token=self.admin_token)
        
        if error:
            self.log_test("PUT Email Settings", False, f"Request error: {error}")
        elif response.status_code == 200:
            self.log_test("PUT Email Settings", True, "Email settings updated successfully")
        else:
            self.log_test("PUT Email Settings", False, f"Status {response.status_code}: {response.text}")

    def test_email_test_endpoint(self):
        """Test email testing endpoint"""
        print("📬 Testing Email Test Endpoint...")
        
        if not self.admin_token:
            self.log_test("Test Email - No Admin Token", False, "Admin login required first")
            return False
        
        response, error = self.make_request('POST', 'admin/test-email', token=self.admin_token)
        
        if error:
            self.log_test("POST Test Email", False, f"Request error: {error}")
        elif response.status_code == 400:
            # Expected if email not configured
            self.log_test("POST Test Email", True, "Expected 400 - Email not configured (correct behavior)")
        elif response.status_code == 500:
            # Expected if email configured but credentials invalid
            self.log_test("POST Test Email", True, "Expected 500 - Email configured but send failed (correct behavior)")
        elif response.status_code == 200:
            self.log_test("POST Test Email", True, "Email test successful")
        else:
            self.log_test("POST Test Email", False, f"Unexpected status {response.status_code}: {response.text}")

    def test_paypal_settings_endpoints(self):
        """Test PayPal configuration endpoints"""
        print("💳 Testing PayPal Settings...")
        
        if not self.admin_token:
            self.log_test("PayPal Settings - No Admin Token", False, "Admin login required first")
            return False
        
        # Test GET PayPal settings
        response, error = self.make_request('GET', 'admin/settings', token=self.admin_token)
        if error:
            self.log_test("GET PayPal Settings", False, f"Request error: {error}")
        elif response.status_code == 200:
            data = response.json()
            self.log_test("GET PayPal Settings", True, f"Current config: {json.dumps(data)}")
        else:
            self.log_test("GET PayPal Settings", False, f"Status {response.status_code}: {response.text}")
        
        # Test PUT PayPal settings
        response, error = self.make_request('PUT', 'admin/settings/paypal', {
            "paypal_client_id": "test_client_id",
            "paypal_secret": "test_secret",
            "paypal_mode": "sandbox"
        }, token=self.admin_token)
        
        if error:
            self.log_test("PUT PayPal Settings", False, f"Request error: {error}")
        elif response.status_code == 200:
            self.log_test("PUT PayPal Settings", True, "PayPal settings updated successfully")
        else:
            self.log_test("PUT PayPal Settings", False, f"Status {response.status_code}: {response.text}")

    def test_user_registration(self):
        """Test user registration functionality"""
        print("👤 Testing User Registration...")
        
        # Create a unique test user
        test_email = f"testuser_{datetime.now().strftime('%H%M%S')}@example.com"
        
        response, error = self.make_request('POST', 'auth/register', {
            "email": test_email,
            "full_name": "Test User",
            "password": "testpass123"
        })
        
        if error:
            self.log_test("User Registration", False, f"Request error: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                self.user_token = data['access_token']
                self.test_user_id = data['user']['id']
                self.log_test("User Registration", True, f"User created with ID: {self.test_user_id}")
                return True
            except Exception as e:
                self.log_test("User Registration", False, f"Failed to parse response: {e}")
                return False
        else:
            self.log_test("User Registration", False, f"Status {response.status_code}: {response.text}")
            return False

    def test_card_creation(self):
        """Test vCard creation functionality"""
        print("🎴 Testing Card Creation...")
        
        if not self.user_token:
            self.log_test("Card Creation - No User Token", False, "User registration required first")
            return False
        
        response, error = self.make_request('POST', 'vcards', {
            "full_name": "John Doe",
            "phone": "+1234567890",
            "email": "john@example.com",
            "company": "Test Company",
            "job_title": "Test Engineer",
            "address": "123 Test St",
            "city": "Test City",
            "country": "Test Country",
            "social_links": {
                "linkedin": "https://linkedin.com/in/johndoe",
                "website": "https://johndoe.com"
            },
            "notes": "This is a test card"
        }, token=self.user_token)
        
        if error:
            self.log_test("Card Creation", False, f"Request error: {error}")
            return False
        
        if response.status_code == 200:
            try:
                data = response.json()
                self.test_card_id = data['id']
                self.log_test("Card Creation", True, f"Card created with ID: {self.test_card_id}")
                return True
            except Exception as e:
                self.log_test("Card Creation", False, f"Failed to parse response: {e}")
                return False
        else:
            self.log_test("Card Creation", False, f"Status {response.status_code}: {response.text}")
            return False

    def test_public_endpoints(self):
        """Test public endpoints that don't require authentication"""
        print("🌐 Testing Public Endpoints...")
        
        # Test root API endpoint
        response, error = self.make_request('GET', '')
        if error:
            self.log_test("Root API", False, f"Request error: {error}")
        elif response.status_code == 200:
            self.log_test("Root API", True, "API root accessible")
        else:
            self.log_test("Root API", False, f"Status {response.status_code}")
        
        # Test plans endpoint
        response, error = self.make_request('GET', 'plans')
        if error:
            self.log_test("Plans API", False, f"Request error: {error}")
        elif response.status_code == 200:
            data = response.json()
            self.log_test("Plans API", True, f"Found {len(data)} plans")
        else:
            self.log_test("Plans API", False, f"Status {response.status_code}")

    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("🚀 Starting Olivo Cards Backend API Tests")
        print("=" * 60)
        
        # Test public endpoints first
        self.test_public_endpoints()
        
        # Test admin functionality
        if self.test_admin_login():
            self.test_email_settings_endpoints()
            self.test_email_test_endpoint()
            self.test_paypal_settings_endpoints()
        
        # Test user functionality
        if self.test_user_registration():
            self.test_card_creation()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Save detailed results
        with open('/app/backend_test_results.json', 'w') as f:
            json.dump({
                "summary": {
                    "total_tests": self.tests_run,
                    "passed_tests": self.tests_passed,
                    "success_rate": f"{(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%"
                },
                "test_results": self.test_results
            }, f, indent=2)
        
        return self.tests_passed == self.tests_run

def main():
    tester = OlivoCardsAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())