export const SERIES = ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano']

export const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

/** "Nicolás Lima Souza" -> "nicolas.souza" (sugestão de usuário: primeiro e último nome, sem acento). */
export function sugerirUsuario(nome) {
  const limpo = nome
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean)
  if (limpo.length === 0) return ''
  if (limpo.length === 1) return limpo[0]
  return `${limpo[0]}.${limpo[limpo.length - 1]}`
}

export const USUARIO_VALIDO = /^[a-z0-9._-]{3,40}$/
export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function nomeDaTurma(t) {
  if (!t) return ''
  const escola = t.escolas?.nome
  return escola ? `${escola} · ${t.nome} (${t.ano_letivo})` : `${t.nome} (${t.ano_letivo})`
}
