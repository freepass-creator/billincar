/**
 * 엑셀 일괄 등록 템플릿 생성 — 보기좋은 양식.
 *
 * 구조:
 *   1행: 타이틀 (큰 글씨, 가운데, brand 배경)
 *   2~N행: 안내 노트 (옅은 노란색 배경, 9pt)
 *   N+1행: 공백 (구분)
 *   N+2행: 헤더 (10pt 굵게, 필수에 * — 보더·연한 회색 배경)
 *   N+3행: 예시 샘플 데이터 (옅은 hint)
 *   N+4~: 빈 행 (사용자 작성)
 *
 * 모든 셀 10pt 맑은 고딕 + 적절한 컬럼 너비.
 */

import * as XLSX from 'xlsx-js-style';
import type { ColumnSpec, HorizontalTemplateSpec } from './import-schema';

type Cell = { v: string | number; s?: Record<string, unknown> };

const FONT = '맑은 고딕';

const BORDER_THIN = {
  top:    { style: 'thin', color: { rgb: 'D0D0D0' } },
  bottom: { style: 'thin', color: { rgb: 'D0D0D0' } },
  left:   { style: 'thin', color: { rgb: 'D0D0D0' } },
  right:  { style: 'thin', color: { rgb: 'D0D0D0' } },
};

const styleTitle = {
  font: { name: FONT, sz: 13, bold: true, color: { rgb: '1B2A4A' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  fill: { patternType: 'solid', fgColor: { rgb: 'EEF2F7' } },
};

const styleNote = {
  font: { name: FONT, sz: 9, color: { rgb: '595959' } },
  alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
  fill: { patternType: 'solid', fgColor: { rgb: 'FFF2CC' } },
};

const styleHeader = (required: boolean) => ({
  font: { name: FONT, sz: 10, bold: true, color: { rgb: required ? 'C00000' : '1B2A4A' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  fill: { patternType: 'solid', fgColor: { rgb: 'E7E6E6' } },
  border: BORDER_THIN,
});

const styleSample = {
  font: { name: FONT, sz: 10, color: { rgb: '7F7F7F' }, italic: true },
  alignment: { horizontal: 'left', vertical: 'center' },
  border: BORDER_THIN,
};

const styleEmpty = {
  font: { name: FONT, sz: 10 },
  alignment: { vertical: 'center' },
  border: BORDER_THIN,
};

export function downloadTemplate(
  filename: string,
  columns: ColumnSpec[],
  opts: {
    title: string;       // 예: '계약 일괄 등록 양식'
    notes?: string[];    // 안내 노트 (선택)
    emptyRows?: number;  // 빈 행 수 (기본 20)
  },
) {
  const ncols = columns.length;
  const lastCol = colLetter(ncols - 1);
  const rows: Cell[][] = [];
  const merges: XLSX.Range[] = [];
  const reqCount = columns.filter((c) => c.required).length;

  // 1) 타이틀
  rows.push([{ v: opts.title, s: styleTitle }, ...filler(ncols - 1)]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: ncols - 1 } });

  // 2) 안내 노트들
  const notes: string[] = [
    `*표시 컬럼 = 필수입력. 나머지는 빈칸 허용.`,
    ...(opts.notes ?? []),
    `· 총 ${ncols}컬럼 (필수 ${reqCount}개 · 부가 ${ncols - reqCount}개)`,
  ];
  for (const note of notes) {
    const rowIdx = rows.length;
    rows.push([{ v: note, s: styleNote }, ...filler(ncols - 1, { s: styleNote })]);
    merges.push({ s: { r: rowIdx, c: 0 }, e: { r: rowIdx, c: ncols - 1 } });
  }

  // 3) 공백 1행
  rows.push(filler(ncols));

  // 4) 헤더
  rows.push(columns.map((c) => ({
    v: `${c.label}${c.required ? ' *' : ''}`,
    s: styleHeader(c.required),
  })));

  // 5) 예시 (sample)
  rows.push(columns.map((c) => ({
    v: c.example,
    s: styleSample,
  })));

  // 6) 빈 행 (사용자 작성용)
  const emptyN = opts.emptyRows ?? 20;
  for (let i = 0; i < emptyN; i++) {
    rows.push(columns.map(() => ({ v: '', s: styleEmpty })));
  }

  // AOA → sheet
  const aoa = rows.map((r) => r.map((c) => c.v));
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // 스타일 부여
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (!cell) continue;
      cell.s = rows[r][c].s ?? styleEmpty;
    }
  }

  // 컬럼 너비 — 헤더 + 예시 길이 기준
  ws['!cols'] = columns.map((c) => ({
    wch: Math.max(8, Math.min(28, Math.max(c.label.length + 2, String(c.example ?? '').length + 2))),
  }));

  // 행 높이 — 타이틀 22, 노트 18, 공백 6, 헤더 22, 그 외 18
  ws['!rows'] = rows.map((_, i) => {
    if (i === 0) return { hpt: 26 };
    if (i <= notes.length) return { hpt: 18 };
    if (i === notes.length + 1) return { hpt: 6 };
    if (i === notes.length + 2) return { hpt: 22 };
    return { hpt: 18 };
  });

  ws['!merges'] = merges;
  ws['!ref'] = `A1:${lastCol}${rows.length}`;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '양식');
  XLSX.writeFile(wb, filename);
}

function filler(n: number, cell: Partial<Cell> = {}): Cell[] {
  return Array.from({ length: n }, () => ({ v: '', ...cell }));
}

/* ─────────────── Horizontal 양식 다운로드 (좌측 고정 + 우측 블록 반복) ─────────────── */
const styleBlockHeader = (blockIdx: number, required: boolean) => ({
  font: { name: FONT, sz: 10, bold: true, color: { rgb: required ? 'C00000' : '1B2A4A' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  fill: { patternType: 'solid', fgColor: { rgb: blockIdx % 2 === 0 ? 'E7E6E6' : 'F2F2F2' } },
  border: BORDER_THIN,
});

const styleBlockLabel = (blockIdx: number) => ({
  font: { name: FONT, sz: 9, bold: true, color: { rgb: '595959' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  fill: { patternType: 'solid', fgColor: { rgb: blockIdx % 2 === 0 ? 'D9E1F2' : 'FCE4D6' } },
  border: BORDER_THIN,
});

export function downloadHorizontalTemplate(spec: HorizontalTemplateSpec, opts: { emptyRows?: number } = {}) {
  const { fixedColumns, blockColumns, blockRepeat, title, notes, filename } = spec;
  const totalCols = fixedColumns.length + blockColumns.length * blockRepeat;
  const lastCol = colLetter(totalCols - 1);
  const rows: Cell[][] = [];
  const merges: XLSX.Range[] = [];

  // 1) 타이틀
  rows.push([{ v: title, s: styleTitle }, ...filler(totalCols - 1)]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });

  // 2) 노트
  const allNotes = [
    `*표시 컬럼 = 필수입력`,
    ...notes,
    `· 좌측 ${fixedColumns.length}컬럼 고정 + 우측 ${blockColumns.length}컬럼 블록 × ${blockRepeat}회 반복`,
  ];
  for (const note of allNotes) {
    const rowIdx = rows.length;
    rows.push([{ v: note, s: styleNote }, ...filler(totalCols - 1, { s: styleNote })]);
    merges.push({ s: { r: rowIdx, c: 0 }, e: { r: rowIdx, c: totalCols - 1 } });
  }

  // 3) 공백
  rows.push(filler(totalCols));

  // 4) 블록 라벨 행 (블록1 / 블록2 / ...) — merge
  const blockLabelRow: Cell[] = [];
  // 좌측 고정 영역에는 "고정" 라벨 1개로 merge
  blockLabelRow.push({ v: '고정', s: styleBlockLabel(0) });
  for (let i = 1; i < fixedColumns.length; i++) blockLabelRow.push({ v: '', s: styleBlockLabel(0) });
  if (fixedColumns.length > 1) {
    merges.push({ s: { r: rows.length, c: 0 }, e: { r: rows.length, c: fixedColumns.length - 1 } });
  }
  // 각 블록마다 "1회차" / "2회차" / ... merge
  for (let b = 0; b < blockRepeat; b++) {
    const startCol = fixedColumns.length + b * blockColumns.length;
    blockLabelRow.push({ v: `${b + 1}`, s: styleBlockLabel(b + 1) });
    for (let i = 1; i < blockColumns.length; i++) blockLabelRow.push({ v: '', s: styleBlockLabel(b + 1) });
    if (blockColumns.length > 1) {
      merges.push({ s: { r: rows.length, c: startCol }, e: { r: rows.length, c: startCol + blockColumns.length - 1 } });
    }
  }
  rows.push(blockLabelRow);

  // 5) 헤더 행
  const headerRow: Cell[] = [];
  for (const c of fixedColumns) {
    headerRow.push({ v: `${c.label}${c.required ? ' *' : ''}`, s: styleBlockHeader(0, c.required) });
  }
  for (let b = 0; b < blockRepeat; b++) {
    for (const c of blockColumns) {
      headerRow.push({ v: `${c.label}${c.required ? ' *' : ''}`, s: styleBlockHeader(b + 1, c.required) });
    }
  }
  rows.push(headerRow);

  // 6) 예시 1행
  const sampleRow: Cell[] = [];
  for (const c of fixedColumns) sampleRow.push({ v: c.example, s: styleSample });
  for (let b = 0; b < blockRepeat; b++) {
    for (const c of blockColumns) {
      // 첫 블록만 예시, 나머지는 비움
      sampleRow.push({ v: b === 0 ? c.example : '', s: styleSample });
    }
  }
  rows.push(sampleRow);

  // 7) 빈 행
  const emptyN = opts.emptyRows ?? 30;
  for (let i = 0; i < emptyN; i++) {
    rows.push(Array.from({ length: totalCols }, () => ({ v: '', s: styleEmpty })));
  }

  // AOA → sheet
  const aoa = rows.map((r) => r.map((c) => c.v));
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // 스타일
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (!cell) continue;
      cell.s = rows[r][c].s ?? styleEmpty;
    }
  }

  // 컬럼 너비
  const widths: { wch: number }[] = [];
  for (const c of fixedColumns) {
    widths.push({ wch: Math.max(10, Math.min(28, c.label.length + 4)) });
  }
  for (let b = 0; b < blockRepeat; b++) {
    for (const c of blockColumns) {
      widths.push({ wch: Math.max(8, Math.min(22, c.label.length + 2)) });
    }
  }
  ws['!cols'] = widths;

  // 행 높이
  ws['!rows'] = rows.map((_, i) => {
    if (i === 0) return { hpt: 26 };
    if (i <= allNotes.length) return { hpt: 18 };
    if (i === allNotes.length + 1) return { hpt: 6 };
    if (i === allNotes.length + 2) return { hpt: 18 };  // 블록라벨
    if (i === allNotes.length + 3) return { hpt: 22 };  // 헤더
    return { hpt: 18 };
  });

  ws['!merges'] = merges;
  ws['!ref'] = `A1:${lastCol}${rows.length}`;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '양식');
  XLSX.writeFile(wb, filename);
}

function colLetter(idx: number): string {
  let s = '';
  let n = idx;
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}
