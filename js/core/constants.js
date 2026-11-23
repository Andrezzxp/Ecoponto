// Constantes globais e chaves de integração.

// ====== APOIO MENSAL: cole aqui o link de pagamento/assinatura (Mercado Pago, Stripe, Apoia.se...) e/ou a chave Pix ======
const PAY_LINK = '';
const PIX_KEY = '';
const CONTACT_URL = '';

// ====== MAPTILER (mapa principal): crie a chave grátis em cloud.maptiler.com/account/keys e cole entre as aspas. Vazia = usa CARTO/OpenStreetMap ======
const MAPTILER_KEY = '';

// ====== GOOGLE MAPS (opcional, só se preencher): cole sua chave da API entre as aspas. Vazia = usa o mapa alternativo (CARTO/OpenStreetMap) ======
const MAPS_KEY = '';

const KEY = 'ecopontoV1';

const CATS = [
  ['🗑️', 'Lixo acumulado'],
  ['🧱', 'Entulho'],
  ['🛋️', 'Móveis descartados'],
  ['🚮', 'Lixeira cheia'],
  ['🌳', 'Área verde'],
  ['➕', 'Outros']
];

const CATEGORY_KEYS = [
  'trash',
  'construction_debris',
  'discarded_furniture',
  'full_bin',
  'green_area',
  'other'
];

const ST = ['Enviada', 'Recebida', 'Em análise', 'Resolvida'];
const FL = ['Todas', 'Em análise', 'Resolvidas', 'Rejeitadas'];
const MAX_GPS_ACCURACY = 100;
