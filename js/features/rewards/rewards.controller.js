// Patrocinadores e resgate de recompensas.

let LASTR = null;
let SP = {};

function redeem(id) {
  const p = S.sponsors.find(x => x.id === id);
  if (!p) return;
  if (bal() < p.cost) {
    toast('Pontos insuficientes');
    return;
  }
  const al = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
    code = [...crypto.getRandomValues(new Uint8Array(6))].map(n => al[n % al.length]).join('');
  LASTR = {
    id: Date.now(),
    uid: ME,
    sid: id,
    name: p.name + ' — ' + p.benefit,
    sname: p.name,
    benefit: p.benefit,
    cost: p.cost,
    code,
    at: Date.now()
  };
  put('redeems', LASTR);
  go('v-voucher');
}

function saveSp() {
  const n = (SP.name || '').trim(),
    b = (SP.benefit || '').trim(),
    c = parseInt(SP.cost, 10);
  if (!ADMIN) return;
  if (!n || !b || !(c > 0)) {
    toast('Preencha nome, benefício e custo em pontos');
    return;
  }
  put('sponsors', {
    id: Date.now(),
    name: n,
    emoji: (SP.emoji || '').trim() || '🏪',
    desc: (SP.desc || '').trim(),
    benefit: b,
    cost: c
  });
  SP = {};
  toast('Patrocinador adicionado');
  go('v-rewards');
}

function delSp(id) {
  if (!ADMIN) return;
  if (delArm !== id) {
    delArm = id;
    toast('Toque de novo para excluir');
    return;
  }
  S.sponsors = S.sponsors.filter(p => p.id !== id);
  rm('sponsors', id);
  delArm = 0;
  toast('Patrocinador removido');
  go('v-rewards');
}
