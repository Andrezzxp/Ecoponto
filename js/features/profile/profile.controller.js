// Atalhos e preferências do perfil.

function openProfileReports() {
  LIST_BACK = 'v-profile';
  F = 'Todas';
  go('v-list');
}

function openProfilePoints() {
  POINTS_BACK = 'v-profile';
  go('v-points');
}

function tog(k) {
  S[k] = !S[k];
  save();
  go('v-profile');
}
