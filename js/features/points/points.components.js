// Linha de missão.

const mrow = m => {
  const [c, g] = m.p(),
    cl = claimed(m.id),
    rdy = !cl && !m.share && c >= g;
  return `<div class="ms ${cl ? 'done' : ''}"><div class="chk">${cl ? '✓' : ''}</div><div style="flex:1;min-width:0"><div class="mt">${m.title}</div>${m.desc ? `<div class="md">${m.desc}</div>` : ''}${g > 1 && !cl ? `<div class="bar"><i style="width:${(c / g) * 100}%"></i></div><div class="md">${c}/${g}</div>` : ''}</div>${cl ? `<span class="mp">+${m.pts} ✓</span>` : m.share ? `<button class="mb" onclick="invite()">Compartilhar +${m.pts}</button>` : rdy ? `<button class="mb" onclick="claim('${m.id}')">Receber +${m.pts}</button>` : `<span class="mp off">+${m.pts}</span>`}</div>`;
};
