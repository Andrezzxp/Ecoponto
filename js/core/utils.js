// Utilitários de DOM, texto e datas.

const $ = s => document.querySelector(s);

const esc = t =>
  String(t).replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

const pid = id => String(id).slice(-6).padStart(6, '0');
const dayOf = t => (t ? new Date(t).toLocaleDateString('sv-SE') : '');
const today = () => dayOf(Date.now());
const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtd = t => new Date(t).toLocaleDateString('pt-BR');
const num = n => n.toLocaleString('pt-BR');

const fmt = t => {
  const d = new Date(t);
  return (
    d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) +
    ', ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
};

const reportDateTime = t =>
  new Date(t).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

function ago(t) {
  const h = Math.floor((Date.now() - t) / 36e5),
    d = Math.floor(h / 24);
  return d >= 1 ? `há ${d} dia${d > 1 ? 's' : ''}` : h >= 1 ? `há ${h} h` : 'agora há pouco';
}
