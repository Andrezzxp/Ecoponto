// Acesso às denúncias no Supabase e regras de status.

function reportFromDb(row, photo) {
  const time = Date.parse(row.created_at),
    updated = Date.parse(row.updated_at || row.created_at),
    rejected = row.status === 'rejected',
    stage = rejected || row.status === 'resolved' ? 3 : row.status === 'under_review' ? 2 : 1;
  return {
    id: row.id,
    uid: row.user_id,
    by: NAME,
    addr: row.address,
    cat: CATEGORY_KEYS.indexOf(row.category),
    desc: row.description || '',
    photo,
    photoPath: row.photo_path,
    x: 0.5,
    y: 0.5,
    lat: row.latitude,
    lng: row.longitude,
    acc: row.accuracy_m,
    locationSource: row.location_source || 'gps',
    stage,
    rej: rejected,
    rejAt: rejected ? updated : null,
    t: [time, time, stage >= 2 ? updated : null, stage >= 3 && !rejected ? updated : null]
  };
}

async function loadReports(userId) {
  if (!AUTH || !userId) return;
  const { data, error } = await AUTH.from('reports').select('*').order('created_at', { ascending: false });
  if (error) {
    toast('Não foi possível carregar suas denúncias');
    return;
  }
  const reports = await Promise.all(
    (data || []).map(async row => {
      let photo = null;
      if (row.photo_path) {
        const { data: result } = await AUTH.storage
          .from('report-photos')
          .createSignedUrl(row.photo_path, 3600);
        photo = result?.signedUrl || null;
      }
      return reportFromDb(row, photo);
    })
  );
  if (ME !== userId) return;
  S.reports = reports;
  render();
}

async function updateReportStatus(id, statusValue) {
  if (!AUTH || !ADMIN) return false;
  const { error } = await AUTH.from('reports')
    .update({ status: statusValue, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.error('Falha ao atualizar denúncia', error.code);
    toast('Não foi possível atualizar o status');
    return false;
  }
  await loadReports(ME);
  return true;
}

const find = id => S.reports.find(r => r.id === id);
const my = () => S.reports.filter(mine);
const tdy = () => my().filter(r => dayOf(r.t[0]) === today());
const status = r => (r.rej ? 'Rejeitada' : r.stage >= 3 ? 'Resolvida' : 'Em análise');
const pcls = r => (r.rej ? 'rej' : r.stage >= 3 ? 'ok' : 'review');
