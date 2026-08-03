import { buildShareCard } from "../game/shareCard";
import type { IncidentReport } from "../game/incidentReport";
import type { GameResult, Level, Route } from "../game/types";

/**
 * The share card, rasterised (#33).
 *
 * `shareCard.ts` builds the picture and knows nothing about the browser; this
 * is the twenty lines that turn it into a PNG, and it is the only part that
 * can fail. Everything here is best-effort: a share that cannot draw a picture
 * still has words, and words were the whole feature until now.
 *
 * The SVG goes through a data URL rather than a blob URL because a blob URL
 * has to be revoked and this is a one-shot. `encodeURIComponent` rather than
 * `btoa`: the card contains a middot and an em dash, and `btoa` throws on
 * anything past Latin-1.
 */
const FILE_NAME = "about-five-kilometres.png";

function svgToImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("the card would not load"));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

export async function renderShareImage(
  level: Level,
  route: Route,
  result: GameResult,
  report: IncidentReport,
): Promise<File | undefined> {
  try {
    const card = buildShareCard(level, route, result, report);
    const image = await svgToImage(card.svg);

    const canvas = document.createElement("canvas");
    canvas.width = card.width;
    canvas.height = card.height;
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    context.drawImage(image, 0, 0, card.width, card.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) return undefined;

    return new File([blob], FILE_NAME, { type: "image/png" });
  } catch {
    // No picture, then. The caller falls back to sharing the words.
    return undefined;
  }
}

/**
 * Straight to the downloads folder, for everywhere the native share sheet is
 * not worth opening — which is every desktop. Without this the picture would
 * exist only on phones, and the map is the good bit.
 */
export function downloadShareImage(file: File): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}
