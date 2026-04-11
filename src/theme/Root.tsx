import React from 'react';
import CodePanel from '@site/src/components/CodePanel';
export default function Root({ children }: { children: React.ReactNode }): React.ReactElement {
  return <>{children}<CodePanel /></>;
}
