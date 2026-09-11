function generateEntityId_(entityType) {
  const prefix = APP.ENTITY_PREFIX[entityType];
  if (!prefix) throw new Error('INVALID_ENTITY_TYPE');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const day = todayKey_();
    const key = 'IDSEQ_' + prefix + '_' + day;
    const props = PropertiesService.getScriptProperties();
    const current = Number(props.getProperty(key) || '0');
    const next = current + 1;
    props.setProperty(key, String(next));
    return prefix + '-' + day + '-' + String(next).padStart(4, '0');
  } finally {
    lock.releaseLock();
  }
}
