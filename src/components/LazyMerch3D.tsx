import { lazy, Suspense } from 'react';
import type { ComponentProps } from 'react';

// three.js is heavy; load it only when a 3D preview is actually shown
const Merch3DViewer = lazy(() => import('./Merch3DViewer'));

export default function LazyMerch3D(props: ComponentProps<typeof Merch3DViewer>) {
  return (
    <Suspense fallback={<div className="merch-3d-fallback">Loading 3D preview…</div>}>
      <Merch3DViewer {...props} />
    </Suspense>
  );
}
