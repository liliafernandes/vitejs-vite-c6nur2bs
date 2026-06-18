import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RotaProtegida({ children }) {
  const { session, carregando, usuarioAtivo } = useAuth()

  if (carregando) {
    return (
      <div className="tela-carregando">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!usuarioAtivo) {
    return (
      <div className="tela-carregando">
        <p>Sua conta está desativada. Contate o administrador do sistema.</p>
      </div>
    )
  }

  return children
}
