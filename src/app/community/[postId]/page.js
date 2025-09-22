// File: src/app/community/[postId]/page.js

import PostClientPage from './post-client-page';

// This is a Server Component. It can access params directly.
export default function PostPage({ params }) {
  // It passes the postId down as a simple prop.
  return <PostClientPage postId={params.postId} />;
}