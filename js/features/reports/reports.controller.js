// Ações sobre denúncias: abrir, enviar, moderar e excluir.

let OPEN = 0;
let LAST = 0;
let SENDING = false;
let F = 'Todas';
let DATE_FROM = '';
let DATE_TO = '';

function openR(id, back) {
  OPEN = id;
  BACK = back;
  go('v-detail');
}

function newReport() {
  if (!requireAuth()) return;
  D = blank();
  go('v-loc');
}

async function submit() {
  if (!requireAuth() || SENDING) return;
  if (!AUTH) {
    toast('A conexão com o Supabase não está disponível');
    return;
  }
  if (!D.photo) {
    toast('Adicione uma foto para continuar');
    go('v-photo');
    return;
  }
  if (D.lat == null || D.lng == null) {
    toast('Selecione uma localização para gerar UTM');
    go('v-loc');
    return;
  }
  if (D.locationSource !== 'manual' && (D.acc == null || D.acc > 100)) {
    toast('Obtenha uma localização com precisão de até 100 m ou marque o ponto no mapa');
    go('v-loc');
    return;
  }
  SENDING = true;
  try {
    const grid = utm(D.lat, D.lng),
      photoPath = `${ME}/${crypto.randomUUID()}.jpg`,
      photoBlob = await (await fetch(D.photo)).blob();
    const { error: uploadError } = await AUTH.storage
      .from('report-photos')
      .upload(photoPath, photoBlob, { contentType: 'image/jpeg', upsert: false });
    if (uploadError) throw uploadError;
    const { data, error } = await AUTH.from('reports')
      .insert({
        user_id: ME,
        address: D.addr.trim(),
        category: CATEGORY_KEYS[D.cat],
        description: D.desc.trim() || null,
        photo_path: photoPath,
        latitude: D.lat,
        longitude: D.lng,
        accuracy_m: D.locationSource === 'manual' ? null : D.acc,
        location_source: D.locationSource || 'gps',
        ...grid
      })
      .select()
      .single();
    if (error) {
      await AUTH.storage.from('report-photos').remove([photoPath]);
      throw error;
    }
    const { data: photoData } = await AUTH.storage.from('report-photos').createSignedUrl(photoPath, 3600);
    S.reports.unshift(reportFromDb(data, photoData?.signedUrl || null));
    LAST = data.id;
    D = blank();
    go('v-confirm');
  } catch (error) {
    console.error('Falha ao enviar denúncia', error);
    toast('Não foi possível enviar. Confira a conexão e tente novamente');
  } finally {
    SENDING = false;
  }
}

async function advance(id) {
  const r = find(id);
  if (!ADMIN || !r || r.rej || r.stage >= 3) return;
  const nextStage = r.stage + 1,
    statusValue = nextStage >= 3 ? 'resolved' : nextStage === 2 ? 'under_review' : 'received';
  if (!(await updateReportStatus(id, statusValue))) return;
  toast(statusValue === 'resolved' ? 'Denúncia marcada como resolvida' : 'Status atualizado');
  go('v-detail');
}

async function reject(id) {
  const r = find(id);
  if (!ADMIN || !r || r.stage >= 3) return;
  if (!(await updateReportStatus(id, 'rejected'))) return;
  toast('Denúncia rejeitada');
  go('v-detail');
}

async function del(id) {
  const r = find(id);
  if (!r || !(ADMIN || mine(r))) return;
  if (delArm !== id) {
    delArm = id;
    toast('Toque de novo para excluir');
    return;
  }
  if (!AUTH) return;
  if (r.photoPath) {
    const { error: photoError } = await AUTH.storage.from('report-photos').remove([r.photoPath]);
    if (photoError) {
      toast('Não foi possível excluir a foto');
      return;
    }
  }
  const { error } = await AUTH.from('reports').delete().eq('id', id);
  if (error) {
    console.error('Falha ao excluir denúncia', error.code);
    toast('Não foi possível excluir a denúncia');
    return;
  }
  S.reports = S.reports.filter(x => x.id !== id);
  toast('Denúncia excluída');
  go('v-list');
}
