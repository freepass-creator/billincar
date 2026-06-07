'use client';

/**
 * /finance — 재무 관리 메인 (거래내역 ledger).
 * v4 finance/page.tsx 의 컬럼 구조 그대로 + jpkerp5 BankTx 데이터.
 * 표 기반 (대시보드 카드 X) — 자산/계약과 동일한 list-first 패턴.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bank, MagnifyingGlass, ArrowLeft, Plus } from '@phosphor-icons/react';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomBar } from '@/components/layout/bottom-bar';
import { useBankTx } from '@/lib/firebase/transactions-store';
import { useContracts } from '@/lib/firebase/contracts-store';
import { useCompanies } from '@/lib/firebase/companies-store';
import { useRole } from '@/lib/use-role';
import { buildCompanyOptions, matchesCompanyFilter, resolveCompanyKey } from '@/lib/filter-helpers';
import { displayCompanyName } from '@/lib/company-display';
import { CreateDialog } from '@/components/create-dialog';

const fmtNum = (v: number) => v ? v.toLocaleString('ko-KR') : '';

export default function FinancePage() {
  const router = useRouter();
  const { isMaster: master, loading: roleLoading } = useRole();
  useEffect(() => {
    if (!roleLoading && !master) router.replace('/');
  }, [master, roleLoading, router]);

  const { rows: bankTx } = useBankTx();
  const { contracts } = useContracts();
  const { companies: companyMaster } = useCompanies();

  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [viewMode, setViewMode] = useState<'account' | 'autopay' | 'card' | 'corpcard' | 'daily'>('account');
  const [createOpen, setCreateOpen] = useState(false);
  const [periodMode, setPeriodMode] = useState<'month' | 'quarter' | 'year'>('month');
  const [periodAnchor, setPeriodAnchor] = useState<{ y: number; m: number }>(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() + 1 };
  });

  function shiftPeriod(delta: number) {
    setPeriodAnchor((p) => {
      const step = periodMode === 'month' ? 1 : periodMode === 'quarter' ? 3 : 12;
      const d = new Date(p.y, p.m - 1 + step * delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() + 1 };
    });
  }
  function gotoCurrent() {
    const d = new Date();
    setPeriodAnchor({ y: d.getFullYear(), m: d.getMonth() + 1 });
  }
  const periodLabel = (() => {
    if (periodMode === 'year') return `${periodAnchor.y}`;
    if (periodMode === 'quarter') {
      const q = Math.floor((periodAnchor.m - 1) / 3) + 1;
      return `${periodAnchor.y} Q${q}`;
    }
    return `${periodAnchor.y}-${String(periodAnchor.m).padStart(2, '0')}`;
  })();
  function inPeriod(yyyymmdd: string): boolean {
    if (!yyyymmdd) return false;
    const [yStr, mStr] = yyyymmdd.split('-');
    const y = Number(yStr), m = Number(mStr);
    if (Number.isNaN(y) || Number.isNaN(m)) return false;
    if (periodMode === 'year') return y === periodAnchor.y;
    if (periodMode === 'quarter') {
      const qa = Math.floor((periodAnchor.m - 1) / 3);
      const qy = Math.floor((m - 1) / 3);
      return y === periodAnchor.y && qy === qa;
    }
    return y === periodAnchor.y && m === periodAnchor.m;
  }

  const contractById = useMemo(() => new Map(contracts.map((c) => [c.id, c])), [contracts]);

  const companyOptions = useMemo(
    () => buildCompanyOptions(bankTx, (t) => resolveCompanyKey(t, contractById)),
    [bankTx, contractById],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bankTx
      .filter((t) => {
        if (directionFilter === 'deposit' && !((t.amount ?? 0) > 0)) return false;
        if (directionFilter === 'withdraw' && !((t.withdraw ?? 0) > 0)) return false;
        if (!matchesCompanyFilter(resolveCompanyKey(t, contractById), companyFilter)) return false;
        // 기간 필터 (월/분기/연)
        if (!inPeriod((t.txDate ?? '').slice(0, 10))) return false;
        if (q) {
          const c = t.matchedContractId ? contractById.get(t.matchedContractId) : undefined;
          const hay = `${t.counterparty ?? ''} ${t.memo ?? ''} ${t.account ?? ''} ${t.subject ?? ''} ${c?.contractNo ?? ''} ${c?.customerName ?? ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (b.txDate ?? '').localeCompare(a.txDate ?? ''));
  }, [bankTx, search, directionFilter, companyFilter, contractById, periodMode, periodAnchor]);


  return (
    <div className="layout">
      <Sidebar />
      <div className="app">
        <header className="topbar">
          <div className="topbar-title">
            <Bank size={16} weight="fill" style={{ color: 'var(--brand)' }} />
            <span>입출금 관리</span>
          </div>
          <div className="topbar-search">
            <MagnifyingGlass size={14} className="icon" />
            <input
              className="input"
              placeholder="거래상대 / 적요 / 계좌 / 계정과목 / 계약자"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-bar">
            <select
              className="input-compact" data-w="md"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              title="회사별 필터"
            >
              <option value="all">회사: 전체</option>
              {companyOptions.map((co) => (
                <option key={co} value={co}>{displayCompanyName(co, companyMaster)}</option>
              ))}
            </select>
            <select
              className="input-compact" data-w="sm"
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value as 'all' | 'deposit' | 'withdraw')}
              title="입출금 방향"
            >
              <option value="all">입출금</option>
              <option value="deposit">입금만</option>
              <option value="withdraw">출금만</option>
            </select>
          </div>
          {/* 퀵필터 — view 토글 + 기간 토글 + 이동 */}
          <div className="quick-filters">
            <button type="button" className={`chip ${viewMode === 'account' ? 'active' : ''}`} onClick={() => setViewMode('account')}>계좌</button>
            <button type="button" className={`chip ${viewMode === 'autopay' ? 'active' : ''}`} onClick={() => setViewMode('autopay')}>자동이체</button>
            <button type="button" className={`chip ${viewMode === 'card' ? 'active' : ''}`} onClick={() => setViewMode('card')}>카드매출</button>
            <button type="button" className={`chip ${viewMode === 'corpcard' ? 'active' : ''}`} onClick={() => setViewMode('corpcard')}>법인카드</button>
            <button type="button" className={`chip ${viewMode === 'daily' ? 'active' : ''}`} onClick={() => setViewMode('daily')}>자금일보</button>
            <span className="filter-divider" />
            {/* 기간 단위 — 월/분기/연 */}
            <button type="button" className={`chip ${periodMode === 'month' ? 'active' : ''}`} onClick={() => setPeriodMode('month')}>월</button>
            <button type="button" className={`chip ${periodMode === 'quarter' ? 'active' : ''}`} onClick={() => setPeriodMode('quarter')}>분기</button>
            <button type="button" className={`chip ${periodMode === 'year' ? 'active' : ''}`} onClick={() => setPeriodMode('year')}>연</button>
            <span className="filter-divider" />
            {/* 기간 이동 */}
            <button type="button" className="chip" onClick={() => shiftPeriod(-1)} title="이전 기간">◀</button>
            <strong className="mono" style={{ minWidth: 80, textAlign: 'center', fontSize: 12 }}>{periodLabel}</strong>
            <button type="button" className="chip" onClick={() => shiftPeriod(1)} title="다음 기간">▶</button>
            <button type="button" className="chip" onClick={gotoCurrent} title="현재 기간으로">당월</button>
          </div>
        </header>

        <div className="dashboard" style={{ gridTemplateColumns: '1fr' }}>
          <div className="panel">
            <div className="panel-body">
              {viewMode !== 'account' && (
                <div className="muted center" style={{ padding: 56, fontSize: 13 }}>
                  {viewMode === 'autopay' && '자동이체 내역 — 엑셀 일괄 업로드로 등록'}
                  {viewMode === 'card' && '카드매출 내역 — PG/단말 매출 엑셀 업로드로 등록'}
                  {viewMode === 'corpcard' && '법인카드 사용내역 — 카드사 엑셀 업로드로 등록'}
                  {viewMode === 'daily' && '자금일보 — 입력된 거래를 자동 집계 (세무사·관리자 보고용)'}
                  <div className="muted" style={{ marginTop: 8, fontSize: 11 }}>준비 중 — 하단 액션으로 업로드 시 표시됨</div>
                </div>
              )}
              {viewMode === 'account' && (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>회사</th>
                    <th style={{ width: 130 }}>계좌</th>
                    <th style={{ width: 110 }}>거래일시</th>
                    <th className="num" style={{ width: 110 }}>입금</th>
                    <th className="num" style={{ width: 110 }}>출금</th>
                    <th className="num" style={{ width: 120 }}>잔액</th>
                    <th>적요</th>
                    <th style={{ width: 140 }}>상대</th>
                    <th style={{ width: 90 }}>거래방법</th>
                    <th style={{ width: 100 }}>계정과목</th>
                    <th style={{ width: 110 }}>매칭 계약</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="muted center" style={{ padding: 32 }}>
                        거래내역 없음 — 입출금 관리에서 등록
                      </td>
                    </tr>
                  ) : filtered.map((t) => {
                    const c = t.matchedContractId ? contractById.get(t.matchedContractId) : undefined;
                    const co = resolveCompanyKey(t, contractById);
                    return (
                      <tr key={t.id}>
                        <td className="dim">{co ? displayCompanyName(co, companyMaster) : '-'}</td>
                        <td className="mono dim" style={{ fontSize: 11 }}>{t.account ?? '-'}</td>
                        <td className="mono">{(t.txDate ?? '').slice(0, 10)}</td>
                        <td className="num mono" style={{ color: (t.amount ?? 0) > 0 ? 'var(--green-text)' : 'var(--text-weak)' }}>
                          {fmtNum(t.amount ?? 0) || '-'}
                        </td>
                        <td className="num mono" style={{ color: (t.withdraw ?? 0) > 0 ? 'var(--red-text)' : 'var(--text-weak)' }}>
                          {fmtNum(t.withdraw ?? 0) || '-'}
                        </td>
                        <td className="num mono dim">{fmtNum(t.balance ?? 0) || '-'}</td>
                        <td>{t.memo || t.counterparty || '-'}</td>
                        <td className="dim">{t.counterparty || '-'}</td>
                        <td className="dim">{t.method || '-'}</td>
                        <td>{t.subject || <span className="muted">미지정</span>}</td>
                        <td className="mono dim" style={{ fontSize: 11 }}>
                          {c ? `${c.contractNo}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </div>

        <BottomBar
          left={
            <>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => setCreateOpen(true)}
                title="계좌/자동이체/카드매출/법인카드 1건 등록 (다이얼로그에서 종류 선택)"
              >
                <Plus size={14} weight="bold" /> 신규 등록
              </button>
              <span className="btn-sep" />
              <button className="btn" type="button" title="현재 표시중 거래내역 엑셀 다운로드">엑셀</button>
            </>
          }
          right={null}
        />

        <CreateDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          visibleModes={['입출금', '자동이체', '카드매출', '법인카드']}
          initialMode="입출금"
        />
      </div>
    </div>
  );
}
