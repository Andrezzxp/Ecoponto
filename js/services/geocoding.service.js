// Geocodificação reversa (Google, MapTiler ou OpenStreetMap).

async function rev() {
  if (MAPS_KEY && !GMFAIL) {
    try {
      const g = await loadGM(),
        x = await new g.Geocoder().geocode({ location: { lat: D.lat, lng: D.lng } }),
        t = x.results[0] && x.results[0].formatted_address;
      if (t && !D.addr.trim()) {
        D.addr = t;
        const i = $('#addr');
        if (i) i.value = t;
      }
      return;
    } catch (e) {}
  }
  if (MAPTILER_KEY) {
    try {
      const j = await (
          await fetch(
            `https://api.maptiler.com/geocoding/${D.lng},${D.lat}.json?key=${encodeURIComponent(MAPTILER_KEY)}&language=pt&limit=1`
          )
        ).json(),
        t = j.features && j.features[0] && j.features[0].place_name;
      if (t && !D.addr.trim()) {
        D.addr = t;
        const i = $('#addr');
        if (i) i.value = t;
        return;
      }
    } catch (e) {}
  }
  try {
    const c = new AbortController();
    setTimeout(() => c.abort(), 5000);
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${D.lat}&lon=${D.lng}&accept-language=pt-BR`,
      { signal: c.signal }
    );
    const j = await r.json(),
      a = j.address || {};
    const t =
      [a.road, a.house_number, a.suburb || a.neighbourhood, a.city || a.town].filter(Boolean).join(', ') ||
      j.display_name;
    if (t && !D.addr.trim()) {
      D.addr = t;
      const i = $('#addr');
      if (i) i.value = t;
    }
  } catch (e) {
    if ($('#addr') && !D.addr) toast('Digite o endereço ou uma referência do local');
  }
}
