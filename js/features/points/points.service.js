// Missões diárias, extrato e saldo de pontos.

const MS = () => [
  { id: 'd0', title: 'Abra o app hoje', desc: 'Check-in diário', pts: 5, p: () => [1, 1] },
  { id: 'd1', title: 'Envie uma denúncia hoje', pts: 20, p: () => [Math.min(tdy().length, 1), 1] },
  {
    id: 'd2',
    title: 'Faça uma denúncia completa',
    desc: 'Com foto, GPS e descrição',
    pts: 15,
    p: () => [tdy().some(r => r.photo && r.lat != null && r.desc) ? 1 : 0, 1]
  },
  { id: 'd3', title: 'Envie 3 denúncias hoje', pts: 30, p: () => [Math.min(tdy().length, 3), 3] },
  {
    id: 'd4',
    title: 'Tenha uma denúncia resolvida hoje',
    desc: 'Quando a prefeitura marcar como resolvida',
    pts: 50,
    p: () => [my().some(r => r.stage >= 3 && !r.rej && dayOf(r.t[3]) === today()) ? 1 : 0, 1]
  },
  {
    id: 'd5',
    title: 'Convide um amigo',
    desc: 'Compartilhe o app com alguém',
    pts: 10,
    share: 1,
    p: () => [0, 1]
  },
  ...(isSup()
    ? [
        {
          id: 'd6',
          title: 'Bônus de apoiador 💚',
          desc: 'Obrigado por apoiar o projeto',
          pts: 10,
          p: () => [1, 1]
        }
      ]
    : [])
];

const claimed = id => S.claims.some(c => mine(c) && c.m === id && c.day === today());

const ledger = () =>
  [
    ...S.reports
      .filter(r => mine(r) && r.stage >= 3 && !r.rej)
      .map(r => ({ t: 'Denúncia validada #' + pid(r.id), v: 100, at: r.t[3] || 0 })),
    ...S.claims.filter(mine).map(c => ({ t: 'Missão: ' + (c.t || 'concluída'), v: c.v, at: c.at })),
    ...S.redeems
      .filter(mine)
      .map(x => ({
        t: 'Resgate: ' + x.name + (x.code ? ' · código ' + x.code + (x.used ? ' (usado)' : '') : ''),
        v: -x.cost,
        at: x.at
      }))
  ].sort((a, b) => a.at - b.at);

const bal = () => ledger().reduce((a, l) => a + l.v, 0);
