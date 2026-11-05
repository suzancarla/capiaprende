// Dois valores PÚBLICOS do seu projeto no Supabase (Project Settings > API).
// Podem ficar no GitHub sem problema: quem protege os dados são as regras do banco.
// NUNCA coloque aqui a chave "secret" / "service_role".
export const config = {
  url: 'https://supabase.com/dashboard/project/kjsvwvbydsretwcnljjr/',      // ex.: https://abcdefgh.supabase.co
  chave: 'sb_publishable_kAN2ud3wh22PQuOcJWwQLg_5LFRWpaT', // ex.: sb_publishable_... (ou a chave "anon")
}

export const configurado =
  config.url.startsWith('https://') && !config.chave.startsWith('COLE_AQUI')
