import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const STATUS_LABEL = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  protocolado: 'Protocolado',
  emitido: 'Emitido',
  concluido: 'Concluído',
}

const STATUS_OPCOES = Object.keys(STATUS_LABEL)

function paraInputDate(valor) {
  return valor ? valor.slice(0, 10) : ''
}

export default function CardEtapa({ etapa, podeEditar, onAtualizado }) {
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    status: etapa.status,
    data_protocolo: paraInputDate(etapa.data_protocolo),
    numero_processo: etapa.numero_processo || '',
    data_aprovacao: paraInputDate(etapa.data_aprovacao),
    data_emissao: paraInputDate(etapa.data_emissao),
    numero_documento: etapa.numero_documento || '',
    data_validade: paraInputDate(etapa.data_validade),
    valor: etapa.valor ?? '',
    observacoes: etapa.observacoes || '',
  })

  function handleChange(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function handleSalvar() {
    setSalvando(true)
    setErro('')

    const payload = {
      status: form.status,
      data_protocolo: form.data_protocolo || null,
      numero_processo: form.numero_processo.trim() || null,
      data_aprovacao: form.data_aprovacao || null,
      data_emissao: form.data_emissao || null,
      numero_documento: form.numero_documento.trim() || null,
      data_validade: form.data_validade || null,
      valor: form.valor === '' ? null : Number(form.valor),
      observacoes: form.observacoes.trim() || null,
    }

    const { error } = await supabase.from('etapas_unidade').update(payload).eq('id', etapa.id)

    setSalvando(false)

    if (error) {
      setErro('Não foi possível salvar. Tente novamente.')
      return
    }

    setEditando(false)
    onAtualizado()
  }

  return (
    <div className={`card-etapa card-etapa-${etapa.status}`}>
      <div className="card-etapa-cabecalho" onClick={() => podeEditar && setEditando((v) => !v)}>
        <div>
          <p className="card-etapa-titulo">{etapa.tipos_etapa?.nome}</p>
          <p className="card-etapa-meta">
            {etapa.tempo_dias != null ? `${etapa.tempo_dias} dia(s) de tramitação` : 'Sem datas registradas'}
            {etapa.precisa_revisao && <span className="badge badge-atencao revisao-tag">revisar dados</span>}
          </p>
        </div>
        <span className={`badge badge-status-${etapa.status}`}>{STATUS_LABEL[etapa.status]}</span>
      </div>

      {editando && podeEditar && (
        <div className="card-etapa-form">
          <div className="formulario-linha">
            <label className="campo campo-pequeno">
              Status
              <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
                {STATUS_OPCOES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="formulario-linha">
            <label className="campo campo-pequeno">
              Data protocolo
              <input
                type="date"
                value={form.data_protocolo}
                onChange={(e) => handleChange('data_protocolo', e.target.value)}
              />
            </label>
            <label className="campo campo-pequeno">
              Nº processo
              <input
                type="text"
                value={form.numero_processo}
                onChange={(e) => handleChange('numero_processo', e.target.value)}
              />
            </label>
          </div>

          <div className="formulario-linha">
            <label className="campo campo-pequeno">
              Data aprovação
              <input
                type="date"
                value={form.data_aprovacao}
                onChange={(e) => handleChange('data_aprovacao', e.target.value)}
              />
            </label>
            <label className="campo campo-pequeno">
              Data emissão
              <input
                type="date"
                value={form.data_emissao}
                onChange={(e) => handleChange('data_emissao', e.target.value)}
              />
            </label>
          </div>

          <div className="formulario-linha">
            <label className="campo campo-pequeno">
              Nº documento
              <input
                type="text"
                value={form.numero_documento}
                onChange={(e) => handleChange('numero_documento', e.target.value)}
              />
            </label>
            {etapa.tipos_etapa?.tem_validade && (
              <label className="campo campo-pequeno">
                Validade
                <input
                  type="date"
                  value={form.data_validade}
                  onChange={(e) => handleChange('data_validade', e.target.value)}
                />
              </label>
            )}
          </div>

          {etapa.tipos_etapa?.tem_valor && (
            <label className="campo campo-pequeno">
              Valor (R$)
              <input
                type="number"
                step="0.01"
                value={form.valor}
                onChange={(e) => handleChange('valor', e.target.value)}
              />
            </label>
          )}

          <label className="campo">
            Observações
            <textarea
              rows={2}
              value={form.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
            />
          </label>

          {erro && <p className="form-erro">{erro}</p>}

          <div className="formulario-acoes formulario-acoes-compactas">
            <button type="button" className="botao-secundario" onClick={() => setEditando(false)}>
              Cancelar
            </button>
            <button type="button" className="botao-primario" onClick={handleSalvar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
