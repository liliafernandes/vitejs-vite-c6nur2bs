import { useEffect, useState } from 'react'
import { useNavigate, NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function ordenarPorLote(lista) {
  return [...lista].sort((a, b) => {
    const numA = Number(a.numero_lote)
    const numB = Number(b.numero_lote)
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB
    return (a.numero_lote || '').localeCompare(b.numero_lote || '')
  })
}

export default function UnidadesLayout() {
  return (
    <div>
      <div className="pagina-cabecalho">
        <div>
          <p className="pagina-titulo">Unidades</p>
          <p className="pagina-subtitulo">Casas e lotes de todos os empreendimentos</p>
        </div>
      </div>

      <div className="abas">
        <NavLink to="" end className={({ isActive }) => `aba ${isActive ? 'aba-ativa' : ''}`}>
          Gerenciar
        </NavLink>
        <NavLink to="novo" className={({ isActive }) => `aba ${isActive ? 'aba-ativa' : ''}`}>
          Lançar nova
        </NavLink>
      </div>

      <Outlet />
    </div>
  )
}

export function ListaUnidades() {
  const navigate = useNavigate()
  const [unidades, setUnidades] = useState([])
  const [empreendimentos, setEmpreendimentos] = useState([])
  const [filtroEmpreendimento, setFiltroEmpreendimento] = useState('')
  const [filtroBusca, setFiltroBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    supabase
      .from('empreendimentos')
      .select('id, nome')
      .order('nome')
      .then(({ data }) => setEmpreendimentos(data || []))
  }, [])

  useEffect(() => {
    carregar()
  }, [filtroEmpreendimento])

  async function carregar() {
    setCarregando(true)
    setErro('')

    let query = supabase
      .from('unidades')
      .select('id, numero_lote, numero_casa, matricula, empreendimentos(nome)')

    if (filtroEmpreendimento) {
      query = query.eq('empreendimento_id', filtroEmpreendimento)
    }

    const { data, error } = await query

    if (error) {
      setErro('Não foi possível carregar as unidades.')
    } else {
      setUnidades(ordenarPorLote(data || []))
    }
    setCarregando(false)
  }

  const unidadesFiltradas = unidades.filter((u) => {
    if (!filtroBusca.trim()) return true
    const busca = filtroBusca.toLowerCase()
    return (
      (u.numero_lote || '').toLowerCase().includes(busca) ||
      (u.numero_casa || '').toLowerCase().includes(busca) ||
      (u.matricula || '').toLowerCase().includes(busca)
    )
  })

  return (
    <div>
      <div className="filtros-barra">
        <select value={filtroEmpreendimento} onChange={(e) => setFiltroEmpreendimento(e.target.value)}>
          <option value="">Todos os empreendimentos</option>
          {empreendimentos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Buscar por lote, casa ou matrícula"
          value={filtroBusca}
          onChange={(e) => setFiltroBusca(e.target.value)}
        />
      </div>

      <div className="card-painel">
        {carregando ? (
          <p className="estado-carregando">Carregando...</p>
        ) : erro ? (
          <p className="estado-erro">{erro}</p>
        ) : unidadesFiltradas.length === 0 ? (
          <p className="lista-vazia">Nenhuma unidade encontrada.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Empreendimento</th>
                <th>Lote</th>
                <th>Casa</th>
                <th>Matrícula</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {unidadesFiltradas.map((u) => (
                <tr key={u.id} className="tabela-linha-clicavel" onClick={() => navigate(`/unidades/${u.id}`)}>
                  <td>{u.empreendimentos?.nome || '-'}</td>
                  <td>{u.numero_lote || '-'}</td>
                  <td>{u.numero_casa || '-'}</td>
                  <td>{u.matricula || '-'}</td>
                  <td className="tabela-acao">
                    <i className="ti ti-chevron-right" aria-hidden="true" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
