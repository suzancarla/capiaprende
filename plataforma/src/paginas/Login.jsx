import { useState } from 'react'
import { useAuth } from '../auth.jsx'
import { Aviso, Campo } from '../ui.jsx'

export default function Login() {
  const { entrar, aviso } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    if (enviando) return
    setEnviando(true)
    setErro(await entrar(email, senha))
    setEnviando(false)
  }

  return (
    <div className="centro">
      <form className="cartao-login" onSubmit={enviar}>
        <div className="logo grande">C</div>
        <h1>Capi-Aprende</h1>
        <p className="subtitulo">Plataforma do professor</p>
        <Aviso tipo="atencao">{aviso}</Aviso>
        <Aviso tipo="erro">{erro}</Aviso>
        <Campo rotulo="E-mail">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required autoFocus />
        </Campo>
        <Campo rotulo="Senha">
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required />
        </Campo>
        <button className="botao grande-botao" type="submit" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
        <p className="nota">Alunos entram pelo aplicativo, não por aqui.</p>
      </form>
    </div>
  )
}
