import PostDetailClient from "./PostDetailClient";

export async function generateStaticParams() {
  return [];
}

export default function PostDetailPage() {
  return <PostDetailClient />;
}
