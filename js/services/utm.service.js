// Conversão de latitude/longitude para UTM.

function utm(lat, lng) {
  if (!window.proj4) throw new Error('Conversor UTM indisponível');
  if (lat < -80 || lat > 84) throw new Error('Latitude fora da faixa UTM');
  const zone = Math.min(60, Math.floor((lng + 180) / 6) + 1),
    hemisphere = lat >= 0 ? 'N' : 'S',
    target = `+proj=utm +zone=${zone}${hemisphere === 'S' ? ' +south' : ''} +datum=WGS84 +units=m +no_defs`;
  const [easting, northing] = window.proj4('EPSG:4326', target, [lng, lat]);
  return { utm_zone: zone, utm_hemisphere: hemisphere, utm_easting: easting, utm_northing: northing };
}
