import { renderOgImage } from "@/lib/seo/og-image";
import { OG_IMAGE_ALT } from "@/lib/seo/site";

export const alt = OG_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage();
}
