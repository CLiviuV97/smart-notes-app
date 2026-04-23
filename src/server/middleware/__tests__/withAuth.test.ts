import { NextResponse } from 'next/server';
import { withAuth } from '../withAuth';

jest.mock('@/lib/firebase/admin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
}));

import { adminAuth } from '@/lib/firebase/admin';

const mockVerify = adminAuth.verifyIdToken as jest.Mock;

describe('withAuth', () => {
  const mockHandler = jest.fn(async (_req, _ctx, user) => {
    return NextResponse.json({ uid: user.uid });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when Authorization header is missing', async () => {
    const wrapped = withAuth(mockHandler);
    const req = new Request('http://localhost/api/test');
    const res = await wrapped(req, {});
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('UNAUTHORIZED');
  });

  it('returns 401 when Authorization header does not start with Bearer', async () => {
    const wrapped = withAuth(mockHandler);
    const req = new Request('http://localhost/api/test', {
      headers: { Authorization: 'Basic abc123' },
    });
    const res = await wrapped(req, {});
    expect(res.status).toBe(401);
  });

  it('calls handler with user on valid token', async () => {
    mockVerify.mockResolvedValue({ uid: 'user-123', email: 'test@test.com' });
    const wrapped = withAuth(mockHandler);
    const req = new Request('http://localhost/api/test', {
      headers: { Authorization: 'Bearer valid-token' },
    });
    const res = await wrapped(req, {});
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.uid).toBe('user-123');
    expect(mockHandler).toHaveBeenCalledWith(
      req,
      {},
      { uid: 'user-123', email: 'test@test.com' },
    );
  });

  it('throws AppError on invalid token', async () => {
    mockVerify.mockRejectedValue(new Error('Token expired'));
    const wrapped = withAuth(mockHandler);
    const req = new Request('http://localhost/api/test', {
      headers: { Authorization: 'Bearer bad-token' },
    });
    await expect(wrapped(req, {})).rejects.toThrow('Invalid or expired token');
  });
});
