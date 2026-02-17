from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import jwt, JWTError
from email_service import email_service, EmailService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Helper to get email service with current config
async def get_email_service() -> EmailService:
    settings = await db.settings.find_one({"type": "email"}, {"_id": 0})
    if settings:
        email_service.smtp_email = settings.get("smtp_email")
        email_service.smtp_password = settings.get("smtp_password")
    return email_service

# ==================== MODELS ====================

# Settings Model for PayPal configuration
class PayPalSettingsUpdate(BaseModel):
    paypal_client_id: Optional[str] = None
    paypal_secret: Optional[str] = None
    paypal_mode: Optional[str] = "sandbox"  # sandbox or live

class SettingsResponse(BaseModel):
    paypal_client_id: Optional[str] = None
    paypal_secret: Optional[str] = None
    paypal_mode: str = "sandbox"

class EmailSettingsUpdate(BaseModel):
    smtp_email: Optional[str] = None
    smtp_password: Optional[str] = None

class EmailSettingsResponse(BaseModel):
    smtp_email: Optional[str] = None
    is_configured: bool = False

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str = "user"  # user or admin
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    subscription_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    subscription_id: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# VCard Models
class SocialLinks(BaseModel):
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    website: Optional[str] = None

class VCardBase(BaseModel):
    full_name: str
    phone: str
    email: EmailStr
    company: Optional[str] = None
    job_title: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    photo_url: Optional[str] = None
    social_links: Optional[SocialLinks] = None
    notes: Optional[str] = None

class VCardCreate(VCardBase):
    pass

class VCardUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    photo_url: Optional[str] = None
    social_links: Optional[SocialLinks] = None
    notes: Optional[str] = None

class VCard(VCardBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    is_active: bool = True
    views_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VCardResponse(VCardBase):
    id: str
    user_id: str
    is_active: bool
    views_count: int
    created_at: str
    updated_at: str

# Plan Models
class PlanBase(BaseModel):
    name: str
    description: str
    price: float
    currency: str = "USD"
    billing_period: str = "monthly"  # monthly, yearly
    max_cards: int
    features: List[str]
    is_popular: bool = False

class PlanCreate(PlanBase):
    pass

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    billing_period: Optional[str] = None
    max_cards: Optional[int] = None
    features: Optional[List[str]] = None
    is_popular: Optional[bool] = None
    is_active: Optional[bool] = None

class Plan(PlanBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PlanResponse(PlanBase):
    id: str
    is_active: bool

# Subscription Models
class SubscriptionCreate(BaseModel):
    plan_id: str
    paypal_order_id: Optional[str] = None

class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_id: str
    status: str = "active"  # active, cancelled, expired
    paypal_order_id: Optional[str] = None
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubscriptionResponse(BaseModel):
    id: str
    user_id: str
    plan_id: str
    status: str
    start_date: str
    end_date: Optional[str] = None

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def generate_vcard_string(vcard: dict) -> str:
    """Generate vCard format string for QR code embedding"""
    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"FN:{vcard.get('full_name', '')}",
        f"TEL;TYPE=CELL:{vcard.get('phone', '')}",
        f"EMAIL:{vcard.get('email', '')}",
    ]
    
    if vcard.get('company'):
        lines.append(f"ORG:{vcard['company']}")
    
    if vcard.get('job_title'):
        lines.append(f"TITLE:{vcard['job_title']}")
    
    # Build address
    address_parts = []
    if vcard.get('address'):
        address_parts.append(vcard['address'])
    if vcard.get('city'):
        address_parts.append(vcard['city'])
    if vcard.get('country'):
        address_parts.append(vcard['country'])
    
    if address_parts:
        lines.append(f"ADR;TYPE=WORK:;;{';'.join(address_parts)};;;;")
    
    # Social links as URLs
    social = vcard.get('social_links') or {}
    if social.get('website'):
        lines.append(f"URL:{social['website']}")
    if social.get('linkedin'):
        lines.append(f"X-SOCIALPROFILE;TYPE=linkedin:{social['linkedin']}")
    if social.get('twitter'):
        lines.append(f"X-SOCIALPROFILE;TYPE=twitter:{social['twitter']}")
    
    if vcard.get('notes'):
        lines.append(f"NOTE:{vcard['notes']}")
    
    if vcard.get('photo_url'):
        lines.append(f"PHOTO;VALUE=URI:{vcard['photo_url']}")
    
    lines.append("END:VCARD")
    
    return "\n".join(lines)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate, background_tasks: BackgroundTasks):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        role="user"
    )
    
    user_dict = user.model_dump()
    user_dict['password_hash'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Send welcome email in background
    async def send_welcome_email():
        email_svc = await get_email_service()
        if email_svc.is_configured():
            subject, html = email_svc.get_welcome_template(user.full_name)
            await email_svc.send_email(user.email, subject, html)
    
    background_tasks.add_task(send_welcome_email)
    
    # Create token
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            subscription_id=user.subscription_id
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user.get('password_hash', '')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user['id'], "email": user['email'], "role": user['role']})
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            full_name=user['full_name'],
            role=user['role'],
            is_active=user['is_active'],
            subscription_id=user.get('subscription_id')
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user['id'],
        email=current_user['email'],
        full_name=current_user['full_name'],
        role=current_user['role'],
        is_active=current_user['is_active'],
        subscription_id=current_user.get('subscription_id')
    )

# ==================== VCARD ROUTES ====================

@api_router.post("/vcards", response_model=VCardResponse)
async def create_vcard(vcard_data: VCardCreate, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    # Check user's card limit based on subscription
    user_cards = await db.vcards.count_documents({"user_id": current_user['id'], "is_active": True})
    
    # Get user's plan limit
    max_cards = 1  # Free tier default
    if current_user.get('subscription_id'):
        subscription = await db.subscriptions.find_one(
            {"id": current_user['subscription_id'], "status": "active"},
            {"_id": 0}
        )
        if subscription:
            plan = await db.plans.find_one({"id": subscription['plan_id']}, {"_id": 0})
            if plan:
                max_cards = plan.get('max_cards', 1)
    
    if user_cards >= max_cards:
        raise HTTPException(
            status_code=403, 
            detail=f"Card limit reached ({max_cards}). Upgrade your plan for more cards."
        )
    
    vcard = VCard(
        **vcard_data.model_dump(),
        user_id=current_user['id']
    )
    
    vcard_dict = vcard.model_dump()
    vcard_dict['created_at'] = vcard_dict['created_at'].isoformat()
    vcard_dict['updated_at'] = vcard_dict['updated_at'].isoformat()
    
    await db.vcards.insert_one(vcard_dict)
    
    # Send new card email in background
    async def send_new_card_email():
        email_svc = await get_email_service()
        if email_svc.is_configured():
            subject, html = email_svc.get_new_card_template(
                current_user['full_name'],
                vcard.full_name,
                vcard.id
            )
            await email_svc.send_email(current_user['email'], subject, html)
    
    background_tasks.add_task(send_new_card_email)
    
    return VCardResponse(
        **vcard_data.model_dump(),
        id=vcard.id,
        user_id=vcard.user_id,
        is_active=vcard.is_active,
        views_count=vcard.views_count,
        created_at=vcard_dict['created_at'],
        updated_at=vcard_dict['updated_at']
    )

@api_router.get("/vcards", response_model=List[VCardResponse])
async def get_user_vcards(current_user: dict = Depends(get_current_user)):
    vcards = await db.vcards.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).to_list(100)
    
    return [VCardResponse(**v) for v in vcards]

@api_router.get("/vcards/{vcard_id}", response_model=VCardResponse)
async def get_vcard(vcard_id: str, current_user: dict = Depends(get_current_user)):
    vcard = await db.vcards.find_one(
        {"id": vcard_id, "user_id": current_user['id']},
        {"_id": 0}
    )
    
    if not vcard:
        raise HTTPException(status_code=404, detail="VCard not found")
    
    return VCardResponse(**vcard)

@api_router.put("/vcards/{vcard_id}", response_model=VCardResponse)
async def update_vcard(vcard_id: str, vcard_data: VCardUpdate, current_user: dict = Depends(get_current_user)):
    vcard = await db.vcards.find_one(
        {"id": vcard_id, "user_id": current_user['id']},
        {"_id": 0}
    )
    
    if not vcard:
        raise HTTPException(status_code=404, detail="VCard not found")
    
    update_data = {k: v for k, v in vcard_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.vcards.update_one(
        {"id": vcard_id},
        {"$set": update_data}
    )
    
    updated = await db.vcards.find_one({"id": vcard_id}, {"_id": 0})
    return VCardResponse(**updated)

@api_router.delete("/vcards/{vcard_id}")
async def delete_vcard(vcard_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.vcards.delete_one({"id": vcard_id, "user_id": current_user['id']})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="VCard not found")
    
    return {"message": "VCard deleted successfully"}

# Public VCard endpoint (no auth required)
@api_router.get("/vcard/{vcard_id}/public")
async def get_public_vcard(vcard_id: str):
    vcard = await db.vcards.find_one(
        {"id": vcard_id, "is_active": True},
        {"_id": 0}
    )
    
    if not vcard:
        raise HTTPException(status_code=404, detail="VCard not found")
    
    # Increment views count
    await db.vcards.update_one(
        {"id": vcard_id},
        {"$inc": {"views_count": 1}}
    )
    
    # Generate vCard string for download
    vcard_string = generate_vcard_string(vcard)
    
    return {
        **vcard,
        "vcard_string": vcard_string
    }

# ==================== PLANS ROUTES ====================

@api_router.get("/plans", response_model=List[PlanResponse])
async def get_plans():
    plans = await db.plans.find({"is_active": True}, {"_id": 0}).to_list(100)
    return [PlanResponse(**p) for p in plans]

@api_router.post("/plans", response_model=PlanResponse)
async def create_plan(plan_data: PlanCreate, admin: dict = Depends(get_admin_user)):
    plan = Plan(**plan_data.model_dump())
    
    plan_dict = plan.model_dump()
    plan_dict['created_at'] = plan_dict['created_at'].isoformat()
    
    await db.plans.insert_one(plan_dict)
    
    return PlanResponse(**plan_dict)

@api_router.put("/plans/{plan_id}", response_model=PlanResponse)
async def update_plan(plan_id: str, plan_data: PlanUpdate, admin: dict = Depends(get_admin_user)):
    plan = await db.plans.find_one({"id": plan_id}, {"_id": 0})
    
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    update_data = {k: v for k, v in plan_data.model_dump().items() if v is not None}
    
    await db.plans.update_one({"id": plan_id}, {"$set": update_data})
    
    updated = await db.plans.find_one({"id": plan_id}, {"_id": 0})
    return PlanResponse(**updated)

@api_router.delete("/plans/{plan_id}")
async def delete_plan(plan_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.plans.update_one(
        {"id": plan_id},
        {"$set": {"is_active": False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return {"message": "Plan deactivated successfully"}

# ==================== SUBSCRIPTION ROUTES ====================

@api_router.post("/subscriptions", response_model=SubscriptionResponse)
async def create_subscription(sub_data: SubscriptionCreate, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    # Verify plan exists
    plan = await db.plans.find_one({"id": sub_data.plan_id, "is_active": True}, {"_id": 0})
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Cancel any existing active subscription
    await db.subscriptions.update_many(
        {"user_id": current_user['id'], "status": "active"},
        {"$set": {"status": "cancelled"}}
    )
    
    # Calculate end date based on billing period
    start_date = datetime.now(timezone.utc)
    if plan['billing_period'] == 'monthly':
        end_date = start_date + timedelta(days=30)
    else:  # yearly
        end_date = start_date + timedelta(days=365)
    
    subscription = Subscription(
        user_id=current_user['id'],
        plan_id=sub_data.plan_id,
        paypal_order_id=sub_data.paypal_order_id,
        start_date=start_date,
        end_date=end_date
    )
    
    sub_dict = subscription.model_dump()
    sub_dict['start_date'] = sub_dict['start_date'].isoformat()
    sub_dict['end_date'] = sub_dict['end_date'].isoformat()
    sub_dict['created_at'] = sub_dict['created_at'].isoformat()
    
    await db.subscriptions.insert_one(sub_dict)
    
    # Update user's subscription_id
    await db.users.update_one(
        {"id": current_user['id']},
        {"$set": {"subscription_id": subscription.id}}
    )
    
    # Send subscription email in background
    async def send_subscription_email():
        email_svc = await get_email_service()
        if email_svc.is_configured():
            end_date_formatted = end_date.strftime("%d/%m/%Y")
            subject, html = email_svc.get_subscription_template(
                current_user['full_name'],
                plan['name'],
                plan['price'],
                end_date_formatted
            )
            await email_svc.send_email(current_user['email'], subject, html)
    
    background_tasks.add_task(send_subscription_email)
    
    return SubscriptionResponse(
        id=subscription.id,
        user_id=subscription.user_id,
        plan_id=subscription.plan_id,
        status=subscription.status,
        start_date=sub_dict['start_date'],
        end_date=sub_dict['end_date']
    )

@api_router.get("/subscriptions/current", response_model=Optional[SubscriptionResponse])
async def get_current_subscription(current_user: dict = Depends(get_current_user)):
    subscription = await db.subscriptions.find_one(
        {"user_id": current_user['id'], "status": "active"},
        {"_id": 0}
    )
    
    if not subscription:
        return None
    
    return SubscriptionResponse(**subscription)

@api_router.post("/subscriptions/cancel")
async def cancel_subscription(current_user: dict = Depends(get_current_user)):
    result = await db.subscriptions.update_one(
        {"user_id": current_user['id'], "status": "active"},
        {"$set": {"status": "cancelled"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    await db.users.update_one(
        {"id": current_user['id']},
        {"$set": {"subscription_id": None}}
    )
    
    return {"message": "Subscription cancelled successfully"}

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [UserResponse(**u) for u in users]

@api_router.get("/admin/stats")
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
    total_users = await db.users.count_documents({})
    total_vcards = await db.vcards.count_documents({})
    active_subscriptions = await db.subscriptions.count_documents({"status": "active"})
    
    # Get views by vcard
    pipeline = [
        {"$group": {"_id": None, "total_views": {"$sum": "$views_count"}}}
    ]
    views_result = await db.vcards.aggregate(pipeline).to_list(1)
    total_views = views_result[0]['total_views'] if views_result else 0
    
    # Get subscriptions by plan
    plan_stats = await db.subscriptions.aggregate([
        {"$match": {"status": "active"}},
        {"$group": {"_id": "$plan_id", "count": {"$sum": 1}}}
    ]).to_list(100)
    
    return {
        "total_users": total_users,
        "total_vcards": total_vcards,
        "active_subscriptions": active_subscriptions,
        "total_views": total_views,
        "subscriptions_by_plan": plan_stats
    }

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(user_id: str, role: str, admin: dict = Depends(get_admin_user)):
    if role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": role}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": f"User role updated to {role}"}

@api_router.get("/admin/subscriptions")
async def get_all_subscriptions(admin: dict = Depends(get_admin_user)):
    subscriptions = await db.subscriptions.find({}, {"_id": 0}).to_list(1000)
    return subscriptions

# ==================== SETTINGS ROUTES (PayPal Config) ====================

@api_router.get("/admin/settings", response_model=SettingsResponse)
async def get_settings(admin: dict = Depends(get_admin_user)):
    settings = await db.settings.find_one({"type": "paypal"}, {"_id": 0})
    if not settings:
        return SettingsResponse()
    return SettingsResponse(
        paypal_client_id=settings.get("paypal_client_id"),
        paypal_mode=settings.get("paypal_mode", "sandbox")
    )

@api_router.put("/admin/settings/paypal")
async def update_paypal_settings(settings_data: PayPalSettingsUpdate, admin: dict = Depends(get_admin_user)):
    update_data = {k: v for k, v in settings_data.model_dump().items() if v is not None}
    update_data["type"] = "paypal"
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.settings.update_one(
        {"type": "paypal"},
        {"$set": update_data},
        upsert=True
    )
    
    return {"message": "PayPal settings updated successfully"}

@api_router.get("/settings/paypal-client-id")
async def get_paypal_client_id():
    """Public endpoint to get PayPal client ID for frontend"""
    settings = await db.settings.find_one({"type": "paypal"}, {"_id": 0})
    if not settings or not settings.get("paypal_client_id"):
        return {"client_id": None, "mode": "sandbox"}
    return {
        "client_id": settings.get("paypal_client_id"),
        "mode": settings.get("paypal_mode", "sandbox")
    }

# ==================== SEED DATA ====================

@api_router.post("/seed-plans")
async def seed_default_plans():
    """Seed default plans - can be called once to initialize"""
    existing = await db.plans.count_documents({})
    if existing > 0:
        return {"message": "Plans already exist"}
    
    default_plans = [
        {
            "id": str(uuid.uuid4()),
            "name": "Básico",
            "description": "Perfecto para empezar",
            "price": 0,
            "currency": "USD",
            "billing_period": "monthly",
            "max_cards": 1,
            "features": [
                "1 tarjeta digital",
                "Código QR estándar",
                "Información básica de contacto",
                "Estadísticas básicas"
            ],
            "is_popular": False,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Profesional",
            "description": "Para profesionales activos",
            "price": 9.99,
            "currency": "USD",
            "billing_period": "monthly",
            "max_cards": 5,
            "features": [
                "5 tarjetas digitales",
                "Código QR estándar",
                "Información completa",
                "Redes sociales",
                "Estadísticas avanzadas",
                "Soporte prioritario"
            ],
            "is_popular": True,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Empresarial",
            "description": "Para equipos y empresas",
            "price": 29.99,
            "currency": "USD",
            "billing_period": "monthly",
            "max_cards": 25,
            "features": [
                "25 tarjetas digitales",
                "Código QR estándar",
                "Información completa",
                "Redes sociales",
                "Estadísticas avanzadas",
                "API access",
                "Soporte dedicado",
                "Gestión de equipo"
            ],
            "is_popular": False,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.plans.insert_many(default_plans)
    
    return {"message": "Default plans created", "count": len(default_plans)}

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "VCard SaaS API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
