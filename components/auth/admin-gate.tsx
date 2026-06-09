'use client';

import { ShieldWarning } from '@phosphor-icons/react';
import { useAuth } from '@/lib/use-auth';
import { useRole } from '@/lib/use-role';

/**
 * Admin 전용 페이지 가드.
 * 마스터(SUPER_ADMIN 화이트리스트) + RTDB role='admin' 부여된 직원 통과.
 *
 * 사용:
 *   <AdminGate><MyAdminPage /></AdminGate>
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isAdmin: admin, loading: roleLoading } = useRole();

  if (loading || roleLoading) return null;
  if (!user) return null; // AuthGate 가 처리

  if (!admin) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-page)',
      }}>
        <div style={{
          maxWidth: 420, padding: '32px 28px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', textAlign: 'center',
        }}>
          <ShieldWarning size={32} weight="duotone" style={{ color: 'var(--orange-text)', marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
            관리자 권한이 필요합니다
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.6 }}>
            현재 로그인 — <span className="mono">{user.email}</span>
            <br />
            이 페이지는 관리자만 접근할 수 있습니다.
            <br />
            <span className="dim" style={{ fontSize: 11 }}>권한 부여는 마스터에게 문의 — 계정관리에서 admin role 지정</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
