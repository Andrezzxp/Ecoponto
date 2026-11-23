// Exige sessão ativa antes de seguir.

function requireAuth() {
  if (SESSION?.user) return true;
  toast('Entre ou crie uma conta para enviar uma denúncia');
  go('v-login');
  return false;
}
