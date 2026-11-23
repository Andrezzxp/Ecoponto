// Navegação entre telas e renderização.

let cur = 'v-home';
let BACK = 'v-list';
let LIST_BACK = null;
let POINTS_BACK = null;
let SUPPORT_BACK = 'v-points';
let PARTNER_BACK = 'v-rewards';
let delArm = 0;

function go(v) {
  stopCam();
  stopGps();
  cur = v;
  delArm = 0;
  render();
}

function go(v) {
  stopCam();
  stopGps();
  cur = v;
  delArm = 0;
  render();
}

function tabGo(v) {
  LIST_BACK = null;
  POINTS_BACK = null;
  SUPPORT_BACK = 'v-points';
  PARTNER_BACK = 'v-rewards';
  go(v);
}

function render() {
  if (ML) clearMap();
  $('.screen').classList.toggle('big', !!S.big);
  const h = V[cur]();
  $('#app').innerHTML = `<div class="view active" id="${cur}">${h}</div>`;
  AFTER[cur] && AFTER[cur]();
}
