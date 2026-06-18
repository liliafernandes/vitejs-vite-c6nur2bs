import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true

    supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return
      setSession(data.session)
      if (data.session) {
        carregarPerfil(data.session.user.id)
      } else {
        setCarregando(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, novaSessao) => {
      setSession(novaSessao)
      if (novaSessao) {
        carregarPerfil(novaSessao.user.id)
      } else {
        setPerfil(null)
        setCarregando(false)
      }
    })

    return () => {
      ativo = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function carregarPerfil(userId) {
    const { data, error } = await supabase
      .from('perfis')
      .select('id, nome_completo, perfil, ativo')
      .eq('id', userId)
      .single()

    if (!error) {
      setPerfil(data)
    }
    setCarregando(false)
  }

  async function entrar(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      return { error }
    }

    setSession(data.session)
    if (data.session) {
      await carregarPerfil(data.session.user.id)
    }

    return { error: null }
  }

  async function sair() {
    await supabase.auth.signOut()
  }

  const podeEditar = perfil?.perfil === 'admin' || perfil?.perfil === 'editor'
  const ehAdmin = perfil?.perfil === 'admin'

  const value = {
    session,
    perfil,
    carregando,
    entrar,
    sair,
    podeEditar,
    ehAdmin,
    usuarioAtivo: perfil?.ativo !== false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider')
  }
  return context
}
