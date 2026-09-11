function authUsersSheet_() {
  var sheet = getSpreadsheet_().getSheetByName('AuthUsers');
  if (!sheet) throw new Error('AUTH_USERS_SHEET_NOT_FOUND');
  return sheet;
}

function sha256Hex_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value), Utilities.Charset.UTF_8)
    .map(function(byte) { var n = byte < 0 ? byte + 256 : byte; return ('0' + n.toString(16)).slice(-2); }).join('');
}

function authRows_() {
  var sheet = authUsersSheet_(), headers = headers_(sheet), lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, headers.length).getValues().map(function(row) { return recordFromRow_(headers, row); });
}

function authSession_(token, touch) {
  if (!token) return null;
  var props = PropertiesService.getScriptProperties(), key = 'SESSION_' + token, raw = props.getProperty(key);
  if (!raw) return null;
  var session; try { session = JSON.parse(raw); } catch (ignore) { props.deleteProperty(key); return null; }
  var now = new Date().getTime(), last = new Date(session.last_activity).getTime();
  if (!last || now - last > 6 * 60 * 60 * 1000) { props.deleteProperty(key); return null; }
  if (touch) { session.last_activity = nowIso_(); props.setProperty(key, JSON.stringify(session)); }
  return session;
}

function authToken_(e, body) {
  return text_(body && body.session_token) || text_(e && e.parameter && e.parameter.session_token);
}

function requireAuth_(e, body, role) {
  var session = authSession_(authToken_(e, body), true);
  if (!session) throw new Error('AUTH_SESSION_INVALID');
  if (role && session.role !== role) throw new Error('AUTH_ROLE_FORBIDDEN');
  return session;
}

function login_(e) {
  var body = parseBody_(e), userId = text_(body.user_id), pin = text_(body.pin);
  if (!userId || !pin) return fail_('AUTH_CREDENTIALS_REQUIRED');
  var user = authRows_().filter(function(row) { return text_(row.user_id) === userId && text_(row.active).toLowerCase() !== 'false'; })[0];
  if (!user || sha256Hex_(pin) !== text_(user.pin_hash)) return fail_('AUTH_INVALID_CREDENTIALS');
  var token = Utilities.getUuid(), session = { user_id: user.user_id, display_name: user.display_name, role: user.role, created_at: nowIso_(), last_activity: nowIso_() };
  PropertiesService.getScriptProperties().setProperty('SESSION_' + token, JSON.stringify(session));
  return ok_({ session_token: token, user_id: session.user_id, display_name: session.display_name, role: session.role, last_activity: session.last_activity }, 'Login berhasil.');
}

function logout_(e) {
  var body = {}; try { body = parseBody_(e); } catch (ignore) {}
  var token = authToken_(e, body); if (token) PropertiesService.getScriptProperties().deleteProperty('SESSION_' + token);
  return ok_(null, 'Logout berhasil.');
}

function session_(e) {
  var session = requireAuth_(e, null, null);
  return ok_({ user_id: session.user_id, display_name: session.display_name, role: session.role, last_activity: session.last_activity }, 'Sesi aktif.');
}

function listAuthUsers_(e) {
  var body = {}; try { body = parseBody_(e); } catch (ignore) {}
  requireAuth_(e, body, 'OWNER');
  return ok_(authRows_().map(function(row) { return { user_id: row.user_id, display_name: row.display_name, role: row.role, active: row.active }; }), 'Daftar user berhasil dimuat.');
}

function listLoginUsers_() {
  return ok_(authRows_().filter(function(row) { return text_(row.active).toLowerCase() !== 'false'; }).map(function(row) { return { user_id: row.user_id, display_name: row.display_name, role: row.role }; }), 'Daftar login berhasil dimuat.');
}

function createAuthUser_(e) {
  var body = parseBody_(e); requireAuth_(e, body, 'OWNER');
  var userId = text_(body.user_id), displayName = text_(body.display_name), role = text_(body.role), pin = text_(body.pin);
  if (!userId || !displayName || !pin || ['OWNER', 'OPERATOR'].indexOf(role) < 0) return fail_('AUTH_USER_INPUT_INVALID');
  if (authRows_().some(function(row) { return text_(row.user_id) === userId; })) return fail_('AUTH_USER_EXISTS');
  var now = nowIso_(); authUsersSheet_().appendRow([userId, displayName, role, sha256Hex_(pin), true, now, now]);
  return ok_({ user_id: userId, display_name: displayName, role: role, active: true }, 'User berhasil ditambahkan.');
}

function seedStagingAuthUsers() {
  if (getConfig_().environment !== 'staging') throw new Error('STAGING_ONLY');
  var sheet = authUsersSheet_(); if (sheet.getLastRow() > 1) return { success: true, seeded: false, dataRows: sheet.getLastRow() - 1 };
  var now = nowIso_(), hash = sha256Hex_('1234');
  sheet.getRange(2, 1, 2, 7).setValues([['owner-demo', 'Owner Demo', 'OWNER', hash, true, now, now], ['operator-demo', 'Operator Demo', 'OPERATOR', hash, true, now, now]]);
  return { success: true, seeded: true, dataRows: 2 };
}
