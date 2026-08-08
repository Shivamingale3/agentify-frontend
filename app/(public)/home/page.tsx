import type { Metadata } from "next";

/**
 * Placeholder. Kept out of the index until it has content — a blank page in
 * the search index is a thin-content signal against the whole domain.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function HomePage() {
  return <div />;
}
