// Resgate de missões e convite.

function claim(id, force) {
  const m = MS().find(x => x.id === id);
  if (!m || claimed(id)) return;
  const [c, g] = m.p();
  if (!force && c < g) {
    toast('Missão ainda não concluída');
    return;
  }
  put('claims', {
    id: String(ME).replace(/[^\w-]/g, '') + '_' + id + '_' + today(),
    uid: ME,
    m: id,
    t: m.title,
    day: today(),
    v: m.pts,
    at: Date.now()
  });
  toast('+' + m.pts + ' pontos!');
  go('v-points');
}

async function invite() {
  const u = /^https?:/.test(location.href) ? location.href.split('#')[0] : '',
    t = 'Conheça o Ecoponto! Denuncie problemas na sua cidade com foto e localização exata.';
  try {
    if (navigator.share) await navigator.share({ title: 'Ecoponto', text: t, url: u || undefined });
    else {
      await navigator.clipboard.writeText(t + (u ? ' ' + u : ''));
      toast('Texto copiado. Cole para enviar a um amigo');
    }
    claim('d5', true);
  } catch (e) {}
}
