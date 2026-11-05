import { useEffect, useState } from 'react'
import { chamarAdmin, erroAmigavel } from './supabase.js'

export function Aviso({ tipo = 'info', children }) {
  if (!children) return null
  return <div className={`aviso aviso-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>{children}</div>
}

export function Campo({ rotulo, dica, children }) {
  return (
    <label className="campo">
      <span className="campo-rotulo">{rotulo}</span>
      {children}
      {dica ? <span className="campo-dica">{dica}</span> : null}
    </label>
  )
}

export function Modal({ titulo, aoFechar, children }) {
  useEffect(() => {
    const tecla = (e) => { if (e.key === 'Escape') aoFechar() }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [aoFechar])
  return (
    <div className="modal-fundo" onMouseDown={(e) => { if (e.target === e.currentTarget) aoFechar() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <div className="modal-topo">
          <h2>{titulo}</h2>
          <button type="button" className="botao-icone" onClick={aoFechar} aria-label="Fechar">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Cabecalho({ titulo, children }) {
  return (
    <div className="cabecalho-pagina">
      <h1>{titulo}</h1>
      <div className="cabecalho-acoes">{children}</div>
    </div>
  )
}

export function Vazio({ children }) {
  return <div className="vazio">{children}</div>
}

/** Busca dados e guarda carregando/erro. recarregar() busca de novo. */
export function useCarregar(buscar, deps = []) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: '' })
  const [vez, setVez] = useState(0)
  useEffect(() => {
    let vivo = true
    setEstado((e) => ({ ...e, carregando: true, erro: '' }))
    Promise.resolve(buscar())
      .then((r) => {
        if (!vivo) return
        if (r?.error) setEstado({ dados: null, carregando: false, erro: erroAmigavel(r.error) })
        else setEstado({ dados: r?.data ?? [], carregando: false, erro: '' })
      })
      .catch(() => { if (vivo) setEstado({ dados: null, carregando: false, erro: 'Não foi possível carregar. Tente de novo.' }) })
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, vez])
  return { ...estado, recarregar: () => setVez((v) => v + 1) }
}

/** Cartão com a senha gerada. A senha só aparece aqui, uma vez. */
export function SenhaGerada({ dados, aoFechar }) {
  const [copiado, setCopiado] = useState(false)
  const login = dados.usuario ? dados.usuario : dados.email
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`Login: ${login}\nSenha: ${dados.senha}`)
      setCopiado(true)
    } catch { /* o navegador pode bloquear; a senha continua na tela */ }
  }
  return (
    <Modal titulo="Senha gerada" aoFechar={aoFechar}>
      <Aviso tipo="atencao">Anote ou imprima agora. Esta senha <strong>não aparece de novo</strong>. Se alguém esquecer, gere outra.</Aviso>
      <div className="cartao-senha">
        <div className="cartao-nome">{dados.nome}</div>
        <div className="cartao-linha"><span>{dados.usuario ? 'Usuário' : 'E-mail'}</span><strong>{login}</strong></div>
        <div className="cartao-linha"><span>Senha</span><strong className="senha-grande">{dados.senha}</strong></div>
      </div>
      <div className="modal-acoes">
        <button type="button" className="botao secundario" onClick={copiar}>{copiado ? 'Copiado!' : 'Copiar'}</button>
        <button type="button" className="botao secundario" onClick={() => window.print()}>Imprimir cartão</button>
        <button type="button" className="botao" onClick={aoFechar}>Pronto</button>
      </div>
    </Modal>
  )
}

/** Ações de conta (nova senha e ativar/desativar) compartilhadas pelas telas de pessoas. */
export function useAcoesConta(aoMudar) {
  const [ocupado, setOcupado] = useState('')
  const [erro, setErro] = useState('')
  const [senha, setSenha] = useState(null)

  const redefinir = async (conta) => {
    if (!window.confirm(`Gerar uma senha nova para ${conta.nome}? A senha antiga deixa de valer.`)) return
    setOcupado(conta.id); setErro('')
    const r = await chamarAdmin({ acao: 'redefinir_senha', id: conta.id })
    setOcupado('')
    if (!r.ok) { setErro(r.erro); return }
    setSenha(r)
  }

  const alternar = async (conta) => {
    const ativar = !conta.ativo
    if (!ativar && !window.confirm(`Desativar ${conta.nome}? A pessoa não consegue mais entrar (nada é apagado).`)) return
    setOcupado(conta.id); setErro('')
    const r = await chamarAdmin({ acao: 'definir_ativo', id: conta.id, ativo: ativar })
    setOcupado('')
    if (!r.ok) { setErro(r.erro); return }
    aoMudar()
  }

  const modal = senha ? <SenhaGerada dados={senha} aoFechar={() => setSenha(null)} /> : null
  return { ocupado, erro, setErro, redefinir, alternar, modal, mostrarSenha: setSenha }
}

export function Situacao({ ativo }) {
  return <span className={`etiqueta ${ativo ? 'ok' : 'off'}`}>{ativo ? 'Ativo' : 'Desativado'}</span>
}
