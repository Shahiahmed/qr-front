const GRID = 21;
const FINDERS = [
  [0, 0],
  [GRID - 7, 0],
  [0, GRID - 7],
] as const;

function isFinderZone(x: number, y: number) {
  return FINDERS.some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7);
}

/**
 * Decorative QR-like matrix. The pattern is generated from a fixed hash so it
 * renders identically on the server and the client.
 */
function modules() {
  const cells: { x: number; y: number }[] = [];

  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      if (isFinderZone(x, y)) continue;
      const hash = (x * 73856093) ^ (y * 19349663) ^ ((x + y) * 83492791);
      if ((hash >>> 3) % 5 < 2) cells.push({ x, y });
    }
  }

  return cells;
}

const CELLS = modules();

type QrCodeProps = {
  className?: string;
  /** Colour of the modules. */
  color?: string;
  /** Draws the animated scanning beam over the code. */
  scanning?: boolean;
};

export function QrCode({
  className = "",
  color = "#141210",
  scanning = false,
}: QrCodeProps) {
  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${GRID} ${GRID}`} className="h-full w-full" role="presentation">
        {FINDERS.map(([fx, fy]) => (
          <g key={`${fx}-${fy}`} fill={color}>
            <rect x={fx} y={fy} width="7" height="7" rx="1.6" />
            <rect x={fx + 1} y={fy + 1} width="5" height="5" rx="1" fill="#fff" />
            <rect x={fx + 2} y={fy + 2} width="3" height="3" rx="0.7" />
          </g>
        ))}
        {CELLS.map(({ x, y }) => (
          <rect
            key={`${x}-${y}`}
            x={x + 0.1}
            y={y + 0.1}
            width="0.8"
            height="0.8"
            rx="0.22"
            fill={color}
          />
        ))}
      </svg>

      {scanning ? (
        <div className="animate-scan pointer-events-none absolute inset-x-0 top-1/2 h-12 -translate-y-1/2 bg-[linear-gradient(180deg,transparent,rgba(255,106,77,0.45),transparent)]" />
      ) : null}
    </div>
  );
}
