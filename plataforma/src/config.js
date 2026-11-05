// Dois valores PÚBLICOS do seu projeto no Supabase (Project Settings > API).
// Podem ficar no GitHub sem problema: quem protege os dados são as regras do banco.
// NUNCA coloque aqui a chave "secret" / "service_role".
export const config = {
  url: 'COLE_AQUI_O_PROJECT_URL',      // ex.: https://abcdefgh.supabase.co
  chave: 'COLE_AQUI_A_CHAVE_PUBLISHABLE', // ex.: sb_publishable_... (ou a chave "anon")
}

export const configurado =
  config.url.startsWith('https://') && !config.chave.startsWith('COLE_AQUI')
