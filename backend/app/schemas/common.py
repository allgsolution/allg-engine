from pydantic import BaseModel
from datetime import datetime
from typing import Optional
class ProductIn(BaseModel):
    marketplace_slug: str
    title: str
    description: Optional[str]=None
    price: Optional[float]=None
    commission_rate: Optional[float]=None
    affiliate_url: Optional[str]=None
    image_url: Optional[str]=None
class ProductOut(ProductIn):
    id: str
    score: float
    created_at: datetime
    class Config:
        from_attributes=True
class CampaignIn(BaseModel):
    product_id: str
    name: str
    channel: str
    scheduled_at: Optional[datetime]=None
class OpportunityQuery(BaseModel):
    marketplace: Optional[str]=None
    nicho: Optional[str]=None
    price_min: Optional[float]=None
    price_max: Optional[float]=None
    commission_min: Optional[float]=None
