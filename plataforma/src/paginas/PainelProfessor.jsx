import { supabase } from '../supabase.js'
import { Aviso, Cabecalho, Situacao, Vazio, useCarregar } from '../ui.jsx'
import { nomeDaTurma } from '../util.js'

// Por enquanto o professor só consulta as turmas e os alunos dele.
// Conteúdos e simulados entram no passo 3.
export default function PainelProfessor() {
  const turmas = useCarregar(() => supabase.from('turmas').select('id, nome, serie, ano_letivo, escolas(nome)').order('nome'))
  const alunos = useCarregar(() => supabase.from('alunos').select('id, turma_id, perfis(nome, usuario, ativo)'))

  const erro = turmas.erro || alunos.erro
  const carregando = turmas.carregando || alunos.carregando

  return (
    <>
      <Cabecalho titulo="Minhas turmas" />
      <Aviso tipo="info">Em breve aqui você cadastra conteúdos e simulados e libera para as suas turmas.</Aviso>
      <Aviso tipo="erro">{erro}</Aviso>
      {carregando && <p className="carregando">Carregando…</p>}
      {!carregando && !erro && (turmas.dados ?? []).length === 0 && (
        <Vazio>Você ainda não está ligado a nenhuma turma. Peça ao master para fazer o vínculo.</Vazio>
      )}
      {(turmas.dados ?? []).map((t) => {
        const doGrupo = (alunos.dados ?? [])
          .filter((a) => a.turma_id === t.id)
          .sort((a, b) => (a.perfis?.nome ?? '').localeCompare(b.perfis?.nome ?? '', 'pt-BR'))
        return (
          <section className="painel" key={t.id}>
            <h2>{nomeDaTurma(t)} <small>· {t.serie}</small></h2>
            {doGrupo.length === 0 ? <p className="nota">Nenhum aluno cadastrado nesta turma.</p> : (
              <ul className="lista-simples">
                {doGrupo.map((a) => (
                  <li key={a.id}>
                    <span>{a.perfis?.nome}</span>
                    <span className="mudo">{a.perfis?.usuario}</span>
                    <Situacao ativo={a.perfis?.ativo} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </>
  )
}
