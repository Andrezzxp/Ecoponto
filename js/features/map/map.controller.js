// Mapa MapLibre: marcadores, filtro, zoom e busca.

let MV = { lat: -23.55, lng: -46.63, z: 13, touched: 0, geo: 0 };
let ML = null;
let USER_MARKER = null;
let PICK = null;
let MAP_FILTER = 'all';

function initMap() {
  const container = $('#gmap');
  if (!container) return;
  if (!window.maplibregl) {
    const note = $('#mnote');
    if (note) note.style.display = 'block';
    return;
  }
  if (!MV.touched) mfit();
  const map = new maplibregl.Map({
    container,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [MV.lng, MV.lat],
    zoom: MV.z,
    attributionControl: false,
    dragRotate: false,
    touchPitch: false
  });
  ML = map;
  map.on('move', () => {
    const center = map.getCenter();
    MV.lat = center.lat;
    MV.lng = center.lng;
    MV.z = map.getZoom();
    if (cur === 'v-pick') PICK = { lat: center.lat, lng: center.lng };
  });
  map.on('dragstart', () => (MV.touched = 1));
  map.on('zoomstart', e => {
    if (e.originalEvent) MV.touched = 1;
  });
  map.on('load', () => {
    if (ML !== map) return;
    const note = $('#mnote');
    if (note) note.style.display = 'none';
    drawMapReports();
    drawPickPin();
    drawUserMarker();
  });
  map.on('click', e => {
    if (cur === 'v-pick') map.easeTo({ center: [e.lngLat.lng, e.lngLat.lat], duration: 250 });
  });
  map.on('error', () => {
    if (!map.isStyleLoaded()) {
      const note = $('#mnote');
      if (note) note.style.display = 'block';
    }
  });
  if (!LOC && !MV.geo && navigator.geolocation) {
    MV.geo = 1;
    navigator.geolocation.getCurrentPosition(
      p => {
        LOC = { lat: p.coords.latitude, lng: p.coords.longitude };
        if (!MV.touched && cur === 'v-home') map.flyTo({ center: [LOC.lng, LOC.lat], zoom: 15 });
        drawUserMarker();
      },
      () => {},
      { timeout: 8000 }
    );
  }
}

function clearMap() {
  if (ML) {
    const center = ML.getCenter();
    MV.lat = center.lat;
    MV.lng = center.lng;
    MV.z = ML.getZoom();
    ML.remove();
    ML = null;
  }
  USER_MARKER = null;
}

function drawPickPin() {
  const pin = $('#pickpin');
  if (pin) pin.style.display = 'block';
}

function drawUserMarker() {
  if (!ML || !LOC) return;
  if (!USER_MARKER) {
    const element = document.createElement('div');
    element.className = 'medot';
    USER_MARKER = new maplibregl.Marker({ element, anchor: 'center' })
      .setLngLat([LOC.lng, LOC.lat])
      .addTo(ML);
  } else USER_MARKER.setLngLat([LOC.lng, LOC.lat]);
}

function setMapFilter(value) {
  MAP_FILTER = value;
  drawMapReports();
}

function drawMapReports() {
  if (!ML || !ML.isStyleLoaded() || cur !== 'v-home') return;
  const reports = S.reports
    .filter(r => r.lat != null && r.lng != null)
    .filter(
      r =>
        MAP_FILTER === 'all' ||
        (MAP_FILTER === 'analysis' && !r.rej && r.stage < 3) ||
        (MAP_FILTER === 'resolved' && r.stage >= 3 && !r.rej)
    );
  const data = {
    type: 'FeatureCollection',
    features: reports.map(r => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
      properties: { id: String(r.id), cls: pcls(r) }
    }))
  };
  if (!ML.getSource('reports')) {
    ML.addSource('reports', { type: 'geojson', data });
    ML.addLayer({
      id: 'report-points',
      type: 'circle',
      source: 'reports',
      paint: {
        'circle-radius': 9,
        'circle-color': ['match', ['get', 'cls'], 'ok', '#2E7D32', 'rej', '#D32F2F', '#F9A825'],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });
    ML.on('click', 'report-points', e => {
      const feature = e.features && e.features[0];
      if (feature) openR(feature.properties.id, 'v-home');
    });
    ML.on('mouseenter', 'report-points', () => {
      ML.getCanvas().style.cursor = 'pointer';
    });
    ML.on('mouseleave', 'report-points', () => {
      ML.getCanvas().style.cursor = '';
    });
  } else ML.getSource('reports').setData(data);
}

function mdraw() {
  drawPickPin();
  drawUserMarker();
}

function mgo(lat, lng, z) {
  MV.lat = lat;
  MV.lng = lng;
  if (z) MV.z = z;
  MV.touched = 1;
  if (ML) {
    ML.flyTo({ center: [lng, lat], zoom: z || ML.getZoom(), duration: 350 });
    drawUserMarker();
  }
}

function setZ(d) {
  const zoom = ML ? ML.getZoom() : MV.z,
    target = Math.max(3, Math.min(19, zoom + d));
  MV.z = target;
  MV.touched = 1;
  if (ML) ML.zoomTo(target, { duration: 180 });
}

function mfit() {
  const m = $('#gmap'),
    P = S.reports.filter(r => r.lat != null).map(r => [r.lat, r.lng]);
  if (LOC) P.push([LOC.lat, LOC.lng]);
  if (!P.length) return;
  const la = P.map(p => p[0]),
    ln = P.map(p => p[1]),
    a = Math.min(...la),
    b = Math.max(...la),
    c = Math.min(...ln),
    d = Math.max(...ln);
  MV.lat = (a + b) / 2;
  MV.lng = (c + d) / 2;
  let z = 16;
  for (; z > 3; z--)
    if (wx(d, z) - wx(c, z) < m.clientWidth * 0.7 && wy(a, z) - wy(b, z) < m.clientHeight * 0.6) break;
  MV.z = Math.min(z, 16);
}

function mlocate() {
  if (!navigator.geolocation) {
    toast('Este navegador não tem GPS');
    return;
  }
  toast('Buscando sua localização…');
  navigator.geolocation.getCurrentPosition(
    p => {
      LOC = { lat: p.coords.latitude, lng: p.coords.longitude };
      mgo(LOC.lat, LOC.lng, 17);
    },
    e => toast(gmsg(e)),
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
  );
}

async function msearch() {
  const q = $('#q').value.trim().toLowerCase();
  if (!q) return;
  const r = S.reports.find(r => r.lat != null && r.addr.toLowerCase().includes(q));
  if (r) {
    mgo(r.lat, r.lng, 17);
    return;
  }
  if (GM) {
    try {
      const x = await new google.maps.Geocoder().geocode({ address: q, region: 'br' }),
        l = x.results[0].geometry.location;
      mgo(l.lat(), l.lng(), 16);
    } catch (e) {
      toast('Endereço não encontrado');
    }
    return;
  }
  if (MAPTILER_KEY) {
    try {
      const j = await (
          await fetch(
            `https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${encodeURIComponent(MAPTILER_KEY)}&language=pt&country=br&limit=1&proximity=${MV.lng},${MV.lat}`
          )
        ).json(),
        f = j.features && j.features[0];
      if (f) {
        mgo(f.center[1], f.center[0], 16);
        return;
      }
      toast('Endereço não encontrado');
      return;
    } catch (e) {}
  }
  try {
    const c = new AbortController();
    setTimeout(() => c.abort(), 6000);
    const j = await (
      await fetch(
        'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=pt-BR&q=' +
          encodeURIComponent(q),
        { signal: c.signal }
      )
    ).json();
    if (j[0]) mgo(+j[0].lat, +j[0].lon, 16);
    else toast('Endereço não encontrado');
  } catch (e) {
    toast('Não foi possível buscar este endereço agora');
  }
}
