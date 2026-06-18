import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [resumo, setResumo] = useState({ totalUnidades: 0, ocorrenciasAbertas: 0, alertasNaoLidos: 0 })
  const [empreendimentos, setEmpreendimentos] = useState([])
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)
    setErro('')

    try {
      const [progressoResp, alertasResp, ocorrenciasResp] = await Promise.all([
        supabase.from('vw_progresso_empreendimento').select('*').order('nome'),
        supabase
          .from('vw_alertas_detalhados')
          .select('*')
          .eq('lido', false)
          .order('criado_em', { ascending: false })
          .limit(8),
        supabase.from('ocorrencias').select('id', { count: 'exact', head: true }).eq('resolvida', false),
      ])

      if (progressoResp.error) throw progressoResp.error
      if (alertasResp.error) throw alertasResp.error
      if (ocorrenciasResp.error) throw ocorrenciasResp.error

      setEmpreendimentos(progressoResp.data || [])
      setAlertas(alertasResp.data || [])
      setResumo({
        totalUnidades: (progressoResp.data || []).reduce((soma, e) => soma + (e.total_unidades || 0), 0),
        ocorrenciasAbertas: ocorrenciasResp.count || 0,
        alertasNaoLidos: (alertasResp.data || []).length,
      })
    } catch (e) {
      setErro('Não foi possível carregar os dados do painel. Tente novamente em alguns instantes.')
      console.error(e)
    } finally {
      setCarregando(false)
    }
  }

  if (carregando) {
    return <p className="estado-carregando">Carregando painel...</p>
  }

  if (erro) {
    return <p className="estado-erro">{erro}</p>
  }

  return (
    <div>
      <div className="pagina-cabecalho">
        <div>
          <p className="pagina-titulo">Painel de legalização</p>
          <p className="pagina-subtitulo">Visão geral de todos os empreendimentos</p>
        </div>
      </div>

      <div className="cards-metricas">
        <div className="card-metrica">
          <p className="card-metrica-label">Unidades cadastradas</p>
          <p className="card-metrica-valor">{resumo.totalUnidades}</p>
        </div>
        <div className="card-metrica">
          <p className="card-metrica-label">Ocorrências abertas</p>
          <p className="card-metrica-valor card-metrica-danger">{resumo.ocorrenciasAbertas}</p>
        </div>
        <div className="card-metrica">
          <p className="card-metrica-label">Alertas não lidos</p>
          <p className="card-metrica-valor card-metrica-warning">{resumo.alertasNaoLidos}</p>
        </div>
        <div className="card-metrica">
          <p className="card-metrica-label">Empreendimentos ativos</p>
          <p className="card-metrica-valor">{empreendimentos.length}</p>
        </div>
      </div>

      <div className="card-painel">
        <p className="card-painel-titulo">
          <i className="ti ti-clock" aria-hidden="true" /> Alertas recentes
        </p>

        {alertas.length === 0 ? (
          <p className="lista-vazia">Nenhum alerta pendente neste momento.</p>
        ) : (
          alertas.map((a) => (
            <div
              key={a.id}
              className="linha-alerta"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/unidades/${a.unidade_id}`)}
            >
              <div>
                <p className="linha-alerta-titulo">{a.mensagem}</p>
                <p className="linha-alerta-subtitulo">
                  {a.nome_empreendimento} · lote {a.numero_lote || '-'} / casa {a.numero_casa || '-'}
                </p>
              </div>
              <span className={`badge badge-${a.severidade}`}>{a.severidade}</span>
            </div>
          ))
        )}
      </div>

      <div className="card-painel">
        <p className="card-painel-titulo">Empreendimentos</p>

        {empreendimentos.length === 0 ? (
          <p className="lista-vazia">
            Nenhum empreendimento cadastrado ainda.{' '}
            <button className="link-botao" onClick={() => navigate('/empreendimentos')}>
              Cadastrar o primeiro
            </button>
          </p>
        ) : (
          empreendimentos.map((e) => (
            <div
              key={e.empreendimento_id}
              className="linha-empreendimento"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/empreendimentos/${e.empreendimento_id}`)}
            >
              <div className="linha-empreendimento-info">
                <i className="ti ti-building" aria-hidden="true" />
                <div>
                  <p className="linha-empreendimento-nome">{e.nome}</p>
                  <p className="linha-empreendimento-sub">{e.total_unidades} unidades</p>
                </div>
              </div>
              <div className="linha-empreendimento-progresso">
                <div className="barra-progresso">
                  <div
                    className="barra-progresso-fill"
                    style={{ width: `${e.percentual_medio_concluido || 0}%` }}
                  />
                </div>
                <span className="barra-progresso-valor">{Math.round(e.percentual_medio_concluido || 0)}%</span>
                <i className="ti ti-chevron-right" aria-hidden="true" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
