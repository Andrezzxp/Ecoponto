// Estado da aplicação e persistência local.

let mem = null;
let S;
let D;

function seed() {
  return { notif: true, big: false, reports: [], redeems: [], claims: [], sponsors: [], pledges: [] };
}

function load() {
  try {
    const r = localStorage.getItem(KEY) || localStorage.getItem('cidadeLimpaV3');
    return r ? JSON.parse(r) : mem;
  } catch (e) {
    return mem;
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(DB ? { notif: S.notif, big: S.big } : S));
  } catch (e) {
    mem = S;
  }
}

S = Object.assign(seed(), load() || {});

const blank = () => ({
  addr: '',
  addrManual: false,
  cat: null,
  desc: '',
  photo: null,
  x: 0.5,
  y: 0.5,
  lat: null,
  lng: null,
  acc: null,
  locationSource: null
});

D = blank();
