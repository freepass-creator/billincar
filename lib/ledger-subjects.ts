/**
 * 자금일보 계정과목 — 입금/출금/내부이체 분류.
 * v4 lib/sample-finance.ts 의 계정과목표를 jpkerp5 운영에 맞게 정리.
 */

/** 입금 계정과목 — 회사로 들어오는 자금 */
export const RECEIPT_SUBJECTS = [
  '대여료수입',     // 월 렌탈료
  '보증금수령',     // 계약 보증금
  '면책금수령',     // 사고 면책금
  '보험금수령',     // 보험사 환급
  '카드매출',       // 카드사 입금
  '잡수입',         // 기타 수입
  '이자수익',
  '환불수령',
] as const;

/** 출금 계정과목 — 회사에서 나가는 자금 */
export const EXPENSE_SUBJECTS = [
  '차량매입',
  '정비비',
  '소모품비',
  '보험료',
  '제세공과금',     // 자동차세·등록세
  '대여료환불',
  '보증금반환',
  '과태료납부',
  '연료비',
  '주차비',
  '통행료',
  '인건비',
  '임차료',         // 사무실 임차
  '통신비',
  '관리비',
  '수수료',         // 이체수수료 등
  '잡지출',
] as const;

/** 내부 이체 — 회사 간/계좌 간 자금 이동 (입금·출금 어느 쪽이든 가능) */
export const INTERNAL_SUBJECTS = [
  '계좌이체',
  '회사간이체',
  '대표자가지급',
  '대표자가수금',
] as const;

export const ALL_SUBJECTS = [
  ...RECEIPT_SUBJECTS,
  ...EXPENSE_SUBJECTS,
  ...INTERNAL_SUBJECTS,
] as const;

export type ReceiptSubject = typeof RECEIPT_SUBJECTS[number];
export type ExpenseSubject = typeof EXPENSE_SUBJECTS[number];
export type InternalSubject = typeof INTERNAL_SUBJECTS[number];
export type AccountSubject = ReceiptSubject | ExpenseSubject | InternalSubject;

/** 거래 방향에 따른 선택 가능 계정과목 */
export function applicableSubjects(direction: 'deposit' | 'withdraw'): readonly string[] {
  if (direction === 'deposit') return [...RECEIPT_SUBJECTS, ...INTERNAL_SUBJECTS];
  return [...EXPENSE_SUBJECTS, ...INTERNAL_SUBJECTS];
}
