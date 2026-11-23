// Telas de apoio mensal e área do parceiro.

Object.assign(V, {
  'v-support': () => {
    const p = sup(),
      act = isSup(),
      pend = p && p.status === 'pendente';
    let body;
    const pay = `${PAY_LINK ? `<button class="btn-primary" onclick="window.open(PAY_LINK,'_blank','noopener')">Ir para o pagamento</button>` : ''}${PIX_KEY ? `<div class="field-label">Chave Pix</div><div class="card" style="word-break:break-all">${esc(PIX_KEY)}</div><button class="btn-ghost" style="margin-top:8px" onclick="copyPix()">Copiar chave Pix</button>` : ''}${!PAY_LINK && !PIX_KEY ? '<div class="md">O pagamento ainda não foi configurado neste app. A administração entrará em contato.</div>' : ''}`;
    if (act)
      body = `<div class="card">💚 <b>Apoiador ativo</b><br><span class="md">${brl(p.amount)}/mês · válido até ${fmtd(p.until)}</span></div><div class="stack" style="margin-top:12px"><button class="btn-primary" onclick="AMT=${p.amount};pledge()">Renovar apoio</button><button class="btn-secondary" onclick="endPledge(${p.id})">Cancelar apoio</button></div>`;
    else if (pend)
      body = `<div class="card">⏳ <b>Aguardando confirmação</b><br><span class="md">Apoio de ${brl(p.amount)}/mês registrado em ${fmtd(p.at)}. Quando o pagamento for confirmado, o selo de apoiador é ativado.</span></div><div class="stack" style="margin-top:12px">${pay}<button class="btn-secondary" onclick="endPledge(${p.id})">Cancelar apoio</button></div>`;
    else
      body = `<div class="field-label">Escolha o valor mensal</div><div class="filterbar">${[5, 10, 20, 50].map(v => `<div class="filterchip ${AMT === v ? 'active' : ''}" onclick="AMT=${v};go('v-support')">R$ ${v}</div>`).join('')}</div>
<input type="text" inputmode="decimal" placeholder="Outro valor (mínimo R$ 5,00)" value="${[5, 10, 20, 50].includes(AMT) ? '' : AMT}" oninput="AMT=parseFloat(this.value.replace(',','.'))||0;$('#pb').textContent=amtL()" style="margin-top:8px">
<div class="field-label">O que você ganha</div><div class="md" style="line-height:1.7;font-size:12.5px">💚 Selo de apoiador no seu perfil<br>⭐ Missão bônus diária de +10 pontos<br>🌱 Ajuda a manter a Ecoponto no ar</div>
<div class="stack" style="margin-top:14px"><button id="pb" class="btn-primary" onclick="pledge()">${amtL()}</button></div><p class="md" style="margin-top:8px">O pagamento é feito no provedor escolhido pela administração. O app não guarda dados de cartão.</p>`;
    let adm = '';
    if (ADMIN) {
      const pn = S.pledges.filter(x => x.status === 'pendente').sort((a, b) => a.at - b.at),
        ac = S.pledges.filter(x => x.status === 'ativo' && x.until > Date.now());
      adm = `<div class="field-label">Painel da administração</div><div class="card"><b>${ac.length}</b> apoiador(es) ativo(s) · <b>${brl(ac.reduce((a, x) => a + x.amount, 0))}</b>/mês</div>${pn.map(x => `<div class="ledger-row" style="align-items:center;gap:8px"><span>${esc(x.by || 'Cidadão')} · ${brl(x.amount)}<br><span class="md">${fmtd(x.at)} · pendente</span></span><span style="white-space:nowrap"><span class="edit" onclick="payOk(${x.id},true)">Confirmar</span> · <span class="edit" onclick="payOk(${x.id},false)" style="color:var(--error)">Recusar</span></span></div>`).join('') || '<div class="md" style="margin-top:8px">Nenhum pagamento pendente.</div>'}`;
    }
    return `${sb()}${tb('Seja apoiador', SUPPORT_BACK)}<div class="content"><div class="balance-card"><div class="lbl">Apoio mensal</div><div class="val">💚 A partir de R$ 5</div><div class="sub">Sua contribuição mantém o projeto funcionando</div></div>${body}${adm}</div>`;
  },
  'v-partner': () => {
    const r = PRR;
    let res = '';
    if (r === 'none')
      res =
        '<div class="card" style="border-color:var(--error);color:var(--error)">Código não encontrado.</div>';
    else if (r)
      res = `<div class="sp"><div class="rt">${esc(r.sname || '')}</div><div class="md">🎁 ${esc(r.benefit || '')}</div><div class="md">Resgatado em ${fmtd(r.at)}</div><div style="margin-top:8px;font-weight:800;color:${r.used ? 'var(--ink-soft)' : 'var(--primary)'}">${r.used ? 'Já utilizado em ' + fmtd(r.usedAt) : '✓ Código válido'}</div>${r.used ? '' : '<button class="btn-primary" style="margin-top:10px" onclick="useCode()">Dar baixa (marcar como usado)</button>'}</div>`;
    const st = S.sponsors
      .map(p => {
        const rs = S.redeems.filter(x => x.sid === p.id);
        return `<div class="ledger-row"><span>${esc(p.emoji || '🏪')} ${esc(p.name)}</span><span>${rs.length} resgates · ${rs.filter(x => x.used).length} usados</span></div>`;
      })
      .join('');
    return `${sb()}${tb('Área do patrocinador', PARTNER_BACK)}<div class="content"><p class="helper" style="margin:0 0 8px;line-height:1.5">Confira o código apresentado pelo cliente e dê baixa para que não seja usado duas vezes.</p><div class="field-label">Código do cliente</div>
<input id="pc" type="text" maxlength="6" placeholder="Ex.: A1B2C3" style="text-transform:uppercase;letter-spacing:3px" value="${esc(PC)}" oninput="PC=this.value.toUpperCase()" onkeydown="if(event.key==='Enter')lookup()"><div class="stack" style="margin:12px 0"><button class="btn-primary" onclick="lookup()">Consultar código</button></div>${res}
${ADMIN ? `<div class="field-label">Resumo por patrocinador</div>${st || '<div class="md">Nenhum patrocinador cadastrado.</div>'}` : ''}${CONTACT_URL ? '<button class="btn-ghost" style="margin-top:14px" onclick="window.open(CONTACT_URL,\'_blank\',\'noopener\')">Quero ser patrocinador</button>' : '<div class="md" style="margin-top:14px">Quer ser patrocinador? Fale com a administração da Ecoponto.</div>'}</div>`;
  }
});
