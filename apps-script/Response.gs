function ok_(data, message) {
  return { success: true, data: data == null ? null : data, message: message || 'OK' };
}

function fail_(message) {
  return { success: false, data: null, message: message || 'Terjadi kesalahan.' };
}
