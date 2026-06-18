import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

const MODULOS = [
  { path: '/', label: 'Dashboard', icone: 'chart-bar' },
  { path: '/empreendimentos', label: 'Empreendimentos', icone: 'building-community' },
  { path: '/unidades', label: 'Unidades', icone: 'home' },
  { path: '/relatorios', label: 'Relatórios', icone: 'report' },
  { path: '/configuracoes', label: 'Configurações', icone: 'settings' },
]

function Icone({ nome, className = '' }) {
  return <i className={`ti ti-${nome} ${className}`} aria-hidden="true" />
}

export default function Layout() {
  const { perfil, sair } = useAuth()
  const navigate = useNavigate()
  const [alertasNaoLidos, setAlertasNaoLidos] = useState(0)

  useEffect(() => {
    carregarContagemAlertas()

    const canal = supabase
      .channel('alertas-contagem')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alertas' }, () => {
        carregarContagemAlertas()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  async function carregarContagemAlertas() {
    const { count } = await supabase
      .from('alertas')
      .select('id', { count: 'exact', head: true })
      .eq('lido', false)

    setAlertasNaoLidos(count || 0)
  }

  async function handleSair() {
    await sair()
    navigate('/login')
  }

  const iniciais = perfil?.nome_completo
    ? perfil.nome_completo
        .split(' ')
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase()
    : '?'

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-brand">LEGALIZA+</span>
          <span className="topbar-empresa">LL Empreendimentos Imobiliários</span>
        </div>
        <div className="topbar-right">
          <button
            className="topbar-alertas"
            onClick={() => navigate('/?aba=alertas')}
            aria-label={`${alertasNaoLidos} alertas não lidos`}
          >
            <Icone nome="bell" />
            {alertasNaoLidos > 0 && <span className="badge-alertas">{alertasNaoLidos}</span>}
          </button>
          <div className="topbar-usuario">
            <span className="avatar">{iniciais}</span>
            <div className="topbar-usuario-info">
              <span className="topbar-usuario-nome">{perfil?.nome_completo || '...'}</span>
              <span className="topbar-usuario-perfil">{perfil?.perfil}</span>
            </div>
            <button className="topbar-sair" onClick={handleSair}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <nav className="modulos-grid">
        {MODULOS.map((m) => (
          <NavLink
            key={m.path}
            to={m.path}
            end={m.path === '/'}
            className={({ isActive }) => `modulo-item ${isActive ? 'modulo-item-ativo' : ''}`}
          >
            <span className="modulo-icone-wrap">
              <Icone nome={m.icone} />
            </span>
            <span className="modulo-label">{m.label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
