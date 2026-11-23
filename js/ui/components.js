// Componentes HTML reutilizados pelas telas.

const sb0 = () =>
  `<div class="statusbar"><span>${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span><span>●●● 🔋</span></div>`;

const sb = () => '';

const tb = (t, b, r = '<span style="width:30px"></span>') =>
  `<div class="topbar">${b ? `<span class="back" onclick="go('${b}')">←</span>` : ''}<span class="title">${t}</span>${r}</div>`;

const steps = n =>
  `<div class="steps">${[1, 2, 3, 4, 5].map(i => `<div class="seg ${i <= n ? 'done' : ''}"></div>`).join('')}</div>`;

const tabs = a =>
  `<div class="tabbar">${[
    ['v-home', '🏠', 'Início'],
    ['v-list', '📋', 'Denúncias'],
    ['v-points', '🏆', 'Pontos'],
    ['v-profile', '👤', 'Perfil']
  ]
    .map(
      ([id, i, l]) =>
        `<div class="tab ${a === id ? 'on' : ''}" onclick="tabGo('${id}')"><span class="dot">${i}</span>${l}</div>`
    )
    .join('')}</div>`;

const thumb = r => (r.photo ? `style="background:url(${r.photo}) center/cover"` : '');
