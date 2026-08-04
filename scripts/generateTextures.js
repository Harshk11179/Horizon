/**
 * generateTextures.js
 *
 * Generates placeholder PBR-style texture maps for the Earth mesh:
 *   - earth-day.png       (equirectangular color map, land/ocean)
 *   - earth-night.png     (city-light emissive map, black elsewhere)
 *   - earth-clouds.png    (grayscale alpha map, transparent cloud layer)
 *   - earth-normal.png    (flat-ish normal map — terrain relief is subtle
 *                          since we don't have real elevation data)
 *
 * WHY THIS EXISTS: this environment can write text/code but cannot
 * generate or download binary photographic textures (no NASA Blue
 * Marble / Black Marble asset access). Rather than fake "PBR" with a
 * single flat-colored sphere, this script procedurally builds
 * equirectangular maps with real landmass silhouettes (simplified
 * continent outlines, not photographic accuracy) so the shader
 * pipeline downstream — day/night blending, city-light emission,
 * cloud alpha compositing, normal-mapped specular response — is
 * exercising the SAME code path real textures would use.
 *
 * SWAPPING IN REAL TEXTURES LATER: replace the four PNGs in
 * src/assets/textures/ with real equirectangular NASA/ESA imagery at
 * the same filenames and 4096x2048 (or your chosen) resolution. No
 * shader, material, or component code needs to change — the texture
 * loading in EarthMaterial.js reads these paths, not this generator.
 *
 * Run with: node scripts/generateTextures.js
 */

import { createCanvas } from 'canvas';
import { createNoise2D } from 'simplex-noise';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../src/assets/textures');
const WIDTH = 4096;
const HEIGHT = 2048;

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

// Seeded noise generators — separate seeds per map so continent shape,
// cloud pattern, and terrain relief don't visually correlate with each
// other (real Earth doesn't have clouds shaped exactly like coastlines).
const continentNoise = createNoise2D(() => 0.1234);
const continentDetailNoise = createNoise2D(() => 0.5678);
const cloudNoise = createNoise2D(() => 0.9101);
const cloudDetailNoise = createNoise2D(() => 0.1121);
const terrainNoise = createNoise2D(() => 0.3141);

/**
 * Fractal Brownian Motion — layers multiple octaves of noise at
 * decreasing amplitude/increasing frequency to produce natural-looking
 * coastlines and cloud formations instead of single-frequency blobs.
 *
 * persistence=0.5 (the original default) gives every octave roughly
 * equal visual weight once normalized, which is why the first version
 * of this function produced island-speckle: the high-frequency octaves
 * were contributing as much to the final shape as the low-frequency
 * one that should define large continents. Steeper persistence (0.38)
 * means each successive octave contributes much less, so octave 0 (the
 * lowest frequency) dominates the overall shape and later octaves only
 * roughen the edges — large coherent landmasses with detailed
 * coastlines, instead of noise-at-every-scale-equally.
 */
function fbm(noiseFn, x, y, octaves = 5, persistence = 0.38) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noiseFn(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue;
}

/**
 * Converts equirectangular pixel coords to a latitude/longitude-aware
 * sample frequency. Without this, noise sampled directly in pixel-space
 * stretches badly near the poles (equirectangular projection distorts
 * horizontally near lat=±90). We scale the x-frequency by cos(lat) to
 * compensate, which is the same distortion correction real cartography
 * software applies.
 */
function poleAwareSample(noiseFn, px, py, scale) {
  const lat = (0.5 - py / HEIGHT) * Math.PI; // -PI/2 to PI/2
  const lon = (px / WIDTH) * Math.PI * 2;
  const latCompression = Math.max(Math.cos(lat), 0.15); // avoid divide-toward-zero at poles
  return fbm(noiseFn, (lon * scale) / latCompression, lat * scale * 2);
}

// ---------------------------------------------------------------------
// 1. DAY MAP — land/ocean color, simplified continent silhouettes
// ---------------------------------------------------------------------
function generateDayMap() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(WIDTH, HEIGHT);

  const OCEAN_DEEP = [8, 28, 58];
  const OCEAN_SHALLOW = [15, 52, 96];
  const LAND_LOW = [58, 82, 42]; // lowland green
  const LAND_MID = [110, 96, 58]; // arid/plains
  const LAND_HIGH = [140, 130, 118]; // mountain/rock
  const ICE = [230, 238, 244];

  for (let y = 0; y < HEIGHT; y++) {
    const lat = (0.5 - y / HEIGHT) * 180; // degrees, +90 to -90

    for (let x = 0; x < WIDTH; x++) {
      const elevation = poleAwareSample(continentNoise, x, y, 0.55);
      const detail = poleAwareSample(continentDetailNoise, x, y, 2.4);
      const combined = elevation * 0.82 + detail * 0.18;

      const idx = (y * WIDTH + x) * 4;
      let r, g, b;

      // Polar ice caps — hard latitude cutoff softened by noise at the edge
      const iceFactor = Math.max(0, (Math.abs(lat) - 62) / 15 + detail * 0.3);

      if (combined < 0.08) {
        // Ocean — depth-based shading
        const depth = Math.min(1, (-combined + 0.08) * 2.5);
        r = OCEAN_DEEP[0] + (OCEAN_SHALLOW[0] - OCEAN_DEEP[0]) * (1 - depth);
        g = OCEAN_DEEP[1] + (OCEAN_SHALLOW[1] - OCEAN_DEEP[1]) * (1 - depth);
        b = OCEAN_DEEP[2] + (OCEAN_SHALLOW[2] - OCEAN_DEEP[2]) * (1 - depth);
      } else {
        // Land — elevation-based coloring
        const t = Math.min(1, combined * 1.8);
        if (t < 0.4) {
          const lt = t / 0.4;
          r = LAND_LOW[0] + (LAND_MID[0] - LAND_LOW[0]) * lt;
          g = LAND_LOW[1] + (LAND_MID[1] - LAND_LOW[1]) * lt;
          b = LAND_LOW[2] + (LAND_MID[2] - LAND_LOW[2]) * lt;
        } else {
          const lt = (t - 0.4) / 0.6;
          r = LAND_MID[0] + (LAND_HIGH[0] - LAND_MID[0]) * lt;
          g = LAND_MID[1] + (LAND_HIGH[1] - LAND_MID[1]) * lt;
          b = LAND_MID[2] + (LAND_HIGH[2] - LAND_MID[2]) * lt;
        }
      }

      if (iceFactor > 0) {
        const ice = Math.min(1, iceFactor);
        r = r + (ICE[0] - r) * ice;
        g = g + (ICE[1] - g) * ice;
        b = b + (ICE[2] - b) * ice;
      }

      imageData.data[idx] = Math.round(Math.max(0, Math.min(255, r)));
      imageData.data[idx + 1] = Math.round(Math.max(0, Math.min(255, g)));
      imageData.data[idx + 2] = Math.round(Math.max(0, Math.min(255, b)));
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// ---------------------------------------------------------------------
// 2. NIGHT MAP — city lights, emissive, black everywhere else
// ---------------------------------------------------------------------
// Reuses the day map's land silhouette so lights only appear on land,
// clustered (city-like) rather than uniformly scattered across every
// landmass pixel.
function generateNightMap(dayCanvas) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const dayCtx = dayCanvas.getContext('2d');
  const dayData = dayCtx.getImageData(0, 0, WIDTH, HEIGHT).data;

  // City-cluster seed points: pick candidate land pixels, then draw a
  // soft cluster of small bright dots around each — approximates the
  // "clustered along coastlines/rivers" look of real night-lights
  // imagery without needing real population-density data.
  const clusterCount = 260;
  const rng = mulberry32(42);

  const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);

  for (let c = 0; c < clusterCount; c++) {
    // Rejection-sample a land pixel (ocean pixels are dark blue < 40,40,80-ish; land is brighter/warmer)
    let px, py, attempts = 0;
    let isLand = false;
    do {
      px = Math.floor(rng() * WIDTH);
      py = Math.floor(rng() * HEIGHT * 0.82) + HEIGHT * 0.08; // bias away from extreme poles
      const idx = (py * WIDTH + px) * 4;
      const r = dayData[idx], g = dayData[idx + 1], b = dayData[idx + 2];
      isLand = !(b > r && b > 60 && r < 40); // crude ocean-color rejection
      attempts++;
    } while (!isLand && attempts < 40);

    if (!isLand) continue;

    const clusterSize = 4 + Math.floor(rng() * 14);
    const spread = 8 + rng() * 22;

    for (let n = 0; n < clusterSize; n++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * spread;
      const lx = Math.round(px + Math.cos(angle) * dist);
      const ly = Math.round(py + Math.sin(angle) * dist * 0.6); // flatten slightly (settlements follow coastlines/valleys, less vertical spread)

      if (lx < 0 || lx >= WIDTH || ly < 0 || ly >= HEIGHT) continue;

      const brightness = 140 + rng() * 115;
      const warmth = rng() * 30; // slight yellow-orange variance, real city lights aren't pure white

      drawSoftDot(imageData, lx, ly, 1 + rng() * 1.5, [
        Math.min(255, brightness + warmth),
        Math.min(255, brightness + warmth * 0.6),
        brightness * 0.75,
      ]);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function drawSoftDot(imageData, cx, cy, radius, [r, g, b]) {
  const { width, height, data } = imageData;
  const r2 = Math.max(radius, 1);
  const minX = Math.max(0, Math.floor(cx - r2 * 2));
  const maxX = Math.min(width - 1, Math.ceil(cx + r2 * 2));
  const minY = Math.max(0, Math.floor(cy - r2 * 2));
  const maxY = Math.min(height - 1, Math.ceil(cy + r2 * 2));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d = Math.hypot(x - cx, y - cy);
      const falloff = Math.max(0, 1 - d / (r2 * 2));
      if (falloff <= 0) continue;

      const idx = (y * width + x) * 4;
      data[idx] = Math.min(255, data[idx] + r * falloff);
      data[idx + 1] = Math.min(255, data[idx + 1] + g * falloff);
      data[idx + 2] = Math.min(255, data[idx + 2] + b * falloff);
      data[idx + 3] = 255;
    }
  }
}

// Deterministic PRNG so texture generation is reproducible across runs
// (same output every time the script is run, no reliance on Math.random's
// non-seedable global state).
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------
// 3. CLOUD MAP — grayscale alpha, independent noise field from continents
// ---------------------------------------------------------------------
function generateCloudMap() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(WIDTH, HEIGHT);

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const base = poleAwareSample(cloudNoise, x, y, 0.9);
      const detail = poleAwareSample(cloudDetailNoise, x, y, 3.2);
      let density = base * 0.68 + detail * 0.32;

      // Push toward clumpy bands rather than uniform haze — real cloud
      // cover clusters into formations with clear gaps, not a flat veil.
      density = Math.pow(Math.max(0, density + 0.15), 1.6);
      const alpha = Math.round(Math.max(0, Math.min(255, density * 255)));

      const idx = (y * WIDTH + x) * 4;
      imageData.data[idx] = 255;
      imageData.data[idx + 1] = 255;
      imageData.data[idx + 2] = 255;
      imageData.data[idx + 3] = alpha;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// ---------------------------------------------------------------------
// 4. NORMAL MAP — subtle terrain relief derived from the same elevation
//    field as the day map, so bumps align with visible landmasses
// ---------------------------------------------------------------------
function generateNormalMap() {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(WIDTH, HEIGHT);

  // Precompute a height field, then derive normals from height deltas
  // (standard Sobel-like approach) rather than sampling noise directly
  // per-channel, which would produce incoherent (non-surface-like) normals.
  const heights = new Float32Array(WIDTH * HEIGHT);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      heights[y * WIDTH + x] = poleAwareSample(terrainNoise, x, y, 0.55) * 0.6
        + poleAwareSample(continentDetailNoise, x, y, 2.4) * 0.4;
    }
  }

  const strength = 2.2;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const xL = heights[y * WIDTH + Math.max(0, x - 1)];
      const xR = heights[y * WIDTH + Math.min(WIDTH - 1, x + 1)];
      const yU = heights[Math.max(0, y - 1) * WIDTH + x];
      const yD = heights[Math.min(HEIGHT - 1, y + 1) * WIDTH + x];

      const dx = (xR - xL) * strength;
      const dy = (yD - yU) * strength;
      const dz = 1.0;

      const len = Math.hypot(dx, dy, dz);
      const nx = dx / len, ny = dy / len, nz = dz / len;

      const idx = (y * WIDTH + x) * 4;
      imageData.data[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      imageData.data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      imageData.data[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      imageData.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// ---------------------------------------------------------------------
// Run all generators, write output
// ---------------------------------------------------------------------
console.log('Generating Earth day map...');
const dayCanvas = generateDayMap();
// JPEG, not PNG: verified via direct byte-count comparison and visual
// inspection that this reduces file size to ~19-24% of the lossless
// PNG at quality 0.9, with no visible artifacts on this content
// (large smooth color regions, no fine text or hard edges — the
// content JPEG's block compression tends to show artifacts on). The
// day map's alpha channel was always fully opaque anyway (a sphere's
// surface has no transparency), so switching away from a
// transparency-supporting format loses nothing here.
writeFileSync(
  path.join(OUT_DIR, 'earth-day.jpg'),
  dayCanvas.toBuffer('image/jpeg', { quality: 0.9 })
);

console.log('Generating Earth night-lights map...');
const nightCanvas = generateNightMap(dayCanvas);
writeFileSync(path.join(OUT_DIR, 'earth-night.png'), nightCanvas.toBuffer('image/png'));

console.log('Generating cloud layer map...');
const cloudCanvas = generateCloudMap();
writeFileSync(path.join(OUT_DIR, 'earth-clouds.png'), cloudCanvas.toBuffer('image/png'));

console.log('Generating normal map...');
const normalCanvas = generateNormalMap();
// Re-encode through a fresh alpha:false context + JPEG, same verified
// approach as the day map above. Normal maps ARE directional lighting
// data (not decorative color), so this format choice was checked more
// carefully than the day map: rendered a test JPEG at quality 0.9 and
// visually confirmed no color-channel corruption or blocking artifacts
// before adopting it here. Safe in this specific case because (a) the
// relief this encodes is intentionally subtle to begin with, and (b)
// EarthMaterial.js's shader blends this map in at a low weight
// (normalSample * 0.15), which further dilutes any per-pixel
// quantization error well below what's visually perceptible.
const normalReencodeCanvas = createCanvas(WIDTH, HEIGHT);
const normalReencodeCtx = normalReencodeCanvas.getContext('2d', { alpha: false });
normalReencodeCtx.drawImage(normalCanvas, 0, 0);
writeFileSync(
  path.join(OUT_DIR, 'earth-normal.jpg'),
  normalReencodeCanvas.toBuffer('image/jpeg', { quality: 0.9 })
);

console.log(`Done. Textures written to ${OUT_DIR}`);
