import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { logoBase64 } from '../assets/logo'
import {
  IconeDashboard,
  IconeEmpreendimentos,
  IconeUnidades,
  IconeRelatorios,
  IconeConfiguracoes,
} from '../assets/icones'

const MODULOS = [
  { path: '/', label: 'Dashboard', Icone: IconeDashboard },
  { path: '/empreendimentos', label: 'Empreendimentos', Icone: IconeEmpreendimentos },
  { path: '/unidades', label: 'Unidades', Icone: IconeUnidades },
  { path: '/relatorios', label: 'Relatórios', Icone: IconeRelatorios },
  { path: '/configuracoes', label: 'Configurações', Icone: IconeConfiguracoes },
]

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
          <img src={logoBase64} alt="Grupo LL" className="topbar-logo" />
          <span className="topbar-divisor" />
          <span className="topbar-empresa">Sistema de legalização</span>
        </div>
        <div className="topbar-right">
          <button
            className="topbar-alertas"
            onClick={() => navigate('/?aba=alertas')}
            aria-label={`${alertasNaoLidos} alertas não lidos`}
          >
            <i className="ti ti-bell" aria-hidden="true" />
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
              <m.Icone />
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
