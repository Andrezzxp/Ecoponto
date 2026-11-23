// Apoio mensal: registrar, cancelar e confirmar pagamento.

let AMT = 10;
const amtL = () => 'Apoiar por ' + brl(AMT > 0 ? AMT : 0) + '/mês';

function openSupport(back) {
  SUPPORT_BACK = back;
  go('v-support');
}

function pledge() {
  const a = Math.round(AMT * 100) / 100;
  if (!(a >= 5)) {
    toast('O valor mínimo do apoio é R$ 5,00');
    return;
  }
  if (a > 10000) {
    toast('Valor máximo: R$ 10.000,00');
    return;
  }
  put('pledges', { id: Date.now(), uid: ME, by: NAME, amount: a, status: 'pendente', at: Date.now() });
  if (PAY_LINK) window.open(PAY_LINK, '_blank', 'noopener');
  toast(
    PAY_LINK || PIX_KEY
      ? 'Conclua o pagamento para ativar seu apoio'
      : 'Apoio registrado. A administração enviará as instruções de pagamento'
  );
  go('v-support');
}

function endPledge(id) {
  const p = S.pledges.find(x => x.id === id);
  if (!p || !(mine(p) || ADMIN)) return;
  p.status = 'cancelado';
  put('pledges', p);
  toast('Apoio cancelado. Se a cobrança for recorrente, cancele também no provedor de pagamento');
  go('v-support');
}

function payOk(id, ok) {
  if (!ADMIN) return;
  const p = S.pledges.find(x => x.id === id);
  if (!p) return;
  if (ok) {
    S.pledges
      .filter(y => y.uid === p.uid && y.id !== p.id && y.status === 'ativo')
      .forEach(y => {
        y.status = 'encerrado';
        put('pledges', y);
      });
    p.status = 'ativo';
    p.paidAt = Date.now();
    p.until = Date.now() + 30 * 864e5;
  } else p.status = 'recusado';
  put('pledges', p);
  toast(ok ? 'Pagamento confirmado' : 'Apoio recusado');
  go('v-support');
}

function copyPix() {
  try {
    navigator.clipboard.writeText(PIX_KEY).then(
      () => toast('Chave Pix copiada'),
      () => toast('Copie a chave manualmente')
    );
  } catch (e) {
    toast('Copie a chave manualmente');
  }
}
