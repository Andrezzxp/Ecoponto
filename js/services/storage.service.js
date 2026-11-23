// Gravação local de coleções (DB remoto opcional).

let DB = null;

function put(col, o) {
  const a = S[col],
    i = a.findIndex(x => x.id === o.id);
  i < 0 ? a.unshift(o) : (a[i] = o);
  save();
  if (DB)
    DB.doc(col + '/' + o.id)
      .set(o)
      .catch(() => toast('Sem permissão para gravar. Peça acesso ao responsável.'));
}

function rm(col, id) {
  save();
  if (DB)
    DB.doc(col + '/' + id)
      .delete()
      .catch(() => toast('Sem permissão para excluir'));
}
