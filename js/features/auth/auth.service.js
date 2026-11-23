// Sessão do usuário.

let ME = null;
let NAME = '';
let SESSION = null;
let RESET_EMAIL = '';

function setSession(session, event) {
  SESSION = session;
  ME = session?.user?.id || null;
  NAME = session?.user?.user_metadata?.name || session?.user?.email || '';
  ADMIN = session?.user?.app_metadata?.role === 'admin';
  if (!ME) S.reports = [];
  if (event === 'PASSWORD_RECOVERY') {
    cur = ME ? 'v-reset-password' : 'v-forgot-password';
    if (!ME) setTimeout(() => toast('O link expirou ou não é mais válido. Solicite outro.'), 0);
  } else if (ME && cur === 'v-login') cur = 'v-home';
  render();
  if (ME && event !== 'PASSWORD_RECOVERY') setTimeout(() => loadReports(ME), 0);
}

function initAuth() {
  if (!authConfigured()) return;
  S.reports = [];
  const c = window.ECOPONTO_CONFIG;
  AUTH = window.supabase.createClient(c.url, c.publishableKey);
  AUTH.auth.onAuthStateChange((event, session) => setSession(session, event));
}
