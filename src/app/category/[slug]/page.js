// File: src/app/category/[slug]/page.js (The new Server Component Wrapper)

import CategoryClientPage from './category-client-page';

// This is a Server Component. It can access params directly.
export default function CategoryPage({ params }) {
  // It does only one thing: passes the slug down as a simple prop.
  return <CategoryClientPage slug={params.slug} />;
}