// Etapa de foto da denúncia.

function snap() {
  const v = $('#vid');
  if (!STREAM || !v || !v.videoWidth) {
    $('#cam').click();
    return;
  }
  const k = Math.min(1, 640 / Math.max(v.videoWidth, v.videoHeight)),
    c = document.createElement('canvas');
  c.width = v.videoWidth * k;
  c.height = v.videoHeight * k;
  c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
  D.photo = c.toDataURL('image/jpeg', 0.7);
  D.at = Date.now();
  go('v-photo');
}

function pick(i) {
  const f = i.files[0];
  if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 480 / Math.max(im.width, im.height)),
        c = document.createElement('canvas');
      c.width = im.width * k;
      c.height = im.height * k;
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      D.photo = c.toDataURL('image/jpeg', 0.6);
      D.at = Date.now();
      go('v-photo');
    };
    im.onerror = () => toast('Não foi possível ler a imagem');
    im.src = rd.result;
  };
  rd.readAsDataURL(f);
}
