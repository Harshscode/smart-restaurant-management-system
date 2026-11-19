// Shared, cookie-authenticated REST client for the local Express API.
// Vite forwards /api/* to http://127.0.0.1:4000 during development.
export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options;
  const verb = method.toUpperCase();
  const requestHeaders = { ...headers };

  if (!['GET', 'HEAD', 'OPTIONS'].includes(verb)) {
    requestHeaders['X-SRMS-Request'] = '1';
  }

  let payload;

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(path, {
      ...rest,
      method: verb,
      credentials: 'include',
      headers: requestHeaders,
      ...(payload === undefined ? {} : { body: payload }),
    });
  } catch {
    throw new Error(
      'Cannot reach the restaurant API. Check that Express is running on port 4000.'
    );
  }

  // Logout and account deactivation return HTTP 204 with no JSON body.
  const raw = await response.text();
  let data = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(
        'Unexpected API response. Check the Vite proxy and Express server.'
      );
    }
  }

  if (!response.ok) {
    const fieldErrors =
      data?.errors?.fieldErrors ?? data?.errors;

    const firstFieldError =
      fieldErrors && typeof fieldErrors === 'object'
        ? Object.values(fieldErrors)
            .flat()
            .find(value => typeof value === 'string')
        : null;

    const error = new Error(
      firstFieldError ||
      data?.message ||
      `Request failed (${response.status}).`
    );

    error.status = response.status;
    error.fields = fieldErrors || {};

    throw error;
  }

  return data;
}