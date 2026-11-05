import { useState } from 'react'
import { supabase } from '../supabase.js'
import { Aviso, Cabecalho, Campo } from '../ui.jsx'

export default function Conta() {
  const [nova, setNova] = useState('')
  const [repetir, setRepetir] = useState('')
  const [msg, setMsg] = useState({ tipo: '', texto: '' })
  const [salvando, setSalvando] = useState(false)

  const salvar = async (e) => {
    e.preventDefault()
    if (nova.length < 8) return setMsg({ tipo: 'erro', texto: 'A senha precisa ter pelo menos 8 caracteres.' })
    if (nova !== repetir) return setMsg({ tipo: 'erro', texto: 'As duas senhas não são iguais.' })
    setSalvando(true)
    const { error } = await supabase.auth.updateUser({ password: nova })
    setSalvando(false)
    if (error) {
      setMsg({ tipo: 'erro', texto: /different|same/i.test(error.message) ? 'Escolha uma senha diferente da atual.' : 'Não foi possível trocar a senha agora.' })
    } else {
      setNova(''); setRepetir('')
      setMsg({ tipo: 'ok', texto: 'Senha trocada.' })
    }
  }

  return (
    <>
      <Cabecalho titulo="Minha conta" />
      <form className="painel formulario estreito" onSubmit={salvar}>
        <h2>Trocar minha senha</h2>
        <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>
        <Campo rotulo="Nova senha" dica="Pelo menos 8 caracteres.">
          <input type="password" value={nova} onChange={(e) => setNova(e.target.value)} autoComplete="new-password" required />
        </Campo>
        <Campo rotulo="Repita a nova senha">
          <input type="password" value={repetir} onChange={(e) => setRepetir(e.target.value)} autoComplete="new-password" required />
        </Campo>
        <button className="botao" type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Trocar senha'}</button>
      </form>
    </>
  )
}
