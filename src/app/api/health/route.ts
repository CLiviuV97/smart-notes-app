import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { withErrorHandler } from '@/server/middleware/withErrorHandler';
import { withAuth } from '@/server/middleware/withAuth';

export const GET = withErrorHandler(
  withAuth(async (_req, _ctx, user) => {
    const authCheck = await adminAuth.listUsers(1);
    const firestoreCheck = await adminDb.collection('notes').limit(1).get();

    return NextResponse.json({
      status: 'ok',
      user: { uid: user.uid, email: user.email },
      firebase: {
        auth: `connected (${authCheck.users.length} user(s) sampled)`,
        firestore: `connected (${firestoreCheck.size} doc(s) sampled)`,
      },
    });
  }),
);
