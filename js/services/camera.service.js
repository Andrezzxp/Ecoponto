// Câmera do dispositivo.

let STREAM = null;
let FACING = 'environment';

function stopCam() {
  if (STREAM) STREAM.getTracks().forEach(t => t.stop());
  STREAM = null;
}

async function cam() {
  stopCam();
  const v = $('#vid');
  if (!v) return;
  try {
    if (!navigator.mediaDevices) throw { name: 'NoApi' };
    STREAM = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: FACING }, width: { ideal: 1280 } },
      audio: false
    });
    if (!document.body.contains(v)) {
      stopCam();
      return;
    }
    v.srcObject = STREAM;
    $('#camerr').textContent = '';
  } catch (e) {
    if (!document.body.contains(v)) return;
    v.style.display = 'none';
    $('#pbph').style.display = 'flex';
    $('#camerr').textContent =
      e.name === 'NotAllowedError'
        ? 'Acesso à câmera negado. Permita a câmera no navegador ou use as opções abaixo.'
        : 'Câmera indisponível aqui. Use “Tirar foto pelo celular” ou a galeria.';
  }
}

function flip() {
  FACING = FACING === 'environment' ? 'user' : 'environment';
  cam();
}
