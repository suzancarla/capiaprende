import { useState } from 'react'
import { erroAmigavel, supabase } from '../supabase.js'
import { Aviso, Cabecalho, Campo, Modal, Vazio, useCarregar } from '../ui.jsx'
import { UFS } from '../util.js'

function FormEscola({ escola, aoSalvar, aoFechar }) {
  const [nome, setNome] = useState(escola?.nome ?? '')
  const [cidade, setCidade] = useState(escola?.cidade ?? '')
  const [uf, setUf] = useState(escola?.uf ?? 'MG')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const salvar = async (e) => {
    e.preventDefault()
    setSalvando(true); setErro('')
    const dados = { nome: nome.trim(), cidade: cidade.trim(), uf }
    const { error } = escola
      ? await supabase.from('escolas').update(dados).eq('id', escola.id)
      : await supabase.from('escolas').insert(dados)
    setSalvando(false)
    if (error) return setErro(erroAmigavel(error))
    aoSalvar()
  }

  return (
    <Modal titulo={escola ? 'Editar escola' : 'Nova escola'} aoFechar={aoFechar}>
      <form className="formulario" onSubmit={salvar}>
        <Aviso tipo="erro">{erro}</Aviso>
        <Campo rotulo="Nome da escola">
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} required autoFocus />
        </Campo>
        <div className="duas-colunas">
          <Campo rotulo="Cidade">
            <input value={cidade} onChange={(e) => setCidade(e.target.value)} maxLength={80} required />
          </Campo>
          <Campo rotulo="UF">
            <select value={uf} onChange={(e) => setUf(e.target.value)}>
              {UFS.map((u) => <option key={u}>{u}</option>)}
            </select>
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

export default function Escolas() {
  const { dados, carregando, erro, recarregar } = useCarregar(() =>
    supabase.from('escolas').select('id, nome, cidade, uf, turmas(count)').order('nome'))
  const [editando, setEditando] = useState(null) // null | 'nova' | escola
  const [erroAcao, setErroAcao] = useState('')

  const apagar = async (escola) => {
    if (!window.confirm(`Apagar a escola ${escola.nome}? Só é possível se ela não tiver turmas.`)) return
    setErroAcao('')
    const { error } = await supabase.from('escolas').delete().eq('id', escola.id)
    if (error) return setErroAcao(erroAmigavel(error))
    recarregar()
  }

  return (
    <>
      <Cabecalho titulo="Escolas">
        <button className="botao" type="button" onClick={() => setEditando('nova')}>Nova escola</button>
      </Cabecalho>
      <Aviso tipo="erro">{erro || erroAcao}</Aviso>
      {carregando && <p className="carregando">Carregando…</p>}
      {!carregando && !erro && (dados ?? []).length === 0 && <Vazio>Nenhuma escola cadastrada ainda. Comece criando a primeira.</Vazio>}
      {(dados ?? []).length > 0 && (
        <div className="tabela-rolagem">
          <table className="tabela">
            <thead><tr><th>Escola</th><th>Cidade</th><th>Turmas</th><th /></tr></thead>
            <tbody>
              {dados.map((e) => (
                <tr key={e.id}>
                  <td data-rotulo="Escola"><strong>{e.nome}</strong></td>
                  <td data-rotulo="Cidade">{e.cidade}, {e.uf}</td>
                  <td data-rotulo="Turmas">{e.turmas?.[0]?.count ?? 0}</td>
                  <td className="acoes">
                    <button type="button" className="botao pequeno secundario" onClick={() => setEditando(e)}>Editar</button>
                    <button type="button" className="botao pequeno perigo" onClick={() => apagar(e)}>Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editando && (
        <FormEscola
          escola={editando === 'nova' ? null : editando}
          aoFechar={() => setEditando(null)}
          aoSalvar={() => { setEditando(null); recarregar() }}
        />
      )}
    </>
  )
}
