import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'

export default function ConfiguracoesLayout() {
  return (
    <div>
      <div className="pagina-cabecalho">
        <div>
          <p className="pagina-titulo">Configurações</p>
          <p className="pagina-subtitulo">Usuários, permissões e parâmetros do sistema</p>
        </div>
      </div>

      <div className="abas">
        <NavLink to="" end className={({ isActive }) => `aba ${isActive ? 'aba-ativa' : ''}`}>
          Usuários e permissões
        </NavLink>
        <NavLink to="auditoria" className={({ isActive }) => `aba ${isActive ? 'aba-ativa' : ''}`}>
          Auditoria
        </NavLink>
        <NavLink to="tipos-etapa" className={({ isActive }) => `aba ${isActive ? 'aba-ativa' : ''}`}>
          Tipos de etapa
        </NavLink>
      </div>

      <Outlet />
    </div>
  )
}

export function GerenciarUsuarios() {
  const { ehAdmin } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    const { data } = await supabase.from('perfis').select('*').order('nome_completo')
    setUsuarios(data || [])
    setCarregando(false)
  }

  async function handleAlterarPerfil(usuarioId, novoPerfil) {
    await supabase.from('perfis').update({ perfil: novoPerfil }).eq('id', usuarioId)
    carregar()
  }

  async function handleAlterarAtivo(usuarioId, novoAtivo) {
    await supabase.from('perfis').update({ ativo: novoAtivo }).eq('id', usuarioId)
    carregar()
  }

  if (carregando) return <p className="estado-carregando">Carregando...</p>

  return (
    <div className="card-painel">
      {!ehAdmin && (
        <p className="aviso-info">Apenas administradores podem alterar perfis de outros usuários.</p>
      )}
      <table className="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Perfil</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.nome_completo}</td>
              <td>
                {ehAdmin ? (
                  <select value={u.perfil} onChange={(e) => handleAlterarPerfil(u.id, e.target.value)}>
                    <option value="visualizante">Visualizante</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className="capitalize">{u.perfil}</span>
                )}
              </td>
              <td>
                {ehAdmin ? (
                  <button
                    className={`badge-botao ${u.ativo ? 'badge-success' : 'badge-neutro'}`}
                    onClick={() => handleAlterarAtivo(u.id, !u.ativo)}
                  >
                    {u.ativo ? 'ativo' : 'inativo'}
                  </button>
                ) : (
                  <span className={`badge ${u.ativo ? 'badge-success' : 'badge-neutro'}`}>
                    {u.ativo ? 'ativo' : 'inativo'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="formulario-info">
        Novos usuários precisam ser criados pelo painel do Supabase (Authentication) e depois aparecem
        aqui automaticamente como "visualizante" para você promover.
      </p>
    </div>
  )
}

export function PainelAuditoria() {
  const { ehAdmin } = useAuth()
  const [logs, setLogs] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!ehAdmin) {
      setCarregando(false)
      return
    }
    supabase
      .from('log_auditoria')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setLogs(data || [])
        setCarregando(false)
      })
  }, [ehAdmin])

  if (!ehAdmin) {
    return <p className="estado-erro">Apenas administradores podem visualizar o log de auditoria.</p>
  }

  if (carregando) return <p className="estado-carregando">Carregando...</p>

  return (
    <div className="card-painel">
      {logs.length === 0 ? (
        <p className="lista-vazia">Nenhum registro de auditoria ainda.</p>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th>Data/hora</th>
              <th>Tabela</th>
              <th>Operação</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.criado_em).toLocaleString('pt-BR')}</td>
                <td>{log.tabela}</td>
                <td className="capitalize">{log.operacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export function GerenciarTiposEtapa() {
  const { ehAdmin } = useAuth()
  const [tipos, setTipos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase
      .from('tipos_etapa')
      .select('*')
      .order('ordem_padrao')
      .then(({ data }) => {
        setTipos(data || [])
        setCarregando(false)
      })
  }, [])

  async function handleSalvarDias(tipoId, campo, valor) {
    await supabase
      .from('tipos_etapa')
      .update({ [campo]: Number(valor) })
      .eq('id', tipoId)
  }

  if (carregando) return <p className="estado-carregando">Carregando...</p>

  return (
    <div className="card-painel">
      <table className="tabela">
        <thead>
          <tr>
            <th>Etapa</th>
            <th>Avisar (dias antes do vencimento)</th>
            <th>Avisar (dias sem movimento)</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map((t) => (
            <tr key={t.id}>
              <td>{t.nome}</td>
              <td>
                <input
                  type="number"
                  className="input-numero-tabela"
                  defaultValue={t.dias_alerta_vencimento}
                  disabled={!ehAdmin}
                  onBlur={(e) => handleSalvarDias(t.id, 'dias_alerta_vencimento', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  className="input-numero-tabela"
                  defaultValue={t.dias_alerta_parada}
                  disabled={!ehAdmin}
                  onBlur={(e) => handleSalvarDias(t.id, 'dias_alerta_parada', e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
