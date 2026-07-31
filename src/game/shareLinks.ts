import type { SharePayload } from "./shareText";

export interface ShareLink {
  id: string;
  label: string;
  href: string;
}

/**
 * Plain share-intent URLs, which work on any browser and any desktop — unlike
 * navigator.share, which either does not exist or opens the macOS share sheet,
 * and that sheet has carried no social networks since Apple dropped built-in
 * Facebook and Twitter integration.
 *
 * Instagram is absent on purpose: it has no web intent at all. It is reachable
 * only through the native share sheet on a phone, and properly only with an
 * image — see issue #33.
 */
export function shareLinksFor(payload: SharePayload): ShareLink[] {
  const { text, url } = payload;
  const both = encodeURIComponent(`${text}\n${url}`);

  return [
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${both}`,
    },
    {
      id: "x",
      label: "X",
      href: `https://x.com/intent/post?text=${encodeURIComponent(
        text,
      )}&url=${encodeURIComponent(url)}`,
    },
    {
      id: "facebook",
      // Facebook's sharer takes the link only; it pulls its own preview text.
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      id: "threads",
      label: "Threads",
      href: `https://www.threads.net/intent/post?text=${both}`,
    },
  ];
}
