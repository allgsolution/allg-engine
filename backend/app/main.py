from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from app.core.database import engine, Base, SessionLocal
from app.api.routes import router
from app.models.entities import Marketplace, MarketplaceEnum

app=FastAPI(title="ALLG Affiliate Engine", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(router, prefix="/api")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as s:
        for slug,name in [("shopee","Shopee"),("mercadolivre","Mercado Livre"),("aliexpress","AliExpress")]:
            r=await s.execute(select(Marketplace).where(Marketplace.slug==slug))
            if not r.scalar_one_or_none():
                s.add(Marketplace(slug=slug,name=name))
        await s.commit()

@app.get("/")
async def root(): return {"name":"ALLG Affiliate Engine","docs":"/docs"}
