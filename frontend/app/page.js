"use client"
import { useEffect, useState, useCallback } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// ─── Toast System ────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])
  return { toasts, addToast }
}

const TOAST_ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">{TOAST_ICONS[t.type]}</span>
          <span className="toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ─── API helpers ─────────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ─── Score helper ─────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const cls = score >= 70 ? 'score-high' : score >= 45 ? 'score-mid' : 'score-low'
  return <div className={`score-ring ${cls}`}>{Math.round(score)}</div>
}

function MarketplaceBadge({ slug }) {
  const map = {
    shopee: { label: 'Shopee', cls: 'badge-shopee' },
    mercadolivre: { label: 'Mercado Livre', cls: 'badge-mercadolivre' },
    aliexpress: { label: 'AliExpress', cls: 'badge-aliexpress' },
  }
  const m = map[slug] || { label: slug, cls: 'badge-info' }
  return <span className={`badge ${m.cls}`}>{m.label}</span>
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'products', icon: '🛒', label: 'Produtos' },
  { id: 'opportunities', icon: '🔍', label: 'Oportunidades' },
  { id: 'agents', icon: '🤖', label: 'Agentes IA' },
  { id: 'campaigns', icon: '📅', label: 'Campanhas' },
  { id: 'settings', icon: '⚙️', label: 'Configurações' },
]

function Sidebar({ active, onNav, services }) {
  const n8nUrl = services?.n8n_url || 'http://localhost:5678'
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <div>
          <div className="sidebar-logo-text">ALLG Engine</div>
          <div className="sidebar-logo-version">v0.1 MVP</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Principal</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onNav(item.id)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
        <div className="nav-section-label">Recursos</div>
        <a
          href={`${API}/docs`}
          target="_blank"
          rel="noreferrer"
          className="nav-item"
          style={{ textDecoration: 'none' }}
        >
          <span className="nav-item-icon">📖</span>
          API Docs
        </a>
        <a
          href={n8nUrl}
          target="_blank"
          rel="noreferrer"
          className="nav-item"
          style={{ textDecoration: 'none' }}
        >
          <span className="nav-item-icon">🔗</span>
          n8n Workflows
        </a>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-badge">
          <span>🟢</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Sistema Online</div>
            <div style={{ fontSize: 11 }}>API conectada</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ─── Dashboard Page ────────────────────────────────────────────────────────
function DashboardPage({ metrics, timeline, loading }) {
  const FLOW = ['Produto', 'Pesquisa', 'Estratégia', 'Conteúdo', 'Campanha', 'Métricas', 'Otimização']

  const METRIC_CARDS = [
    { icon: '🛒', label: 'Produtos', value: metrics?.products ?? 0 },
    { icon: '📅', label: 'Campanhas', value: metrics?.campaigns ?? 0 },
    { icon: '👆', label: 'Cliques', value: metrics?.clicks ?? 0 },
    { icon: '✍️', label: 'Conteúdos', value: metrics?.contents ?? 0 },
    { icon: '🤖', label: 'Runs IA', value: metrics?.agent_runs ?? 0 },
  ]

  return (
    <div className="animate-fade">
      {/* Flow */}
      <div className="flow-steps">
        {FLOW.map((step, i) => (
          <span key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="flow-step active">{step}</span>
            {i < FLOW.length - 1 && <span className="flow-arrow">→</span>}
          </span>
        ))}
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        {METRIC_CARDS.map(m => (
          <div key={m.label} className="metric-card">
            <span className="metric-icon">{m.icon}</span>
            {loading
              ? <div className="skeleton" style={{ height: 32, width: 60, marginBottom: 8 }} />
              : <div className="metric-value">{m.value}</div>
            }
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Timeline chart */}
      <div className="card">
        <div className="section-header">
          <div>
            <div className="section-title">📈 Cliques — Últimos 7 dias</div>
            <div className="section-subtitle">Eventos registrados por dia</div>
          </div>
        </div>
        {loading
          ? <div className="skeleton" style={{ height: 80 }} />
          : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
              {(timeline || []).map(d => {
                const max = Math.max(...(timeline || []).map(x => x.clicks), 1)
                const h = Math.max(4, (d.clicks / max) * 72)
                return (
                  <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      height: h,
                      background: 'linear-gradient(180deg, var(--accent-primary), var(--accent-secondary))',
                      borderRadius: '4px 4px 0 0',
                      width: '100%',
                      minHeight: 4,
                      opacity: d.clicks > 0 ? 1 : 0.2,
                      transition: 'height 0.5s ease',
                    }} />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.date}</span>
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    </div>
  )
}

// ─── Products Page ─────────────────────────────────────────────────────────
function ProductsPage({ products, loading, onRefresh, toast }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    marketplace_slug: 'shopee', title: '', description: '',
    price: '', commission_rate: '', affiliate_url: '', image_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [agentResult, setAgentResult] = useState({})
  const [agentLoading, setAgentLoading] = useState({})
  const [activeTab, setActiveTab] = useState({})

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price) || 0,
          commission_rate: parseFloat(form.commission_rate) || 0,
        }),
      })
      toast('Produto cadastrado com sucesso!', 'success')
      setShowModal(false)
      setForm({ marketplace_slug: 'shopee', title: '', description: '', price: '', commission_rate: '', affiliate_url: '', image_url: '' })
      onRefresh()
    } catch {
      toast('Erro ao salvar produto.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const runAgent = async (productId, agent) => {
    setAgentLoading(prev => ({ ...prev, [`${productId}-${agent}`]: true }))
    try {
      const r = await apiFetch(`/api/agents/${agent}/${productId}`, { method: 'POST' })
      setAgentResult(prev => ({ ...prev, [`${productId}-${agent}`]: r }))
      setActiveTab(prev => ({ ...prev, [productId]: agent }))
      toast(`Agente ${agent} concluído!`, 'success')
    } catch {
      toast(`Erro ao executar agente ${agent}.`, 'error')
    } finally {
      setAgentLoading(prev => ({ ...prev, [`${productId}-${agent}`]: false }))
    }
  }

  const simulateClick = async (productId) => {
    try {
      await apiFetch(`/api/events/click?product_id=${productId}`, { method: 'POST' })
      toast('Clique registrado!', 'info')
      onRefresh()
    } catch { toast('Erro ao registrar clique.', 'error') }
  }

  return (
    <div className="animate-fade">
      <div className="section-header">
        <div>
          <div className="section-title">🛒 Produtos Afiliados</div>
          <div className="section-subtitle">{products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ＋ Novo Produto
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: 14 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-text">Nenhum produto ainda</div>
            <div className="empty-state-sub">Clique em "+ Novo Produto" para começar</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {products.map(p => {
            const currentAgent = activeTab[p.id]
            const result = currentAgent ? agentResult[`${p.id}-${currentAgent}`] : null
            return (
              <div key={p.id} className="product-card">
                <div className="product-header">
                  <div className="product-title">{p.title}</div>
                  <ScoreRing score={p.score || 0} />
                </div>
                <div className="product-meta">
                  <MarketplaceBadge slug={p.marketplace_slug} />
                  {p.price > 0 && (
                    <span className="badge badge-info">
                      R$ {Number(p.price).toFixed(2)}
                    </span>
                  )}
                  {p.commission_rate > 0 && (
                    <span className="badge badge-success">
                      {p.commission_rate}% comissão
                    </span>
                  )}
                </div>
                <div className="product-actions">
                  {['research', 'strategy', 'content'].map(agent => {
                    const isLoading = agentLoading[`${p.id}-${agent}`]
                    const labels = { research: '🔬 Pesquisar', strategy: '🧠 Estratégia', content: '✍️ Conteúdo' }
                    return (
                      <button
                        key={agent}
                        className="btn btn-secondary btn-sm"
                        disabled={isLoading}
                        onClick={() => runAgent(p.id, agent)}
                      >
                        {isLoading ? <span className="loading-pulse">⏳</span> : null}
                        {labels[agent]}
                      </button>
                    )
                  })}
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => simulateClick(p.id)}
                  >
                    👆 Simular Clique
                  </button>
                  {p.affiliate_url && (
                    <a
                      href={p.affiliate_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      🔗 Link
                    </a>
                  )}
                </div>

                {/* Agent result */}
                {result && (
                  <div className="result-panel">
                    <div className="tabs">
                      {['research', 'strategy', 'content']
                        .filter(a => agentResult[`${p.id}-${a}`])
                        .map(a => (
                          <button
                            key={a}
                            className={`tab ${currentAgent === a ? 'active' : ''}`}
                            onClick={() => setActiveTab(prev => ({ ...prev, [p.id]: a }))}
                          >
                            {{ research: '🔬 Pesquisa', strategy: '🧠 Estratégia', content: '✍️ Conteúdo' }[a]}
                          </button>
                        ))}
                    </div>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="section-title">➕ Cadastrar Produto</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="form-grid" style={{ gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Marketplace</label>
                  <select
                    className="form-select"
                    value={form.marketplace_slug}
                    onChange={e => setForm({ ...form, marketplace_slug: e.target.value })}
                  >
                    <option value="shopee">🛍️ Shopee</option>
                    <option value="mercadolivre">🟡 Mercado Livre</option>
                    <option value="aliexpress">🔴 AliExpress</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Título do Produto *</label>
                  <input
                    className="form-input"
                    placeholder="Ex: Fone Bluetooth Premium XYZ"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Descrição</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Descreva o produto, diferenciais, público-alvo..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Preço (R$)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comissão (%)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={form.commission_rate}
                      onChange={e => setForm({ ...form, commission_rate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Link de Afiliado</label>
                  <input
                    className="form-input"
                    type="url"
                    placeholder="https://..."
                    value={form.affiliate_url}
                    onChange={e => setForm({ ...form, affiliate_url: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">URL da Imagem</label>
                  <input
                    className="form-input"
                    type="url"
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={e => setForm({ ...form, image_url: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Salvando...' : '✓ Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Opportunities Page ────────────────────────────────────────────────────
function OpportunitiesPage({ toast }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    marketplace: 'shopee', nicho: '', price_min: '', price_max: '', commission_min: '',
  })

  const search = async () => {
    setLoading(true)
    try {
      const body = {
        marketplace: filters.marketplace,
        nicho: filters.nicho || 'tendência',
        ...(filters.price_min && { price_min: parseFloat(filters.price_min) }),
        ...(filters.price_max && { price_max: parseFloat(filters.price_max) }),
        ...(filters.commission_min && { commission_min: parseFloat(filters.commission_min) }),
      }
      const r = await apiFetch('/api/opportunities', { method: 'POST', body: JSON.stringify(body) })
      setResults(r)
      toast(`${r.length} oportunidade${r.length !== 1 ? 's' : ''} encontrada${r.length !== 1 ? 's' : ''}!`, 'success')
    } catch {
      toast('Erro ao buscar oportunidades.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade">
      <div className="section-header">
        <div>
          <div className="section-title">🔍 Caçador de Oportunidades</div>
          <div className="section-subtitle">Score = Demanda + Tendência + Comissão + Potencial − Concorrência</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-grid" style={{ gap: 14 }}>
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label">Marketplace</label>
              <select
                className="form-select"
                value={filters.marketplace}
                onChange={e => setFilters({ ...filters, marketplace: e.target.value })}
              >
                <option value="shopee">🛍️ Shopee</option>
                <option value="mercadolivre">🟡 Mercado Livre</option>
                <option value="aliexpress">🔴 AliExpress</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nicho / Palavra-chave</label>
              <input
                className="form-input"
                placeholder="Ex: smartwatch, beleza, casa..."
                value={filters.nicho}
                onChange={e => setFilters({ ...filters, nicho: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Comissão mínima (%)</label>
              <input
                className="form-input"
                type="number"
                placeholder="Ex: 10"
                value={filters.commission_min}
                onChange={e => setFilters({ ...filters, commission_min: e.target.value })}
              />
            </div>
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Preço mínimo (R$)</label>
              <input
                className="form-input"
                type="number"
                placeholder="0.00"
                value={filters.price_min}
                onChange={e => setFilters({ ...filters, price_min: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Preço máximo (R$)</label>
              <input
                className="form-input"
                type="number"
                placeholder="9999.00"
                value={filters.price_max}
                onChange={e => setFilters({ ...filters, price_max: e.target.value })}
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={search} disabled={loading}>
            {loading ? '⏳ Buscando...' : '🔍 Buscar Oportunidades'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'grid', gap: 12 }}>
          {results.map((item, i) => (
            <div key={i} className="opp-card">
              <ScoreRing score={item.score} />
              <div className="opp-info">
                <div className="opp-title">{item.title}</div>
                <div className="opp-meta">
                  <MarketplaceBadge slug={item.marketplace || filters.marketplace} />
                  {item.price && <span className="badge badge-info">R$ {Number(item.price).toFixed(2)}</span>}
                  {item.commission_rate && <span className="badge badge-success">{item.commission_rate}% comissão</span>}
                  {item.trend_score >= 80 && <span className="badge badge-purple">🔥 Em Alta</span>}
                  {item.competition_score <= 40 && <span className="badge badge-warning">🎯 Baixa Concorrência</span>}
                </div>
                <div className="opp-justification">{item.justificativa}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-text">Configure os filtros e busque oportunidades</div>
            <div className="empty-state-sub">Score baseado em 5 fatores: demanda, tendência, comissão, potencial de conteúdo e concorrência</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Campaigns Page ────────────────────────────────────────────────────────
function CampaignsPage({ products, toast }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ product_id: '', name: '', channel: 'instagram', scheduled_at: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await apiFetch('/api/campaigns')
      setCampaigns(r)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiFetch('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          scheduled_at: form.scheduled_at || null,
        }),
      })
      toast('Campanha criada!', 'success')
      setShowModal(false)
      setForm({ product_id: '', name: '', channel: 'instagram', scheduled_at: '' })
      load()
    } catch {
      toast('Erro ao criar campanha.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const STATUS_COLORS = { draft: 'badge-warning', active: 'badge-success', paused: 'badge-info', finished: 'badge-purple' }
  const CHANNEL_ICONS = { instagram: '📸', tiktok: '🎵', whatsapp: '💬', youtube: '▶️', facebook: '👥' }

  return (
    <div className="animate-fade">
      <div className="section-header">
        <div>
          <div className="section-title">📅 Campanhas</div>
          <div className="section-subtitle">{campaigns.length} campanha{campaigns.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ＋ Nova Campanha
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />)}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div className="empty-state-icon">📅</div>
            <div className="empty-state-text">Nenhuma campanha criada</div>
            <div className="empty-state-sub">Crie sua primeira campanha para organizar a distribuição de conteúdo</div>
          </div>
        ) : (
          campaigns.map(c => (
            <div key={c.id} className="campaign-item">
              <span style={{ fontSize: 20 }}>{CHANNEL_ICONS[c.channel] || '📢'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {c.channel} {c.scheduled_at ? `· 📅 ${new Date(c.scheduled_at).toLocaleDateString('pt-BR')}` : '· Sem data'}
                </div>
              </div>
              <span className={`badge ${STATUS_COLORS[c.status] || 'badge-info'}`}>{c.status}</span>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="section-title">📅 Nova Campanha</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="form-grid" style={{ gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Produto *</label>
                  <select
                    className="form-select"
                    value={form.product_id}
                    onChange={e => setForm({ ...form, product_id: e.target.value })}
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nome da Campanha *</label>
                  <input
                    className="form-input"
                    placeholder="Ex: Lançamento Verão 2026"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Canal</label>
                    <select
                      className="form-select"
                      value={form.channel}
                      onChange={e => setForm({ ...form, channel: e.target.value })}
                    >
                      <option value="instagram">📸 Instagram</option>
                      <option value="tiktok">🎵 TikTok</option>
                      <option value="whatsapp">💬 WhatsApp</option>
                      <option value="youtube">▶️ YouTube</option>
                      <option value="facebook">👥 Facebook</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Data agendada</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={form.scheduled_at}
                      onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Criando...' : '✓ Criar Campanha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsPage({ toast }) {
  const [services, setServices] = useState(null)
  const [saving, setSaving] = useState(false)
  const FIELDS = [
    { key: 'n8n_url', label: 'n8n', icon: '🔗', placeholder: 'https://n8.allgbr.com', hint: 'Workflows e automações' },
    { key: 'api_url', label: 'API', icon: '⚡', placeholder: 'https://api.allgbr.com', hint: 'Backend FastAPI' },
    { key: 'frontend_url', label: 'Frontend', icon: '🖥️', placeholder: 'https://app.allgbr.com', hint: 'Painel Next.js' },
    { key: 'ollama_url', label: 'Ollama / IA', icon: '🤖', placeholder: 'http://ollama:11434', hint: 'LLM local ou remoto' },
    { key: 'postgres_url', label: 'PostgreSQL', icon: '🐘', placeholder: 'postgresql://...', hint: 'Banco transacional + pgvector' },
    { key: 'redis_url', label: 'Redis', icon: '🔴', placeholder: 'redis://redis:6379/0', hint: 'Cache e fila' },
    { key: 'minio_url', label: 'MinIO S3', icon: '🪣', placeholder: 'http://minio:9000', hint: 'Storage de mídia' },
    { key: 'minio_console_url', label: 'MinIO Console', icon: '📦', placeholder: 'http://minio:9001', hint: 'Console MinIO' },
    { key: 'traefik_url', label: 'Traefik / Portainer', icon: '🌐', placeholder: 'https://traefik.allgbr.com', hint: 'Proxy / dashboard' },
  ]
  useEffect(() => { apiFetch('/api/settings').then(r => setServices(r.services)).catch(()=>{}) }, [])
  const save = async () => {
    setSaving(true)
    try { await apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify({ services }) }); toast('Configurações salvas!', 'success') } catch { toast('Erro ao salvar', 'error') } finally { setSaving(false) }
  }
  if (!services) return <div className="skeleton" style={{ height: 300 }} />
  return (
    <div className="animate-fade">
      <div className="section-header"><div><div className="section-title">⚙️ Configurações de Serviços</div><div className="section-subtitle">Defina o caminho/URL de cada serviço — ex: n8n = n8.allgbr.com</div></div><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? '⏳ Salvando...' : '💾 Salvar'}</button></div>
      <div className="card" style={{ display: 'grid', gap: 14 }}>
        {FIELDS.map(f => (
          <div key={f.key} className="form-group">
            <label className="form-label"><span style={{ marginRight: 6 }}>{f.icon}</span>{f.label} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— {f.hint}</span></label>
            <input className="form-input" value={services[f.key] || ''} placeholder={f.placeholder} onChange={e => setServices({ ...services, [f.key]: e.target.value })} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {Object.entries(services).slice(0, 3).map(([k, v]) => <a key={k} href={v} target="_blank" rel="noreferrer" className="badge badge-info" style={{ textDecoration: 'none' }}>🔗 {k}: {String(v).slice(0, 30)}</a>)}
        </div>
      </div>
    </div>
  )
}

// ─── Agents Page ──────────────────────────────────────────────────────────
function AgentsPage({ products, toast }) {
  const [selectedProduct, setSelectedProduct] = useState('')
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState({})
  const [activeTab, setActiveTab] = useState('research')

  const AGENTS = [
    { id: 'research', icon: '🔬', label: 'Researcher', desc: 'Pesquisa público, benefícios, objeções e contexto de compra' },
    { id: 'strategy', icon: '🧠', label: 'Strategist', desc: 'Avatar, posicionamento, ângulos de venda e CTAs' },
    { id: 'content', icon: '✍️', label: 'Content Engine', desc: 'Posts Instagram, roteiro TikTok, mensagem WhatsApp e carrossel' },
  ]

  const run = async (agent) => {
    if (!selectedProduct) { toast('Selecione um produto primeiro!', 'warning'); return }
    setLoading(prev => ({ ...prev, [agent]: true }))
    try {
      const r = await apiFetch(`/api/agents/${agent}/${selectedProduct}`, { method: 'POST' })
      setResults(prev => ({ ...prev, [agent]: r }))
      setActiveTab(agent)
      toast(`Agente ${agent} executado!`, 'success')
    } catch {
      toast(`Erro ao executar agente ${agent}.`, 'error')
    } finally {
      setLoading(prev => ({ ...prev, [agent]: false }))
    }
  }

  const activeResult = results[activeTab]

  return (
    <div className="animate-fade">
      <div className="section-header">
        <div>
          <div className="section-title">🤖 Agentes de IA</div>
          <div className="section-subtitle">Selecione um produto e execute os agentes em sequência</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-group">
          <label className="form-label">Produto alvo</label>
          <select
            className="form-select"
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
          >
            <option value="">— Selecione um produto —</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        {AGENTS.map(a => (
          <div key={a.id} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{a.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{a.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>{a.desc}</div>
            {results[a.id] && (
              <div style={{ marginBottom: 10 }}>
                <span className="badge badge-success">✓ Concluído</span>
              </div>
            )}
            <button
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
              disabled={loading[a.id] || !selectedProduct}
              onClick={() => run(a.id)}
            >
              {loading[a.id] ? '⏳ Executando...' : `Executar ${a.label}`}
            </button>
          </div>
        ))}
      </div>

      {Object.keys(results).length > 0 && (
        <div className="card">
          <div className="section-header">
            <div className="section-title">📋 Resultados</div>
          </div>
          <div className="tabs">
            {AGENTS.filter(a => results[a.id]).map(a => (
              <button
                key={a.id}
                className={`tab ${activeTab === a.id ? 'active' : ''}`}
                onClick={() => setActiveTab(a.id)}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>
          {activeResult && (
            <div className="result-panel" style={{ margin: 0 }}>
              <pre>{JSON.stringify(activeResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────
export default function Home() {
  const [page, setPage] = useState('dashboard')
  const [products, setProducts] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [services, setServices] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toasts, addToast } = useToast()

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [prods, met, tl, svc] = await Promise.allSettled([
        apiFetch('/api/products'),
        apiFetch('/api/analytics/summary'),
        apiFetch('/api/analytics/timeline'),
        apiFetch('/api/settings'),
      ])
      if (prods.status === 'fulfilled') setProducts(Array.isArray(prods.value) ? prods.value : [])
      if (met.status === 'fulfilled') setMetrics(met.value)
      if (tl.status === 'fulfilled') setTimeline(Array.isArray(tl.value) ? tl.value : [])
      if (svc.status === 'fulfilled') setServices(svc.value.services)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const PAGE_TITLES = {
    dashboard: { title: 'Dashboard', subtitle: 'Visão geral do seu motor de afiliados' },
    products: { title: 'Produtos', subtitle: 'Gerencie seus produtos afiliados' },
    opportunities: { title: 'Oportunidades', subtitle: 'Descubra produtos com alto potencial' },
    agents: { title: 'Agentes IA', subtitle: 'Pesquise, estrategize e gere conteúdo com IA' },
    campaigns: { title: 'Campanhas', subtitle: 'Organize e agende sua distribuição de conteúdo' },
    settings: { title: 'Configurações', subtitle: 'Caminhos e URLs dos serviços' },
  }

  const current = PAGE_TITLES[page] || PAGE_TITLES.dashboard

  return (
    <div className="app-layout">
      <Sidebar active={page} onNav={setPage} services={services} />

      <div className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">{current.title}</div>
            <div className="topbar-subtitle">{current.subtitle}</div>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={loadAll}>
              🔄 Atualizar
            </button>
          </div>
        </header>

        <main className="page-content">
          {page === 'dashboard' && (
            <DashboardPage metrics={metrics} timeline={timeline} loading={loading} />
          )}
          {page === 'products' && (
            <ProductsPage
              products={products}
              loading={loading}
              onRefresh={loadAll}
              toast={addToast}
            />
          )}
          {page === 'opportunities' && (
            <OpportunitiesPage toast={addToast} />
          )}
          {page === 'agents' && (
            <AgentsPage products={products} toast={addToast} />
          )}
          {page === 'campaigns' && (
            <CampaignsPage products={products} toast={addToast} />
          )}
          {page === 'settings' && (
            <SettingsPage toast={addToast} />
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
