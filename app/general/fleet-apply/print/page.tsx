'use client';

/**
 * 자동차대여사업 변경등록 — 묶음 PDF 출력 페이지.
 *
 * 흐름:
 *   1. /general 증차 신청 다이얼로그 [묶음 PDF 출력] 클릭
 *      → localStorage('jpkerp5_fleet_apply_print', JSON) 저장 + window.open('/general/fleet-apply/print')
 *   2. 이 페이지 — localStorage 읽고 신청서 + 신구대비표 렌더
 *   3. 자동 window.print() 트리거 (사용자가 PDF로 저장 또는 인쇄)
 *
 * 데이터 키: 'jpkerp5_fleet_apply_print'
 *   { application: FleetChangeApplicationProps, doc: FleetChangeDocProps }
 */

import { useEffect, useState } from 'react';
import { FleetChangeApplication, FCA_PRINT_CSS, type FleetChangeApplicationProps } from '@/components/general/fleet-change-application';
import { FleetChangeDoc, FCD_PRINT_CSS, type FleetChangeDocProps } from '@/components/general/fleet-change-doc';

const LS_KEY = 'jpkerp5_fleet_apply_print';

type Payload = {
  application: FleetChangeApplicationProps;
  doc: FleetChangeDocProps;
};

export default function FleetApplyPrintPage() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) {
        setError('인쇄 데이터를 찾을 수 없습니다. 일반관리 → 증차 신청에서 [묶음 PDF 출력] 을 다시 눌러주세요.');
        return;
      }
      const parsed = JSON.parse(raw) as Payload;
      setPayload(parsed);
      // 데이터 로드되면 잠시 후 자동 print
      const t = setTimeout(() => window.print(), 500);
      return () => clearTimeout(t);
    } catch (e) {
      setError(`데이터 파싱 실패: ${(e as Error).message ?? String(e)}`);
    }
  }, []);

  if (error) {
    return (
      <div style={{ padding: 40, fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: '#c2410c' }}>
        ⚠ {error}
      </div>
    );
  }

  if (!payload) {
    return (
      <div style={{ padding: 40, fontFamily: 'Pretendard, sans-serif', fontSize: 14, color: '#6b7280' }}>
        로딩 중…
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FCA_PRINT_CSS + FCD_PRINT_CSS }} />
      <FleetChangeApplication {...payload.application} />
      <FleetChangeDoc {...payload.doc} />
    </>
  );
}
