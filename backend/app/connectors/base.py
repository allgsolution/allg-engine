from abc import ABC, abstractmethod
import random

class MarketplaceConnector(ABC):
    slug: str

    @abstractmethod
    async def search(self, query: str, **filters) -> list[dict]: ...

    @abstractmethod
    async def normalize(self, raw: dict) -> dict: ...


class ShopeeMockConnector(MarketplaceConnector):
    slug = "shopee"

    async def search(self, query: str, **f):
        produtos = [
            {
                "title": f"[Shopee] {query} — Kit Premium Nacional",
                "price": round(random.uniform(49.9, 299.9), 2),
                "commission_rate": round(random.uniform(8, 18), 1),
                "image_url": "https://placehold.co/300x300/EE4D2D/white?text=Shopee",
                "marketplace": "shopee",
                "demand_score": random.randint(60, 95),
                "trend_score": random.randint(55, 90),
                "competition_score": random.randint(30, 70),
                "content_potential": random.randint(65, 95),
                "raw": {"source": "shopee_mock", "sales_rank": random.randint(1, 500)},
            },
            {
                "title": f"[Shopee] {query} — Versão Importada Top",
                "price": round(random.uniform(29.9, 149.9), 2),
                "commission_rate": round(random.uniform(10, 22), 1),
                "image_url": "https://placehold.co/300x300/EE4D2D/white?text=Shopee",
                "marketplace": "shopee",
                "demand_score": random.randint(50, 85),
                "trend_score": random.randint(70, 99),
                "competition_score": random.randint(20, 60),
                "content_potential": random.randint(70, 99),
                "raw": {"source": "shopee_mock", "sales_rank": random.randint(1, 200)},
            },
        ]
        return produtos

    async def normalize(self, raw: dict) -> dict:
        return raw


class MercadoLivreMockConnector(MarketplaceConnector):
    slug = "mercadolivre"

    async def search(self, query: str, **f):
        produtos = [
            {
                "title": f"[Mercado Livre] {query} — Full Envio Grátis",
                "price": round(random.uniform(89.9, 599.9), 2),
                "commission_rate": round(random.uniform(5, 12), 1),
                "image_url": "https://placehold.co/300x300/FFE600/333?text=ML",
                "marketplace": "mercadolivre",
                "demand_score": random.randint(65, 98),
                "trend_score": random.randint(50, 85),
                "competition_score": random.randint(40, 80),
                "content_potential": random.randint(55, 88),
                "raw": {"source": "ml_mock", "reputation": "platinum"},
            },
            {
                "title": f"[Mercado Livre] {query} — Oficial + NF",
                "price": round(random.uniform(199.9, 999.9), 2),
                "commission_rate": round(random.uniform(4, 9), 1),
                "image_url": "https://placehold.co/300x300/FFE600/333?text=ML",
                "marketplace": "mercadolivre",
                "demand_score": random.randint(70, 99),
                "trend_score": random.randint(45, 80),
                "competition_score": random.randint(50, 90),
                "content_potential": random.randint(50, 82),
                "raw": {"source": "ml_mock", "reputation": "gold"},
            },
        ]
        return produtos

    async def normalize(self, raw: dict) -> dict:
        return raw


class AliExpressMockConnector(MarketplaceConnector):
    slug = "aliexpress"

    async def search(self, query: str, **f):
        produtos = [
            {
                "title": f"[AliExpress] {query} — Global Ship Fast",
                "price": round(random.uniform(9.9, 99.9), 2),
                "commission_rate": round(random.uniform(6, 25), 1),
                "image_url": "https://placehold.co/300x300/FF4747/white?text=Ali",
                "marketplace": "aliexpress",
                "demand_score": random.randint(55, 88),
                "trend_score": random.randint(65, 95),
                "competition_score": random.randint(25, 55),
                "content_potential": random.randint(60, 92),
                "raw": {"source": "ali_mock", "store_rating": round(random.uniform(4.2, 5.0), 1)},
            },
            {
                "title": f"[AliExpress] {query} — Bestseller Choice",
                "price": round(random.uniform(19.9, 199.9), 2),
                "commission_rate": round(random.uniform(8, 20), 1),
                "image_url": "https://placehold.co/300x300/FF4747/white?text=Ali",
                "marketplace": "aliexpress",
                "demand_score": random.randint(60, 92),
                "trend_score": random.randint(72, 99),
                "competition_score": random.randint(20, 50),
                "content_potential": random.randint(75, 99),
                "raw": {"source": "ali_mock", "store_rating": round(random.uniform(4.5, 5.0), 1)},
            },
        ]
        return produtos

    async def normalize(self, raw: dict) -> dict:
        return raw


REGISTRY = {
    "shopee": ShopeeMockConnector(),
    "mercadolivre": MercadoLivreMockConnector(),
    "aliexpress": AliExpressMockConnector(),
}


def get_connector(slug: str) -> MarketplaceConnector:
    return REGISTRY.get(slug, REGISTRY["shopee"])
