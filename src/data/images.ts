import destRwanda from "@/assets/dest-rwanda.jpg";
import destUganda from "@/assets/dest-uganda.jpg";
import destKenya from "@/assets/dest-kenya.jpg";
import destTanzania from "@/assets/dest-tanzania.jpg";
import destCongo from "@/assets/dest-congo.jpg";
import destZanzibar from "@/assets/dest-zanzibar.jpg";

export const imageLibrary: Record<string, string> = {
  rwanda: destRwanda,
  uganda: destUganda,
  kenya: destKenya,
  tanzania: destTanzania,
  congo: destCongo,
  zanzibar: destZanzibar,
};

export const imageKeys = Object.keys(imageLibrary);

export function resolveImage(key: string | null | undefined): string {
  if (key && imageLibrary[key]) return imageLibrary[key];
  return destRwanda;
}
