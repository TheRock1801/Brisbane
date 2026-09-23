import Image from 'next/image';
import { RugbyBall } from '@/components/RugbyBall';

export function LoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-12"
    >
      <span className="sr-only">Loading</span>

      <div className="relative w-full max-w-[280px] overflow-hidden rounded-[2rem] shadow-[0_8px_30px_-8px_rgba(18,38,63,0.35)]">
        <Image
          src="/brisbane-poster.png"
          alt="Brisbane 2026"
          width={1254}
          height={1254}
          priority
          className="h-auto w-full"
        />
      </div>

      <div className="relative h-16 w-[200px]" aria-hidden="true">
        <div className="absolute bottom-2 left-0 h-px w-full border-b border-dashed border-border-subtle" />
        <div className="rugby-travel absolute bottom-2 left-0">
          <div className="rugby-bounce">
            <RugbyBall size={36} />
          </div>
        </div>
      </div>
    </div>
  );
}
