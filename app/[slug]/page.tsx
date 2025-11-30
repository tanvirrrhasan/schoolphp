import PublicPageClient from "./PublicPageClient";

export async function generateStaticParams() {
  return [];
}

export default function PublicPage() {
  return <PublicPageClient />;
}
