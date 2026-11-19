const PREFIX = 'ct_srms_v1_';

export function readStored(
  key,
  fallback = null
) {
  try {
    const serialized = localStorage.getItem(
      PREFIX + key
    );

    return serialized === null
      ? fallback
      : JSON.parse(serialized);
  } catch {
    return fallback;
  }
}

export function writeStored(key, value) {
  localStorage.setItem(
    PREFIX + key,
    JSON.stringify(value)
  );
}