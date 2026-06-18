import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function PainelOcorrencias({ unidadeId, etapas, podeEditar }) {
  const [ocorrencias, setOcorrencias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [etapaId, setEtapaId] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregar()
  }, [unidadeId])

  async function carregar() {
    setCarregando(true)
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*, etapas_unidade(tipos_etapa(nome))')
      .eq('unidade_id', unidadeId)
      .order('criado_em', { ascending: false })

    if (!error) setOcorrencias(data || [])
    setCarregando(false)
  }

  async function handleCriar(e) {
    e.preventDefault()
    if (!titulo.trim()) {
      setErro('Informe um título para a ocorrência.')
      return
    }

    setSalvando(true)
    setErro('')

    const { error } = await supabase.from('ocorrencias').insert({
      unidade_id: unidadeId,
      etapa_unidade_id: etapaId || null,
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
    })

    setSalvando(false)

    if (error) {
      setErro('Não foi possível registrar a ocorrência.')
      return
    }

    setTitulo('')
    setDescricao('')
    setEtapaId('')
    setMostrarForm(false)
    carregar()
  }

  async function handleResolver(ocorrenciaId) {
    await supabase
      .from('ocorrencias')
      .update({ resolvida: true, data_resolucao: new Date().toISOString() })
      .eq('id', ocorrenciaId)
    carregar()
  }

  return (
    <div className="card-painel">
      {podeEditar && (
        <div className="ocorrencias-cabecalho">
          <button className="botao-secundario" onClick={() => setMostrarForm((v) => !v)}>
            <i className="ti ti-plus" aria-hidden="true" /> Nova ocorrência
          </button>
        </div>
      )}

      {mostrarForm && (
        <form onSubmit={handleCriar} className="formulario formulario-ocorrencia">
          <label className="campo">
            Título
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </label>
          <label className="campo">
            Etapa relacionada (opcional)
            <select value={etapaId} onChange={(e) => setEtapaId(e.target.value)}>
              <option value="">Nenhuma etapa específica</option>
              {etapas.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.tipos_etapa?.nome}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            Descrição
            <textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </label>

          {erro && <p className="form-erro">{erro}</p>}

          <div className="formulario-acoes formulario-acoes-compactas">
            <button type="button" className="botao-secundario" onClick={() => setMostrarForm(false)}>
              Cancelar
            </button>
            <button type="submit" className="botao-primario" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Registrar'}
            </button>
          </div>
        </form>
      )}

      {carregando ? (
        <p className="estado-carregando">Carregando...</p>
      ) : ocorrencias.length === 0 ? (
        <p className="lista-vazia">Nenhuma ocorrência registrada para esta unidade.</p>
      ) : (
        ocorrencias.map((o) => (
          <div key={o.id} className="linha-ocorrencia">
            <div>
              <p className="linha-ocorrencia-titulo">{o.titulo}</p>
              {o.descricao && <p className="linha-ocorrencia-desc">{o.descricao}</p>}
              {o.etapas_unidade?.tipos_etapa?.nome && (
                <p className="linha-ocorrencia-meta">Etapa: {o.etapas_unidade.tipos_etapa.nome}</p>
              )}
            </div>
            <div className="linha-ocorrencia-acoes">
              <span className={`badge ${o.resolvida ? 'badge-success' : 'badge-danger'}`}>
                {o.resolvida ? 'resolvida' : 'aberta'}
              </span>
              {podeEditar && !o.resolvida && (
                <button className="link-botao" onClick={() => handleResolver(o.id)}>
                  Marcar como resolvida
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
