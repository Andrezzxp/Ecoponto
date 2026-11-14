# Ecoponto

App web de denúncias de problemas urbanos (lixo, entulho etc.) com mapa, GPS, câmera, pontos, missões diárias, patrocinadores e apoio mensal.

## Estrutura
- `index.html` — estrutura da página
- `css/style.css` — estilos
- `js/app.js` — toda a lógica do app

## Configuração (no começo de `js/app.js`)
- `MAPTILER_KEY` — chave do MapTiler (cloud.maptiler.com). Vazia = usa CARTO/OpenStreetMap.
- `MAPS_KEY` — chave do Google Maps (opcional). Se preenchida, tem prioridade.
- `PAY_LINK`, `PIX_KEY` — link de pagamento e chave Pix para o apoio mensal.
- `CONTACT_URL` — link de contato para quem quer ser patrocinador.

## Como usar
Abra `index.html` no navegador ou hospede a pasta inteira (ex.: Netlify Drop, GitHub Pages). GPS e câmera exigem HTTPS.
Fora do claude.ai os dados ficam salvos só no navegador de cada pessoa; para dados compartilhados é preciso um backend.
