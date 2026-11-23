// Telas de pontos, patrocinadores e voucher.

const inp = (l, k, ph, extra = '') =>
  `<div class="field-label">${l}</div><input type="text" ${extra} placeholder="${ph}" value="${esc(SP[k] || '')}" oninput="SP.${k}=this.value">`;

Object.assign(V, {
  'v-points': () => {
    const b = bal(),
      M = MS(),
      dn = M.filter(m => claimed(m.id)).length,
      L = ledger().reverse(),
      hl = Math.ceil((new Date().setHours(24, 0, 0, 0) - Date.now()) / 36e5);
    return `${sb()}${tb('Pontos', POINTS_BACK)}<div class="content"><div class="balance-card"><div class="lbl">Saldo</div><div class="val">${num(b)} pontos</div><div class="sub">${b >= 1000 ? 'Guardião do Bairro' : b >= 500 ? 'Vigilante' : 'Iniciante'}</div></div>
<div class="field-label">Missões de hoje · ${dn} de ${M.length} concluídas</div><div class="md" style="margin-bottom:2px">Renovam todo dia à meia-noite (em ${hl} h)</div>${M.map(mrow).join('')}<div class="card" style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;gap:10px" onclick="openSupport('v-points')"><span>💚 <b>${isSup() ? 'Você é apoiador' : 'Seja apoiador'}</b><br><span class="md">${isSup() ? 'Obrigado por manter o projeto!' : 'A partir de R$ 5,00 por mês + bônus diário'}</span></span><span class="edit">Ver</span></div>
<div class="field-label">Patrocinadores</div>${S.sponsors.length ? `<div class="spstrip">${S.sponsors.map(p => `<div class="spchip" onclick="go('v-rewards')">${esc(p.emoji || '🏪')} ${esc(p.name)}</div>`).join('')}</div>` : `<div class="md">${ADMIN ? 'Nenhum patrocinador cadastrado ainda.' : 'Em breve novos parceiros.'}</div>`}
<button class="btn-secondary" style="margin-top:10px;" onclick="go('v-rewards')">Ver patrocinadores e recompensas</button>
<div class="field-label">Histórico</div>${L.map((l, i, a) => `<div class="ledger-row" ${i === a.length - 1 ? 'style="border-bottom:none"' : ''}><span>${esc(l.t)}</span><span class="plus" ${l.v < 0 ? 'style="color:var(--error)"' : ''}>${l.v > 0 ? '+' : ''}${l.v}</span></div>`).join('') || '<div class="md">Nenhuma movimentação ainda.</div>'}</div>${tabs('v-points')}`;
  },
  'v-rewards': () => {
    const b = bal();
    return `${sb()}${tb('Patrocinadores', 'v-points', ADMIN ? `<span class="iconbtn" onclick="SP={};go('v-sponsor-new')">+</span>` : undefined)}<div class="content"><div class="helper" style="margin:0 0 10px">Seu saldo: <b>${num(b)} pontos</b>. Troque pontos por benefícios dos parceiros da cidade.</div>
${S.sponsors.map(p => `<div class="sp"><div class="top"><div class="lg">${esc(p.emoji || '🏪')}</div><div style="flex:1;min-width:0"><div class="rt">${esc(p.name)}</div>${p.desc ? `<div class="md">${esc(p.desc)}</div>` : ''}</div>${ADMIN ? `<span class="edit" onclick="delSp(${p.id})">Excluir</span>` : ''}</div><div class="ben"><span>🎁 ${esc(p.benefit)}<br><b>${num(p.cost)} pontos</b></span><button style="${b < p.cost ? 'opacity:.5' : ''}" onclick="redeem(${p.id})">Resgatar</button></div></div>`).join('') || `<p class="helper" style="text-align:center;margin-top:30px">${ADMIN ? 'Nenhum patrocinador cadastrado. Toque em + para adicionar.' : 'Em breve teremos benefícios de patrocinadores por aqui.'}</p>`}<button class="btn-ghost" style="margin-top:10px" onclick="openPartner()">🏪 Sou patrocinador · Área do parceiro</button></div>`;
  },
  'v-sponsor-new': () =>
    `${sb()}${tb('Novo patrocinador', 'v-rewards')}<div class="content">${inp('Nome', 'name', 'Ex.: Padaria Central')}${inp('Ícone (emoji)', 'emoji', '🏪', 'maxlength="4"')}${inp('Descrição (opcional)', 'desc', 'Ex.: Pães e cafés no centro')}${inp('Benefício oferecido', 'benefit', 'Ex.: 10% de desconto na compra')}${inp('Custo em pontos', 'cost', 'Ex.: 500', 'inputmode="numeric"')}<div class="stack"><button class="btn-primary" onclick="saveSp()">Salvar patrocinador</button></div></div>`,
  'v-voucher': () =>
    `${sb()}<div class="confirm-wrap"><div class="confirm-badge">🎁</div><div style="font-size:17px;font-weight:800;">Recompensa resgatada!</div><p style="font-size:13px;color:var(--ink-soft);margin:6px 0 0;">${esc(LASTR.sname)} — ${esc(LASTR.benefit)}</p><div class="protocol" style="letter-spacing:3px;font-size:22px;">${LASTR.code}</div><p class="helper">Apresente este código ao patrocinador. Ele também fica no seu histórico de pontos.</p><div class="stack" style="width:100%;margin-top:22px;"><button class="btn-primary" onclick="go('v-points')">Voltar aos pontos</button></div></div>`
});
