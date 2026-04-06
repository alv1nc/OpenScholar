"use client";

import { usePathname } from 'next/navigation';
import { useNavigationDirection } from '@/contexts/NavigationContext';

export default function Template({ children }: { children: React.ReactNode }) {
  const direction = useNavigationDirection();
  const pathname = usePathname();
  const animClass = direction === 'backward' ? 'page-enter-backward' : 'page-enter-forward';

  return (
    <div key={pathname} className={`flex-1 flex flex-col ${animClass}`}>
      {children}
    </div>
  );
}
