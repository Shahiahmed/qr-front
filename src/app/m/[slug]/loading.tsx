import { Preloader } from "@/components/ui/Preloader";

// Shown while the menu is fetched on first scan (before the 60s ISR cache warms).
// The guest's language is unknown here, so the mark carries the wait wordlessly.
export default function GuestMenuLoading() {
  return <Preloader fullscreen />;
}
