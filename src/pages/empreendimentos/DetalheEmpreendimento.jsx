import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

function ordenarPorLote(lista) {
  return [...lista].sort((a, b) => {
    const numA = Number(a.numero_lote)
    const numB = Number(b.numero_lote)
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB
    return (a.numero_lote || '').localeCompare(b.numero_lote || '')
  })
}

export default function DetalheEmpreendimento() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [empreendimento, setEmpreendimento] = useState(null)
  const [unidades, setUnidades] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregar()
  }, [id])

  async function carregar() {
    setCarregando(true)
    setErro('')

    const [empResp, unidadesSimplesResp] = await Promise.all([
      supabase.from('empreendimentos').select('*').eq('id', id).single(),
      supabase
        .from('unidades')
        .select('id, numero_lote, numero_casa, matricula')
        .eq('empreendimento_id', id),
    ])

    if (empResp.error) {
      setErro('Empreendimento não encontrado.')
      setCarregando(false)
      return
    }

    setEmpreendimento(empResp.data)

    if (unidadesSimplesResp.error) {
      setErro('Não foi possível carregar as unidades deste empreendimento.')
      setCarregando(false)
      return
    }

    const unidadesSimples = unidadesSimplesResp.data || []

    const { data: progresso } = await supabase
      .from('vw_progresso_unidade')
      .select('unidade_id, percentual_concluido')
      .in('unidade_id', unidadesSimples.map((u) => u.id))

    const mapaProgresso = new Map((progresso || []).map((p) => [p.unidade_id, p.percentual_concluido]))

    setUnidades(
      ordenarPorLote(
        unidadesSimples.map((u) => ({
          ...u,
          percentual_concluido: mapaProgresso.get(u.id) || 0,
        }))
      )
    )

    setCarregando(false)
  }

  if (carregando) return <p className="estado-carregando">Carregando...</p>
  if (erro) return <p className="estado-erro">{erro}</p>

  return (
    <div>
      <div className="pagina-cabecalho">
        <div>
          <button className="link-voltar" onClick={() => navigate('/empreendimentos')}>
            <i className="ti ti-arrow-left" aria-hidden="true" /> Empreendimentos
          </button>
          <p className="pagina-titulo">{empreendimento.nome}</p>
          <p className="pagina-subtitulo capitalize">{empreendimento.tipo} · {unidades.length} unidades</p>
        </div>
        <button className="botao-primario" onClick={() => navigate(`/unidades/novo?empreendimento=${id}`)}>
          <i className="ti ti-plus" aria-hidden="true" /> Lançar unidade
        </button>
      </div>

      <div className="card-painel">
        {unidades.length === 0 ? (
          <p className="lista-vazia">Nenhuma unidade cadastrada neste empreendimento ainda.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Lote</th>
                <th>Casa</th>
                <th>Matrícula</th>
                <th>Progresso</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {unidades.map((u) => (
                <tr key={u.id} className="tabela-linha-clicavel" onClick={() => navigate(`/unidades/${u.id}`)}>
                  <td>{u.numero_lote || '-'}</td>
                  <td>{u.numero_casa || '-'}</td>
                  <td>{u.matricula || '-'}</td>
                  <td>
                    <div className="progresso-celula">
                      <div className="barra-progresso barra-progresso-pequena">
                        <div
                          className="barra-progresso-fill"
                          style={{ width: `${u.percentual_concluido || 0}%` }}
                        />
                      </div>
                      <span>{Math.round(u.percentual_concluido || 0)}%</span>
                    </div>
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
    </div>
  )
}
