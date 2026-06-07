'use client';

/**
 * 자동차대여사업 변경등록신청서 — 별지 제35호서식.
 *
 * 양식 source: sources/증감 - [별지 제35호서식] 자동차대여사업 변경등록신청서_스위치플랜.hwp
 * 정부 공공 양식 그대로 모사 — 상단 시행규칙 마크 / 접수번호 표 / 신청인·변경사항 표 /
 * 신청 문구 / 작성일·신청인·인 / 수신 / 첨부서류 / 수수료 박스.
 */

import React from 'react';

export type FleetChangeApplicationProps = {
  companyName: string;
  corpRegNo: string;          // 법인등록번호 (또는 주민등록번호)
  bizRegNo: string;           // 사업자등록번호
  ceo: string;                // 대표자명
  address: string;            // 본점 소재지
  phone: string;
  /** 변경 내용 — 증감 차량 수 */
  changes: {
    passenger: { before: number; after: number };
    smallBus: { before: number; after: number };
    midBus: { before: number; after: number };
    total: { before: number; after: number };
  };
  /** 첨부 차량들 (참고용 — 본 양식엔 직접 안 들어감) */
  vehicles: Array<{
    plate: string;
    model: string;
    carType: string;
    contractDocAttached: boolean;
    contractDocFileName?: string;
  }>;
  issuedDate: string;         // YYYY-MM-DD
  receiver: string;           // 수신 (예: '서울특별시장')
};

function fmtYmd(iso: string): { y: string; m: string; d: string } {
  const m = iso.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return { y: '', m: '', d: '' };
  return { y: m[1], m: String(Number(m[2])), d: String(Number(m[3])) };
}

export function FleetChangeApplication(props: FleetChangeApplicationProps) {
  const { companyName, corpRegNo, bizRegNo, ceo, address, phone, changes, issuedDate, receiver } = props;
  const ymd = fmtYmd(issuedDate);

  return (
    <article className="fca-doc">
      {/* 상단 — ■ 시행규칙 표기 + 우측 수수료 박스 */}
      <div className="fca-header-row">
        <div className="fca-mark">
          ■ 여객자동차 운수사업법 시행규칙 [별지 제35호서식] &lt;개정 2021. 12. 31.&gt;
        </div>
      </div>

      <h1 className="fca-title">자동차대여사업 변경등록신청서</h1>

      <div className="fca-instruction">
        ※ 색상이 어두운 칸은 신청인이 적지 않으며, [&nbsp;&nbsp;]에는 해당되는 곳에 √표를 합니다.
      </div>

      {/* 접수번호 표 */}
      <table className="fca-table fca-receipt-table">
        <colgroup>
          <col style={{ width: '20%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <tbody>
          <tr>
            <th>접수번호</th>
            <th>접수일</th>
            <th>발급일</th>
            <th colSpan={2}>처리기간</th>
          </tr>
          <tr className="fca-blank-row">
            <td></td>
            <td></td>
            <td></td>
            <td colSpan={2}>5일</td>
          </tr>
        </tbody>
      </table>

      {/* 신청인 표 */}
      <table className="fca-table fca-applicant-table">
        <colgroup>
          <col style={{ width: 60 }} />
          <col style={{ width: 140 }} />
          <col />
          <col style={{ width: 140 }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <th rowSpan={3} className="fca-side">신<br/>청<br/>인</th>
            <th>성명(법인의 명칭)</th>
            <td colSpan={3}>{companyName}</td>
          </tr>
          <tr>
            <th>주민등록번호<br/>(법인등록번호)</th>
            <td>{corpRegNo}</td>
            <th>사업자등록번호</th>
            <td>{bizRegNo}</td>
          </tr>
          <tr>
            <th>주소</th>
            <td colSpan={3}>{address} <span className="fca-dim">(전화번호: {phone})</span></td>
          </tr>
        </tbody>
      </table>

      {/* 변경사항 표 — 좌(변경 전) / 우(변경 후) */}
      <table className="fca-table fca-change-table">
        <colgroup>
          <col style={{ width: 60 }} />
          <col style={{ width: '20%' }} />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2} className="fca-side">변<br/>경<br/>사<br/>항</th>
            <th rowSpan={2}>구분</th>
            <th>변경 전</th>
            <th>변경 후</th>
          </tr>
          <tr>
            <th className="fca-sub">자동차 대수</th>
            <th className="fca-sub">자동차 대수</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={1}></td>
            <td>승용</td>
            <td className="num">{changes.passenger.before}</td>
            <td className="num">{changes.passenger.after}</td>
          </tr>
          <tr>
            <td></td>
            <td>소형 승합</td>
            <td className="num">{changes.smallBus.before}</td>
            <td className="num">{changes.smallBus.after}</td>
          </tr>
          <tr>
            <td></td>
            <td>중형 승합</td>
            <td className="num">{changes.midBus.before}</td>
            <td className="num">{changes.midBus.after}</td>
          </tr>
          <tr className="fca-total-row">
            <td></td>
            <td><strong>합계</strong></td>
            <td className="num"><strong>{changes.total.before}</strong></td>
            <td className="num"><strong>{changes.total.after}</strong></td>
          </tr>
        </tbody>
      </table>

      {/* 신청 문구 */}
      <p className="fca-statement">
        「여객자동차 운수사업법」 제30조 및 같은 법 시행규칙 제74조에 따라 위와 같이 자동차대여사업의 변경등록을 신청합니다.
      </p>

      {/* 작성일 + 신청인 서명 */}
      <div className="fca-sign-area">
        <div className="fca-date-line">
          <span className="fca-y">{ymd.y}</span>년 &nbsp;
          <span className="fca-m">{ymd.m}</span>월 &nbsp;
          <span className="fca-d">{ymd.d}</span>일
        </div>
        <div className="fca-sign-line">
          신청인 &nbsp; <span className="fca-applicant-name">{companyName} 대표 {ceo}</span> &nbsp;
          <span className="fca-seal-text">(서명 또는 인)</span>
        </div>
      </div>

      {/* 수신 */}
      <div className="fca-receiver">
        <strong>{receiver}</strong> 귀하
      </div>

      {/* 첨부서류 박스 */}
      <table className="fca-table fca-attach-table">
        <colgroup>
          <col style={{ width: 70 }} />
          <col />
          <col style={{ width: 90 }} />
        </colgroup>
        <tbody>
          <tr>
            <th rowSpan={4} className="fca-side">첨부<br/>서류</th>
            <td className="fca-attach-item">
              1. 사업계획 변경사항 신·구사업계획대비표 1부
            </td>
            <td rowSpan={4} className="fca-fee">수수료<br/>없음</td>
          </tr>
          <tr>
            <td className="fca-attach-item">
              2. 변경하려는 사항을 확인할 수 있는 서류 (자동차매매계약서, 차고지 임대차계약서 등) 각 1부
            </td>
          </tr>
          <tr>
            <td className="fca-attach-item">
              3. 차고지 확보를 증명할 수 있는 서류 (해당하는 경우) 1부
            </td>
          </tr>
          <tr>
            <td className="fca-attach-item">
              4. 사업면허증 원본 (변경기재가 필요한 경우) 1부
            </td>
          </tr>
        </tbody>
      </table>

      {/* 페이지 하단 양식 메타 */}
      <div className="fca-form-footer">
        210mm × 297mm[백상지(80g/㎡) 또는 중질지(80g/㎡)]
      </div>
    </article>
  );
}

/** 인쇄용 CSS — A4 세로 (정부 별지 제35호서식 톤) */
export const FCA_PRINT_CSS = `
  .fca-doc {
    width: 210mm;
    min-height: 297mm;
    padding: 15mm 18mm;
    background: #fff;
    font-family: 'Pretendard Variable', Pretendard, 'Malgun Gothic', sans-serif;
    color: #000;
    font-size: 10pt;
    line-height: 1.45;
    box-sizing: border-box;
    page-break-after: always;
    break-after: page;
    position: relative;
  }
  .fca-doc:last-child { page-break-after: auto; break-after: auto; }

  /* 상단 시행규칙 마크 */
  .fca-header-row {
    margin-bottom: 6pt;
  }
  .fca-mark {
    font-size: 8.5pt;
    color: #000;
    font-weight: 400;
  }

  /* 제목 */
  .fca-title {
    text-align: center;
    font-size: 20pt;
    font-weight: 700;
    margin: 8pt 0 6pt;
    letter-spacing: 0.06em;
  }
  .fca-instruction {
    font-size: 8.5pt;
    color: #000;
    margin-bottom: 8pt;
  }

  /* 공용 표 */
  .fca-table {
    width: 100%;
    border-collapse: collapse;
    border-top: 1.2pt solid #000;
    border-bottom: 1.2pt solid #000;
    margin-bottom: 8pt;
    font-size: 9.5pt;
  }
  .fca-table th, .fca-table td {
    border: 0.5pt solid #000;
    padding: 4pt 6pt;
    vertical-align: middle;
    line-height: 1.4;
  }
  .fca-table th {
    background: #f1f3f5;        /* 정부 양식 옅은 회색 */
    font-weight: 600;
    text-align: center;
  }
  .fca-table td.num {
    text-align: right;
    font-variant-numeric: tabular-nums;
    padding-right: 10pt;
  }
  .fca-table .fca-side {
    background: #e9ecef;
    font-weight: 600;
    text-align: center;
    letter-spacing: 0.5pt;
  }
  .fca-table .fca-sub {
    font-size: 8.5pt;
    font-weight: 500;
    background: #f8f9fa;
  }
  .fca-table .fca-blank-row td { height: 22pt; background: #f8f9fa; }
  .fca-table .fca-total-row td { background: #fff5f5; }

  /* 접수번호 표 — 어두운 칸 회색 표시 (실제 양식) */
  .fca-receipt-table th { background: #f1f3f5; font-size: 9pt; }
  .fca-receipt-table .fca-blank-row td {
    background: repeating-linear-gradient(45deg, #f1f3f5, #f1f3f5 3pt, #fff 3pt, #fff 5pt);
  }

  /* 신청인 / 변경사항 표 */
  .fca-applicant-table th, .fca-change-table th { background: #f1f3f5; }

  /* 신청 문구 */
  .fca-statement {
    margin: 18pt 0 12pt;
    line-height: 1.8;
    font-size: 10pt;
  }

  /* 작성일 + 신청인 영역 — 우측 정렬 */
  .fca-sign-area {
    text-align: center;
    margin: 20pt 0 14pt;
    font-size: 11pt;
  }
  .fca-date-line { margin-bottom: 14pt; }
  .fca-date-line .fca-y, .fca-date-line .fca-m, .fca-date-line .fca-d {
    display: inline-block;
    min-width: 30pt;
    text-align: center;
    border-bottom: 0.5pt solid #000;
    padding: 0 4pt;
    margin: 0 2pt;
  }
  .fca-sign-line {
    text-align: right;
    padding-right: 10pt;
  }
  .fca-applicant-name {
    display: inline-block;
    min-width: 140pt;
    border-bottom: 0.5pt solid #000;
    padding: 0 6pt;
    text-align: center;
    margin: 0 4pt;
  }
  .fca-seal-text { font-size: 9pt; color: #555; }

  /* 수신 */
  .fca-receiver {
    margin: 8pt 0 14pt;
    font-size: 11pt;
  }

  /* 첨부서류 표 */
  .fca-attach-table { margin-top: 6pt; }
  .fca-attach-item {
    padding: 6pt 8pt;
    text-align: left;
    font-size: 9pt;
  }
  .fca-fee {
    text-align: center;
    background: #f1f3f5;
    font-weight: 600;
    font-size: 9pt;
    line-height: 1.3;
  }

  /* dim 텍스트 (전화번호 등) */
  .fca-dim { color: #555; font-size: 9pt; margin-left: 4pt; }

  /* 페이지 하단 양식 메타 */
  .fca-form-footer {
    position: absolute;
    bottom: 8mm;
    left: 18mm;
    right: 18mm;
    font-size: 7.5pt;
    color: #555;
    text-align: center;
    border-top: 0.3pt solid #aaa;
    padding-top: 4pt;
  }

  @page { size: A4; margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    .fca-doc { box-shadow: none; }
  }
`;
