import { nomeDaTurma } from '../util.js'

/** Lista de caixinhas para marcar várias turmas. */
export default function SeletorDeTurmas({ turmas, marcadas, aoMudar }) {
  if (turmas.length === 0) return <p className="nota">Nenhuma turma cadastrada ainda.</p>
  const alternar = (id) => aoMudar(marcadas.includes(id) ? marcadas.filter((x) => x !== id) : [...marcadas, id])
  return (
    <div className="caixas">
      {turmas.map((t) => (
        <label key={t.id} className="caixa">
          <input type="checkbox" checked={marcadas.includes(t.id)} onChange={() => alternar(t.id)} />
          <span>{nomeDaTurma(t)}</span>
        </label>
      ))}
    </div>
  )
}
