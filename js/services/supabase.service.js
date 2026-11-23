// Cliente Supabase.

let AUTH = null;

function authConfigured() {
  const c = window.ECOPONTO_CONFIG || {};
  return !!(window.supabase?.createClient && c.url && c.publishableKey);
}
