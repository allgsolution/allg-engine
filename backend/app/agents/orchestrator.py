import httpx
from app.core.config import settings

SYSTEM_PROMPTS = {
    "researcher": (
        "Você é o Product Researcher do ALLG Affiliate Engine. "
        "Estruture as informações do produto em: público-alvo, principais benefícios, "
        "objeções comuns, concorrentes diretos e contexto de compra. "
        "Separe fatos de hipóteses. Seja objetivo e factual."
    ),
    "strategist": (
        "Você é o Strategy Agent do ALLG Affiliate Engine. "
        "Com base na pesquisa, crie: avatar do comprador ideal, posicionamento único, "
        "3 ângulos de venda distintos, principais dores e desejos, "
        "objeções e como quebrá-las, oferta irresistível e CTAs por canal. "
        "Inclua justificativa para cada decisão."
    ),
    "content": (
        "Você é o Content Engine do ALLG Affiliate Engine. "
        "Gere um lote de conteúdo multicanal completo: "
        "post para Instagram (legenda + hashtags), roteiro de TikTok/Short (60s), "
        "mensagem de WhatsApp/grupo, carrossel (5 slides com título e corpo), "
        "e descrição de produto otimizada para SEO. "
        "Use gancho forte, corpo persuasivo e CTA claro em cada formato."
    ),
}

# Mock responses estruturadas por agente — usadas quando não há LLM disponível
MOCK_RESPONSES = {
    "researcher": lambda payload: {
        "agent": "researcher",
        "produto": payload.get("title", "Produto"),
        "publico_alvo": {
            "perfil": "Adultos 25-45 anos, classe B/C, ativos nas redes sociais",
            "motivacao": "Busca praticidade, custo-benefício e qualidade comprovada",
            "canais_preferidos": ["Instagram", "TikTok", "WhatsApp"],
        },
        "beneficios_principais": [
            "Solução rápida para dor recorrente do consumidor",
            "Preço acessível com entrega rápida",
            "Avaliações positivas de compradores reais",
        ],
        "objecoes_comuns": [
            {"objecao": "É confiável?", "resposta": "Produto com mais de 4.5★ e milhares de avaliações"},
            {"objecao": "Vale o preço?", "resposta": "ROI claro: economiza tempo e resolve o problema definitivamente"},
            {"objecao": "Chega rápido?", "resposta": "Frete grátis com entrega garantida em até 7 dias úteis"},
        ],
        "contexto_de_compra": "Decisão de impulso moderada; comprador pesquisa comparação de preço antes de converter",
        "nota": "Dados baseados em padrões gerais do segmento — valide com dados reais do marketplace",
    },
    "strategist": lambda payload: {
        "agent": "strategist",
        "produto": payload.get("title", "Produto"),
        "avatar": {
            "nome": "Marcos, 32 anos",
            "descricao": "Trabalha em home office, pesquisa online antes de comprar, valoriza avaliações reais",
            "dores": ["Perde tempo com soluções ruins", "Desconfia de produtos baratos", "Quer resultado rápido"],
            "desejos": ["Praticidade", "Economia sem abrir mão da qualidade", "Status/reconhecimento"],
        },
        "posicionamento": f"O {payload.get('title', 'produto')} que entrega resultado real sem complicação",
        "angulos": [
            {
                "angulo": "Problema → Solução",
                "hook": "Cansado de gastar dinheiro em produtos que não funcionam?",
                "justificativa": "Ativa dor latente e posiciona o produto como alívio",
            },
            {
                "angulo": "Prova Social",
                "hook": "Mais de 10.000 pessoas já resolveram isso com esse produto",
                "justificativa": "Reduz risco percebido e aproveita efeito manada",
            },
            {
                "angulo": "Urgência / Escassez",
                "hook": "Última chance: promoção acaba hoje à meia-noite",
                "justificativa": "Combate procrastinação e acelera decisão de compra",
            },
        ],
        "ctas": {
            "instagram": "👇 Link na bio para garantir o seu!",
            "tiktok": "Comenta QUERO que eu mando o link!",
            "whatsapp": "Responda essa mensagem e te mando o cupom exclusivo agora!",
        },
    },
    "content": lambda payload: {
        "agent": "content",
        "produto": payload.get("title", "Produto"),
        "instagram": {
            "legenda": (
                f"🔥 Você PRECISA conhecer esse produto!\n\n"
                f"➡️ {payload.get('title', 'Produto')}\n\n"
                "✅ Qualidade comprovada\n"
                "✅ Melhor preço do mercado\n"
                "✅ Entrega rápida\n\n"
                "💰 Comissão atrativa para afiliados!\n\n"
                "👇 Link na bio — corre que é por tempo limitado!\n\n"
                "#afiliados #compraonline #oferta #tendencia #shopee"
            ),
            "hashtags": ["#afiliados", "#compraonline", "#oferta", "#tendencia"],
        },
        "tiktok": {
            "roteiro": (
                f"[0-3s] HOOK: 'Esse produto mudou minha vida e talvez mude a sua!'\n"
                f"[3-15s] PROBLEMA: Mostre a dor que o produto resolve\n"
                f"[15-45s] SOLUÇÃO: Demonstre o produto em uso, destaque benefícios\n"
                f"[45-55s] PROVA: Mostre avaliações ou resultado real\n"
                f"[55-60s] CTA: 'Comenta QUERO e te mando o link direto!'"
            ),
        },
        "whatsapp": {
            "mensagem": (
                f"Oi! 👋 Encontrei um produto incrível que preciso te mostrar:\n\n"
                f"🛒 *{payload.get('title', 'Produto')}*\n\n"
                "📦 Entrega rápida\n"
                "⭐ 4.8★ de avaliação\n"
                "💲 Melhor preço garantido\n\n"
                "Quer o link? Me responde aqui! 😊"
            ),
        },
        "carrossel": [
            {"slide": 1, "titulo": "Você conhece esse produto?", "corpo": "Que está tomando conta das redes sociais..."},
            {"slide": 2, "titulo": "O problema que ele resolve", "corpo": "Milhares de pessoas sofriam com isso antes..."},
            {"slide": 3, "titulo": "Como funciona", "corpo": "Simples, eficaz e comprovado por quem já usou..."},
            {"slide": 4, "titulo": "+10.000 clientes satisfeitos", "corpo": "Veja o que estão falando sobre o produto..."},
            {"slide": 5, "titulo": "Garanta o seu agora!", "corpo": "👇 Link na bio — Frete grátis hoje!"},
        ],
        "descricao_seo": (
            f"{payload.get('title', 'Produto')} — Compre com segurança e melhor preço. "
            "Produto com alta avaliação, entrega rápida e garantia do marketplace. "
            "Ideal para quem busca qualidade e custo-benefício. "
            "Confira todas as especificações e aproveite a promoção exclusiva."
        ),
    },
}


async def call_llm(agent: str, payload: dict) -> dict:
    system_prompt = SYSTEM_PROMPTS[agent]
    user_input = f"PRODUTO/CONTEXTO: {payload}"
    full_prompt = f"{system_prompt}\n\n{user_input}"

    # Tenta OpenAI se a chave estiver configurada
    if settings.openai_api_key:
        try:
            async with httpx.AsyncClient(timeout=30) as c:
                r = await c.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_input},
                        ],
                        "temperature": 0.7,
                    },
                )
                if r.status_code == 200:
                    content = r.json()["choices"][0]["message"]["content"]
                    return {"agent": agent, "content": content, "source": "openai", "raw": payload}
        except Exception:
            pass

    # Tenta Ollama local
    try:
        async with httpx.AsyncClient(timeout=25) as c:
            r = await c.post(
                f"{settings.ollama_url}/api/generate",
                json={"model": "llama3", "prompt": full_prompt, "stream": False},
            )
            if r.status_code == 200:
                content = r.json().get("response", "")
                return {"agent": agent, "content": content, "source": "ollama", "raw": payload}
    except Exception:
        pass

    # Fallback: mock estruturado por agente
    mock_fn = MOCK_RESPONSES.get(agent)
    if mock_fn:
        return {**mock_fn(payload), "source": "mock"}
    return {"agent": agent, "content": f"[MOCK] Saída do agente {agent}", "source": "mock", "raw": payload}


async def run_researcher(product: dict) -> dict:
    return await call_llm("researcher", product)


async def run_strategist(product: dict, research: dict) -> dict:
    return await call_llm("strategist", {**product, "research": research})


async def run_content(product: dict, strategy: dict) -> dict:
    return await call_llm("content", {**product, "strategy": strategy})
