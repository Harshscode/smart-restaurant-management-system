import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { apiRequest } from '../services/apiClient.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('cookie-authenticated API client', () => {
  it(
    'sends credentials and the required header on writes',
    async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            user: {
              role: 'customer',
            },
          }),
      });

      vi.stubGlobal('fetch', fetchMock);

      const result = await apiRequest(
        '/api/auth/login',
        {
          method: 'POST',
          body: {
            email: 'demo@example.com',
            password: 'not-a-real-password',
          },
        }
      );

      expect(result.user.role).toBe('customer');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          credentials: 'include',
          headers: expect.objectContaining({
            'X-SRMS-Request': '1',
            'Content-Type': 'application/json',
          }),
        })
      );
    }
  );

  it(
    'handles empty 204 logout replies',
    async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 204,
          text: async () => '',
        })
      );

      await expect(
        apiRequest('/api/auth/logout', {
          method: 'POST',
        })
      ).resolves.toBeNull();
    }
  );

  it(
    'surfaces backend validation messages',
    async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 409,
          text: async () =>
            JSON.stringify({
              message: 'Account already exists.',
            }),
        })
      );

      await expect(
        apiRequest('/api/auth/register', {
          method: 'POST',
          body: {},
        })
      ).rejects.toThrow(
        'Account already exists.'
      );
    }
  );
});