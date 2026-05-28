'use client';

import { useMemo, useState } from 'react';
import { ClipboardText, MagnifyingGlass, ArrowsClockwise } from '@phosphor-icons/react';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomBar } from '@/components/layout/bottom-bar';
import { useAuditLogs } from '@/lib/firebase/audit-store';
import type { AuditAction, AuditEntityType } from '@/lib/types';

const ACTION_LABEL: Record<AuditAction, string> = {
  create: '생성',
  update: '수정',
  delete: '삭제',
  restore: '복원',
  match: '매칭',
  unmatch: '매칭해제',
  login: '로그인',
  logout: '로그아웃',
  import: '업로드',
  export: '내보내기',
};

const ACTION_COLOR: Record<AuditAction, string> = {
  create: 'var(--green-text)',
  update: 'var(--brand)',
  delete: 'var(--red-text)',
  restore: 'var(--green-text)',
  match: 'var(--brand)',
  unmatch: 'var(--orange-text)',
  login: 'var(--text-sub)',
  logout: 'var(--text-sub)',
  import: 'var(--brand)',
  export: 'var(--text-sub)',
};

const ENTITY_LABEL: Record<AuditEntityType, string> = {
  contract: '계약',
  company: '법인',
  vehicle: '차량',
  bank_tx: '계좌',
  card_tx: '카드',
  schedule: '회차',
  penalty: '과태료',
  license: '면허',
  document: '서류',
  system: '시스템',
};

export default function AuditPage() {
  const { rows, loading } = useAuditLogs(1000);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [entityFilter, setEntityFilter] = useState<AuditEntityType | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (actionFilter !== 'all' && r.action !== actionFilter) return false;
      if (entityFilter !== 'all' && r.entityType !== entityFilter) return false;
      if (q) {
        const hay = `${r.label} ${r.by ?? ''} ${r.entityId ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, actionFilter, entityFilter, search]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of rows) m[r.action] = (m[r.action] ?? 0) + 1;
    return m;
  }, [rows]);

  return (
    <div className="layout">
      <Sidebar />
      <div className="app">
        <header className="topbar">
          <div className="topbar-title">
            <ClipboardText size={16} weight="fill" style={{ color: 'var(--text-sub)' }} />
            <span>감사 로그</span>
          </div>

          <div className="topbar-search">
            <MagnifyingGlass size={14} className="icon" />
            <input
              className="input"
              placeholder="내용 / 사용자 / ID 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-bar">
            <button type="button" className={`chip ${actionFilter === 'all' ? 'active' : ''}`} onClick={() => setActionFilter('all')}>전체</button>
            {(['create', 'update', 'delete', 'match', 'unmatch', 'import'] as const).map((a) => (
              <button key={a} type="button" className={`chip ${actionFilter === a ? 'active' : ''}`} onClick={() => setActionFilter(a)}>
                {ACTION_LABEL[a]}
                {counts[a] > 0 && <span className="chip-count">{counts[a]}</span>}
              </button>
            ))}
            <span className="filter-divider" />
            {(['contract', 'bank_tx', 'company', 'schedule'] as const).map((e) => (
              <button key={e} type="button" className={`chip ${entityFilter === e ? 'active' : ''}`} onClick={() => setEntityFilter(entityFilter === e ? 'all' : e)}>
                {ENTITY_LABEL[e]}
              </button>
            ))}
          </div>
        </header>

        <div className="dashboard" style={{ gridTemplateColumns: '1fr' }}>
          <div className="panel">
            <div className="panel-body">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 150 }}>일시</th>
                    <th style={{ width: 100 }}>사용자</th>
                    <th className="center" style={{ width: 80 }}>액션</th>
                    <th className="center" style={{ width: 70 }}>대상</th>
                    <th>내용</th>
                    <th style={{ width: 120 }}>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="muted center" style={{ padding: '32px 10px' }}>
                        <ArrowsClockwise size={14} style={{ animation: 'spin 1s linear infinite', marginRight: 6 }} />
                        로그 로드 중...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="muted center" style={{ padding: '32px 10px' }}>
                        표시할 감사 로그가 없습니다.
                      </td>
                    </tr>
                  ) : filtered.map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{r.at.slice(0, 19).replace('T', ' ')}</td>
                      <td className="dim">{r.by ?? '시스템'}</td>
                      <td className="center">
                        <span style={{ fontWeight: 600, fontSize: 11, color: ACTION_COLOR[r.action] }}>
                          {ACTION_LABEL[r.action]}
                        </span>
                      </td>
                      <td className="center dim">{ENTITY_LABEL[r.entityType]}</td>
                      <td>{r.label}</td>
                      <td className="mono dim" style={{ fontSize: 11 }}>{r.entityId ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <BottomBar
          right={
            <>
              <span>전체 <strong>{rows.length}</strong></span>
              <span style={{ width: 1, height: 14, background: 'var(--border)' }} />
              <span>표시 <strong>{filtered.length}</strong></span>
            </>
          }
        />
      </div>
    </div>
  );
}
