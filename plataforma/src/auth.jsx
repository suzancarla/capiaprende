import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase.js'

const Contexto = createContext(null)
export const useAuth = () => useContext(Contexto)

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(undefined) // undefined = ainda carregando
  const [perfil, setPerfil] = useState(null)
  const [carregandoPerfil, setCarregandoPerfil] = useState(true)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, nova) => setSessao(nova ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  const userId = sessao?.user?.id ?? null

  useEffect(() => {
    if (sessao === undefined) return
    if (!userId) {
      setPerfil(null)
      setCarregandoPerfil(false)
      return
    }
    let vivo = true
    setCarregandoPerfil(true)
    supabase.from('perfis').select('id, papel, nome, email, ativo').eq('id', userId).maybeSingle()
      .then(async ({ data, error }) => {
        if (!vivo) return
        let problema = ''
        if (error || !data) problema = 'Não encontramos o seu cadastro. Fale com quem administra a plataforma.'
        else if (!data.ativo) problema = 'Seu acesso está desativado. Fale com quem administra a plataforma.'
        else if (data.papel === 'aluno') problema = 'Alunos entram pelo aplicativo Capi-Aprende, não por esta página.'
        if (problema) {
          setAviso(problema)
          setPerfil(null)
          setCarregandoPerfil(false)
          await supabase.auth.signOut()
          return
        }
        setPerfil(data)
        setCarregandoPerfil(false)
      })
    return () => { vivo = false }
    // Só recarrega quando muda a PESSOA (renovar o token não conta).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, sessao === undefined])

  const entrar = useCallback(async (email, senha) => {
    setAviso('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha })
    if (error) {
      return /invalid login|invalid credentials/i.test(error.message)
        ? 'E-mail ou senha incorretos.'
        : /banned|not allowed/i.test(error.message)
          ? 'Seu acesso está desativado. Fale com quem administra a plataforma.'
          : 'Não foi possível entrar agora. Tente de novo.'
    }
    return ''
  }, [])

  const sair = useCallback(async () => {
    setAviso('')
    await supabase.auth.signOut()
  }, [])

  const valor = useMemo(() => ({
    carregando: sessao === undefined || carregandoPerfil,
    perfil, aviso, entrar, sair,
  }), [sessao, carregandoPerfil, perfil, aviso, entrar, sair])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}
