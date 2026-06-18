import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function RelatoriosLayout() {
  return (
    <div>
      <div className="pagina-cabecalho">
        <div>
          <p className="pagina-titulo">Relatórios</p>
          <p className="pagina-subtitulo">Consultas e exportações sobre os processos de legalização</p>
        </div>
      </div>

      <div className="abas">
        <NavLink to="" end className={({ isActive }) => `aba ${isActive ? 'aba-ativa' : ''}`}>
          Por empreendimento
        </NavLink>
        <NavLink to="pendencias" className={({ isActive }) => `aba ${isActive ? 'aba-ativa' : ''}`}>
          Atrasos e pendências
        </NavLink>
        <NavLink to="tempo-medio" className={({ isActive }) => `aba ${isActive ? 'aba-ativa' : ''}`}>
          Tempo médio por etapa
        </NavLink>
      </div>

      <Outlet />
    </div>
  )
}

export function RelatorioPorEmpreendimento() {
  const [dados, setDados] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase
      .from('vw_progresso_empreendimento')
      .select('*')
      .order('nome')
      .then(({ data }) => {
        setDados(data || [])
        setCarregando(false)
      })
  }, [])

  function exportarCsv() {
    const cabecalho = ['Empreendimento', 'Tipo', 'Total de unidades', 'Unidades concluídas', '% médio concluído']
    const linhas = dados.map((d) => [
      d.nome,
      d.tipo,
      d.total_unidades,
      d.unidades_concluidas,
      d.percentual_medio_concluido,
    ])
    baixarCsv('relatorio_por_empreendimento.csv', cabecalho, linhas)
  }

  if (carregando) return <p className="estado-carregando">Carregando...</p>

  return (
    <div className="card-painel">
      <div className="relatorio-acoes">
        <button className="botao-secundario" onClick={exportarCsv}>
          <i className="ti ti-download" aria-hidden="true" /> Exportar CSV
        </button>
      </div>
      <table className="tabela">
        <thead>
          <tr>
            <th>Empreendimento</th>
            <th>Tipo</th>
            <th>Total de unidades</th>
            <th>Concluídas</th>
            <th>% médio concluído</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((d) => (
            <tr key={d.empreendimento_id}>
              <td>{d.nome}</td>
              <td className="capitalize">{d.tipo}</td>
              <td>{d.total_unidades}</td>
              <td>{d.unidades_concluidas}</td>
              <td>{Math.round(d.percentual_medio_concluido || 0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function RelatorioPendencias() {
  const navigate = useNavigate()
  const [dados, setDados] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase
      .from('vw_unidades_com_pendencia')
      .select('*')
      .then(({ data }) => {
        setDados(data || [])
        setCarregando(false)
      })
  }, [])

  if (carregando) return <p className="estado-carregando">Carregando...</p>

  return (
    <div className="card-painel">
      {dados.length === 0 ? (
        <p className="lista-vazia">Nenhuma unidade com pendências no momento.</p>
      ) : (
        <table className="tabela">
          <thead>
            <tr>
              <th>Empreendimento</th>
              <th>Lote / Casa</th>
              <th>Ocorrências abertas</th>
              <th>Etapas p/ revisão</th>
              <th>Alertas não lidos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dados.map((d) => (
              <tr key={d.unidade_id} className="tabela-linha-clicavel" onClick={() => navigate(`/unidades/${d.unidade_id}`)}>
                <td>{d.nome_empreendimento}</td>
                <td>{d.numero_lote || '-'} / {d.numero_casa || '-'}</td>
                <td>{d.ocorrencias_abertas > 0 ? <span className="badge badge-danger">{d.ocorrencias_abertas}</span> : '-'}</td>
                <td>{d.etapas_para_revisao > 0 ? <span className="badge badge-atencao">{d.etapas_para_revisao}</span> : '-'}</td>
                <td>{d.alertas_nao_lidos > 0 ? <span className="badge badge-warning">{d.alertas_nao_lidos}</span> : '-'}</td>
                <td className="tabela-acao"><i className="ti ti-chevron-right" aria-hidden="true" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export function RelatorioTempoMedio() {
  const [dados, setDados] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase
      .from('vw_tempo_medio_etapa')
      .select('*')
      .order('ordem_padrao')
      .then(({ data }) => {
        setDados(data || [])
        setCarregando(false)
      })
  }, [])

  if (carregando) return <p className="estado-carregando">Carregando...</p>

  return (
    <div className="card-painel">
      <table className="tabela">
        <thead>
          <tr>
            <th>Etapa</th>
            <th>Amostras</th>
            <th>Tempo médio (dias)</th>
            <th>Mínimo</th>
            <th>Máximo</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((d) => (
            <tr key={d.tipo_etapa_id}>
              <td>{d.nome}</td>
              <td>{d.amostras}</td>
              <td>{d.tempo_medio_dias ?? '-'}</td>
              <td>{d.tempo_minimo_dias ?? '-'}</td>
              <td>{d.tempo_maximo_dias ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function baixarCsv(nomeArquivo, cabecalho, linhas) {
  const conteudo = [cabecalho, ...linhas]
    .map((linha) => linha.map((valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
