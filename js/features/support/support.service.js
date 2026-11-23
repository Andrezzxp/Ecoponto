// Situação do apoio mensal do usuário.

const sup = () => S.pledges.filter(mine).sort((a, b) => b.at - a.at)[0];
const isSup = () => {
  const p = sup();
  return !!p && p.status === 'ativo' && p.until > Date.now();
};
