'use client';

/**
 * 상세정보 다이얼로그 공용 shell — 운영현황·계약관리·리스크관리·자산관리 모두 이걸 wrap.
 *
 * 규격:
 *   DialogContent
 *     ├ DialogBody (p-0, flex column)
 *     │   ├ DetailHero (.detail-hero, padding 14 16)
 *     │   │   ├ left: 이름 + meta line
 *     │   │   └ right: 뱃지/KPI/액션 (props)
 *     │   └ 본문
 *     │       ├ Tabs 모드: Tabs.Root + Tabs.List + Tabs.Content (마지막은 wrapper padding 16)
 *     │       └ 단일 모드: 본문 wrapper (padding 16, marginTop 14)
 *     └ DialogFooter ([닫기])
 *
 * → 모든 dialog 가 HERO 좌측 X = 16, 본문 좌측 X = 16 동일.
 * → globals.css .dialog-content scope CSS (.detail-section / .detail-field 등) 가 자동 적용.
 */

import { type ReactNode } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  DialogRoot, DialogContent, DialogBody, DialogFooter, DialogClose,
} from '@/components/ui/dialog';

export type ShellTab = {
  value: string;
  label: ReactNode;
  content: ReactNode;
};

export type DetailDialogShellProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** DialogContent title - 다이얼로그 헤더에 표시 */
  title: string;
  /** HERO 큰 이름 (예: 계약자명, 차종명) */
  heroName: ReactNode;
  /** HERO meta line — plate badge + 텍스트들 (· 구분자 포함) */
  heroMeta: ReactNode;
  /** HERO 우상단 영역 — 뱃지/KPI/액션 자유 배치 */
  heroRight?: ReactNode;
  /** 탭 모드 — tabs 가 있으면 children 무시하고 Tabs.Root 렌더 */
  tabs?: ShellTab[];
  /** 단일 모드 — tabs 없을 때 본문 영역 */
  children?: ReactNode;
  /** Footer 추가 버튼 (닫기 좌측). 미지정 시 [닫기]만 노출 */
  footer?: ReactNode;
  /** 초기 활성 탭 (tabs 모드에서만) */
  defaultTab?: string;
};

export function DetailDialogShell({
  open, onOpenChange, title,
  heroName, heroMeta, heroRight,
  tabs, children, footer, defaultTab,
}: DetailDialogShellProps) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent title={title}>
        <DialogBody className="p-0" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* HERO */}
          <div
            className="detail-hero"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div className="detail-hero-main">
              <div className="detail-hero-name">{heroName}</div>
              <div className="detail-hero-meta">{heroMeta}</div>
            </div>
            {heroRight && <div className="detail-hero-right">{heroRight}</div>}
          </div>

          {/* 본문 — Tabs 모드 OR 단일 모드 */}
          {tabs && tabs.length > 0 ? (
            <Tabs.Root
              defaultValue={defaultTab ?? tabs[0].value}
              style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, marginTop: 14 }}
            >
              <Tabs.List className="tabs-list">
                {tabs.map((t) => (
                  <Tabs.Trigger key={t.value} value={t.value} className="tabs-trigger">
                    {t.label}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
                {tabs.map((t) => (
                  <Tabs.Content key={t.value} value={t.value}>
                    {t.content}
                  </Tabs.Content>
                ))}
              </div>
            </Tabs.Root>
          ) : (
            <div
              style={{
                flex: 1, overflow: 'auto', padding: 16, marginTop: 14,
                display: 'flex', flexDirection: 'column', gap: 14,
              }}
            >
              {children}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          {footer}
          <DialogClose asChild>
            <button className="btn">닫기</button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
