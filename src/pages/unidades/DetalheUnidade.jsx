import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import CardEtapa from './CardEtapa'
import PainelOcorrencias from './PainelOcorrencias'

export default function DetalheUnidade() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { podeEditar } = useAuth()

  const [unidade, setUnidade] = useState(null)
  const [etapas, setEtapas] = useState([])
  const [abaAtiva, setAbaAtiva] = useState('etapas')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregar()
  }, [id])

  async function carregar() {
    setCarregando(true)
    setErro('')

    const [unidadeResp, etapasResp] = await Promise.all([
      supabase.from('unidades').select('*, empreendimentos(id, nome)').eq('id', id).single(),
      supabase
        .from('etapas_unidade')
        .select('*, tipos_etapa(nome, ordem_padrao, tem_validade, tem_valor)')
        .eq('unidade_id', id),
    ])

    if (unidadeResp.error) {
      setErro('Unidade não encontrada.')
      setCarregando(false)
      return
    }

    setUnidade(unidadeResp.data)

    if (!etapasResp.error) {
      const ordenadas = (etapasResp.data || []).sort(
        (a, b) => (a.tipos_etapa?.ordem_padrao || 0) - (b.tipos_etapa?.ordem_padrao || 0)
      )
      setEtapas(ordenadas)
    }

    setCarregando(false)
  }

  if (carregando) return <p className="estado-carregando">Carregando...</p>
  if (erro) return <p className="estado-erro">{erro}</p>

  return (
    <div>
      <div className="pagina-cabecalho">
        <div>
          <button
            className="link-voltar"
            onClick={() => navigate(`/empreendimentos/${unidade.empreendimentos?.id}`)}
          >
            <i className="ti ti-arrow-left" aria-hidden="true" /> {unidade.empreendimentos?.nome}
          </button>
          <p className="pagina-titulo">
            Lote {unidade.numero_lote || '-'} · Casa {unidade.numero_casa || '-'}
          </p>
          <p className="pagina-subtitulo">Matrícula {unidade.matricula || 'não informada'}</p>
        </div>
      </div>

      <div className="abas">
        <button
          className={`aba ${abaAtiva === 'etapas' ? 'aba-ativa' : ''}`}
          onClick={() => setAbaAtiva('etapas')}
        >
          Etapas do processo
        </button>
        <button
          className={`aba ${abaAtiva === 'ocorrencias' ? 'aba-ativa' : ''}`}
          onClick={() => setAbaAtiva('ocorrencias')}
        >
          Ocorrências
        </button>
      </div>

      {abaAtiva === 'etapas' && (
        <div className="lista-etapas">
          {etapas.length === 0 ? (
            <p className="lista-vazia">Nenhuma etapa encontrada para esta unidade.</p>
          ) : (
            etapas.map((etapa) => (
              <CardEtapa key={etapa.id} etapa={etapa} podeEditar={podeEditar} onAtualizado={carregar} />
            ))
          )}
        </div>
      )}

      {abaAtiva === 'ocorrencias' && (
        <PainelOcorrencias unidadeId={id} etapas={etapas} podeEditar={podeEditar} />
      )}
    </div>
  )
}
