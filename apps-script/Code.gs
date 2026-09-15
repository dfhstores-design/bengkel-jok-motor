const APP = Object.freeze({
  TIMEZONE: 'Asia/Jakarta',
  ROLES: Object.freeze({ OWNER: 'OWNER', OPERATOR: 'OPERATOR' }),
  ENTITY_PREFIX: Object.freeze({ JOB: 'JOB', PAYMENT: 'PAY', EXPENSE: 'EXP', MEDIA: 'MED', AUDIT: 'AUDIT' }),
  SHEETS: Object.freeze({ JOBS: 'Jobs', PAYMENTS: 'Payments', EXPENSES: 'Expenses', MEDIA: 'Media' }),
});
function getConfig_() {
  const props = PropertiesService.getScriptProperties();
  const config = {
    environment: props.getProperty('ENVIRONMENT') || 'development',
    spreadsheetId: props.getProperty('SPREADSHEET_ID'),
    mediaRootFolderId: props.getProperty('MEDIA_ROOT_FOLDER_ID'),
    mediaJobsFolderId: props.getProperty('MEDIA_JOBS_FOLDER_ID'),
    mediaExpensesFolderId: props.getProperty('MEDIA_EXPENSES_FOLDER_ID'),
    mediaPaymentsFolderId: props.getProperty('MEDIA_PAYMENTS_FOLDER_ID'),
    timezone: props.getProperty('TIMEZONE') || APP.TIMEZONE,
    sheets: APP.SHEETS,
  };

  const missing = [
    'spreadsheetId',
    'mediaRootFolderId',
    'mediaJobsFolderId',
    'mediaExpensesFolderId',
    'mediaPaymentsFolderId',
  ].filter((key) => !config[key]);

  if (missing.length) throw new Error('CONFIG_MISSING:' + missing.join(','));
  if (config.timezone !== APP.TIMEZONE) throw new Error('CONFIG_TIMEZONE_INVALID');
  return config;
}
function nowIso_() {
  return Utilities.formatDate(new Date(), APP.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}
function todayKey_() {
  return Utilities.formatDate(new Date(), APP.TIMEZONE, 'yyyyMMdd');
}
function jsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
function logEvent_(action, entityId, status, errorMessage) {
  Logger.log(JSON.stringify({
    timestamp: nowIso_(),
    action: action || 'unknown',
    entityId: entityId || null,
    status: status || 'INFO',
    errorMessage: errorMessage || null,
  }));
}
function actorLabel_() {
  return PropertiesService.getScriptProperties().getProperty('ACTOR_LABEL') || APP.ROLES.OWNER;
}
function requestKey_(body) {
  var key = text_(body && body.idempotency_key);
  if (!key) return '';
  if (!/^[A-Za-z0-9._:-]{8,120}$/.test(key)) throw new Error('IDEMPOTENCY_KEY_INVALID');
  return key;
}
function idempotentResult_(action, key) {
  if (!key) return null;
  var raw = PropertiesService.getScriptProperties().getProperty('IDEMP_' + action + '_' + key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (ignore) { return null; }
}
function saveIdempotentResult_(action, key, result) {
  if (key) PropertiesService.getScriptProperties().setProperty('IDEMP_' + action + '_' + key, JSON.stringify(result));
}
function getSpreadsheet_() {
  return SpreadsheetApp.openById(getConfig_().spreadsheetId);
}

function getSheet_(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error('SHEET_NOT_FOUND:' + sheetName);
  return sheet;
}

function getFolderByConfigKey_(key) {
  const config = getConfig_();
  const id = config[key];
  if (!id) throw new Error('CONFIG_MISSING:' + key);
  return DriveApp.getFolderById(id);
}

function getMediaRoot_() {
  return getFolderByConfigKey_('mediaRootFolderId');
}

function getMediaFolderAccess_() {
  const root = getMediaRoot_();
  const jobs = getFolderByConfigKey_('mediaJobsFolderId');
  const expenses = getFolderByConfigKey_('mediaExpensesFolderId');
  const payments = getFolderByConfigKey_('mediaPaymentsFolderId');
  return {
    root: { accessible: true, name: root.getName() },
    jobs: { accessible: true, name: jobs.getName() },
    expenses: { accessible: true, name: expenses.getName() },
    payments: { accessible: true, name: payments.getName() },
  };
}

function assertExpectedSheets_() {
  const ss = getSpreadsheet_();
  const result = {};
  Object.keys(APP.SHEETS).forEach((key) => {
    result[APP.SHEETS[key]] = Boolean(ss.getSheetByName(APP.SHEETS[key]));
  });
  return result;
}
function healthCheck_() {
  const action = 'healthCheck';
  let testId = null;
  let appendedRow = null;
  let jobs = null;
  let cleanupAttempted = false;
  let cleaned = false;

  try {
    const config = getConfig_();
    const ss = getSpreadsheet_();
    const sheets = assertExpectedSheets_();
    const folders = getMediaFolderAccess_();
    jobs = getSheet_(APP.SHEETS.JOBS);

    const actor = 'SYSTEM_HEALTHCHECK';
    const now = nowIso_();
    testId = generateEntityId_('JOB');
    const testRow = [testId, now, actor, now, actor, 'IN_PROGRESS', 'HEALTH_CHECK', 'Sprint 0 health check', 0, '', '', '', ''];

    jobs.appendRow(testRow);
    appendedRow = jobs.getLastRow();

    const readBackId = String(jobs.getRange(appendedRow, 1).getValue());
    const readBack = readBackId === testId;
    const allSheetsOk = Object.keys(sheets).every((name) => sheets[name]);
    const allFoldersOk = Object.keys(folders).every((name) => folders[name].accessible === true);

    if (!readBack || !allSheetsOk || !allFoldersOk) {
      throw new Error('HEALTHCHECK_VALIDATION_FAILED');
    }

    cleanupAttempted = true;
    cleaned = cleanupTestRow_(jobs, testId, appendedRow);
    if (!cleaned) throw new Error('HEALTHCHECK_CLEANUP_FAILED');

    const data = {
      environment: config.environment,
      timezone: config.timezone,
      spreadsheet: { accessible: true, title: ss.getName() },
      mediaFolders: folders,
      sheets: sheets,
      testWrite: { written: true, readBack: true, cleaned: true },
    };

    logEvent_(action, testId, 'SUCCESS', null);
    return ok_(data, 'Fondasi Sprint 0 terhubung dengan benar.');
  } catch (error) {
    if (jobs && testId && !cleaned) {
      cleanupAttempted = true;
      try {
        cleaned = cleanupTestRow_(jobs, testId, appendedRow);
      } catch (cleanupError) {
        logEvent_(action + ':cleanup', testId, 'ERROR', String(cleanupError && cleanupError.message ? cleanupError.message : cleanupError));
      }
    }

    logEvent_(action, testId, 'ERROR', String(error && error.message ? error.message : error));
    return fail_(humanizeError_(error, cleanupAttempted, cleaned));
  }
}

function cleanupTestRow_(sheet, testId, preferredRow) {
  if (preferredRow && preferredRow > 1 && String(sheet.getRange(preferredRow, 1).getValue()) === testId) {
    sheet.deleteRow(preferredRow);
    return true;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return true;

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = values.length - 1; i >= 0; i -= 1) {
    if (String(values[i][0]) === testId) {
      sheet.deleteRow(i + 2);
      return true;
    }
  }
  return true;
}

function humanizeError_(error, cleanupAttempted, cleaned) {
  const message = String(error && error.message ? error.message : error);
  if (message.indexOf('CONFIG_MISSING:') === 0) return 'Konfigurasi backend belum lengkap.';
  if (message === 'CONFIG_TIMEZONE_INVALID') return 'Timezone backend tidak sesuai konfigurasi Sprint 0.';
  if (message.indexOf('SHEET_NOT_FOUND:') === 0) return 'Struktur workbook belum sesuai konfigurasi.';
  if (message === 'INVALID_ENTITY_TYPE') return 'Tipe ID backend tidak valid.';
  if (message === 'AUTH_USERS_SHEET_NOT_FOUND') return 'Sheet user belum tersedia.';
  if (message === 'AUTH_SESSION_INVALID') return 'Sesi login berakhir. Silakan login kembali.';
  if (message === 'AUTH_ROLE_FORBIDDEN') return 'Akses tidak tersedia untuk role ini.';
  if (message === 'AUTH_CREDENTIALS_REQUIRED') return 'User dan PIN wajib diisi.';
  if (message === 'AUTH_INVALID_CREDENTIALS') return 'User atau PIN tidak valid.';
  if (message === 'HEALTHCHECK_CLEANUP_FAILED') return 'Health check gagal membersihkan data uji. Periksa backend log.';
  if (cleanupAttempted && !cleaned) return 'Health check gagal dan cleanup data uji perlu diperiksa oleh admin.';
  return 'Health check gagal. Periksa konfigurasi dan log backend.';
}
function doGet(e) {
  return handleRequest_(e);
}
function doPost(e) {
  return handleRequest_(e);
}
function handleRequest_(e) {
  const action = e && e.parameter ? e.parameter.action : null;
  try {
    var protectedActions = ['healthCheck', 'createJob', 'listActiveJobs', 'listClosedJobs', 'getDashboard', 'getRecap', 'getOwnerReport', 'getJob', 'closeJob', 'addJobMedia', 'listJobMedia', 'createExpense', 'listExpenses', 'addExpenseReceipt', 'listExpenseMedia', 'editClosedJob'];
    var requestBody = null;
    if (e && e.postData && e.postData.contents) { try { requestBody = parseBody_(e); } catch (ignore) {} }
    if (protectedActions.indexOf(action) >= 0) requireAuth_(e, requestBody, null);
    if (action === 'login') return jsonOutput_(login_(e));
    if (action === 'logout') return jsonOutput_(logout_(e));
    if (action === 'session') return jsonOutput_(session_(e));
    if (action === 'listAuthUsers') return jsonOutput_(listAuthUsers_(e));
    if (action === 'listLoginUsers') return jsonOutput_(listLoginUsers_());
    if (action === 'createAuthUser') return jsonOutput_(createAuthUser_(e));
    if (action === 'editClosedJob') return jsonOutput_(editClosedJob_(e));
    if (action === 'healthCheck') return jsonOutput_(healthCheck_());

    if (action === 'createJob') return jsonOutput_(createJob_(e));
    if (action === 'listActiveJobs') return jsonOutput_(listActiveJobs_());
    if (action === 'listClosedJobs') return jsonOutput_(listClosedJobs_(e && e.parameter ? e.parameter : {}));
    if (action === 'getDashboard') return jsonOutput_(getDashboard_());
    if (action === 'getRecap') return jsonOutput_(getRecap_(e && e.parameter ? e.parameter : {}));
    if (action === 'getOwnerReport') return jsonOutput_(getOwnerReport_(e && e.parameter ? e.parameter : {}));
    if (action === 'getJob') return jsonOutput_(getJob_(e && e.parameter ? e.parameter.job_id : null));
    if (action === 'closeJob') return jsonOutput_(closeJob_(e));
    if (action === 'addJobMedia') return jsonOutput_(addJobMedia_(e));
    if (action === 'listJobMedia') return jsonOutput_(listJobMedia_(e && e.parameter ? e.parameter.job_id : null));
    if (action === 'createExpense') return jsonOutput_(createExpense_(e));
    if (action === 'listExpenses') return jsonOutput_(listExpenses_(e && e.parameter ? e.parameter : {}));
    if (action === 'addExpenseReceipt') return jsonOutput_(addExpenseReceipt_(e));
    if (action === 'listExpenseMedia') return jsonOutput_(listExpenseMedia_(e && e.parameter ? e.parameter.expense_id : null));
    return jsonOutput_(fail_('Action tidak dikenali.'));
  } catch (error) {
    logEvent_(action || 'unknown', null, 'ERROR', String(error && error.message ? error.message : error));
    var errorMessage = String(error && error.message ? error.message : error);
    if (errorMessage.indexOf('AUTH_') === 0) return jsonOutput_(fail_(humanizeError_(error)));
    return jsonOutput_(fail_('Terjadi kesalahan pada backend.'));
  }
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) throw new Error('MALFORMED_REQUEST');
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (error) { throw new Error('MALFORMED_REQUEST'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('MALFORMED_REQUEST');
  return body;
}

function text_(value) { return value == null ? '' : String(value).trim(); }

function validateJobInput_(body) {
  var model = text_(body.motorcycle_model);
  var description = text_(body.work_description);
  var price = body.agreed_price;
  if (!model) throw new Error('MOTORCYCLE_MODEL_REQUIRED');
  if (!description) throw new Error('WORK_DESCRIPTION_REQUIRED');
  if (price === '' || price == null || (typeof price === 'string' && !price.trim())) throw new Error('AGREED_PRICE_REQUIRED');
  var numeric = typeof price === 'number' ? price : Number(String(price).replace(/,/g, ''));
  if (!isFinite(numeric) || numeric < 0) throw new Error('AGREED_PRICE_INVALID');
  return {
    motorcycle_model: model,
    work_description: description,
    agreed_price: numeric,
    customer_name: text_(body.customer_name),
    customer_whatsapp: text_(body.customer_whatsapp),
    notes: text_(body.notes),
  };
}

function headers_(sheet) {
  var lastColumn = sheet.getLastColumn();
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(value) { return String(value); });
}

function recordFromRow_(headers, row) {
  var result = {};
  headers.forEach(function(header, index) { result[header] = row[index]; });
  return result;
}

function allJobRecords_() {
  var sheet = getSheet_(APP.SHEETS.JOBS);
  var headers = headers_(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, headers.length).getValues().map(function(row) {
    return recordFromRow_(headers, row);
  });
}

function createJob_(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var body = parseBody_(e), session = requireAuth_(e, body, null), key = requestKey_(body), prior = idempotentResult_('createJob', key);
    if (prior) return prior;
    var input = validateJobInput_(body);
    var sheet = getSheet_(APP.SHEETS.JOBS);
    var now = nowIso_();
    var id = generateEntityId_('JOB');
    var actor = actorFromSession_(session);
    var record = {
      job_id: id, created_at: now, created_by: actor, updated_at: now, updated_by: actor,
      status: 'IN_PROGRESS', motorcycle_model: input.motorcycle_model,
      work_description: input.work_description, agreed_price: input.agreed_price,
      customer_name: input.customer_name, customer_whatsapp: input.customer_whatsapp,
      notes: input.notes, closed_at: '',
    };
    var headers = headers_(sheet);
    sheet.appendRow(headers.map(function(header) { return record[header] == null ? '' : record[header]; }));
    logEvent_('createJob', id, 'SUCCESS', null);
    var result = ok_(record, 'Job berhasil dibuat.'); saveIdempotentResult_('createJob', key, result); return result;
  } catch (error) {
    logEvent_('createJob', null, 'ERROR', String(error && error.message ? error.message : error));
    var message = String(error && error.message ? error.message : error);
    var messages = {
      MALFORMED_REQUEST: 'Permintaan tidak valid.',
      MOTORCYCLE_MODEL_REQUIRED: 'Model motor wajib diisi.',
      WORK_DESCRIPTION_REQUIRED: 'Deskripsi pekerjaan wajib diisi.',
      AGREED_PRICE_REQUIRED: 'Harga deal wajib diisi.',
      AGREED_PRICE_INVALID: 'Harga deal harus berupa angka nol atau lebih.',
    };
    return fail_(messages[message] || 'Job gagal dibuat.');
  } finally { try { lock.releaseLock(); } catch (ignore) {} }
}

function listActiveJobs_() {
  try {
    var records = allJobRecords_().filter(function(record) { return String(record.status) === 'IN_PROGRESS'; });
    records.sort(function(a, b) { return String(b.created_at).localeCompare(String(a.created_at)); });
    return ok_(records, 'Job aktif berhasil diambil.');
  } catch (error) {
    logEvent_('listActiveJobs', null, 'ERROR', String(error && error.message ? error.message : error));
    return fail_('Daftar Job aktif tidak dapat dimuat.');
  }
}

function getJob_(jobId) {
  try {
    var id = text_(jobId);
    if (!id) return fail_('Job ID wajib diisi.');
    var record = allJobRecords_().find(function(item) { return String(item.job_id) === id; });
    if (record) {
      var payment = allPaymentRecords_().find(function(item) { return String(item.job_id) === id; });
      record.payment = payment || null;
      record.media = allMediaRecords_().filter(function(item) { return String(item.owner_type) === 'JOB' && String(item.owner_id) === id; });
    }
    return record ? ok_(record, 'Detail Job berhasil diambil.') : fail_('Job tidak ditemukan.');
  } catch (error) {
    logEvent_('getJob', jobId || null, 'ERROR', String(error && error.message ? error.message : error));
    return fail_('Detail Job tidak dapat dimuat.');
  }
}

function allPaymentRecords_() {
  var sheet = getSheet_(APP.SHEETS.PAYMENTS);
  var headers = headers_(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, headers.length).getValues().map(function(row) {
    return recordFromRow_(headers, row);
  });
}

function dateKey_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, APP.TIMEZONE, 'yyyy-MM-dd');
  var raw = text_(value);
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  var parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? raw.slice(0, 10) : Utilities.formatDate(parsed, APP.TIMEZONE, 'yyyy-MM-dd');
}

function periodMatches_(value, from, to) {
  var key = dateKey_(value);
  return !!key && (!from || key >= from) && (!to || key <= to);
}

function listClosedJobs_(params) {
  try {
    params = params || {};
    var payments = allPaymentRecords_();
    var query = text_(params.query).toLowerCase(), from = text_(params.date_from), to = text_(params.date_to);
    var records = allJobRecords_().filter(function(record) {
      if (String(record.status) !== 'CLOSED') return false;
      if (!periodMatches_(record.closed_at || record.updated_at, from, to)) return false;
      if (!query) return true;
      return [record.motorcycle_model, record.work_description, record.customer_name, record.customer_whatsapp].join(' ').toLowerCase().indexOf(query) !== -1;
    }).map(function(record) {
      record.payment = payments.find(function(payment) { return String(payment.job_id) === String(record.job_id); }) || null;
      return record;
    });
    records.sort(function(a, b) { return String(b.closed_at || b.updated_at).localeCompare(String(a.closed_at || a.updated_at)); });
    return ok_(records, 'Riwayat Job berhasil diambil.');
  } catch (error) {
    logEvent_('listClosedJobs', null, 'ERROR', String(error && error.message ? error.message : error));
    return fail_('Riwayat Job tidak dapat dimuat.');
  }
}

function financialSnapshot_(from, to) {
  var payments = allPaymentRecords_(), expenses = allExpenseRecords_(), jobs = allJobRecords_();
  var paymentTotal = 0, expenseTotal = 0, closedCount = 0, inconsistencies = [];
  payments.forEach(function(payment) { if (periodMatches_(payment.created_at, from, to)) paymentTotal += Number(payment.amount) || 0; });
  expenses.forEach(function(expense) { if (periodMatches_(expense.expense_date || expense.created_at, from, to)) expenseTotal += Number(expense.total_amount) || 0; });
  jobs.forEach(function(job) {
    if (String(job.status) !== 'CLOSED' || !periodMatches_(job.closed_at || job.updated_at, from, to)) return;
    var payment = payments.find(function(item) { return String(item.job_id) === String(job.job_id); });
    if (payment) closedCount += 1; else { inconsistencies.push({ job_id: job.job_id, issue: 'CLOSED_WITHOUT_PAYMENT' }); logEvent_('financialSnapshot', job.job_id, 'INCONSISTENT', 'CLOSED_WITHOUT_PAYMENT'); }
  });
  return { total_income: paymentTotal, total_expense: expenseTotal, difference: paymentTotal - expenseTotal, closed_job_count: closedCount, inconsistencies: inconsistencies };
}

function getDashboard_() {
  try {
    var today = Utilities.formatDate(new Date(), APP.TIMEZONE, 'yyyy-MM-dd');
    var month = today.slice(0, 7), monthFrom = month + '-01';
    var todayIncome = financialSnapshot_(today, today).total_income;
    var monthSnapshot = financialSnapshot_(monthFrom, today);
    var active = allJobRecords_().filter(function(job) { return String(job.status) === 'IN_PROGRESS'; });
    active.sort(function(a, b) { return String(b.created_at).localeCompare(String(a.created_at)); });
    return ok_({ as_of: today, active_jobs: active, active_job_count: active.length, income_today: todayIncome, income_month: monthSnapshot.total_income, expense_month: monthSnapshot.total_expense, inconsistencies: monthSnapshot.inconsistencies }, 'Dashboard berhasil dimuat.');
  } catch (error) { logEvent_('getDashboard', null, 'ERROR', String(error)); return fail_('Dashboard tidak dapat dimuat.'); }
}

function getRecap_(params) {
  try {
    var today = Utilities.formatDate(new Date(), APP.TIMEZONE, 'yyyy-MM-dd'), monthFrom = today.slice(0, 7) + '-01';
    var from = text_(params.date_from) || monthFrom, to = text_(params.date_to) || today;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) return fail_('Periode tanggal tidak valid.');
    return ok_({ date_from: from, date_to: to, snapshot: financialSnapshot_(from, to) }, 'Ringkasan berhasil dimuat.');
  } catch (error) { logEvent_('getRecap', null, 'ERROR', String(error)); return fail_('Ringkasan tidak dapat dimuat.'); }
}

function getOwnerReport_(params) {
  try {
    params = params || {};
    var today = Utilities.formatDate(new Date(), APP.TIMEZONE, 'yyyy-MM-dd');
    var from = text_(params.date_from) || today.slice(0, 7) + '-01';
    var to = text_(params.date_to) || today;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) return fail_('Periode tanggal tidak valid.');

    var jobs = allJobRecords_();
    var payments = allPaymentRecords_();
    var expenses = allExpenseRecords_();
    var paymentByJob = {};
    var totalIncome = 0;
    var totalExpense = 0;
    var closedCount = 0;
    var inconsistencies = [];
    var history = [];
    var activeJobs = [];

    payments.forEach(function(payment) {
      paymentByJob[String(payment.job_id)] = payment;
      if (periodMatches_(payment.created_at, from, to)) totalIncome += Number(payment.amount) || 0;
    });
    expenses.forEach(function(expense) {
      if (periodMatches_(expense.expense_date || expense.created_at, from, to)) totalExpense += Number(expense.total_amount) || 0;
    });
    jobs.forEach(function(job) {
      if (String(job.status) === 'IN_PROGRESS') {
        activeJobs.push(job);
        return;
      }
      if (String(job.status) !== 'CLOSED' || !periodMatches_(job.closed_at || job.updated_at, from, to)) return;
      var payment = paymentByJob[String(job.job_id)] || null;
      job.payment = payment;
      history.push(job);
      if (payment) closedCount += 1;
      else inconsistencies.push({ job_id: job.job_id, issue: 'CLOSED_WITHOUT_PAYMENT' });
    });
    history.sort(function(a, b) { return String(b.closed_at || b.updated_at).localeCompare(String(a.closed_at || a.updated_at)); });
    activeJobs.sort(function(a, b) { return String(b.created_at).localeCompare(String(a.created_at)); });

    return ok_({
      recap: {
        date_from: from,
        date_to: to,
        snapshot: {
          total_income: totalIncome,
          total_expense: totalExpense,
          difference: totalIncome - totalExpense,
          closed_job_count: closedCount,
          inconsistencies: inconsistencies,
        },
      },
      history: history,
      active_jobs: activeJobs,
    }, 'Data Owner berhasil dimuat.');
  } catch (error) {
    logEvent_('getOwnerReport', null, 'ERROR', String(error && error.message ? error.message : error));
    return fail_('Data Owner tidak dapat dimuat.');
  }
}

function validatePaymentInput_(body) {
  var jobId = text_(body.job_id);
  var amount = body.amount;
  var method = text_(body.payment_method).toUpperCase();
  var note = text_(body.note);
  if (!jobId) throw new Error('JOB_ID_REQUIRED');
  if (amount === '' || amount == null || (typeof amount === 'string' && !amount.trim())) throw new Error('PAYMENT_AMOUNT_REQUIRED');
  var numeric = typeof amount === 'number' ? amount : Number(String(amount).replace(/,/g, ''));
  if (!isFinite(numeric) || numeric < 0) throw new Error('PAYMENT_AMOUNT_INVALID');
  if (['CASH', 'TRANSFER', 'QRIS', 'OTHER'].indexOf(method) === -1) throw new Error('PAYMENT_METHOD_INVALID');
  return { job_id: jobId, amount: numeric, payment_method: method, note: note };
}

function closeJob_(e) {
  var lock = LockService.getScriptLock();
  var jobSheet = null;
  var paymentSheet = null;
  var paymentRow = null;
  var jobRow = null;
  var paymentId = null;
  var jobId = null;
  lock.waitLock(15000);
  try {
    var body = parseBody_(e), session = requireAuth_(e, body, null), key = requestKey_(body), prior = idempotentResult_('closeJob', key);
    if (prior) return prior;
    var input = validatePaymentInput_(body);
    jobId = input.job_id;
    jobSheet = getSheet_(APP.SHEETS.JOBS);
    paymentSheet = getSheet_(APP.SHEETS.PAYMENTS);
    var jobHeaders = headers_(jobSheet);
    var paymentHeaders = headers_(paymentSheet);
    var jobLastRow = jobSheet.getLastRow();
    var jobValues = jobLastRow < 2 ? [] : jobSheet.getRange(2, 1, jobLastRow - 1, jobHeaders.length).getValues();
    var jobIndex = -1;
    for (var i = 0; i < jobValues.length; i += 1) {
      if (String(recordFromRow_(jobHeaders, jobValues[i]).job_id) === jobId) { jobIndex = i; break; }
    }
    if (jobIndex === -1) throw new Error('JOB_NOT_FOUND');
    jobRow = jobIndex + 2;
    var job = recordFromRow_(jobHeaders, jobValues[jobIndex]);
    if (String(job.status) === 'CLOSED') throw new Error('JOB_ALREADY_CLOSED');
    var paymentLastRow = paymentSheet.getLastRow();
    var paymentValues = paymentLastRow < 2 ? [] : paymentSheet.getRange(2, 1, paymentLastRow - 1, paymentHeaders.length).getValues();
    for (var j = 0; j < paymentValues.length; j += 1) {
      if (String(recordFromRow_(paymentHeaders, paymentValues[j]).job_id) === jobId) throw new Error('PAYMENT_ALREADY_EXISTS');
    }
    var agreed = Number(job.agreed_price);
    if (!isFinite(agreed) || input.amount !== agreed) throw new Error('PAYMENT_AMOUNT_MISMATCH');

    var now = nowIso_();
    paymentId = generateEntityId_('PAYMENT');
    var actor = actorFromSession_(session);
    var payment = { payment_id: paymentId, job_id: jobId, created_at: now, created_by: actor, updated_at: now, updated_by: actor, amount: input.amount, payment_method: input.payment_method, note: input.note, proof_media_id: '' };
    paymentSheet.appendRow(paymentHeaders.map(function(header) { return payment[header] == null ? '' : payment[header]; }));
    paymentRow = paymentSheet.getLastRow();

    var updatedJob = {};
    Object.keys(job).forEach(function(key) { updatedJob[key] = job[key]; });
    updatedJob.status = 'CLOSED';
    updatedJob.closed_at = now;
    updatedJob.updated_at = now;
    updatedJob.updated_by = actor;
    jobHeaders.forEach(function(header, col) { jobSheet.getRange(jobRow, col + 1).setValue(updatedJob[header] == null ? '' : updatedJob[header]); });
    logEvent_('closeJob', jobId, 'SUCCESS', null);
    var result = ok_({ job: updatedJob, payment: payment }, 'Pembayaran berhasil dicatat dan Job ditutup.'); saveIdempotentResult_('closeJob', key, result); return result;
  } catch (error) {
    if (paymentSheet && paymentId && paymentRow && String(paymentSheet.getRange(paymentRow, 1).getValue()) === paymentId) {
      try { paymentSheet.deleteRow(paymentRow); } catch (rollbackError) { logEvent_('closeJob:rollback', jobId, 'ERROR', String(rollbackError)); }
    }
    var message = String(error && error.message ? error.message : error);
    logEvent_('closeJob', jobId, 'ERROR', message);
    var messages = {
      MALFORMED_REQUEST: 'Permintaan tidak valid.', JOB_ID_REQUIRED: 'Job wajib dipilih.', JOB_NOT_FOUND: 'Job tidak ditemukan.',
      JOB_ALREADY_CLOSED: 'Job sudah CLOSED dan tidak dapat dibayar lagi.', PAYMENT_ALREADY_EXISTS: 'Job sudah memiliki Payment.',
      PAYMENT_AMOUNT_REQUIRED: 'Nominal pembayaran wajib diisi.', PAYMENT_AMOUNT_INVALID: 'Nominal pembayaran tidak valid.',
      PAYMENT_AMOUNT_MISMATCH: 'Nominal pembayaran harus sama dengan harga deal.', PAYMENT_METHOD_INVALID: 'Metode pembayaran tidak valid.',
    };
    return fail_(messages[message] || 'Pembayaran gagal dicatat. Job tetap IN_PROGRESS.');
  } finally {
    lock.releaseLock();
  }
}

var MEDIA_MAX_BYTES_ = 10 * 1024 * 1024;
var MEDIA_STAGES_ = ['BEFORE', 'PROCESS', 'AFTER'];
var MEDIA_TYPES_ = ['PHOTO', 'VIDEO'];

function allMediaRecords_() {
  var sheet = getSheet_(APP.SHEETS.MEDIA);
  var headers = headers_(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, headers.length).getValues().map(function(row) { return recordFromRow_(headers, row); });
}

function listJobMedia_(jobId) {
  try {
    var id = text_(jobId);
    if (!id) return fail_('Job wajib dipilih.');
    var exists = allJobRecords_().some(function(item) { return String(item.job_id) === id; });
    if (!exists) return fail_('Job tidak ditemukan.');
    return ok_(allMediaRecords_().filter(function(item) { return String(item.owner_type) === 'JOB' && String(item.owner_id) === id; }), 'Media Job berhasil dimuat.');
  } catch (error) {
    logEvent_('listJobMedia', jobId || null, 'ERROR', String(error && error.message ? error.message : error));
    return fail_('Media Job tidak dapat dimuat.');
  }
}

function validateMediaInput_(body) {
  var jobId = text_(body.job_id);
  var category = text_(body.category).toUpperCase();
  var mediaType = text_(body.media_type).toUpperCase();
  var mime = text_(body.mime_type).toLowerCase();
  var fileName = text_(body.file_name);
  var encoded = text_(body.file_base64);
  var size = Number(body.file_size_bytes);
  if (!jobId) throw new Error('JOB_ID_REQUIRED');
  if (MEDIA_STAGES_.indexOf(category) === -1) throw new Error('MEDIA_CATEGORY_INVALID');
  if (MEDIA_TYPES_.indexOf(mediaType) === -1) throw new Error('MEDIA_TYPE_INVALID');
  if (!fileName || !encoded || !mime || !isFinite(size) || size <= 0) throw new Error('MEDIA_FILE_REQUIRED');
  if (size > MEDIA_MAX_BYTES_) throw new Error('MEDIA_FILE_TOO_LARGE');
  var supported = mime.indexOf('image/') === 0 || ['video/mp4', 'video/webm', 'video/quicktime'].indexOf(mime) !== -1;
  if (!supported) throw new Error('MEDIA_MIME_UNSUPPORTED');
  if (mediaType === 'PHOTO' && mime.indexOf('image/') !== 0) throw new Error('MEDIA_TYPE_MISMATCH');
  if (mediaType === 'VIDEO' && mime.indexOf('video/') !== 0) throw new Error('MEDIA_TYPE_MISMATCH');
  return { job_id: jobId, category: category, media_type: mediaType, mime_type: mime, file_name: fileName, file_base64: encoded, file_size_bytes: size, notes: text_(body.notes) };
}

function addJobMedia_(e) {
  var driveFile = null;
  var mediaId = null;
  var jobId = null;
  try {
    var body = parseBody_(e), session = requireAuth_(e, body, null), key = requestKey_(body), prior = idempotentResult_('addJobMedia', key);
    if (prior) return prior;
    var input = validateMediaInput_(body);
    jobId = input.job_id;
    var exists = allJobRecords_().some(function(item) { return String(item.job_id) === jobId; });
    if (!exists) throw new Error('JOB_NOT_FOUND');
    var jobsFolder = getFolderByConfigKey_('mediaJobsFolderId');
    // The configured Jobs folder is the stable storage boundary. Creating a
    // subfolder is optional in Sprint 3, and may require an extra Drive scope
    // on deployments that only have write access to the existing folder.
    // Keep upload reliable by storing the physical file directly there.
    var jobFolder = jobsFolder;
    var bytes = Utilities.base64Decode(input.file_base64);
    var blob = Utilities.newBlob(bytes, input.mime_type, input.file_name);
    driveFile = jobFolder.createFile(blob);
    var now = nowIso_();
    mediaId = generateEntityId_('MEDIA');
    var actor = actorFromSession_(session);
    var record = { media_id: mediaId, created_at: now, created_by: actor, updated_at: now, updated_by: actor, owner_type: 'JOB', owner_id: jobId, category: input.category, media_type: input.media_type, drive_file_id: driveFile.getId(), drive_file_url: driveFile.getUrl(), file_name: input.file_name, mime_type: input.mime_type, file_size_bytes: input.file_size_bytes, notes: input.notes };
    var sheet = getSheet_(APP.SHEETS.MEDIA);
    var headers = headers_(sheet);
    sheet.appendRow(headers.map(function(header) { return record[header] == null ? '' : record[header]; }));
    logEvent_('addJobMedia', mediaId, 'SUCCESS', null);
    var result = ok_(record, 'Media berhasil diunggah.'); saveIdempotentResult_('addJobMedia', key, result); return result;
  } catch (error) {
    if (driveFile) { try { driveFile.setTrashed(true); } catch (cleanupError) { logEvent_('addJobMedia:cleanup', mediaId || jobId, 'ERROR', String(cleanupError)); } }
    var message = String(error && error.message ? error.message : error);
    logEvent_('addJobMedia', mediaId || jobId, 'ERROR', message);
    var messages = { MALFORMED_REQUEST: 'Permintaan upload tidak valid.', JOB_ID_REQUIRED: 'Job wajib dipilih.', JOB_NOT_FOUND: 'Job tidak ditemukan.', MEDIA_CATEGORY_INVALID: 'Kategori media tidak valid.', MEDIA_TYPE_INVALID: 'Tipe media tidak valid.', MEDIA_FILE_REQUIRED: 'File media wajib dipilih.', MEDIA_FILE_TOO_LARGE: 'Ukuran file melebihi batas 10 MB.', MEDIA_MIME_UNSUPPORTED: 'Tipe file tidak didukung.', MEDIA_TYPE_MISMATCH: 'Tipe media tidak sesuai dengan file.' };
    return fail_(messages[message] || 'Upload media gagal. Job tetap aman dan silakan coba lagi.');
  }
}

function allExpenseRecords_() {
  var sheet = getSheet_(APP.SHEETS.EXPENSES), headers = headers_(sheet), last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, headers.length).getValues().map(function(row) { var record = recordFromRow_(headers, row); if (record.expense_date instanceof Date) record.expense_date = Utilities.formatDate(record.expense_date, APP.TIMEZONE, 'yyyy-MM-dd'); return record; });
}

function validateExpenseInput_(body) {
  var item = text_(body.item_name);
  var category = text_(body.category).toUpperCase() || 'OTHER';
  var total = body.total_amount;
  if (!item) throw new Error('EXPENSE_ITEM_REQUIRED');
  if (total === '' || total == null || (typeof total === 'string' && !total.trim())) throw new Error('EXPENSE_TOTAL_REQUIRED');
  var amount = typeof total === 'number' ? total : Number(String(total).replace(/,/g, ''));
  if (!isFinite(amount) || amount < 0 || Math.floor(amount) !== amount) throw new Error('EXPENSE_TOTAL_INVALID');
  var quantity = body.quantity;
  if (quantity !== '' && quantity != null) {
    quantity = Number(quantity);
    if (!isFinite(quantity) || quantity <= 0) throw new Error('EXPENSE_QUANTITY_INVALID');
  } else quantity = '';
  var unitPrice = body.unit_price;
  if (unitPrice !== '' && unitPrice != null) {
    unitPrice = Number(String(unitPrice).replace(/,/g, ''));
    if (!isFinite(unitPrice) || unitPrice < 0 || Math.floor(unitPrice) !== unitPrice) throw new Error('EXPENSE_UNIT_PRICE_INVALID');
  } else unitPrice = '';
  return { item_name: item, category: category, total_amount: amount, quantity: quantity, unit: text_(body.unit), unit_price: unitPrice, supplier: text_(body.supplier), notes: text_(body.notes) };
}

function createExpense_(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var body = parseBody_(e), session = requireAuth_(e, body, null), key = requestKey_(body), prior = idempotentResult_('createExpense', key);
    if (prior) return prior;
    var input = validateExpenseInput_(body);
    var sheet = getSheet_(APP.SHEETS.EXPENSES), now = nowIso_(), id = generateEntityId_('EXPENSE'), actor = actorFromSession_(session);
    var record = { expense_id: id, expense_date: Utilities.formatDate(new Date(), APP.TIMEZONE, 'yyyy-MM-dd'), created_at: now, created_by: actor, updated_at: now, updated_by: actor, category: input.category, item_name: input.item_name, quantity: input.quantity, unit: input.unit, total_amount: input.total_amount, unit_price: input.unit_price, supplier: input.supplier, receipt_media_id: '', notes: input.notes };
    var headers = headers_(sheet);
    sheet.appendRow(headers.map(function(header) { return record[header] == null ? '' : record[header]; }));
    logEvent_('createExpense', id, 'SUCCESS', null);
    var result = ok_(record, 'Pengeluaran berhasil disimpan.'); saveIdempotentResult_('createExpense', key, result); return result;
  } catch (error) {
    var message = String(error && error.message ? error.message : error);
    logEvent_('createExpense', null, 'ERROR', message);
    var messages = { MALFORMED_REQUEST: 'Permintaan tidak valid.', EXPENSE_ITEM_REQUIRED: 'Keperluan wajib diisi.', EXPENSE_TOTAL_REQUIRED: 'Total pengeluaran wajib diisi.', EXPENSE_TOTAL_INVALID: 'Total pengeluaran harus integer Rupiah nol atau lebih.', EXPENSE_QUANTITY_INVALID: 'Quantity harus lebih besar dari nol.', EXPENSE_UNIT_PRICE_INVALID: 'Harga satuan tidak valid.' };
    return fail_(messages[message] || 'Pengeluaran gagal disimpan.');
  } finally { try { lock.releaseLock(); } catch (ignore) {} }
}

function listExpenses_(params) {
  try {
    var from = text_(params.date_from), to = text_(params.date_to);
    var rows = allExpenseRecords_().filter(function(item) { var d = String(item.expense_date || ''); return (!from || d >= from) && (!to || d <= to); });
    rows.sort(function(a, b) { return String(b.expense_date).localeCompare(String(a.expense_date)) || String(b.created_at).localeCompare(String(a.created_at)); });
    return ok_(rows, 'Riwayat pengeluaran berhasil dimuat.');
  } catch (error) { logEvent_('listExpenses', null, 'ERROR', String(error)); return fail_('Riwayat pengeluaran tidak dapat dimuat.'); }
}

function listExpenseMedia_(expenseId) {
  var id = text_(expenseId);
  if (!id) return fail_('Expense ID wajib diisi.');
  if (!allExpenseRecords_().some(function(item) { return String(item.expense_id) === id; })) return fail_('Expense tidak ditemukan.');
  return ok_(allMediaRecords_().filter(function(item) { return String(item.owner_type) === 'EXPENSE' && String(item.owner_id) === id; }), 'Receipt berhasil dimuat.');
}

function addExpenseReceipt_(e) {
  var driveFile = null, mediaId = null, expenseId = null;
  try {
    var body = parseBody_(e), session = requireAuth_(e, body, null), key = requestKey_(body), prior = idempotentResult_('addExpenseReceipt', key); if (prior) return prior;
    expenseId = text_(body.expense_id);
    if (!expenseId || !allExpenseRecords_().some(function(item) { return String(item.expense_id) === expenseId; })) throw new Error('EXPENSE_NOT_FOUND');
    var mime = text_(body.mime_type).toLowerCase(), fileName = text_(body.file_name), encoded = text_(body.file_base64), size = Number(body.file_size_bytes);
    if (!fileName || !encoded || mime.indexOf('image/') !== 0 || !isFinite(size) || size <= 0) throw new Error('RECEIPT_INVALID');
    if (size > MEDIA_MAX_BYTES_) throw new Error('MEDIA_FILE_TOO_LARGE');
    var folder = getFolderByConfigKey_('mediaExpensesFolderId');
    driveFile = folder.createFile(Utilities.newBlob(Utilities.base64Decode(encoded), mime, fileName));
    mediaId = generateEntityId_('MEDIA'); var now = nowIso_(), actor = actorFromSession_(session);
    var record = { media_id: mediaId, created_at: now, created_by: actor, updated_at: now, updated_by: actor, owner_type: 'EXPENSE', owner_id: expenseId, category: 'RECEIPT', media_type: 'PHOTO', drive_file_id: driveFile.getId(), drive_file_url: driveFile.getUrl(), file_name: fileName, mime_type: mime, file_size_bytes: size, notes: text_(body.notes) };
    var mediaSheet = getSheet_(APP.SHEETS.MEDIA), headers = headers_(mediaSheet);
    mediaSheet.appendRow(headers.map(function(header) { return record[header] == null ? '' : record[header]; }));
    var expenseSheet = getSheet_(APP.SHEETS.EXPENSES), expenseHeaders = headers_(expenseSheet), last = expenseSheet.getLastRow();
    for (var i = 2; i <= last; i++) if (String(expenseSheet.getRange(i, 1).getValue()) === expenseId) { var col = expenseHeaders.indexOf('receipt_media_id'); if (col >= 0) expenseSheet.getRange(i, col + 1).setValue(mediaId); break; }
    var result = ok_(record, 'Receipt berhasil diunggah.'); saveIdempotentResult_('addExpenseReceipt', key, result); return result;
  } catch (error) {
    if (driveFile) { try { driveFile.setTrashed(true); } catch (ignore) {} }
    var message = String(error && error.message ? error.message : error);
    var messages = { MALFORMED_REQUEST: 'Permintaan tidak valid.', EXPENSE_NOT_FOUND: 'Expense tidak ditemukan.', RECEIPT_INVALID: 'Receipt harus berupa foto yang valid.', MEDIA_FILE_TOO_LARGE: 'Ukuran receipt melebihi batas 10 MB.' };
    return fail_(messages[message] || 'Receipt gagal diunggah. Expense tetap tersimpan dan dapat dicoba lagi.');
  }
}
