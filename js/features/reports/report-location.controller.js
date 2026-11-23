// Etapa de localização da denúncia (GPS ou mapa).

function gpsUI(t, cls) {
  const e = $('#gps');
  if (e) {
    e.innerHTML = t;
    e.className = 'card ' + (cls || '');
  }
}

function locate() {
  stopGps();
  if (!navigator.geolocation) {
    gpsUI('Este navegador não tem GPS. Digite o endereço ou marque no mapa.', 'err');
    return;
  }
  gpsUI('📡 Buscando sua localização…');
  let best = null;
  const done = () => {
    stopGps();
    if (!best) return;
    if (best.coords.accuracy > MAX_GPS_ACCURACY) {
      D.lat = null;
      D.lng = null;
      D.acc = null;
      gpsUI(
        `⚠️ Precisão insuficiente: ±${Math.ceil(best.coords.accuracy)} m. Vá para um local aberto e tente de novo; precisamos de até ${MAX_GPS_ACCURACY} m.`,
        'err'
      );
      return;
    }
    fix(best, true);
  };
  WATCH = navigator.geolocation.watchPosition(
    p => {
      if (!best || p.coords.accuracy < best.coords.accuracy) best = p;
      fix(best, false);
      if (p.coords.accuracy <= 15) done();
    },
    e => {
      stopGps();
      if (!best) gpsUI('⚠️ ' + gmsg(e), 'err');
      else done();
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
  WT = setTimeout(done, 9000);
}

function fix(p, final) {
  D.lat = p.coords.latitude;
  D.lng = p.coords.longitude;
  D.acc = Math.ceil(p.coords.accuracy);
  D.locationSource = 'gps';
  LOC = { lat: D.lat, lng: D.lng };
  gpsUI(
    `📍 <b>${D.lat.toFixed(6)}, ${D.lng.toFixed(6)}</b><br><span class="helper">Precisão de ±${D.acc} m${final ? '' : ' · refinando…'}</span>`,
    'ok'
  );
  if (final && !D.addr.trim()) rev();
}

function showSelectedLocation() {
  if (D.locationSource === 'manual') {
    LOC = { lat: D.lat, lng: D.lng };
    gpsUI(
      `📍 Ponto marcado no mapa<br><span class="helper">${D.lat.toFixed(6)}, ${D.lng.toFixed(6)} · sem estimativa de precisão GPS</span>`,
      'ok'
    );
  } else if (D.lat == null) locate();
  else fix({ coords: { latitude: D.lat, longitude: D.lng, accuracy: D.acc } }, true);
}

function showSelectedLocation() {
  if (D.locationSource === 'manual') {
    LOC = { lat: D.lat, lng: D.lng };
    gpsUI(
      `📍 Ponto marcado no mapa<br><span class="helper">${D.lat.toFixed(6)}, ${D.lng.toFixed(6)} · sem estimativa de precisão GPS</span>`,
      'ok'
    );
  } else if (D.lat == null) locate();
  else fix({ coords: { latitude: D.lat, longitude: D.lng, accuracy: D.acc } }, true);
}

function chooseMapPoint() {
  stopGps();
  const point = D.lat != null ? { lat: D.lat, lng: D.lng } : LOC;
  if (point) {
    MV.lat = point.lat;
    MV.lng = point.lng;
    MV.z = Math.max(MV.z, 16);
  }
  MV.touched = 1;
  go('v-pick');
}

async function confirmMapPoint() {
  const point = ML ? ML.getCenter() : { lat: MV.lat, lng: MV.lng };
  D.lat = point.lat;
  D.lng = point.lng;
  D.acc = null;
  D.locationSource = 'manual';
  LOC = { lat: D.lat, lng: D.lng };
  if (!D.addrManual) {
    D.addr = '';
    await rev();
  }
  go('v-loc');
}
