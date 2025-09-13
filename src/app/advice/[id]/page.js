// File: src/app/advice/[id]/page.js (The new Server Component Wrapper)

import AdviceDetailClientPage from './advice-detail-client-page';

// This Server Component gets the params instantly.
export default function AdviceDetailPage({ params }) {
  // It passes the 'id' down as a simple prop.
  return <AdviceDetailClientPage adviceId={params.id} />;
}