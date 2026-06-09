/**
 * 가입 직원 명단 — 인증된 모든 직원이 호출 가능.
 *
 * GET /api/staff/list
 *   → { ok, staff: [{ uid, email, displayName }] }
 *
 * 사용처: 대시보드 할 일 보드 담당자 선택, 계약 담당자 선택 등.
 * admin 전용 /api/admin/users 의 가벼운 버전 (활성 계정만, role/시간정보 제외).
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getFirebaseAuth } from '@/lib/firebase/admin-auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

const HAS_ADMIN_KEY = !!process.env.FIREBASE_ADMIN_KEY || !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

export async function GET(): Promise<NextResponse> {
  const actor = await requireAuth();
  if (actor instanceof NextResponse) return actor;

  // 로컬 dev — admin SDK 자격증명 미설정 시 빈 배열 + 안내
  if (!HAS_ADMIN_KEY) {
    return NextResponse.json({
      ok: true,
      count: 0,
      staff: [],
      note: 'admin SDK 자격증명 미설정 (FIREBASE_ADMIN_KEY) — production 배포 후 자동 채워짐',
    });
  }

  try {
    const auth = getFirebaseAuth();
    type Row = { uid: string; email: string; displayName: string };
    const staff: Row[] = [];

    let pageToken: string | undefined = undefined;
    do {
      const res = await auth.listUsers(1000, pageToken);
      for (const u of res.users) {
        if (u.disabled) continue;          // 비활성 계정 제외
        const email = u.email ?? '';
        if (!email) continue;              // 익명/통신없는 계정 제외
        staff.push({
          uid: u.uid,
          email,
          displayName: u.displayName ?? '',
        });
      }
      pageToken = res.pageToken;
    } while (pageToken);

    // displayName 기준 정렬 (없으면 email)
    staff.sort((a, b) => (a.displayName || a.email).localeCompare(b.displayName || b.email));

    return NextResponse.json({ ok: true, count: staff.length, staff });
  } catch (e) {
    // admin SDK 호출 실패 (자격증명·네트워크 등) — 200 으로 빈 배열 반환해 UI 가 끊기지 않게
    return NextResponse.json({
      ok: true,
      count: 0,
      staff: [],
      note: `staff list 조회 실패: ${(e as Error).message ?? String(e)}`,
    });
  }
}
