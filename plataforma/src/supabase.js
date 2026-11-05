import { createClient } from '@supabase/supabase-js'
import { config, configurado } from './config.js'

// Se ainda não foi configurado, usa valores de enfeite só para a página abrir e mostrar o aviso.
export const supabase = createClient(
  configurado ? config.url : 'https://sem-configuracao.invalid',
  configurado ? config.chave : 'sem-configuracao',
  { auth: { persistSession: true, autoRefreshToken: true } },
)

/** Chama a Edge Function de administração. Devolve { ok, ...dados } ou { ok:false, erro }. */
export async function chamarAdmin(corpo) {
  const { data, error } = await supabase.functions.invoke('admin-usuarios', { body: corpo })
  if (error) {
    return { ok: false, erro: 'Não foi possível falar com o servidor. Confira a função "admin-usuarios" e tente de novo.' }
  }
  return data ?? { ok: false, erro: 'Resposta vazia do servidor.' }
}

/** Traduz erros do banco para uma frase simples. */
export function erroAmigavel(e) {
  if (!e) return ''
  switch (e.code) {
    case '23503': return 'Isso está em uso por outros cadastros (por exemplo, uma escola que ainda tem turmas). Remova ou mude os outros cadastros antes.'
    case '23505': return 'Já existe um cadastro igual a esse.'
    case '23514': return 'Algum campo está com um valor que não é permitido.'
    case '42501': return 'Você não tem permissão para isso.'
    default: return e.message || 'Algo deu errado.'
  }
}
