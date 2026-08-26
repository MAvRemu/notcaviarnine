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
    <div className="inline-flex h-11 min-w-[160px] items-center justify-end">
      {ready ? <radix-connect-button /> : <span className="skeleton h-11 w-[160px] rounded-full" />}
    </div>
  );
}
