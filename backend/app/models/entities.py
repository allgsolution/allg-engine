import uuid, enum
from datetime import datetime
from sqlalchemy import String, Text, Float, ForeignKey, DateTime, Enum, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class MarketplaceEnum(str, enum.Enum):
    shopee="shopee"; mercadolivre="mercadolivre"; aliexpress="aliexpress"; amazon="amazon"

class User(Base):
    __tablename__="users"
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str]=mapped_column(String(255), unique=True)
    password_hash: Mapped[str]=mapped_column(String(255))
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)

class Marketplace(Base):
    __tablename__="marketplaces"
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slug: Mapped[str]=mapped_column(String(50), unique=True)
    name: Mapped[str]=mapped_column(String(100))
    enabled: Mapped[bool]=mapped_column(Boolean, default=True)

class Product(Base):
    __tablename__="products"
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    marketplace_id: Mapped[str]=mapped_column(String(36), ForeignKey("marketplaces.id"))
    title: Mapped[str]=mapped_column(String(500))
    description: Mapped[str]=mapped_column(Text, nullable=True)
    price: Mapped[float]=mapped_column(Float, nullable=True)
    commission_rate: Mapped[float]=mapped_column(Float, nullable=True)
    affiliate_url: Mapped[str]=mapped_column(Text, nullable=True)
    image_url: Mapped[str]=mapped_column(Text, nullable=True)
    score: Mapped[float]=mapped_column(Float, default=0)
    raw_data: Mapped[dict]=mapped_column(JSON, default=dict)
    embedding: Mapped[str]=mapped_column(Text, nullable=True)
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)
    marketplace: Mapped[Marketplace]=relationship()

class Strategy(Base):
    __tablename__="strategies"
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id: Mapped[str]=mapped_column(String(36), ForeignKey("products.id"))
    avatar: Mapped[dict]=mapped_column(JSON, default=dict)
    angles: Mapped[dict]=mapped_column(JSON, default=dict)
    ctas: Mapped[dict]=mapped_column(JSON, default=dict)
    prompt_version: Mapped[str]=mapped_column(String(50), default="v1")
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)

class Content(Base):
    __tablename__="contents"
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id: Mapped[str]=mapped_column(String(36), ForeignKey("products.id"))
    strategy_id: Mapped[str]=mapped_column(String(36), ForeignKey("strategies.id"), nullable=True)
    type: Mapped[str]=mapped_column(String(50))
    channel: Mapped[str]=mapped_column(String(50))
    body: Mapped[str]=mapped_column(Text)
    meta: Mapped[dict]=mapped_column(JSON, default=dict)
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)

class Campaign(Base):
    __tablename__="campaigns"
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id: Mapped[str]=mapped_column(String(36), ForeignKey("products.id"))
    name: Mapped[str]=mapped_column(String(255))
    status: Mapped[str]=mapped_column(String(50), default="draft")
    channel: Mapped[str]=mapped_column(String(50))
    scheduled_at: Mapped[datetime]=mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)

class Event(Base):
    __tablename__="events"
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id: Mapped[str]=mapped_column(String(36), ForeignKey("products.id"), nullable=True)
    campaign_id: Mapped[str]=mapped_column(String(36), ForeignKey("campaigns.id"), nullable=True)
    type: Mapped[str]=mapped_column(String(50))
    meta: Mapped[dict]=mapped_column(JSON, default=dict)
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)

class AgentRun(Base):
    __tablename__="agent_runs"
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent: Mapped[str]=mapped_column(String(50))
    input_data: Mapped[dict]=mapped_column(JSON, default=dict)
    output_data: Mapped[dict]=mapped_column(JSON, default=dict)
    created_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow)

class AppSettings(Base):
    __tablename__="app_settings"
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default="global")
    data: Mapped[dict]=mapped_column(JSON, default=dict)
    updated_at: Mapped[datetime]=mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
