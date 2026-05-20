/**
 * 계약자 식별번호 — 정규화 + 마스킹 + 자동 종류 판별.
 *
 *   주민번호  : 13자리 (XXXXXX-XXXXXXX) — 개인
 *   사업자번호: 10자리 (XXX-XX-XXXXX)   — 사업자
 *   법인번호  : 13자리 (XXXXXX-XXXXXXX) — 법인 (주민번호와 동일 자릿수, kind로 구분)
 *
 * 저장은 raw (구분자 없는 숫자만). 표시는 kind 별 포맷팅 + 마스킹.
 */

import type { Contract } from './types';

export type CustomerKind = NonNullable<Contract['customerKind']>;

/** raw → 숫자만 추출 */
export function normalizeIdent(raw: string | undefined): string {
  return (raw ?? '').replace(/\D/g, '');
}

/**
 * 식별번호 길이로 kind 자동 추정. 법인/주민은 13자리 동일이라 판별 불가 → 우선순위:
 *   - 명시된 kind 있으면 그대로
 *   - 10자리 → 사업자
 *   - 13자리 → 개인 (default), 명시적으로 법인 지정 시에만 법인
 */
export function inferKind(raw: string | undefined, hint?: CustomerKind): CustomerKind | undefined {
  if (hint) return hint;
  const digits = normalizeIdent(raw);
  if (digits.length === 10) return '사업자';
  if (digits.length === 13) return '개인';
  return undefined;
}

/**
 * raw 식별번호 → 포맷팅된 표시값 (마스킹 옵션).
 *
 *   formatIdent('9001011234567', '개인', { mask: true })  → '900101-1******'
 *   formatIdent('9001011234567', '개인', { mask: false }) → '900101-1234567'
 *   formatIdent('1234567890', '사업자')                    → '123-45-67890'
 *   formatIdent('1101111234567', '법인', { mask: true })   → '110111-1******'
 */
export function formatIdent(
  raw: string | undefined,
  kind: CustomerKind | undefined,
  opts: { mask?: boolean } = { mask: true },
): string {
  const digits = normalizeIdent(raw);
  if (!digits) return '';
  const mask = opts.mask ?? true;

  if (kind === '사업자') {
    // 123-45-67890 (10자리, 마스킹 안 함 — 사업자번호는 공개정보)
    if (digits.length !== 10) return digits;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }

  if (kind === '법인' || kind === '개인') {
    if (digits.length !== 13) return digits;
    const front = digits.slice(0, 6);
    const back7 = digits.slice(6);
    if (mask) {
      // 900101-1****** (첫 자리만 노출)
      return `${front}-${back7[0]}******`;
    }
    return `${front}-${back7}`;
  }

  return digits;
}

/** Contract → 마스킹된 식별번호 1줄 표시 (legacy customerRegNoMasked 폴백 포함) */
export function contractIdentMasked(c: Contract): string {
  const kind = inferKind(c.customerIdentNo, c.customerKind);
  const m = formatIdent(c.customerIdentNo, kind, { mask: true });
  return m || c.customerRegNoMasked || '';
}

/** Contract → 마스킹 없는 raw 표시 (관리자용) */
export function contractIdentRaw(c: Contract): string {
  const kind = inferKind(c.customerIdentNo, c.customerKind);
  return formatIdent(c.customerIdentNo, kind, { mask: false });
}

/** 생년월일 추출 — 개인 주민번호일 때만. YYYY-MM-DD */
export function birthFromIdent(raw: string | undefined, kind: CustomerKind | undefined): string | undefined {
  if (kind && kind !== '개인') return undefined;
  const digits = normalizeIdent(raw);
  if (digits.length !== 13) return undefined;
  const yy = digits.slice(0, 2), mm = digits.slice(2, 4), dd = digits.slice(4, 6);
  const g = digits[6];
  if (!'1234'.includes(g)) return undefined;
  const century = (g === '1' || g === '2') ? 1900 : 2000;
  return `${century + parseInt(yy, 10)}-${mm}-${dd}`;
}
