// Estado e mensagens do GPS.

let LOC = null;
let WATCH = null;
let WT = null;

function stopGps() {
  if (WATCH != null) navigator.geolocation.clearWatch(WATCH);
  WATCH = null;
  clearTimeout(WT);
}

const gmsg = e =>
  e.code === 1
    ? 'Permissão de localização negada. Ative o acesso à localização no navegador e toque em “Atualizar localização”.'
    : e.code === 3
      ? 'Tempo esgotado ao obter o GPS. Vá para um local aberto e tente de novo.'
      : 'Não foi possível obter a localização.';
