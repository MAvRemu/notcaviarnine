'use client';

import { useEffect, useState } from 'react';
import { getRdt } from '@/lib/radix/rdt';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'radix-connect-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

/** Official Radix Connect Button (web component), registered by the dApp Toolkit. */
export function ConnectButton() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    getRdt().then(() => setReady(true));
  }, []);
  return (
    <div className="inline-flex h-9 min-w-[120px] items-center justify-end sm:h-11 sm:min-w-[160px]">
      {ready ? <radix-connect-button /> : <span className="skeleton h-9 w-[120px] rounded-full sm:h-11 sm:w-[160px]" />}
    </div>
  );
}
