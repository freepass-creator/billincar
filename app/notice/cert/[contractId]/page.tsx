'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Printer, FloppyDisk, Warning } from '@phosphor-icons/react';
import { useContracts } from '@/lib/firebase/contracts-store';
import { useCompanies } from '@/lib/firebase/companies-store';
import { useHistoryEntries } from '@/lib/firebase/history-store';
import { useAuth } from '@/lib/use-auth';
import { toast } from '@/lib/toast';
import { friendlyError } from '@/lib/friendly-error';
import { todayKr } from '@/lib/mock-data';
import { stripCorpSuffix } from '@/lib/company-display';
import type { Contract, Company } from '@/lib/types';

/* ─────────────── 위약금률 계산 ─────────────── */
function calcPenaltyRate(contractDate: string, terminationDate: string): number {
  if (!contractDate || !terminationDate) return 0.3;
  const start = new Date(contractDate).getTime();
  const end = new Date(terminationDate).getTime();
  const months = (end - start) / (1000 * 60 * 60 * 24 * 30);
  // 1년 이내 30% / 1년 초과 20%
  return months <= 12 ? 0.3 : 0.2;
}

function addDays(yyyymmdd: string, days: number): string {
  const d = new Date(yyyymmdd);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function fmtCurrency(n: number): string {
  return n.toLocaleString('ko-KR');
}

function fmtKDate(s: string): string {
  if (!s) return '____년 __월 __일';
  const [y, m, d] = s.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
}

/* ─────────────── 페이지 ─────────────── */
export default function NoticeCertPage() {
  const params = useParams<{ contractId: string }>();
  const contractId = params?.contractId;
  const { contracts, update: updateContract } = useContracts();
  const { companies } = useCompanies();
  const { add: addHistory } = useHistoryEntries();
  const { user } = useAuth();

  const contract = useMemo(() => contracts.find((c) => c.id === contractId), [contracts, contractId]);
  const senderCompany = useMemo<Company | undefined>(() => {
    if (!contract) return undefined;
    return companies.find((co) => co.name === contract.company || co.id === contract.company)
      ?? companies[0];
  }, [contract, companies]);

  // 편집 가능 필드
  const [terminationDate, setTerminationDate] = useState('');
  const [returnedDate, setReturnedDate] = useState('');
  const [repairCost, setRepairCost] = useState(0);
  const [overrunCost, setOverrunCost] = useState(0);
  const [towingCost, setTowingCost] = useState(0);
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [issuedDate, setIssuedDate] = useState(todayKr());

  // 자동 채움
  useEffect(() => {
    if (!contract) return;
    setTerminationDate(contract.returnedDate || todayKr());
    setReturnedDate(contract.returnedDate || '');
    setPaymentDueDate(addDays(todayKr(), 14));
  }, [contract]);

  if (!contractId) {
    return <div style={{ padding: 40 }}>잘못된 경로</div>;
  }
  if (!contract) {
    return <div style={{ padding: 40 }}>계약 로딩 중...</div>;
  }

  const penaltyRate = calcPenaltyRate(contract.contractDate, terminationDate);
  const penaltyAmount = Math.round((contract.deposit ?? 0) * penaltyRate);
  const unpaid = contract.unpaidAmount ?? 0;
  const deposit = contract.deposit ?? 0;
  const totalA = unpaid + penaltyAmount + repairCost + overrunCost + towingCost;
  const totalNet = totalA - deposit;

  async function handleSave() {
    if (!contract) return;
    try {
      // 1) history_entries에 기록
      await addHistory({
        scope: 'contract',
        contractId: contract.id,
        vehiclePlate: contract.vehiclePlate,
        date: issuedDate,
        category: '법적조치',
        title: `내용증명 발송 (최고서) — 청구 ₩${fmtCurrency(totalNet)}`,
        description: [
          `수신: ${contract.customerName}`,
          `차량: ${contract.vehiclePlate}`,
          `해지일: ${terminationDate} / 반납일: ${returnedDate || '-'}`,
          `미납 ₩${fmtCurrency(unpaid)} + 위약금 ₩${fmtCurrency(penaltyAmount)} (${(penaltyRate * 100).toFixed(0)}%) + 수리 ₩${fmtCurrency(repairCost)} + 초과 ₩${fmtCurrency(overrunCost)} + 견인 ₩${fmtCurrency(towingCost)} - 보증금 ₩${fmtCurrency(deposit)}`,
          `납부기일: ${paymentDueDate}`,
          `담당: ${contactName}${contactPhone ? ` (${contactPhone})` : ''}`,
        ].join('\n'),
        status: '완료',
      });
      // 2) 채권화 자동 전이 (이미 채권이 아니라면)
      if (contract.status !== '채권') {
        await updateContract({ ...contract, status: '채권' });
      }
      toast.success('내용증명 발송 기록 저장 — 채권화 처리됨');
    } catch (e) {
      toast.error(friendlyError(e));
    }
  }

  const senderName = senderCompany?.name || contract.company;
  const senderRep = senderCompany?.ceo || '대표이사';
  const senderAddr = senderCompany?.address || '';
  const senderAccount = senderCompany?.accounts?.[0];

  return (
    <div className="cert-shell">
      <style>{`
        .cert-shell {
          font-family: 'Pretendard Variable', Pretendard, sans-serif;
          background: #f4f4f5;
          min-height: 100vh;
          padding: 24px 0;
        }
        .cert-toolbar {
          max-width: 794px;
          margin: 0 auto 16px;
          display: flex;
          gap: 8px;
          padding: 10px 16px;
          background: #fff;
          border: 1px solid #e4e4e7;
          border-radius: 6px;
          font-size: 12px;
        }
        .cert-toolbar input[type="date"],
        .cert-toolbar input[type="text"],
        .cert-toolbar input[type="number"] {
          height: 26px;
          padding: 0 6px;
          font: inherit;
          border: 1px solid #d4d4d8;
          border-radius: 4px;
        }
        .cert-toolbar .group {
          display: flex; align-items: center; gap: 4px;
          padding: 0 6px;
          border-right: 1px solid #e4e4e7;
        }
        .cert-toolbar .group:last-of-type { border-right: none; }
        .cert-toolbar label { color: #71717a; font-size: 11px; }
        .cert-actions { margin-left: auto; display: flex; gap: 6px; }
        .cert-btn {
          height: 28px;
          padding: 0 12px;
          font: inherit;
          border: 1px solid #d4d4d8;
          background: #fff;
          border-radius: 4px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .cert-btn.primary {
          background: #1B2A4A;
          color: #fff;
          border-color: #1B2A4A;
        }

        /* A4 인쇄 영역 */
        .cert-paper {
          width: 794px;       /* A4 width @ 96dpi */
          min-height: 1123px; /* A4 height */
          margin: 0 auto;
          background: #fff;
          padding: 60px 60px;
          border: 1px solid #e4e4e7;
          color: #18181b;
          font-size: 13px;
          line-height: 1.7;
          box-sizing: border-box;
        }
        .cert-title {
          text-align: center;
          margin: 0 auto 40px;
          padding: 14px 28px;
          border: 2px solid #18181b;
          width: fit-content;
          font-weight: 700;
        }
        .cert-title h1 {
          margin: 0;
          font-size: 22px;
          letter-spacing: 6px;
        }
        .cert-title .sub {
          margin-top: 4px;
          font-size: 12px;
          letter-spacing: 1px;
          font-weight: 500;
        }
        .cert-section { margin-bottom: 14px; }
        .cert-section.peer { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .cert-peer-label {
          display: inline-block;
          width: 50px;
          font-weight: 600;
        }
        .cert-list { margin: 0; padding-left: 18px; }
        .cert-list li { margin-bottom: 12px; }
        .cert-table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
          font-size: 12px;
        }
        .cert-table th, .cert-table td {
          border: 1px solid #71717a;
          padding: 6px 8px;
          text-align: center;
        }
        .cert-table th { background: #f4f4f5; font-weight: 600; }
        .cert-table td.num { text-align: right; font-variant-numeric: tabular-nums; }
        .cert-account {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          padding: 8px 12px;
          font-size: 12px;
          margin-top: 6px;
        }
        .cert-signature {
          margin-top: 60px;
          text-align: center;
          font-size: 13px;
        }
        .cert-signature .date { margin-bottom: 12px; }
        .cert-signature .name { font-weight: 600; font-size: 14px; }
        .cert-input {
          border: none;
          border-bottom: 1px dashed #a1a1aa;
          background: transparent;
          font: inherit;
          padding: 0 4px;
          min-width: 60px;
        }
        .cert-input:focus { outline: none; border-bottom-color: #1B2A4A; }

        @media print {
          .cert-toolbar { display: none; }
          .cert-shell { background: #fff; padding: 0; }
          .cert-paper { border: none; padding: 50px 40px; width: auto; min-height: auto; }
          @page { size: A4; margin: 12mm; }
        }
      `}</style>

      {/* 툴바 */}
      <div className="cert-toolbar">
        <div className="group">
          <label>발송일</label>
          <input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} />
        </div>
        <div className="group">
          <label>해지일</label>
          <input type="date" value={terminationDate} onChange={(e) => setTerminationDate(e.target.value)} />
        </div>
        <div className="group">
          <label>반납일</label>
          <input type="date" value={returnedDate} onChange={(e) => setReturnedDate(e.target.value)} />
        </div>
        <div className="group">
          <label>납부기일</label>
          <input type="date" value={paymentDueDate} onChange={(e) => setPaymentDueDate(e.target.value)} />
        </div>
        <div className="group">
          <label>수리비</label>
          <input type="number" value={repairCost} onChange={(e) => setRepairCost(Number(e.target.value) || 0)} style={{ width: 100 }} />
          <label>초과</label>
          <input type="number" value={overrunCost} onChange={(e) => setOverrunCost(Number(e.target.value) || 0)} style={{ width: 100 }} />
          <label>견인</label>
          <input type="number" value={towingCost} onChange={(e) => setTowingCost(Number(e.target.value) || 0)} style={{ width: 100 }} />
        </div>
        <div className="group">
          <label>담당</label>
          <input type="text" placeholder="이름" value={contactName} onChange={(e) => setContactName(e.target.value)} style={{ width: 80 }} />
          <input type="text" placeholder="연락처" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} style={{ width: 130 }} />
        </div>
        <div className="cert-actions">
          <button className="cert-btn" type="button" onClick={handleSave}>
            <FloppyDisk size={14} /> 저장+채권화
          </button>
          <button className="cert-btn primary" type="button" onClick={() => window.print()}>
            <Printer size={14} /> 인쇄
          </button>
        </div>
      </div>

      {/* A4 종이 */}
      <div className="cert-paper">
        <div className="cert-title">
          <h1>최 고 서</h1>
          <div className="sub">【대여 계약 중도해지 및 정산 통보】</div>
        </div>

        <div className="cert-section peer">
          <div>
            <div><span className="cert-peer-label">[수 신 인]</span></div>
            <div><span className="cert-peer-label">[주    소]</span> {contract.customerRegion ? `${contract.customerRegion}${contract.customerDistrict ? ' ' + contract.customerDistrict : ''}` : '_______________________________'}</div>
            <div><span className="cert-peer-label">[연락처]</span> {contract.customerPhone1 || '_______________'}</div>
            <div><span className="cert-peer-label">[성    명]</span> <strong>{contract.customerName}</strong></div>
          </div>
          <div>
            <div><span className="cert-peer-label">[발 신 인]</span> <strong>{stripCorpSuffix(senderName || '')}</strong></div>
            <div><span className="cert-peer-label">[주    소]</span> {senderAddr || '_______________________________'}</div>
          </div>
        </div>

        <ol className="cert-list">
          <li>귀하의 건승과 사업의 번창을 기원합니다.</li>

          <li>
            발신인은 귀하와 <strong>{fmtKDate(contract.contractDate)}</strong> 아래 (표 1)과 같은 자동차 대여계약을 체결하였고
            귀하는 발신인의 차량을 대여하였습니다. 자동차 대여약관 제10조를 위반하였으며,
            발신인은 규정에 따라 귀하와의 대여계약을 <strong>{fmtKDate(terminationDate)}</strong>로 해지 되었음을 통보드립니다.
            <table className="cert-table">
              <thead>
                <tr>
                  <th>계약차량</th>
                  <th>차량번호</th>
                  <th>계약시작일</th>
                  <th>계약종료일</th>
                  <th>보증금</th>
                  <th>월 대여료</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{contract.vehicleModel || '-'}</td>
                  <td>{contract.vehiclePlate}</td>
                  <td>{contract.contractDate}</td>
                  <td>{contract.returnScheduledDate || '-'}</td>
                  <td className="num">₩{fmtCurrency(deposit)}</td>
                  <td className="num">₩{fmtCurrency(contract.monthlyRent ?? 0)}</td>
                </tr>
                <tr>
                  <th>계약해지일</th>
                  <td colSpan={2}>{terminationDate}</td>
                  <th>차량반납일</th>
                  <td colSpan={2}>{returnedDate || '-'}</td>
                </tr>
              </tbody>
            </table>
          </li>

          <li>
            아래 (표 2)와 같은 차량 미납 대여료, 중도해지위약금, 차량원상복귀비용 등을 청구하고자 본 최고장을 발송합니다.
            <table className="cert-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>구 분</th>
                  <th style={{ width: '25%' }}>금액(원)</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>미납 대여료</td>
                  <td className="num">{fmtCurrency(unpaid)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td>위약금<br /><small>(보증금 × {(penaltyRate * 100).toFixed(0)}%)</small></td>
                  <td className="num">{fmtCurrency(penaltyAmount)}</td>
                  <td style={{ fontSize: 11, textAlign: 'left' }}>중도해지 위약금률<br />계약일로부터 1년 이내 30%<br />계약일로부터 1년 초과 20%</td>
                </tr>
                <tr>
                  <td>차량수리비</td>
                  <td className="num">{fmtCurrency(repairCost)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td>초과운행비</td>
                  <td className="num">{fmtCurrency(overrunCost)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td>견인비</td>
                  <td className="num">{fmtCurrency(towingCost)}</td>
                  <td>회수 비용</td>
                </tr>
                <tr>
                  <th>합계 (A)</th>
                  <th className="num">{fmtCurrency(totalA)}</th>
                  <td></td>
                </tr>
                <tr>
                  <td>보증금 (B)</td>
                  <td className="num">- {fmtCurrency(deposit)}</td>
                  <td></td>
                </tr>
                <tr style={{ background: '#fef2f2' }}>
                  <th>최종 청구액 (A - B)</th>
                  <th className="num">{fmtCurrency(totalNet)}</th>
                  <td>납부일: <strong>{paymentDueDate}</strong>까지</td>
                </tr>
              </tbody>
            </table>
          </li>

          <li>
            이에 발신인은 귀하가 해지 정산내역 합계 <strong>금 {fmtCurrency(totalNet)}원</strong>을
            위 납부기일까지 납부하여 주실 것을 귀하에 요청합니다.
            <div className="cert-account">
              [납부 계좌 안내]<br />
              ● 은행: {senderAccount?.bankName || '_______'} &nbsp;
              ● 예금주: {senderAccount?.accountHolder || stripCorpSuffix(senderName || '')} &nbsp;
              ● 계좌번호: {senderAccount?.accountNo || '____ - ____ - _______'}
            </div>
          </li>

          <li>
            발신인은 계약해지 후 차량을 강제회수 완료하였습니다. 회수 당시 차량 상태를 기준으로 손해 여부를 확인하였으며,
            원상복귀비용은 (표 2)에 반영되었습니다. 귀하가 채무를 변제기간 이상 미상환시,
            법적절차가 진행되며, 진행 시 발생하는 비용은 관련 법령에 따라 고객님 부담이 될 수 있습니다.
          </li>

          <li>
            귀하에 대해 위 조치를 취하는 경우 귀하의 신용에 영향을 줄 뿐 아니라
            귀하의 금융거래 등에 심각한 불이익을 초래할 수 있음을 알려드리오니 이 점 양지하여 주시기 바랍니다.
          </li>
        </ol>

        {(contactName || contactPhone) && (
          <div style={{ marginTop: 20, fontSize: 12 }}>
            담당자: <strong>{contactName || '___'}</strong> {contactPhone && `(${contactPhone})`}
          </div>
        )}

        <div className="cert-signature">
          <div className="date">{fmtKDate(issuedDate)}</div>
          <div className="name">{senderName}</div>
          <div>{senderRep} <strong>(인)</strong></div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16, color: '#71717a', fontSize: 11 }}>
        <Warning size={11} weight="duotone" style={{ verticalAlign: 'middle', marginRight: 4 }} />
        '인쇄' 누르면 브라우저 인쇄 다이얼로그 (Ctrl+P) — PDF로 저장 가능. '저장+채권화' 시 history_entries에 발송 이력 + contract.status='채권' 자동 전이.
      </div>
    </div>
  );
}
