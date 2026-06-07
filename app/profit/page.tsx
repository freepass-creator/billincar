'use client';

/** 손익관리는 일반관리에 통합 — /general 로 리다이렉트 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfitPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/general'); }, [router]);
  return null;
}
