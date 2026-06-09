'use client';

/**
 * 가입 직원 명단 훅 — RTDB `users/{uid}` 노드 실시간 구독.
 * admin SDK 자격증명 없이도 동작. 가입/첫 로그인 시 upsertUserProfile 로 자동 등록.
 */

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { getRtdb, dbPath, isFirebaseConfigured, ensureAuth } from '@/lib/firebase/client';

export type StaffMember = { uid: string; email: string; displayName: string };

type UserNode = {
  uid?: string;
  email?: string;
  displayName?: string;
  // 그 외 role, department 등 — list 에선 무시
};

export function useStaffList(): { staff: StaffMember[]; loading: boolean; error: string | null } {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configured] = useState(() => isFirebaseConfigured());

  useEffect(() => {
    if (!configured) { setLoading(false); return; }
    let unsub: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try { await ensureAuth(); } catch { setLoading(false); return; }
      if (cancelled) return;
      const db = getRtdb(); if (!db) { setLoading(false); return; }
      const r = ref(db, dbPath('users'));
      unsub = onValue(
        r,
        (snap) => {
          const val = snap.val();
          if (!val) { setStaff([]); setLoading(false); return; }
          const list: StaffMember[] = Object.entries(val as Record<string, UserNode>)
            .map(([uid, u]) => ({
              uid,
              email: u.email ?? '',
              displayName: u.displayName ?? '',
            }))
            .filter((s) => s.email)
            .sort((a, b) => (a.displayName || a.email).localeCompare(b.displayName || b.email));
          setStaff(list);
          setLoading(false);
        },
        (err) => { setError(err.message); setLoading(false); },
      );
    })();
    return () => { cancelled = true; if (unsub) unsub(); };
  }, [configured]);

  return { staff, loading, error };
}
