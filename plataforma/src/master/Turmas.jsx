import { useState } from 'react'
import { erroAmigavel, supabase } from '../supabase.js'
import { Aviso, Cabecalho, Campo, Modal, Vazio, useCarregar } from '../ui.jsx'
import { SERIES } from '../util.js'

function FormTurma({ turma, escolas, aoSalvar, aoFechar }) {
  const [escolaId, setEscolaId] = useState(turma?.escola_id ?? escolas[0]?.id ?? '')
  const [nome, setNome] = useState(turma?.nome ?? '')
  const [serie, setSerie] = useState(turma?.serie ?? '5º ano')
  const [ano, setAno] = useState(turma?.ano_letivo ?? new Date().getFullYear())
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const salvar = async (e) => {
    e.preventDefault()
    setSalvando(true); setErro('')
    const dados = { escola_id: escolaId, nome: nome.trim(), serie, ano_letivo: Number(ano) }
    const { error } = turma
      ? await supabase.from('turmas').update(dados).eq('id', turma.id)
      : await supabase.from('turmas').insert(dados)
    setSalvando(false)
    if (error) return setErro(error.code === '23505' ? 'Essa escola já tem uma turma com esse nome neste ano letivo.' : erroAmigavel(error))
    aoSalvar()
  }

  return (
    <Modal titulo={turma ? 'Editar turma' : 'Nova turma'} aoFechar={aoFechar}>
      <form className="formulario" onSubmit={salvar}>
        <Aviso tipo="erro">{erro}</Aviso>
        <Campo rotulo="Escola">
          <select value={escolaId} onChange={(e) => setEscolaId(e.target.value)} required>
            {escolas.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
          </select>
        </Campo>
        <Campo rotulo="Nome da turma" dica='Ex.: "5º ano C"'>
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60} required autoFocus />
        </Campo>
        <div className="duas-colunas">
          <Campo rotulo="Série">
            <select value={serie} onChange={(e) => setSerie(e.target.value)}>
              {SERIES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Ano letivo">
            <input type="number" min="2020" max="2100" value={ano} onChange={(e) => setAno(e.target.value)} required />
          </Campo>
        </div>
        <div className="modal-acoes">
          <button type="button" className="botao secundario" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="botao" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default function Turmas() {
  const escolas = useCarregar(() => supabase.from('escolas').select('id, nome').order('nome'))
  const turmas = useCarregar(() =>
    supabase.from('turmas').select('id, escola_id, nome, serie, ano_letivo, escolas(nome), alunos(count)').order('ano_letivo', { ascending: false }).order('nome'))
  const [filtro, setFiltro] = useState('')
  const [editando, setEditando] = useState(null)
  const [erroAcao, setErroAcao] = useState('')

  const apagar = async (t) => {
    if (!window.confirm(`Apagar a turma ${t.nome}? Só é possível se ela não tiver alunos.`)) return
    setErroAcao('')
    const { error } = await supabase.from('turmas').delete().eq('id', t.id)
    if (error) return setErroAcao(erroAmigavel(error))
    turmas.recarregar()
  }

  const lista = (turmas.dados ?? []).filter((t) => !filtro || t.escola_id === filtro)
  const semEscolas = !escolas.carregando && (escolas.dados ?? []).length === 0

  return (
    <>
      <Cabecalho titulo="Turmas">
        <button className="botao" type="button" disabled={semEscolas} onClick={() => setEditando('nova')}>Nova turma</button>
      </Cabecalho>
      {semEscolas && <Aviso tipo="info">Cadastre uma escola antes de criar turmas.</Aviso>}
      <Aviso tipo="erro">{escolas.erro || turmas.erro || erroAcao}</Aviso>
      {(escolas.dados ?? []).length > 1 && (
        <div className="filtros">
          <Campo rotulo="Escola">
            <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="">Todas</option>
              {escolas.dados.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
            </select>
          </Campo>
        </div>
      )}
      {turmas.carregando && <p className="carregando">Carregando…</p>}
      {!turmas.carregando && !turmas.erro && !semEscolas && lista.length === 0 && <Vazio>Nenhuma turma por aqui ainda.</Vazio>}
      {lista.length > 0 && (
        <div className="tabela-rolagem">
          <table className="tabela">
            <thead><tr><th>Turma</th><th>Escola</th><th>Série</th><th>Ano</th><th>Alunos</th><th /></tr></thead>
            <tbody>
              {lista.map((t) => (
                <tr key={t.id}>
                  <td data-rotulo="Turma"><strong>{t.nome}</strong></td>
                  <td data-rotulo="Escola">{t.escolas?.nome}</td>
                  <td data-rotulo="Série">{t.serie}</td>
                  <td data-rotulo="Ano">{t.ano_letivo}</td>
                  <td data-rotulo="Alunos">{t.alunos?.[0]?.count ?? 0}</td>
                  <td className="acoes">
                    <button type="button" className="botao pequeno secundario" onClick={() => setEditando(t)}>Editar</button>
                    <button type="button" className="botao pequeno perigo" onClick={() => apagar(t)}>Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editando && (
        <FormTurma
          turma={editando === 'nova' ? null : editando}
          escolas={escolas.dados ?? []}
          aoFechar={() => setEditando(null)}
          aoSalvar={() => { setEditando(null); turmas.recarregar() }}
        />
      )}
    </>
  )
}
