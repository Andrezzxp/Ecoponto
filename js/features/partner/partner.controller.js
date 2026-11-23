// Área do parceiro: consulta e baixa de códigos.

let PC = '';
let PRR = null;

function openPartner() {
  PC = '';
  PRR = null;
  PARTNER_BACK = cur;
  go('v-partner');
}

function lookup() {
  PC = ($('#pc').value || '').trim().toUpperCase();
  if (PC.length < 6) {
    toast('Digite o código de 6 caracteres');
    return;
  }
  PRR = S.redeems.find(x => x.code === PC) || 'none';
  go('v-partner');
}

function useCode() {
  const r = PRR;
  if (!r || r === 'none' || r.used) return;
  r.used = true;
  r.usedAt = Date.now();
  put('redeems', r);
  toast('Baixa registrada');
  go('v-partner');
}
