import { useState } from 'react'
import { chamarAdmin, supabase } from '../supabase.js'
import { Aviso, Cabecalho, Campo, Modal, SenhaGerada, Situacao, useAcoesConta, useCarregar } from '../ui.jsx'
import { EMAIL_VALIDO } from '../util.js'

function FormMaster({ aoCriado, aoFechar }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const salvar = async (e) => {
    e.preventDefault()
    if (!EMAIL_VALIDO.test(email.trim())) return setErro('Informe um e-mail válido.')
    setSalvando(true); setErro('')
    const r = await chamarAdmin({ acao: 'criar_master', nome: nome.trim(), email: email.trim() })
    setSalvando(false)
    if (!r.ok) return setErro(r.erro)
    aoCriado(r)
  }

  return (
    <Modal titulo="Novo master" aoFechar={aoFechar}>
      <form className="formulario" onSubmit={salvar}>
        <Aviso tipo="atencao">Um master vê e muda tudo na plataforma. Crie só para quem realmente administra.</Aviso>
        <Aviso tipo="erro">{erro}</Aviso>
        <Campo rotulo="Nome">
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} required autoFocus />
        </Campo>
        <Campo rotulo="E-mail" dica="É o login. A senha é gerada e aparece na próxima tela.">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Campo>
        <div className="modal-acoes">
          <button type="button" className="botao secundario" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="botao" disabled={salvando}>{salvando ? 'Criando…' : 'Criar master'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Masters({ perfil }) {
  const lista = useCarregar(() => supabase.from('perfis').select('id, nome, email, ativo').eq('papel', 'master').order('nome'))
  const acoes = useAcoesConta(lista.recarregar)
  const [criando, setCriando] = useState(false)
  const [recemCriado, setRecemCriado] = useState(null)

  return (
    <>
      <Cabecalho titulo="Masters">
        <button className="botao" type="button" onClick={() => setCriando(true)}>Novo master</button>
      </Cabecalho>
      <Aviso tipo="erro">{lista.erro || acoes.erro}</Aviso>
      {lista.carregando && <p className="carregando">Carregando…</p>}
      {(lista.dados ?? []).length > 0 && (
        <div className="tabela-rolagem">
          <table className="tabela">
            <thead><tr><th>Master</th><th>Situação</th><th /></tr></thead>
            <tbody>
              {lista.dados.map((m) => (
                <tr key={m.id}>
                  <td data-rotulo="Master"><strong>{m.nome}</strong>{m.id === perfil.id ? <span className="etiqueta">você</span> : null}<div className="mudo">{m.email}</div></td>
                  <td data-rotulo="Situação"><Situacao ativo={m.ativo} /></td>
                  <td className="acoes">
                    <button type="button" className="botao pequeno secundario" disabled={acoes.ocupado === m.id} onClick={() => acoes.redefinir(m)}>Nova senha</button>
                    {m.id !== perfil.id && (
                      <button type="button" className={`botao pequeno ${m.ativo ? 'perigo' : 'secundario'}`} disabled={acoes.ocupado === m.id} onClick={() => acoes.alternar(m)}>
                        {m.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {criando && <FormMaster aoFechar={() => setCriando(false)} aoCriado={(r) => { setCriando(false); setRecemCriado(r); lista.recarregar() }} />}
      {recemCriado && <SenhaGerada dados={recemCriado} aoFechar={() => setRecemCriado(null)} />}
      {acoes.modal}
    </>
  )
}
