import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    const { error } = await entrar(email, senha)

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setEnviando(false)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">L+</div>
          <p className="login-title">Legaliza+</p>
          <p className="login-subtitle">Sistema de legalização de empreendimentos</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="seu.email@empresa.com"
            />
          </label>

          <label className="login-label">
            Senha
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit" className="login-botao" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="login-rodape">
          Não tem acesso? Peça ao administrador do sistema para criar sua conta.
        </p>
      </div>
    </div>
  )
}
