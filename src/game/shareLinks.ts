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
 * Instagram is absent on purpose, and it is the one people ask after. It has
 * no web share intent — there is no URL that opens a composer, the way there
 * is for the other four — so there is nothing to put in this list. On a phone
 * it is in the native share sheet, which opens instead of this menu; on a
 * desktop the route is Save the picture and then post it, which the menu now
 * says out loud.
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
