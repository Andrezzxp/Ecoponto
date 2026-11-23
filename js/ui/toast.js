// Mensagem flutuante (toast).

let tt;

function toast(m) {
  const e = $('#toast');
  e.textContent = m;
  e.style.opacity = 1;
  clearTimeout(tt);
  tt = setTimeout(() => (e.style.opacity = 0), 2200);
}
