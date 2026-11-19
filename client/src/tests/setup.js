// Node 22 exposes experimental storage getters that can mask
// jsdom's storage implementation unless Node is started with
// extra command-line flags.
//
// Keep the test suite portable by installing a deterministic
// Storage-compatible implementation.
//
// This file is loaded only by Vitest.

function createMemoryStorage() {
  const values = new Map();

  return {
    get length() {
      return values.size;
    },

    clear() {
      values.clear();
    },

    getItem(key) {
      const normalized = String(key);

      return values.has(normalized)
        ? values.get(normalized)
        : null;
    },

    key(index) {
      return (
        Array.from(values.keys())[index] ??
        null
      );
    },

    removeItem(key) {
      values.delete(String(key));
    },

    setItem(key, value) {
      values.set(
        String(key),
        String(value),
      );
    },
  };
}

Object.defineProperty(
  globalThis,
  'localStorage',
  {
    configurable: true,
    value: createMemoryStorage(),
  },
);

Object.defineProperty(
  globalThis,
  'sessionStorage',
  {
    configurable: true,
    value: createMemoryStorage(),
  },
);