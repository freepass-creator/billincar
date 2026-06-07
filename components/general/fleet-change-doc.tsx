'use client';

/**
 * 신·구사업계획 대비표 — 자동차대여사업 변경등록 신청 시 관청 제출용.
 *
 * 양식 source: sources/스위치플랜_신구대비표.pdf
 * 한 장 = 한 법인의 변경 전/후 차고지·사무실 비교표.
 *
 * props 로 company + scenario(현재 vs 변경 후) 받아 자동 렌더.
 */

import React from 'react';

export type FleetChangeRow = {
  category: '사무실' | '차고지';
  location: string;              // 위치 (주소)
  areaSqm: number | null;        // 면적 (㎡) — null 이면 "신규등록" 표기
  leaseStart?: string;           // YY.MM.DD
  leaseEnd?: string;             // YY.MM.DD
  totalCars: number;             // 자동차 계
  passenger: number;             // 승용
  smallBus: number;              // 소형 승합
  midBus: number;                // 중형 승합
  note?: string;                 // 비고
};

export type FleetChangeDocProps = {
  companyName: string;
  registeredDate: string;        // 등록일 YYYY-MM-DD
  ceo: string;
  corpRegNo: string;             // 법인등록번호
  bizRegNo: string;              // 사업자등록번호
  phone: string;                 // 010-XXXX-XXXX 또는 02-XXX-XXXX
  issuedDate: string;            // 작성일 YYYY-MM-DD
  before: FleetChangeRow[];      // 변경 전 (사무실/차고지 각 행)
  after: FleetChangeRow[];       // 변경 후
  requiredAreaSqm: number;       // 필요 면적 (자동차 1대당 13㎡ 기준)
  surplusAreaSqm: number;        // 여유 면적
  changeSummary?: string[];      // 비고 (변동사항) 다중 줄
};

function fmtNum(n: number | null | undefined): string {
  if (n == null) return '';
  return n.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}
function fmtDateKr(iso?: string): string {
  if (!iso) return '';
  const m = iso.match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1].slice(2)}.${m[2]}.${m[3]}` : iso;
}
function fmtFullDateKr(iso: string): string {
  const m = iso.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return iso;
  return `${m[1]}. ${Number(m[2])}. ${Number(m[3])}`;
}

export function FleetChangeDoc(props: FleetChangeDocProps) {
  const {
    companyName, registeredDate, ceo, corpRegNo, bizRegNo, phone, issuedDate,
    before, after, requiredAreaSqm, surplusAreaSqm, changeSummary,
  } = props;

  // 사무실/차고지 행을 매핑해서 같은 카테고리끼리 좌우 정렬
  const categories: FleetChangeRow['category'][] = ['사무실', '차고지'];

  return (
    <article className="fcd-doc">
      <header className="fcd-header">
        <h1>{companyName} 신·구사업계획 대비표</h1>
        <div className="fcd-meta">
          <span>○ 등록일: <strong>{registeredDate}</strong></span>
          <span>○ 대표: <strong>{ceo}</strong></span>
          <span>○ 법인등록번호: <strong>{corpRegNo}</strong></span>
          <span>○ 사업자번호: <strong>{bizRegNo}</strong></span>
          <span>○ 전화: <strong>{phone}</strong></span>
        </div>
        <div className="fcd-issued">{fmtFullDateKr(issuedDate)}</div>
      </header>

      <table className="fcd-table">
        <colgroup>
          <col style={{ width: 60 }} /><col style={{ width: 50 }} />
          {/* 변경 전 — 위치 면적 임대기간 계 승용 소형승합 중형승합 비고 */}
          <col /><col style={{ width: 80 }} /><col style={{ width: 90 }} />
          <col style={{ width: 38 }} /><col style={{ width: 38 }} /><col style={{ width: 50 }} /><col style={{ width: 50 }} /><col style={{ width: 60 }} />
          {/* 변경 후 — 같은 컬럼 */}
          <col /><col style={{ width: 80 }} /><col style={{ width: 90 }} />
          <col style={{ width: 38 }} /><col style={{ width: 38 }} /><col style={{ width: 50 }} /><col style={{ width: 50 }} /><col style={{ width: 60 }} />
          {/* 필요 면적 / 여유 면적 / 비고 */}
          <col style={{ width: 60 }} /><col style={{ width: 60 }} /><col style={{ width: 130 }} />
        </colgroup>
        <thead>
          <tr>
            <th colSpan={2} rowSpan={3}>구분</th>
            <th colSpan={8}>변경 전</th>
            <th colSpan={8}>변경 후</th>
            <th rowSpan={3}>필요<br/>면적</th>
            <th rowSpan={3}>여유<br/>면적</th>
            <th rowSpan={3}>비고<br/>(변동사항)</th>
          </tr>
          <tr>
            <th rowSpan={2}>위치</th>
            <th rowSpan={2}>면적<br/>(㎡, 면수)</th>
            <th rowSpan={2}>임대기간</th>
            <th colSpan={4}>자동차(대수)</th>
            <th rowSpan={2}>비고</th>
            <th rowSpan={2}>위치</th>
            <th rowSpan={2}>면적<br/>(㎡, 면수)</th>
            <th rowSpan={2}>임대기간</th>
            <th colSpan={4}>자동차(대수)</th>
            <th rowSpan={2}>비고</th>
          </tr>
          <tr>
            <th>계</th><th>승용</th><th>소형<br/>승합</th><th>중형<br/>승합</th>
            <th>계</th><th>승용</th><th>소형<br/>승합</th><th>중형<br/>승합</th>
          </tr>
        </thead>
        <tbody>
          {/* 합계 (차고지 기준) */}
          {(() => {
            const bg = before.find((r) => r.category === '차고지');
            const ag = after.find((r) => r.category === '차고지');
            return (
              <tr className="fcd-total-row">
                <td colSpan={2}><strong>계</strong><br/>(차고지)</td>
                <td>{bg ? '신규등록' : ''}</td>
                <td className="num">{bg ? fmtNum(bg.areaSqm) : ''}</td>
                <td>{bg ? `${fmtDateKr(bg.leaseStart)}~${fmtDateKr(bg.leaseEnd)}` : ''}</td>
                <td className="num">{bg?.totalCars ?? ''}</td>
                <td className="num">{bg?.passenger ?? ''}</td>
                <td className="num">{bg?.smallBus ?? ''}</td>
                <td className="num">{bg?.midBus ?? ''}</td>
                <td>{bg?.note ?? ''}</td>
                <td>{ag?.location ?? ''}</td>
                <td className="num">{ag ? fmtNum(ag.areaSqm) : ''}</td>
                <td>{ag ? `${fmtDateKr(ag.leaseStart)}~${fmtDateKr(ag.leaseEnd)}` : ''}</td>
                <td className="num">{ag?.totalCars ?? ''}</td>
                <td className="num">{ag?.passenger ?? ''}</td>
                <td className="num">{ag?.smallBus ?? ''}</td>
                <td className="num">{ag?.midBus ?? ''}</td>
                <td>{ag?.note ?? ''}</td>
                <td className="num">{fmtNum(requiredAreaSqm)}</td>
                <td className="num">{fmtNum(surplusAreaSqm)}</td>
                <td className="fcd-summary">
                  {changeSummary?.map((line, i) => <div key={i}>{line}</div>)}
                </td>
              </tr>
            );
          })()}
          {/* 주사무소(본점) — 사무실 + 차고지 각각 1행 */}
          {categories.map((cat, idx) => {
            const b = before.find((r) => r.category === cat);
            const a = after.find((r) => r.category === cat);
            return (
              <tr key={cat}>
                {idx === 0 && <td className="fcd-side" rowSpan={categories.length}>주<br/>사무소<br/>(본점)</td>}
                <td><strong>{cat}</strong></td>
                <td>{b?.location ?? ''}</td>
                <td className="num">{b ? fmtNum(b.areaSqm) : ''}</td>
                <td>{b ? `${fmtDateKr(b.leaseStart)}~${fmtDateKr(b.leaseEnd)}` : ''}</td>
                <td className="num">{b?.totalCars ?? '-'}</td>
                <td className="num">{b?.passenger ?? '-'}</td>
                <td className="num">{b?.smallBus ?? '-'}</td>
                <td className="num">{b?.midBus ?? '-'}</td>
                <td>{b?.note ?? ''}</td>
                <td>{a?.location ?? ''}</td>
                <td className="num">{a ? fmtNum(a.areaSqm) : ''}</td>
                <td>{a ? `${fmtDateKr(a.leaseStart)}~${fmtDateKr(a.leaseEnd)}` : ''}</td>
                <td className="num">{a?.totalCars ?? '-'}</td>
                <td className="num">{a?.passenger ?? '-'}</td>
                <td className="num">{a?.smallBus ?? '-'}</td>
                <td className="num">{a?.midBus ?? '-'}</td>
                <td>{a?.note ?? ''}</td>
                {idx === 0 && (
                  <>
                    <td className="num" rowSpan={categories.length}>{fmtNum(requiredAreaSqm)}</td>
                    <td className="num" rowSpan={categories.length}>{fmtNum(surplusAreaSqm)}</td>
                    <td className="fcd-summary" rowSpan={categories.length} />
                  </>
                )}
              </tr>
            );
          })}
          {/* 빈 row (예비) */}
          <tr className="fcd-empty">
            <td colSpan={2}>()</td>
            <td>()</td><td>()</td><td>()</td><td>()</td><td>()</td><td>()</td><td>()</td><td>()</td>
            <td>()</td><td>()</td><td>()</td><td>()</td><td>()</td><td>()</td><td>()</td><td>()</td>
            <td>()</td><td>()</td><td>()</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

/** 인쇄용 CSS — A4 가로 (ERP 출력 톤: 깔끔 + 가독성 강조) */
export const FCD_PRINT_CSS = `
  .fcd-doc {
    width: 297mm;
    min-height: 210mm;
    padding: 12mm 14mm;
    background: #fff;
    font-family: 'Pretendard Variable', Pretendard, 'Malgun Gothic', sans-serif;
    color: #1a1a1a;
    font-size: 9pt;
    line-height: 1.45;
    box-sizing: border-box;
    page-break-after: always;
    break-after: page;
  }
  .fcd-doc:last-child { page-break-after: auto; break-after: auto; }

  /* 헤더 — 회사명 강조 + 메타 한 줄 정리 + 우상단 일자 */
  .fcd-header {
    text-align: center;
    position: relative;
    padding: 6pt 0 14pt;
    border-bottom: 1.5pt solid #1B2A4A;     /* JPK 네이비 — ERP 브랜드 톤 */
    margin-bottom: 12pt;
  }
  .fcd-header h1 {
    font-size: 16pt;
    font-weight: 800;
    margin: 0 0 8pt;
    letter-spacing: 0.04em;
    color: #1B2A4A;
  }
  .fcd-meta {
    display: flex; justify-content: center; flex-wrap: wrap;
    gap: 14pt;
    font-size: 9pt;
    color: #333;
  }
  .fcd-meta > span { display: inline-flex; gap: 4pt; align-items: baseline; }
  .fcd-meta strong { font-weight: 600; color: #1a1a1a; }
  .fcd-issued {
    position: absolute;
    right: 0; bottom: 0;
    font-size: 9pt;
    color: #555;
    background: #f4f6fa;
    padding: 2pt 8pt;
    border-radius: 3pt;
    border: 0.5pt solid #e0e4eb;
  }

  /* 표 — 명확한 외곽 + 옅은 내부선 + 두꺼운 헤더 라인 */
  .fcd-table {
    width: 100%;
    border-collapse: collapse;
    border: 1.2pt solid #1B2A4A;
    font-size: 8.5pt;
    box-shadow: 0 0 0 0;
  }
  .fcd-table th, .fcd-table td {
    border: 0.5pt solid #c4c4c4;
    padding: 4pt 6pt;
    text-align: center;
    vertical-align: middle;
    line-height: 1.3;
  }
  /* 헤더 — JPK 네이비 톤 */
  .fcd-table thead th {
    background: #1B2A4A;
    color: #fff;
    font-weight: 600;
    font-size: 8pt;
    letter-spacing: 0.02em;
    border-color: #1B2A4A;
  }
  .fcd-table thead th:not(:last-child) { border-right: 0.5pt solid #2c3e6b; }

  /* 변경 전/후 그룹 헤더 — 진한 구분 */
  .fcd-table thead tr:first-child th:nth-child(2) { background: #1B2A4A; }

  .fcd-table td.num {
    text-align: right;
    font-variant-numeric: tabular-nums;
    padding-right: 8pt;
  }

  /* 사이드 라벨 — 옅은 brand bg */
  .fcd-table .fcd-side {
    background: #eef1f7;
    font-weight: 600;
    color: #1B2A4A;
    writing-mode: horizontal-tb;
  }

  /* 합계 — 강조 (얇은 라인 강조 + 옅은 강조색) */
  .fcd-table .fcd-total-row td {
    background: #fff7ed !important;     /* 옅은 주황 */
    font-weight: 700;
    color: #9a3412;
    border-top: 1.2pt solid #c2410c !important;
    border-bottom: 1.2pt solid #c2410c !important;
  }

  /* 빈 행 — 옅은 회색 */
  .fcd-table .fcd-empty td {
    color: #d4d4d8;
    background: #fafafa;
  }

  /* 비고 (변동사항) */
  .fcd-summary {
    font-size: 8pt;
    text-align: left;
    padding: 4pt 6pt;
  }
  .fcd-summary div {
    margin-bottom: 2pt;
    padding-left: 6pt;
    position: relative;
  }
  .fcd-summary div::before {
    content: '·';
    position: absolute;
    left: 0;
    font-weight: 700;
    color: #1B2A4A;
  }

  @page { size: A4 landscape; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .fcd-doc { box-shadow: none; }
  }
`;
