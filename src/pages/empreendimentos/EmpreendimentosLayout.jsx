import { useEffect, useState } from 'react'
import { useNavigate, NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'

export default function EmpreendimentosLayout() {
  return (
    <div>
      <div className="pagina-cabecalho">
        <div>
          <p className="pagina-titulo">Empreendimentos</p>
          <p className="pagina-subtitulo">Cadastro raiz dos empreendimentos da empresa</p>
        </div>
      </div>

      <div className="abas">
        <NavLink to="" end className={({ isActive }) => `aba ${isActive ? 'aba-ativa' : ''}`}>
          Gerenciar
        </NavLink>
        <NavLink to="novo" className={({ isActive }) => `aba ${isActive ? 'aba-ativa' : ''}`}>
          Cadastrar novo
        </NavLink>
      </div>

      <Outlet />
    </div>
  )
}

export function ListaEmpreendimentos() {
  const navigate = useNavigate()
  const [empreendimentos, setEmpreendimentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    setErro('')
    const { data, error } = await supabase
      .from('empreendimentos')
      .select('id, nome, tipo, ativo, criado_em')
      .order('nome')

    if (error) {
      setErro('Não foi possível carregar os empreendimentos.')
    } else {
      setEmpreendimentos(data || [])
    }
    setCarregando(false)
  }

  if (carregando) return <p className="estado-carregando">Carregando...</p>
  if (erro) return <p className="estado-erro">{erro}</p>

  return (
    <div className="card-painel">
      {empreendimentos.length === 0 ? (
        <p className="lista-vazia">Nenhum empreendimento cadastrado ainda.</p>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {empreendimentos.map((emp) => (
              <tr key={emp.id} className="tabela-linha-clicavel" onClick={() => navigate(`/empreendimentos/${emp.id}`)}>
                <td>{emp.nome}</td>
                <td className="capitalize">{emp.tipo}</td>
                <td>
                  <span className={`badge ${emp.ativo ? 'badge-success' : 'badge-neutro'}`}>
                    {emp.ativo ? 'ativo' : 'inativo'}
                  </span>
                </td>
                <td className="tabela-acao">
                  <i className="ti ti-chevron-right" aria-hidden="true" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export function NovoEmpreendimento() {
  const navigate = useNavigate()
  const { podeEditar } = useAuth()
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('casa')
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  if (!podeEditar) {
    return <p className="estado-erro">Seu perfil não tem permissão para cadastrar empreendimentos.</p>
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!nome.trim()) {
      setErro('Informe o nome do empreendimento.')
      return
    }

    setSalvando(true)
    const { data, error } = await supabase
      .from('empreendimentos')
      .insert({ nome: nome.trim(), tipo, observacoes: observacoes.trim() || null })
      .select()
      .single()

    setSalvando(false)

    if (error) {
      if (error.code === '23505') {
        setErro('Já existe um empreendimento com esse nome.')
      } else {
        setErro('Não foi possível salvar. Tente novamente.')
      }
      return
    }

    navigate(`/empreendimentos/${data.id}`)
  }

  return (
    <div className="card-painel card-painel-form">
      <form onSubmit={handleSubmit} className="formulario">
        <label className="campo">
          Nome do empreendimento
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Vitalle Por do Sol"
            required
          />
        </label>

        <label className="campo">
          Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="casa">Casa</option>
            <option value="loteamento">Loteamento</option>
          </select>
        </label>

        <label className="campo">
          Observações (opcional)
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
          />
        </label>

        {erro && <p className="form-erro">{erro}</p>}

        <div className="formulario-acoes">
          <button type="submit" className="botao-primario" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Cadastrar empreendimento'}
          </button>
        </div>
      </form>
    </div>
  )
}
