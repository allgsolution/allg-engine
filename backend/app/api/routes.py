from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.entities import Product, Marketplace, Strategy, Content, Campaign, Event, AgentRun, AppSettings
from app.schemas.common import ProductIn, ProductOut, CampaignIn, OpportunityQuery
from app.connectors.base import get_connector
from app.agents.orchestrator import run_researcher, run_strategist, run_content

DEFAULT_SERVICES = {
    "n8n_url": "https://n8.allgbr.com",
    "ollama_url": "http://ollama:11434",
    "postgres_url": "postgresql://allg:allg123@postgres:5432/allg",
    "redis_url": "redis://redis:6379/0",
    "minio_url": "http://minio:9000",
    "minio_console_url": "http://minio:9001",
    "api_url": "https://api.allgbr.com",
    "frontend_url": "https://app.allgbr.com",
    "traefik_url": "https://traefik.allgbr.com",
}

router = APIRouter()


def compute_opportunity_score(item: dict) -> float:
    """
    Score baseado nos fatores do PDF:
    SCORE = DEMANDA + TENDÊNCIA + COMISSÃO + POTENCIAL_CONTEÚDO - CONCORRÊNCIA
    Cada fator normalizado de 0 a 20 pontos (total máximo 100).
    """
    demanda = item.get("demand_score", 50) * 0.20        # peso 20%
    tendencia = item.get("trend_score", 50) * 0.20       # peso 20%
    comissao = min(item.get("commission_rate", 5) * 1.5, 20)  # peso 20%, cap 20
    conteudo = item.get("content_potential", 60) * 0.20  # peso 20%
    concorrencia = item.get("competition_score", 50) * 0.20  # penalidade 20%
    score = demanda + tendencia + comissao + conteudo - concorrencia
    return round(max(0, min(100, score)), 1)


def score_justification(item: dict) -> str:
    parts = []
    if item.get("trend_score", 0) >= 80:
        parts.append("produto em alta tendência")
    if item.get("commission_rate", 0) >= 15:
        parts.append("comissão elevada")
    if item.get("content_potential", 0) >= 80:
        parts.append("alto potencial de conteúdo viral")
    if item.get("demand_score", 0) >= 80:
        parts.append("demanda consistente")
    if item.get("competition_score", 0) <= 40:
        parts.append("baixa concorrência")
    return "Destaque: " + ", ".join(parts) if parts else "Oportunidade com potencial moderado"


@router.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@router.get("/marketplaces")
async def list_marketplaces(db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Marketplace))
    return [{"slug": m.slug, "name": m.name, "enabled": m.enabled} for m in r.scalars()]


@router.post("/products", response_model=ProductOut)
async def create_product(data: ProductIn, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Marketplace).where(Marketplace.slug == data.marketplace_slug))
    mp = q.scalar_one_or_none()
    if not mp:
        raise HTTPException(400, "marketplace inválido")

    # Score baseado nos fatores do PDF
    commission = data.commission_rate or 5
    price = data.price or 100
    demand_estimate = 65  # valor padrão para produto cadastrado manualmente
    price_factor = 15 if price < 100 else (10 if price < 300 else 5)
    score = round(min(100, commission * 1.5 + demand_estimate * 0.5 + price_factor), 1)

    p = Product(
        marketplace_id=mp.id,
        title=data.title,
        description=data.description,
        price=data.price,
        commission_rate=data.commission_rate,
        affiliate_url=data.affiliate_url,
        image_url=data.image_url,
        score=score,
    )
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return ProductOut(
        id=p.id,
        marketplace_slug=data.marketplace_slug,
        title=p.title,
        description=p.description,
        price=p.price,
        commission_rate=p.commission_rate,
        affiliate_url=p.affiliate_url,
        image_url=p.image_url,
        score=p.score,
        created_at=p.created_at,
    )


@router.get("/products")
async def list_products(db: AsyncSession = Depends(get_db)):
    r = await db.execute(
        select(Product).order_by(Product.score.desc(), Product.created_at.desc()).limit(100)
    )
    products = r.scalars().all()
    result = []
    for p in products:
        mp = await db.get(Marketplace, p.marketplace_id)
        result.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "price": p.price,
            "commission_rate": p.commission_rate,
            "affiliate_url": p.affiliate_url,
            "image_url": p.image_url,
            "score": p.score,
            "marketplace_slug": mp.slug if mp else "desconhecido",
            "marketplace_name": mp.name if mp else "Desconhecido",
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    return result


@router.post("/opportunities")
async def opportunities(q: OpportunityQuery, db: AsyncSession = Depends(get_db)):
    marketplace_slug = q.marketplace or "shopee"
    conn = get_connector(marketplace_slug)
    raw = await conn.search(q.nicho or "tendência")

    scored = []
    for item in raw:
        # Aplica filtros de preço e comissão mínima
        price = item.get("price", 0)
        commission = item.get("commission_rate", 0)
        if q.price_min and price < q.price_min:
            continue
        if q.price_max and price > q.price_max:
            continue
        if q.commission_min and commission < q.commission_min:
            continue

        score = compute_opportunity_score(item)
        justificativa = score_justification(item)
        scored.append({**item, "score": score, "justificativa": justificativa})

    return sorted(scored, key=lambda x: x["score"], reverse=True)


@router.post("/agents/research/{product_id}")
async def researcher(product_id: str, db: AsyncSession = Depends(get_db)):
    p = await db.get(Product, product_id)
    if not p:
        raise HTTPException(404, "produto não encontrado")
    out = await run_researcher({"title": p.title, "description": p.description, "price": p.price})
    db.add(AgentRun(agent="researcher", input_data={"product_id": str(product_id)}, output_data=out))
    await db.commit()
    return out


@router.post("/agents/strategy/{product_id}")
async def strategy(product_id: str, db: AsyncSession = Depends(get_db)):
    p = await db.get(Product, product_id)
    if not p:
        raise HTTPException(404, "produto não encontrado")
    research = await run_researcher({"title": p.title, "description": p.description})
    strat = await run_strategist({"title": p.title, "price": p.price}, research)
    s = Strategy(
        product_id=p.id,
        avatar=strat.get("avatar", {}),
        angles=strat.get("angulos", strat),
        ctas=strat.get("ctas", {}),
        prompt_version="v2",
    )
    db.add(s)
    await db.commit()
    await db.refresh(s)
    return {"strategy_id": s.id, "content": strat}


@router.post("/agents/content/{product_id}")
async def content_batch(product_id: str, db: AsyncSession = Depends(get_db)):
    p = await db.get(Product, product_id)
    if not p:
        raise HTTPException(404, "produto não encontrado")

    strat_q = await db.execute(
        select(Strategy).where(Strategy.product_id == product_id).order_by(Strategy.created_at.desc())
    )
    strat = strat_q.scalar_one_or_none()
    out = await run_content(
        {"title": p.title, "price": p.price, "affiliate_url": p.affiliate_url},
        strat.angles if strat else {},
    )

    # Salva conteúdo estruturado por canal
    channels = {
        "instagram": out.get("instagram", {}).get("legenda", ""),
        "tiktok": str(out.get("tiktok", {}).get("roteiro", "")),
        "whatsapp": out.get("whatsapp", {}).get("mensagem", ""),
    }
    for ch, body in channels.items():
        db.add(Content(
            product_id=p.id,
            strategy_id=strat.id if strat else None,
            type="post",
            channel=ch,
            body=body[:2000],
            meta={"carrossel": out.get("carrossel", []), "seo": out.get("descricao_seo", "")},
        ))
    await db.commit()
    return out


@router.post("/campaigns")
async def create_campaign(data: CampaignIn, db: AsyncSession = Depends(get_db)):
    c = Campaign(
        product_id=data.product_id,
        name=data.name,
        channel=data.channel,
        scheduled_at=data.scheduled_at,
        status="draft",
    )
    db.add(c)
    await db.commit()
    await db.refresh(c)
    return {
        "id": c.id,
        "name": c.name,
        "channel": c.channel,
        "status": c.status,
        "scheduled_at": c.scheduled_at.isoformat() if c.scheduled_at else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


@router.get("/campaigns")
async def list_campaigns(db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(Campaign).order_by(Campaign.created_at.desc()))
    campaigns = r.scalars().all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "channel": c.channel,
            "status": c.status,
            "product_id": c.product_id,
            "scheduled_at": c.scheduled_at.isoformat() if c.scheduled_at else None,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in campaigns
    ]


@router.post("/events/click")
async def click(product_id: str, campaign_id: str = None, db: AsyncSession = Depends(get_db)):
    e = Event(product_id=product_id, campaign_id=campaign_id, type="click", meta={})
    db.add(e)
    await db.commit()
    return {"ok": True}


@router.get("/analytics/summary")
async def analytics(db: AsyncSession = Depends(get_db)):
    clicks = await db.execute(select(func.count()).select_from(Event).where(Event.type == "click"))
    prods = await db.execute(select(func.count()).select_from(Product))
    camps = await db.execute(select(func.count()).select_from(Campaign))
    contents = await db.execute(select(func.count()).select_from(Content))
    agent_runs = await db.execute(select(func.count()).select_from(AgentRun))
    return {
        "clicks": clicks.scalar(),
        "products": prods.scalar(),
        "campaigns": camps.scalar(),
        "contents": contents.scalar(),
        "agent_runs": agent_runs.scalar(),
    }


@router.get("/settings")
async def get_settings(db: AsyncSession = Depends(get_db)):
    row = await db.get(AppSettings, "global")
    data = row.data if row else {}
    merged = {**DEFAULT_SERVICES, **data}
    return {"services": merged, "updated_at": row.updated_at.isoformat() if row and row.updated_at else None}

@router.put("/settings")
async def save_settings(payload: dict, db: AsyncSession = Depends(get_db)):
    services = payload.get("services", payload)
    row = await db.get(AppSettings, "global")
    if not row:
        row = AppSettings(id="global", data={**DEFAULT_SERVICES, **services})
        db.add(row)
    else:
        merged = {**DEFAULT_SERVICES, **(row.data or {}), **services}
        row.data = merged
    await db.commit()
    await db.refresh(row)
    return {"services": row.data, "updated_at": row.updated_at.isoformat()}

@router.get("/analytics/timeline")
async def analytics_timeline(days: int = 7, db: AsyncSession = Depends(get_db)):
    """Retorna cliques por dia nos últimos N dias."""
    timeline = []
    for i in range(days - 1, -1, -1):
        day_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        count = await db.execute(
            select(func.count()).select_from(Event).where(
                Event.type == "click",
                Event.created_at >= day_start,
                Event.created_at < day_end,
            )
        )
        timeline.append({
            "date": day_start.strftime("%d/%m"),
            "clicks": count.scalar(),
        })
    return timeline
