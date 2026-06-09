'use client';

/**
 * 달력 수동 스케줄 — `schedules/{id}` RTDB.
 * 자동 집계(만기·반납·신규)와 별개로 사용자가 일자에 등록하는 메모/일정.
 */

import { useEffect, useState } from 'react';
import { ref, onValue, set, remove as rtdbRemove, push } from 'firebase/database';
import { getRtdb, dbPath, isFirebaseConfigured, ensureAuth, pruneUndefined } from './client';
import { audit } from './audit-store';
import type { ManualSchedule } from '@/lib/types';

const PATH = dbPath('schedules');

export function useSchedules() {
  const [schedules, setSchedules] = useState<ManualSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured] = useState(() => isFirebaseConfigured());

  useEffect(() => {
    if (!configured) { setLoading(false); return; }
    let unsub: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      try { await ensureAuth(); } catch { setLoading(false); return; }
      if (cancelled) return;
      const db = getRtdb(); if (!db) { setLoading(false); return; }
      const r = ref(db, PATH);
      unsub = onValue(r, (snap) => {
        const val = snap.val();
        setSchedules(val ? Object.values<ManualSchedule>(val) : []);
        setLoading(false);
      });
    })();
    return () => { cancelled = true; if (unsub) unsub(); };
  }, [configured]);

  return {
    schedules,
    loading,
    configured,

    add: async (s: Omit<ManualSchedule, 'id'>): Promise<string> => {
      if (!configured) {
        const id = `local-${Date.now()}`;
        setSchedules((prev) => [...prev, { ...s, id }]);
        return id;
      }
      await ensureAuth();
      const db = getRtdb(); if (!db) return '';
      const newRef = push(ref(db, PATH));
      const id = newRef.key;
      if (!id) throw new Error('Firebase push failed');
      await set(newRef, pruneUndefined({ ...s, id } as Record<string, unknown>));
      void audit.create('system', id, `스케줄 추가 ${s.date} ${s.title}`);
      return id;
    },

    remove: async (id: string): Promise<void> => {
      if (!configured) {
        setSchedules((prev) => prev.filter((x) => x.id !== id));
        return;
      }
      await ensureAuth();
      const db = getRtdb(); if (!db) return;
      await rtdbRemove(ref(db, `${PATH}/${id}`));
      void audit.delete('system', id, `스케줄 삭제 ${id}`);
    },
  };
}
