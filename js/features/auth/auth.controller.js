// Login, cadastro, recuperação de senha e logout.

async function login(mode) {
  if (!AUTH) {
    toast('Configure a URL e a chave publicável do Supabase em js/config.js');
    return;
  }
  const email = $('#em').value.trim(),
    password = $('#pw').value;
  if (!email || !password) {
    toast('Informe e-mail e senha');
    return;
  }
  const result =
    mode === 'signup'
      ? await AUTH.auth.signUp({ email, password })
      : await AUTH.auth.signInWithPassword({ email, password });
  if (result.error) {
    toast(
      mode === 'signup' ? 'Não foi possível criar a conta. Confira os dados.' : 'E-mail ou senha inválidos.'
    );
    return;
  }
  if (mode === 'signup' && !result.data.session) {
    toast('Conta criada. Confirme o e-mail para entrar.');
    return;
  }
  go('v-home');
}

async function sendPasswordReset() {
  if (!AUTH) {
    toast('A recuperação de senha não está disponível agora');
    return;
  }
  const email = $('#reset-email').value.trim();
  if (!email) {
    toast('Informe seu e-mail');
    $('#reset-email').focus();
    return;
  }
  RESET_EMAIL = email;
  const { error } = await AUTH.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  if (error) {
    toast('Não foi possível solicitar a recuperação. Tente novamente.');
    return;
  }
  toast('Se houver uma conta com esse e-mail, enviaremos um link para redefinir a senha.');
}

async function saveNewPassword() {
  if (!AUTH) {
    toast('A recuperação de senha não está disponível agora');
    return;
  }
  if (!SESSION?.user) {
    toast('O link expirou ou não é mais válido. Solicite outro.');
    go('v-forgot-password');
    return;
  }
  const password = $('#new-password').value,
    confirmation = $('#confirm-password').value;
  if (password.length < 8) {
    toast('Use uma senha com pelo menos 8 caracteres');
    $('#new-password').focus();
    return;
  }
  if (password !== confirmation) {
    toast('As senhas não coincidem');
    $('#confirm-password').focus();
    return;
  }
  const { error } = await AUTH.auth.updateUser({ password });
  if (error) {
    const message = String(error.message || '').toLowerCase();
    if (
      error.status === 401 ||
      error.code === 'session_not_found' ||
      message.includes('session') ||
      message.includes('token')
    ) {
      toast('O link expirou ou não é mais válido. Solicite outro.');
      go('v-forgot-password');
    } else if (error.code === 'same_password' || message.includes('different from the old password'))
      toast('Escolha uma senha diferente da atual.');
    else if (
      error.code === 'weak_password' ||
      message.includes('weak password') ||
      message.includes('password should be at least')
    )
      toast('A senha não atende aos requisitos do Supabase. Escolha outra senha.');
    else {
      console.error('Falha ao redefinir a senha', error.status, error.code);
      toast(`Não foi possível atualizar a senha (${error.code || error.status || 'erro'}). Tente novamente.`);
    }
    return;
  }
  toast('Senha atualizada. Entre com sua nova senha.');
  await AUTH.auth.signOut();
  go('v-login');
}

async function logout() {
  if (AUTH) await AUTH.auth.signOut();
  setSession(null);
  go('v-home');
}
