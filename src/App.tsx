import { useEffect, useState } from 'react';

/* ----------------------------------------------------------- */
/*  CONFIG                                                     */
/* ----------------------------------------------------------- */
const ROWS = 15;
const COLS = 16;

/* tile set and sprite files
   (all PNGs are 16 × 16; React/Vite will copy them from /public)          */
const TILE_TYPES = [
  '.', 'w', 'h', 'p', 'k', 'd', '<', '^', '>', 'v', 'c', 'r',
];

/* map every tile char → image URL (null = blank floor) */
const TILE_SPRITES = {
  '.': null,            // floor stays blank
  w: '/w.png',
  h: '/h.png',
  p: '/p.png',
  k: '/k.png',
  d: '/d.png',
  '<': '/left.png',
  '^': '/up.png',
  '>': '/right.png',
  v: '/down.png',       // conveyor down
  V: '/down.png',       // (alias, in case you use uppercase)
  c: '/c.png',
  r: '/r.png',
};

/* fallback colours if an image is missing (optional) */
const FALLBACK_COLOUR = {
  '.': 'black',
  default: '#ff00ff', // bright magenta = missing sprite
};

/* ----------------------------------------------------------- */
/*  APP                                                        */
/* ----------------------------------------------------------- */
export default function App() {
  /* 2‑D level data */
  const [map, setMap] = useState(() =>
    Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => '.')
    )
  );

  /* current brush */
  const [brush, setBrush] = useState('.');

  /* drawing state */
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('paint'); // 'paint' | 'erase'

  /* release brush on global mouse‑up */
  useEffect(() => {
    const stop = () => setIsDrawing(false);
    window.addEventListener('mouseup', stop);
    return () => window.removeEventListener('mouseup', stop);
  }, []);

  /* paint or erase one cell */
  function modifyCell(r, c, action) {
    setMap((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[r][c] = action === 'erase' ? '.' : brush;
      return copy;
    });
  }

  /* sprite button helper */
  function SpriteButton({ tile }) {
    const src = TILE_SPRITES[tile];
    return (
      <button
        onClick={() => setBrush(tile)}
        style={{
          width: 32,
          height: 32,
          padding: 0,
          background: 'none',
          // border:
          //   brush === tile ? '3px solid #ff00ff' : '1px solid #333',
          cursor: 'pointer',
        }}
        title={`Tile "${tile}"`}
      >
        {src ? (
          <img
            src={src}
            alt={tile}
            width={32}
            height={32}
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          tile === '.' ? '' : tile
        )}
      </button>
    );
  }

  /* --------------------------------------------------------- */
  /*  RENDER                                                   */
  /* --------------------------------------------------------- */
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>OCTOROQ LEVEL EDITOR</h2>

      {/* ---------------  palette --------------- */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        {TILE_TYPES.map((t) => (
          <SpriteButton key={t} tile={t} />
        ))}
      </div>

      {/* ---------------  grid --------------- */}
      <div style={{ display: 'inline-block' }}>
        {map.map((row, r) => (
          <div key={r} style={{ display: 'flex' }}>
            {row.map((cell, c) => {
              const src = TILE_SPRITES[cell];
              return (
                <div
                  key={c}
                  onMouseDown={(e) => {
                    e.preventDefault(); // stop text‑select / context menu
                    const action = e.button === 2 ? 'erase' : 'paint';
                    setIsDrawing(true);
                    setMode(action);
                    modifyCell(r, c, action);
                  }}
                  onMouseEnter={() => {
                    if (isDrawing) modifyCell(r, c, mode);
                  }}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    width: 32,
                    height: 32,
                    border: '1px solid #555',
                    background: src
                      ? `url(${src}) center / 32px 32px`
                      : FALLBACK_COLOUR[cell] || FALLBACK_COLOUR.default,
                    imageRendering: 'pixelated',
                    userSelect: 'none',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* ---------------  text export --------------- */}
      <h3 style={{ marginTop: 24 }}>Level string</h3>
      <pre
        style={{
          background: '#f4f4f4',
          padding: 12,
          lineHeight: '18px',
          fontSize: 14,
        }}
      >
        {map.map((row) => `"${row.join('')}",`).join('\n')}
      </pre>
    </div>
  );
}
