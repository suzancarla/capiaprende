import { useState } from 'react'
import { chamarAdmin, erroAmigavel, supabase } from '../supabase.js'
import { Aviso, Cabecalho, Campo, Modal, SenhaGerada, Situacao, Vazio, useAcoesConta, useCarregar } from '../ui.jsx'
import { USUARIO_VALIDO, nomeDaTurma, sugerirUsuario } from '../util.js'

function FormAluno({ turmas, turmaInicial, aoCriado, aoFechar }) {
  const [nome, setNome] = useState('')
  const [usuario, setUsuario] = useState('')
  const [editouUsuario, setEditouUsuario] = useState(false)
  const [turmaId, setTurmaId] = useState(turmaInicial || turmas[0]?.id || '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const mudarNome = (v) => {
    setNome(v)
    if (!editouUsuario) setUsuario(sugerirUsuario(v)) // sugere "primeiro.ultimo" enquanto o master não mexe
  }

  const salvar = async (e) => {
    e.preventDefault()
    const u = usuario.trim().toLowerCase()
    if (!USUARIO_VALIDO.test(u)) {
      return setErro('O usuário deve ter de 3 a 40 caracteres: letras minúsculas sem acento, números, ponto, hífen ou _.')
    }
    setSalvando(true); setErro('')
    const r = await chamarAdmin({ acao: 'criar_aluno', nome: nome.trim(), usuario: u, turma_id: turmaId })
    setSalvando(false)
    if (!r.ok) return setErro(r.erro)
    aoCriado(r)
  }

  return (
    <Modal titulo="Novo aluno" aoFechar={aoFechar}>
      <form className="formulario" onSubmit={salvar}>
        <Aviso tipo="erro">{erro}</Aviso>
        <Campo rotulo="Nome do aluno">
          <input value={nome} onChange={(e) => mudarNome(e.target.value)} maxLength={80} required autoFocus />
        </Campo>
        <Campo rotulo="Usuário (login no app)" dica="Sem acento e sem espaço. Já sugerimos a partir do nome; mude se dois alunos tiverem o mesmo.">
          <input value={usuario} onChange={(e) => { setUsuario(e.target.value.toLowerCase()); setEditouUsuario(true) }} maxLength={40} required />
        </Campo>
        <Campo rotulo="Turma">
          <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} required>
            {turmas.map((t) => <option key={t.id} value={t.id}>{nomeDaTurma(t)}</option>)}
          </select>
        </Campo>
        <div className="modal-acoes">
          <button type="button" className="botao secundario" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="botao" disabled={salvando}>{salvando ? 'Criando…' : 'Criar aluno'}</button>
        </div>
      </form>
    </Modal>
  )
}

function MudarTurma({ aluno, turmas, aoSalvar, aoFechar }) {
  const [turmaId, setTurmaId] = useState(aluno.turma_id)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const salvar = async () => {
    setSalvando(true); setErro('')
    const { error } = await supabase.from('alunos').update({ turma_id: turmaId }).eq('id', aluno.id)
    setSalvando(false)
    if (error) return setErro(erroAmigavel(error))
    aoSalvar()
  }

  return (
    <Modal titulo={`Mudar ${aluno.perfis?.nome} de turma`} aoFechar={aoFechar}>
      <Aviso tipo="erro">{erro}</Aviso>
      <Campo rotulo="Nova turma">
        <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
          {turmas.map((t) => <option key={t.id} value={t.id}>{nomeDaTurma(t)}</option>)}
        </select>
      </Campo>
      <div className="modal-acoes">
        <button type="button" className="botao secundario" onClick={aoFechar}>Cancelar</button>
        <button type="button" className="botao" onClick={salvar} disabled={salvando || turmaId === aluno.turma_id}>{salvando ? 'Salvando…' : 'Mudar'}</button>
      </div>
    </Modal>
  )
}

export default function Alunos() {
  // Atenção: o servidor devolve no máximo 1.000 linhas por pedido. Para turmas muito grandes, filtre por turma.
  const alunos = useCarregar(() => supabase.from('alunos').select('id, turma_id, perfis(nome, usuario, ativo)'))
  const turmas = useCarregar(() =>
    supabase.from('turmas').select('id, escola_id, nome, ano_letivo, escolas(nome)').order('ano_letivo', { ascending: false }).order('nome'))
  const acoes = useAcoesConta(alunos.recarregar)
  const [filtroTurma, setFiltroTurma] = useState('')
  const [busca, setBusca] = useState('')
  const [criando, setCriando] = useState(false)
  const [mudando, setMudando] = useState(null)
  const [recemCriado, setRecemCriado] = useState(null)

  const mapaTurmas = Object.fromEntries((turmas.dados ?? []).map((t) => [t.id, t]))
  const termo = busca.trim().toLowerCase()
  const lista = (alunos.dados ?? [])
    .filter((a) => !filtroTurma || a.turma_id === filtroTurma)
    .filter((a) => !termo || `${a.perfis?.nome ?? ''} ${a.perfis?.usuario ?? ''}`.toLowerCase().includes(termo))
    .sort((a, b) => (a.perfis?.nome ?? '').localeCompare(b.perfis?.nome ?? '', 'pt-BR'))
  const semTurmas = !turmas.carregando && (turmas.dados ?? []).length === 0

  return (
    <>
      <Cabecalho titulo="Alunos">
        <button className="botao" type="button" disabled={semTurmas} onClick={() => setCriando(true)}>Novo aluno</button>
      </Cabecalho>
      {semTurmas && <Aviso tipo="info">Cadastre uma escola e uma turma antes de criar alunos.</Aviso>}
      <Aviso tipo="erro">{alunos.erro || turmas.erro || acoes.erro}</Aviso>
      <div className="filtros">
        <Campo rotulo="Turma">
          <select value={filtroTurma} onChange={(e) => setFiltroTurma(e.target.value)}>
            <option value="">Todas</option>
            {(turmas.dados ?? []).map((t) => <option key={t.id} value={t.id}>{nomeDaTurma(t)}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Buscar por nome ou usuário">
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite para filtrar" />
        </Campo>
      </div>
      {alunos.carregando && <p className="carregando">Carregando…</p>}
      {!alunos.carregando && !alunos.erro && !semTurmas && lista.length === 0 && <Vazio>Nenhum aluno por aqui.</Vazio>}
      {lista.length > 0 && (
        <div className="tabela-rolagem">
          <table className="tabela">
            <thead><tr><th>Aluno</th><th>Usuário</th><th>Turma</th><th>Situação</th><th /></tr></thead>
            <tbody>
              {lista.map((a) => {
                const conta = { id: a.id, nome: a.perfis?.nome ?? '', ativo: a.perfis?.ativo }
                return (
                  <tr key={a.id}>
                    <td data-rotulo="Aluno"><strong>{a.perfis?.nome}</strong></td>
                    <td data-rotulo="Usuário"><code>{a.perfis?.usuario}</code></td>
                    <td data-rotulo="Turma">{nomeDaTurma(mapaTurmas[a.turma_id])}</td>
                    <td data-rotulo="Situação"><Situacao ativo={a.perfis?.ativo} /></td>
                    <td className="acoes">
                      <button type="button" className="botao pequeno secundario" onClick={() => setMudando(a)}>Turma</button>
                      <button type="button" className="botao pequeno secundario" disabled={acoes.ocupado === a.id} onClick={() => acoes.redefinir(conta)}>Nova senha</button>
                      <button type="button" className={`botao pequeno ${conta.ativo ? 'perigo' : 'secundario'}`} disabled={acoes.ocupado === a.id} onClick={() => acoes.alternar(conta)}>
                        {conta.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {criando && (
        <FormAluno
          turmas={turmas.dados ?? []}
          turmaInicial={filtroTurma}
          aoFechar={() => setCriando(false)}
          aoCriado={(r) => { setCriando(false); setRecemCriado(r); alunos.recarregar() }}
        />
      )}
      {mudando && (
        <MudarTurma
          aluno={mudando}
          turmas={turmas.dados ?? []}
          aoFechar={() => setMudando(null)}
          aoSalvar={() => { setMudando(null); alunos.recarregar() }}
        />
      )}
      {recemCriado && <SenhaGerada dados={recemCriado} aoFechar={() => setRecemCriado(null)} />}
      {acoes.modal}
    </>
  )
}
