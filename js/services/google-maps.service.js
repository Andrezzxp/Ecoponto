// Integração opcional com Google Maps.

let GM = null;
let GMEL = null;
let GMK = [];
let GML = null;
let GMFAIL = 0;

window.gm_authFailure = () => {
  GMFAIL = 1;
  GM = null;
  GMEL = null;
  GML = null;
  toast('Chave do Google Maps inválida ou sem permissão. Usando o mapa alternativo.');
  render();
};

function loadGM() {
  if (!GML)
    GML = new Promise((ok, no) => {
      window.gmReady = () => ok(window.google.maps);
      const sc = document.createElement('script');
      sc.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_KEY)}&callback=gmReady&language=pt-BR&region=BR`;
      sc.onerror = () => {
        GML = null;
        no();
      };
      document.head.appendChild(sc);
    });
  return GML;
}

function gdraw() {
  if (!GM) return;
  const g = google.maps,
    col = { review: '#F9A825', ok: '#2E7D32', rej: '#D32F2F' },
    ic = (c, sc, w) => ({
      path: g.SymbolPath.CIRCLE,
      scale: sc,
      fillColor: c,
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: w
    });
  GMK.forEach(k => k.setMap(null));
  GMK = [];
  S.reports
    .filter(r => r.lat != null)
    .forEach(r => {
      const k = new g.Marker({
        position: { lat: r.lat, lng: r.lng },
        map: GM,
        title: r.addr,
        icon: ic(col[pcls(r)], 9, 2)
      });
      k.addListener('click', () => openR(r.id, 'v-home'));
      GMK.push(k);
    });
  if (LOC)
    GMK.push(
      new g.Marker({
        position: { lat: LOC.lat, lng: LOC.lng },
        map: GM,
        icon: ic('#1E88E5', 8, 3),
        zIndex: 9
      })
    );
}

async function gmInit(m) {
  try {
    const g = await loadGM();
    if (!$('#gmap')) return;
    if (!GMEL) {
      GMEL = document.createElement('div');
      GMEL.style.cssText = 'position:absolute;inset:0';
      GM = new g.Map(GMEL, {
        center: { lat: MV.lat, lng: MV.lng },
        zoom: MV.z,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        clickableIcons: false
      });
      GM.addListener('dragstart', () => (MV.touched = 1));
      GM.addListener('idle', () => {
        const c = GM.getCenter();
        MV.lat = c.lat();
        MV.lng = c.lng();
        MV.z = GM.getZoom();
      });
    } else {
      GM.setCenter({ lat: MV.lat, lng: MV.lng });
      GM.setZoom(MV.z);
    }
    m.prepend(GMEL);
    const a = $('.mattr');
    if (a) a.style.display = 'none';
    g.event.trigger(GM, 'resize');
    gdraw();
    if (!LOC && !MV.geo && navigator.geolocation) {
      MV.geo = 1;
      navigator.geolocation.getCurrentPosition(
        p => {
          LOC = { lat: p.coords.latitude, lng: p.coords.longitude };
          if (!MV.touched && GM) {
            GM.setCenter(LOC);
            GM.setZoom(15);
          }
          gdraw();
        },
        () => {},
        { timeout: 8000 }
      );
    }
  } catch (e) {
    GMFAIL = 1;
    GM = null;
    render();
  }
}
