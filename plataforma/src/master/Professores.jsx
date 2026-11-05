import { useState } from 'react'
import { chamarAdmin, erroAmigavel, supabase } from '../supabase.js'
import { Aviso, Cabecalho, Campo, Modal, SenhaGerada, Situacao, Vazio, useAcoesConta, useCarregar } from '../ui.jsx'
import { EMAIL_VALIDO, nomeDaTurma } from '../util.js'
import SeletorDeTurmas from './SeletorDeTurmas.jsx'

function FormProfessor({ turmas, aoCriado, aoFechar }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [marcadas, setMarcadas] = useState([])
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const salvar = async (e) => {
    e.preventDefault()
    if (!EMAIL_VALIDO.test(email.trim())) return setErro('Informe um e-mail válido.')
    setSalvando(true); setErro('')
    const r = await chamarAdmin({ acao: 'criar_professor', nome: nome.trim(), email: email.trim(), turma_ids: marcadas })
    setSalvando(false)
    if (!r.ok) return setErro(r.erro)
    aoCriado(r)
  }

  return (
    <Modal titulo="Novo professor" aoFechar={aoFechar}>
      <form className="formulario" onSubmit={salvar}>
        <Aviso tipo="erro">{erro}</Aviso>
        <Campo rotulo="Nome">
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} required autoFocus />
        </Campo>
        <Campo rotulo="E-mail" dica="É o login do professor. A senha é gerada e aparece na próxima tela.">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Campo>
        <div className="campo">
          <span className="campo-rotulo">Turmas (pode marcar depois)</span>
          <SeletorDeTurmas turmas={turmas} marcadas={marcadas} aoMudar={setMarcadas} />
        </div>
        <div className="modal-acoes">
          <button type="button" className="botao secundario" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="botao" disabled={salvando}>{salvando ? 'Criando…' : 'Criar professor'}</button>
        </div>
      </form>
    </Modal>
  )
}

function EditarTurmas({ professor, turmas, aoSalvar, aoFechar }) {
  const atuais = (professor.professores_turmas ?? []).map((x) => x.turma_id)
  const [marcadas, setMarcadas] = useState(atuais)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const salvar = async () => {
    setSalvando(true); setErro('')
    const remover = atuais.filter((id) => !marcadas.includes(id))
    const incluir = marcadas.filter((id) => !atuais.includes(id))
    if (remover.length) {
      const { error } = await supabase.from('professores_turmas').delete().eq('professor_id', professor.id).in('turma_id', remover)
      if (error) { setSalvando(false); return setErro(erroAmigavel(error)) }
    }
    if (incluir.length) {
      const { error } = await supabase.from('professores_turmas').insert(incluir.map((turma_id) => ({ professor_id: professor.id, turma_id })))
      if (error) { setSalvando(false); return setErro(erroAmigavel(error)) }
    }
    setSalvando(false)
    aoSalvar()
  }

  return (
    <Modal titulo={`Turmas de ${professor.nome}`} aoFechar={aoFechar}>
      <Aviso tipo="erro">{erro}</Aviso>
      <SeletorDeTurmas turmas={turmas} marcadas={marcadas} aoMudar={setMarcadas} />
      <div className="modal-acoes">
        <button type="button" className="botao secundario" onClick={aoFechar}>Cancelar</button>
        <button type="button" className="botao" onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </Modal>
  )
}

export default function Professores() {
  const profs = useCarregar(() =>
    supabase.from('perfis').select('id, nome, email, ativo, professores_turmas(turma_id)').eq('papel', 'professor').order('nome'))
  const turmas = useCarregar(() =>
    supabase.from('turmas').select('id, nome, ano_letivo, escolas(nome)').order('ano_letivo', { ascending: false }).order('nome'))
  const acoes = useAcoesConta(profs.recarregar)
  const [criando, setCriando] = useState(false)
  const [editandoTurmas, setEditandoTurmas] = useState(null)
  const [recemCriado, setRecemCriado] = useState(null)

  const mapaTurmas = Object.fromEntries((turmas.dados ?? []).map((t) => [t.id, t]))

  return (
    <>
      <Cabecalho titulo="Professores">
        <button className="botao" type="button" onClick={() => setCriando(true)}>Novo professor</button>
      </Cabecalho>
      <Aviso tipo="erro">{profs.erro || turmas.erro || acoes.erro}</Aviso>
      {profs.carregando && <p className="carregando">Carregando…</p>}
      {!profs.carregando && !profs.erro && (profs.dados ?? []).length === 0 && <Vazio>Nenhum professor cadastrado ainda.</Vazio>}
      {(profs.dados ?? []).length > 0 && (
        <div className="tabela-rolagem">
          <table className="tabela">
            <thead><tr><th>Professor</th><th>Turmas</th><th>Situação</th><th /></tr></thead>
            <tbody>
              {profs.dados.map((p) => (
                <tr key={p.id}>
                  <td data-rotulo="Professor"><strong>{p.nome}</strong><div className="mudo">{p.email}</div></td>
                  <td data-rotulo="Turmas">
                    {(p.professores_turmas ?? []).length === 0
                      ? <span className="mudo">Nenhuma</span>
                      : (p.professores_turmas ?? []).map((x) => (
                        <span className="etiqueta" key={x.turma_id}>{nomeDaTurma(mapaTurmas[x.turma_id]) || '…'}</span>
                      ))}
                  </td>
                  <td data-rotulo="Situação"><Situacao ativo={p.ativo} /></td>
                  <td className="acoes">
                    <button type="button" className="botao pequeno secundario" onClick={() => setEditandoTurmas(p)}>Turmas</button>
                    <button type="button" className="botao pequeno secundario" disabled={acoes.ocupado === p.id} onClick={() => acoes.redefinir(p)}>Nova senha</button>
                    <button type="button" className={`botao pequeno ${p.ativo ? 'perigo' : 'secundario'}`} disabled={acoes.ocupado === p.id} onClick={() => acoes.alternar(p)}>
                      {p.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {criando && (
        <FormProfessor
          turmas={turmas.dados ?? []}
          aoFechar={() => setCriando(false)}
          aoCriado={(r) => { setCriando(false); setRecemCriado(r); profs.recarregar() }}
        />
      )}
      {editandoTurmas && (
        <EditarTurmas
          professor={editandoTurmas}
          turmas={turmas.dados ?? []}
          aoFechar={() => setEditandoTurmas(null)}
          aoSalvar={() => { setEditandoTurmas(null); profs.recarregar() }}
        />
      )}
      {recemCriado && <SenhaGerada dados={recemCriado} aoFechar={() => setRecemCriado(null)} />}
      {acoes.modal}
    </>
  )
}
