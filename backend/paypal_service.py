import aiohttp
import base64
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class PayPalService:
    """PayPal Subscriptions API Service for recurring payments"""
    
    def __init__(self):
        self.client_id: Optional[str] = None
        self.client_secret: Optional[str] = None
        self.mode: str = "sandbox"
        self.access_token: Optional[str] = None
        # Separate product IDs for sandbox and live
        self.sandbox_product_id: Optional[str] = None
        self.live_product_id: Optional[str] = None
    
    @property
    def base_url(self) -> str:
        if self.mode == "live":
            return "https://api-m.paypal.com"
        return "https://api-m.sandbox.paypal.com"
    
    @property
    def product_id(self) -> Optional[str]:
        """Get the product ID for the current mode"""
        if self.mode == "live":
            return self.live_product_id
        return self.sandbox_product_id
    
    @product_id.setter
    def product_id(self, value: Optional[str]):
        """Set the product ID for the current mode"""
        if self.mode == "live":
            self.live_product_id = value
        else:
            self.sandbox_product_id = value
    
    def configure(self, client_id: str, client_secret: str, mode: str = "sandbox"):
        # Check if mode changed - if so, we need to potentially reset product_id for new mode
        mode_changed = self.mode != mode
        credentials_changed = self.client_id != client_id or self.client_secret != client_secret
        
        self.client_id = client_id
        self.client_secret = client_secret
        self.mode = mode
        self.access_token = None
        
        # Log the configuration
        logger.info(f"PayPal configured for mode: {mode}, product_id: {self.product_id}")
    
    def is_configured(self) -> bool:
        return bool(self.client_id and self.client_secret)
    
    async def get_access_token(self) -> Optional[str]:
        """Get OAuth 2.0 access token from PayPal"""
        if not self.is_configured():
            logger.warning("PayPal not configured")
            return None
        
        auth = base64.b64encode(f"{self.client_id}:{self.client_secret}".encode()).decode()
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/v1/oauth2/token",
                headers={
                    "Authorization": f"Basic {auth}",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data="grant_type=client_credentials"
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.access_token = data.get("access_token")
                    return self.access_token
                else:
                    error = await response.text()
                    logger.error(f"PayPal auth error: {error}")
                    return None
    
    async def create_product(self) -> Optional[str]:
        """Create a PayPal product for subscriptions"""
        token = await self.get_access_token()
        if not token:
            return None
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/v1/catalogs/products",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json={
                    "name": "Olivo Cards Subscription",
                    "description": "Digital business card subscription service",
                    "type": "SERVICE",
                    "category": "SOFTWARE"
                }
            ) as response:
                if response.status in [200, 201]:
                    data = await response.json()
                    self.product_id = data.get("id")
                    logger.info(f"PayPal product created: {self.product_id}")
                    return self.product_id
                else:
                    error = await response.text()
                    logger.error(f"PayPal create product error: {error}")
                    return None
    
    async def create_billing_plan(
        self,
        name: str,
        description: str,
        price: float,
        billing_period: str = "monthly",
        trial_days: int = 0,
        product_id: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Create a PayPal billing plan for recurring payments with optional trial"""
        token = await self.get_access_token()
        if not token:
            return None
        
        # Always create a new product for this mode if we don't have one
        # This ensures sandbox and live have separate products
        prod_id = self.product_id
        if not prod_id:
            logger.info(f"Creating new PayPal product for mode: {self.mode}")
            prod_id = await self.create_product()
            if not prod_id:
                logger.error(f"Failed to create PayPal product for mode: {self.mode}")
                return None
        
        # Map billing period
        interval_unit = "MONTH" if billing_period == "monthly" else "YEAR"
        
        # Build billing cycles
        billing_cycles = []
        sequence = 1
        
        # Add trial period if specified
        if trial_days > 0:
            billing_cycles.append({
                "frequency": {
                    "interval_unit": "DAY",
                    "interval_count": trial_days
                },
                "tenure_type": "TRIAL",
                "sequence": sequence,
                "total_cycles": 1,
                "pricing_scheme": {
                    "fixed_price": {
                        "value": "0",
                        "currency_code": "USD"
                    }
                }
            })
            sequence += 1
        
        # Add regular billing cycle
        billing_cycles.append({
            "frequency": {
                "interval_unit": interval_unit,
                "interval_count": 1
            },
            "tenure_type": "REGULAR",
            "sequence": sequence,
            "total_cycles": 0,  # 0 = infinite
            "pricing_scheme": {
                "fixed_price": {
                    "value": str(price),
                    "currency_code": "USD"
                }
            }
        })
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/v1/billing/plans",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json={
                    "product_id": prod_id,
                    "name": f"Olivo Cards - {name}",
                    "description": description,
                    "status": "ACTIVE",
                    "billing_cycles": billing_cycles,
                    "payment_preferences": {
                        "auto_bill_outstanding": True,
                        "setup_fee_failure_action": "CONTINUE",
                        "payment_failure_threshold": 3
                    }
                }
            ) as response:
                if response.status in [200, 201]:
                    data = await response.json()
                    logger.info(f"PayPal plan created: {data.get('id')} with {trial_days} days trial")
                    return data
                else:
                    error = await response.text()
                    logger.error(f"PayPal create plan error: {error}")
                    return None
    
    async def get_plan_details(self, paypal_plan_id: str) -> Optional[Dict[str, Any]]:
        """Get details of a PayPal billing plan"""
        token = await self.get_access_token()
        if not token:
            return None
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/v1/billing/plans/{paypal_plan_id}",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error = await response.text()
                    logger.error(f"PayPal get plan error: {error}")
                    return None
    
    async def create_subscription(
        self,
        paypal_plan_id: str,
        return_url: str,
        cancel_url: str
    ) -> Optional[Dict[str, Any]]:
        """Create a subscription for a user"""
        token = await self.get_access_token()
        if not token:
            return None
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/v1/billing/subscriptions",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json={
                    "plan_id": paypal_plan_id,
                    "application_context": {
                        "brand_name": "Olivo Cards",
                        "locale": "es-ES",
                        "shipping_preference": "NO_SHIPPING",
                        "user_action": "SUBSCRIBE_NOW",
                        "return_url": return_url,
                        "cancel_url": cancel_url
                    }
                }
            ) as response:
                if response.status in [200, 201]:
                    data = await response.json()
                    logger.info(f"PayPal subscription created: {data.get('id')}")
                    return data
                else:
                    error = await response.text()
                    logger.error(f"PayPal create subscription error: {error}")
                    return None
    
    async def get_subscription_details(self, subscription_id: str) -> Optional[Dict[str, Any]]:
        """Get details of a PayPal subscription"""
        token = await self.get_access_token()
        if not token:
            return None
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/v1/billing/subscriptions/{subscription_id}",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error = await response.text()
                    logger.error(f"PayPal get subscription error: {error}")
                    return None
    
    async def cancel_subscription(self, subscription_id: str, reason: str = "User requested cancellation") -> bool:
        """Cancel a PayPal subscription"""
        token = await self.get_access_token()
        if not token:
            return False
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/v1/billing/subscriptions/{subscription_id}/cancel",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                json={"reason": reason}
            ) as response:
                if response.status == 204:
                    logger.info(f"PayPal subscription cancelled: {subscription_id}")
                    return True
                else:
                    error = await response.text()
                    logger.error(f"PayPal cancel subscription error: {error}")
                    return False

# Global instance
paypal_service = PayPalService()
