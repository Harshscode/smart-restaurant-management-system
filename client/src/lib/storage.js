const PREFIX = 'ct_srms_v1_';

export function readStored(key, fallback = null) {
  try {
    const serialized = localStorage.getItem(PREFIX + key);
    return serialized === null ? fallback : JSON.parse(serialized);
  } catch {
    return fallback;
  }
}

export function writeStored(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('ct:datachange', { detail: { key } }));
}

export function deleteStored(key) {
  localStorage.removeItem(PREFIX + key);
  window.dispatchEvent(new CustomEvent('ct:datachange', { detail: { key } }));
}

export function subscribeDataChange(callback) {
  const handleInternal = () => callback();
  const handleExternal = (event) => {
    if (event.key?.startsWith(PREFIX)) callback();
  };
  window.addEventListener('ct:datachange', handleInternal);
  window.addEventListener('storage', handleExternal);
  return () => {
    window.removeEventListener('ct:datachange', handleInternal);
    window.removeEventListener('storage', handleExternal);
  };
}
