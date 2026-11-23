// Telas principais e ações executadas após cada render.

const V = {
  'v-home': () => `<div class="mapfull" id="gmap">
<div class="msearch"><span>🔎</span><input id="q" type="text" placeholder="Procurar um endereço" onkeydown="if(event.key==='Enter')msearch()" onpointerdown="event.stopPropagation()"><span class="iconbtn" onclick="go('v-profile')" onpointerdown="event.stopPropagation()">👤</span></div>
<label class="map-filter-control" onpointerdown="event.stopPropagation()"><span>Status</span><select aria-label="Filtrar denúncias no mapa" onchange="setMapFilter(this.value)"><option value="all" ${MAP_FILTER === 'all' ? 'selected' : ''}>Todas</option><option value="analysis" ${MAP_FILTER === 'analysis' ? 'selected' : ''}>Em análise</option><option value="resolved" ${MAP_FILTER === 'resolved' ? 'selected' : ''}>Concluídas</option><option value="none" ${MAP_FILTER === 'none' ? 'selected' : ''}>Nenhuma</option></select></label>
<div class="mctl" onpointerdown="event.stopPropagation()"><div class="iconbtn" onclick="setZ(1)">＋</div><div class="iconbtn" onclick="setZ(-1)">－</div><div class="iconbtn" onclick="mlocate()">🎯</div></div>
<div id="mnote">Não foi possível carregar o mapa neste ambiente.</div>
<div class="map-attribution"><a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">© OpenMapTiles</a> · Dados <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a></div>
<div class="fab" onpointerdown="event.stopPropagation()" onclick="newReport()">+ Nova denúncia</div></div>${tabs('v-home')}`,
  'v-pick':
    () => `${sb()}<div class="mapfull map-pick" id="gmap"><div id="pickpin" class="pick-pin" aria-hidden="true">📍</div><div class="pick-hint">Arraste o mapa ou busque um endereço; o alfinete marca o centro</div>
<div class="msearch"><span class="iconbtn" onclick="go('v-loc')" onpointerdown="event.stopPropagation()">←</span><span>🔎</span><input id="q" type="text" placeholder="Procurar um endereço" onkeydown="if(event.key==='Enter')msearch()" onpointerdown="event.stopPropagation()"><span class="iconbtn" onclick="mlocate()" onpointerdown="event.stopPropagation()">🎯</span></div>
<div class="mctl" onpointerdown="event.stopPropagation()"><div class="iconbtn" onclick="setZ(1)">＋</div><div class="iconbtn" onclick="setZ(-1)">－</div></div>
<div id="mnote">Não foi possível carregar o mapa neste ambiente.</div><div class="map-attribution"><a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">© OpenMapTiles</a> · Dados <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a></div><div class="pick-actions" onpointerdown="event.stopPropagation()"><button class="btn-primary" onclick="confirmMapPoint()">Usar este ponto</button></div></div>`,
  'v-loc': () => `${sb()}${tb('Onde está o problema?', 'v-home')}${steps(1)}
<div class="content"><p class="helper" style="margin:4px 0 10px;line-height:1.5">Fique perto do local e permita o acesso à localização para registrar o ponto exato.</p>
<div class="card" id="gps">📡 Buscando sua localização exata…</div>
<div class="stack" style="margin:10px 0 0"><button class="btn-ghost" onclick="locate()">📍 Atualizar GPS</button><button class="btn-ghost" onclick="chooseMapPoint()">📌 Marcar no mapa</button>${D.lat != null ? `<a class="btn-ghost" style="text-decoration:none" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${D.lat},${D.lng}">🗺️ Conferir no mapa</a>` : ''}</div>
<div class="field-label">Endereço ou referência</div><input id="addr" type="text" placeholder="Rua, número, bairro ou ponto de referência" value="${esc(D.addr)}" oninput="D.addr=this.value;D.addrManual=true">
<div class="stack"><button class="btn-primary" onclick="need(D.addr.trim(),'Informe o endereço ou uma referência','v-photo','#addr')">Usar esta localização</button></div></div>`,
  'v-photo':
    () => `${sb()}${tb('Mostre o local', 'v-loc')}${steps(2)}<div class="content"><input id="file" type="file" accept="image/*" hidden onchange="pick(this)"><input id="cam" type="file" accept="image/*" capture="environment" hidden onchange="pick(this)">
<div class="photobox" style="position:relative;overflow:hidden;${D.photo ? `background:url(${D.photo}) center/cover;border-style:solid` : 'padding:0'}">${D.photo ? '' : `<video id="vid" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover"></video><div id="pbph" style="display:none;flex-direction:column;align-items:center;gap:8px;padding:16px;text-align:center">📷<span>Câmera não disponível</span></div>`}</div>
<div class="helper" id="camerr" style="color:var(--error);min-height:16px"></div>
${
  D.photo
    ? `<div class="stack"><button class="btn-primary" onclick="go('v-type')">Usar esta foto</button><button class="btn-ghost" onclick="D.photo=null;go('v-photo')">Refazer foto</button></div>`
    : `<div class="shutter" onclick="snap()"></div>
<div class="stack" style="margin-top:16px;"><button class="btn-ghost" onclick="flip()">🔄 Trocar câmera</button><button class="btn-ghost" onclick="$('#cam').click()">📷 Tirar foto pelo celular</button><button class="btn-ghost" onclick="$('#file').click()">🖼️ Escolher da galeria</button></div>`
}</div>`,
  'v-type': () =>
    `${sb()}${tb('O que é isso?', 'v-photo')}${steps(3)}<div class="content"><div class="catgrid">${CATS.map((c, i) => `<div class="cat ${D.cat === i ? 'sel' : ''}" onclick="D.cat=${i};go('v-type')"><span class="ic">${c[0]}</span>${c[1]}</div>`).join('')}</div><button class="btn-primary" onclick="need(D.cat!==null,'Escolha um tipo','v-desc')">Continuar</button></div>`,
  'v-desc':
    () => `${sb()}${tb('Quer contar mais?', 'v-type')}${steps(4)}<div class="content"><div class="field-label">Descrição (opcional)</div>
<textarea rows="4" maxlength="140" placeholder="Ex.: Lixo acumulado há alguns dias na esquina..." oninput="D.desc=this.value;$('#cc').textContent=this.value.length+'/140 caracteres'">${esc(D.desc)}</textarea><div class="helper" id="cc">${D.desc.length}/140 caracteres</div>
<div class="stack" style="margin-top:20px;"><button class="btn-primary" onclick="go('v-review')">Continuar</button><button class="btn-ghost" onclick="D.desc='';go('v-review')">Pular esta etapa</button></div></div>`,
  'v-review': () => {
    const row = (ic, l, v, to, last) =>
      `<div class="review-row" ${last ? 'style="border-bottom:none"' : ''}>${ic}<div><div class="rlabel">${l}</div><div class="rval">${v}</div></div><div class="edit" onclick="go('${to}')">Editar</div></div>`;
    return `${sb()}${tb('Confira sua denúncia', 'v-desc')}<div class="content">${row(`<div class="thumb" ${thumb(D)}></div>`, 'Foto', D.photo ? '1 imagem anexada' : 'Sem foto', 'v-photo')}${row('<div style="font-size:20px;">📍</div>', 'Local', esc(D.addr) + (D.lat != null ? `<div class="helper" style="margin:2px 0 0">${D.lat.toFixed(5)}, ${D.lng.toFixed(5)} · ${D.locationSource === 'manual' ? 'Ponto marcado no mapa' : `±${D.acc} m`}</div>` : '<div class="helper" style="margin:2px 0 0">Sem coordenadas (endereço informado)</div>'), 'v-loc')}${row('<div style="font-size:20px;">' + (CATS[D.cat] || CATS[5])[0] + '</div>', 'Tipo', (CATS[D.cat] || CATS[5])[1], 'v-type')}${row('<div style="font-size:20px;">📝</div>', 'Descrição', D.desc.trim() ? esc(D.desc) : '—', 'v-desc', 1)}<div class="stack"><button class="btn-primary" onclick="submit()">Enviar denúncia</button></div></div>`;
  },
  'v-confirm': () =>
    `${sb()}<div class="confirm-wrap"><div class="confirm-badge">✓</div><div style="font-size:17px;font-weight:800;">Denúncia enviada!</div><p style="font-size:13px;color:var(--ink-soft);margin:6px 0 0;">Obrigado por ajudar a manter a cidade limpa.</p><div class="protocol">Protocolo #${pid(LAST)}</div><div><span class="status-pill">Status: Em análise</span></div><div class="stack" style="width:100%;margin-top:26px;"><button class="btn-primary" onclick="openR('${LAST}','v-list')">Ver denúncia</button><button class="btn-secondary" onclick="go('v-home')">Voltar ao início</button></div></div>`,
  'v-list': () => {
    const L = S.reports.filter(r => {
      const day = dayOf(r.t[0]);
      return (
        (ADMIN || mine(r)) &&
        (F === 'Todas' ||
          status(r) === F.replace('Resolvidas', 'Resolvida').replace('Rejeitadas', 'Rejeitada')) &&
        (!DATE_FROM || day >= DATE_FROM) &&
        (!DATE_TO || day <= DATE_TO)
      );
    });
    return `${sb()}${tb(ADMIN ? 'Todas as denúncias' : 'Minhas denúncias', LIST_BACK, `<span class="iconbtn" onclick="newReport()">+</span>`)}<div class="content"><div class="filterbar">${FL.map(f => `<div class="filterchip ${F === f ? 'active' : ''}" onclick="F='${f}';go('v-list')">${f}</div>`).join('')}</div><div class="date-filter"><label for="date-from">De<input id="date-from" type="date" value="${DATE_FROM}" onchange="DATE_FROM=this.value;render()"></label><label for="date-to">Até<input id="date-to" type="date" value="${DATE_TO}" onchange="DATE_TO=this.value;render()"></label>${DATE_FROM || DATE_TO ? `<button class="date-clear" onclick="DATE_FROM='';DATE_TO='';render()">Limpar</button>` : ''}</div>
${L.map(r => `<div class="report-item" onclick="openR('${r.id}','v-list')"><div class="thumb" ${thumb(r)}></div><div style="flex:1;"><div class="addr">${esc(r.addr)}</div><div class="meta">${CATS[r.cat][1]} · ${reportDateTime(r.t[0])} · ${ago(r.t[0])}</div></div><span class="pill ${pcls(r)}">${status(r)}</span></div>`).join('') || '<p class="helper" style="text-align:center;margin-top:30px">Nenhuma denúncia neste período.</p>'}</div>${tabs('v-list')}`;
  },
  'v-detail': () => {
    const r = S.reports.find(r => r.id === OPEN);
    if (!r) return V['v-list']();
    const tl = ST.map((n, i) => {
      const rj = i === 3 && r.rej,
        t = rj ? r.rejAt : r.t[i];
      return `<div class="tstep ${t ? 'done' : ''} ${rj ? 'rej' : ''}"><div class="dot"></div><div><div class="tt">${rj ? 'Rejeitada' : n}</div><div class="td">${t ? fmt(t) : 'aguardando'}</div></div></div>`;
    }).join('');
    return `${sb()}${tb('Detalhes', BACK)}<div class="content"><div class="photobox" style="height:170px;${r.photo ? `background:url(${r.photo}) center/cover;border-style:solid` : ''}">${r.photo ? '' : '📷'}</div>
<div class="field-label">Protocolo</div><div class="protocol" style="margin:0;">#${pid(r.id)}</div><div class="field-label">Data da denúncia</div><div>${reportDateTime(r.t[0])}</div><div class="field-label">Endereço</div><div>${esc(r.addr)}</div>${r.lat != null ? `<div class="helper" style="margin:4px 0 0">${r.lat.toFixed(6)}, ${r.lng.toFixed(6)} · ${r.locationSource === 'manual' ? 'Ponto marcado no mapa' : `±${r.acc} m`} · <a target="_blank" rel="noopener" style="color:var(--secondary);font-weight:700" href="https://www.google.com/maps?q=${r.lat},${r.lng}">ver no mapa</a></div>` : ''}<div class="field-label">Tipo</div><div>${CATS[r.cat][0]} ${CATS[r.cat][1]}</div>
${r.desc ? `<div class="field-label">Descrição</div><div style="font-size:13.5px">${esc(r.desc)}</div>` : ''}<div class="field-label">Acompanhamento</div><div class="timeline">${tl}</div>
<div class="stack">${ADMIN && !r.rej && r.stage < 3 ? `<button class="btn-primary" onclick="advance('${r.id}')">Avançar para “${ST[r.stage + 1]}”</button><button class="btn-ghost" onclick="reject('${r.id}')">Rejeitar denúncia</button>` : ''}${ADMIN || mine(r) ? `<button class="btn-secondary" style="color:var(--error);border-color:var(--error)" onclick="del('${r.id}')">Excluir denúncia</button>` : ''}</div>`;
  },
  'v-login': () =>
    `${sb()}${tb('', 'v-home')}<div class="login-page"><section class="login-hero"><div class="login-brand"><span class="login-brand-mark">🌱</span><span>ECOPONTO</span></div><div class="login-eyebrow">CUIDADO COM A CIDADE</div><h1>Acompanhe suas denúncias</h1><p>Registre problemas e acompanhe as atualizações em um só lugar.</p></section><div class="content login-content"><section class="login-form" aria-labelledby="login-title"><div class="login-form-heading"><h2 id="login-title">Entre na sua conta</h2><p>Use seu e-mail e senha para continuar.</p></div>${authConfigured() ? '' : `<div class="login-config-notice">Configure o Supabase em js/config.js para ativar o acesso.</div>`}<label class="login-label" for="em">E-mail</label><input class="login-input" id="em" type="email" autocomplete="email" inputmode="email" placeholder="voce@exemplo.com" onkeydown="if(event.key==='Enter')login('signin')"><div class="login-password-row"><label class="login-label" for="pw">Senha</label><button class="login-link" onclick="RESET_EMAIL=$('#em').value.trim();go('v-forgot-password')">Esqueci minha senha</button></div><input class="login-input" id="pw" type="password" autocomplete="current-password" placeholder="Sua senha" onkeydown="if(event.key==='Enter')login('signin')"><div class="login-actions"><button class="btn-primary" ${authConfigured() ? '' : 'disabled'} onclick="login('signin')">Entrar</button><button class="btn-secondary" ${authConfigured() ? '' : 'disabled'} onclick="login('signup')">Criar conta</button></div><p class="login-footnote">Ao criar sua conta, enviaremos um link de confirmação para seu e-mail.</p></section></div></div>`,
  'v-forgot-password': () =>
    `${sb()}${tb('', 'v-login')}<div class="login-page"><section class="login-hero login-hero-compact"><div class="login-brand"><span class="login-brand-mark">🌱</span><span>ECOPONTO</span></div><div class="login-eyebrow">RECUPERAÇÃO DE ACESSO</div><h1>Redefina sua senha</h1><p>Enviaremos um link para o e-mail da sua conta.</p></section><div class="content login-content"><section class="login-form" aria-labelledby="forgot-title"><div class="login-form-heading"><h2 id="forgot-title">Qual é seu e-mail?</h2><p>Use o endereço cadastrado no Ecoponto.</p></div><label class="login-label" for="reset-email">E-mail</label><input class="login-input" id="reset-email" type="email" autocomplete="email" inputmode="email" placeholder="voce@exemplo.com" value="${esc(RESET_EMAIL)}" oninput="RESET_EMAIL=this.value" onkeydown="if(event.key==='Enter')sendPasswordReset()"><div class="login-actions"><button class="btn-primary" ${authConfigured() ? '' : 'disabled'} onclick="sendPasswordReset()">Enviar link de recuperação</button><button class="btn-secondary" onclick="go('v-login')">Voltar ao login</button></div></section></div></div>`,
  'v-reset-password': () =>
    `${sb()}${tb('', 'v-login')}<div class="login-page"><section class="login-hero login-hero-compact"><div class="login-brand"><span class="login-brand-mark">🌱</span><span>ECOPONTO</span></div><div class="login-eyebrow">RECUPERAÇÃO DE ACESSO</div><h1>Crie uma nova senha</h1><p>Escolha uma senha segura para voltar à sua conta.</p></section><div class="content login-content"><section class="login-form" aria-labelledby="new-password-title"><div class="login-form-heading"><h2 id="new-password-title">Nova senha</h2><p>Use pelo menos 8 caracteres.</p></div><label class="login-label" for="new-password">Nova senha</label><input class="login-input" id="new-password" type="password" autocomplete="new-password" placeholder="Nova senha"><label class="login-label" for="confirm-password">Confirme a senha</label><input class="login-input" id="confirm-password" type="password" autocomplete="new-password" placeholder="Digite novamente"><div class="login-actions"><button class="btn-primary" onclick="saveNewPassword()">Salvar nova senha</button></div></section></div></div>`,

  'v-profile': () => {
    const row = (l, r, f, last) =>
        `<div class="profile-row" ${last ? 'style="border-bottom:none"' : ''} onclick="${f}"><span>${l}</span><span class="chev">${r}</span></div>`,
      n = NAME || 'Visitante';
    return `${sb()}${tb('Perfil')}<div class="content"><div class="avatar">${esc(n.slice(0, 2).toUpperCase())}</div><div style="text-align:center;font-weight:700;font-size:14.5px;">${esc(n)}${isSup() ? ' 💚' : ''}</div><div style="text-align:center;font-size:12px;color:var(--ink-soft);margin-bottom:8px;">${ADMIN ? 'Administrador' : 'Cidadão'} · ${S.reports.filter(mine).length} denúncia(s) enviada(s)</div>
${row('Minhas denúncias', '›', 'openProfileReports()')}${row('Pontos e recompensas', '›', 'openProfilePoints()')}${row(isSup() ? '💚 Apoiador ativo' : '💚 Seja apoiador', '›', "openSupport('v-profile')")}${row('Área do patrocinador', '›', 'openPartner()')}${row(SESSION ? 'Sair da conta' : 'Entrar ou criar conta', '›', SESSION ? 'logout()' : "go('v-login')")}${row('Notificações', S.notif ? 'Ativadas' : 'Desativadas', "tog('notif')")}${row('Acessibilidade · texto maior', S.big ? 'Ligado' : 'Desligado', "tog('big')", 1)}</div>${tabs('v-profile')}`;
  }
};

const AFTER = {
  'v-home': initMap,
  'v-pick': initMap,
  'v-loc': showSelectedLocation,
  'v-photo': () => {
    if (!D.photo) cam();
  }
};
