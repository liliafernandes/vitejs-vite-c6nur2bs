import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'

export default function NovaUnidade() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { podeEditar } = useAuth()

  const [empreendimentos, setEmpreendimentos] = useState([])
  const [empreendimentoId, setEmpreendimentoId] = useState(searchParams.get('empreendimento') || '')
  const [numeroLote, setNumeroLote] = useState('')
  const [numeroCasa, setNumeroCasa] = useState('')
  const [matricula, setMatricula] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    supabase
      .from('empreendimentos')
      .select('id, nome')
      .eq('ativo', true)
      .order('nome')
      .then(({ data }) => setEmpreendimentos(data || []))
  }, [])

  if (!podeEditar) {
    return <p className="estado-erro">Seu perfil não tem permissão para cadastrar unidades.</p>
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!empreendimentoId) {
      setErro('Selecione o empreendimento.')
      return
    }
    if (!numeroLote.trim() && !numeroCasa.trim()) {
      setErro('Informe ao menos o número do lote ou da casa.')
      return
    }

    setSalvando(true)
    const { data, error } = await supabase
      .from('unidades')
      .insert({
        empreendimento_id: empreendimentoId,
        numero_lote: numeroLote.trim() || null,
        numero_casa: numeroCasa.trim() || null,
        matricula: matricula.trim() || null,
      })
      .select()
      .single()

    setSalvando(false)

    if (error) {
      setErro('Não foi possível salvar a unidade. Tente novamente.')
      return
    }

    navigate(`/unidades/${data.id}`)
  }

  return (
    <div className="card-painel card-painel-form">
      <form onSubmit={handleSubmit} className="formulario">
        <label className="campo">
          Empreendimento
          <select value={empreendimentoId} onChange={(e) => setEmpreendimentoId(e.target.value)} required>
            <option value="">Selecione...</option>
            {empreendimentos.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="formulario-linha">
          <label className="campo">
            Número do lote
            <input type="text" value={numeroLote} onChange={(e) => setNumeroLote(e.target.value)} />
          </label>
          <label className="campo">
            Número da casa
            <input type="text" value={numeroCasa} onChange={(e) => setNumeroCasa(e.target.value)} />
          </label>
        </div>

        <label className="campo">
          Matrícula
          <input type="text" value={matricula} onChange={(e) => setMatricula(e.target.value)} />
        </label>

        <p className="formulario-info">
          Ao salvar, as etapas do processo de legalização serão criadas automaticamente como pendentes.
        </p>

        {erro && <p className="form-erro">{erro}</p>}

        <div className="formulario-acoes">
          <button type="submit" className="botao-primario" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Lançar unidade'}
          </button>
        </div>
      </form>
    </div>
  )
}
