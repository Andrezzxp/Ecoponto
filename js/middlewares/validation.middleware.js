// Valida um campo antes de avançar de tela.

function need(ok, msg, next, f) {
  if (!ok) {
    toast(msg);
    if (f) $(f) && $(f).focus();
    return;
  }
  go(next);
}
