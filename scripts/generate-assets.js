import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const ASSETS_DIR = path.resolve('assets');
const ANDROID_RES_DIR = path.resolve('android/app/src/main/res');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// 1. Base SVG source
const svgContent = fs.readFileSync('public/assets/lovychat-logo.svg', 'utf8');

// Render full logo (1024x1024)
const resvgFull = new Resvg(svgContent, {
  fitTo: { mode: 'width', value: 1024 }
});
const fullIconPng = resvgFull.render().asPng();

fs.writeFileSync(path.join(ASSETS_DIR, 'icon.png'), fullIconPng);
fs.writeFileSync(path.join(ASSETS_DIR, 'icon-only.png'), fullIconPng);
fs.writeFileSync(path.join(ASSETS_DIR, 'logo.png'), fullIconPng);
console.log('✔ Generated assets/icon.png & assets/icon-only.png (1024x1024)');

// 2. Background SVG for Adaptive Icon (1024x1024 gradient)
const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D285" />
      <stop offset="35%" stop-color="#00BA71" />
      <stop offset="70%" stop-color="#019154" />
      <stop offset="100%" stop-color="#016238" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bgGrad)" />
</svg>`;

const resvgBg = new Resvg(bgSvg, { fitTo: { mode: 'width', value: 1024 } });
const bgPng = resvgBg.render().asPng();
fs.writeFileSync(path.join(ASSETS_DIR, 'icon-background.png'), bgPng);
console.log('✔ Generated assets/icon-background.png (1024x1024)');

// 3. Foreground SVG for Adaptive Icon (Transparent background, centered chat bubble + heart within safe zone)
const fgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1024" height="1024">
  <defs>
    <linearGradient id="heartGrad" x1="20%" y1="10%" x2="80%" y2="90%">
      <stop offset="0%" stop-color="#027D4C" />
      <stop offset="50%" stop-color="#015D37" />
      <stop offset="100%" stop-color="#014327" />
    </linearGradient>
    <filter id="bubbleDropShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#013A20" flood-opacity="0.3" />
    </filter>
    <filter id="heartShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#012B18" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Scaled slightly to fit comfortably inside the 66% circular safe zone of Android adaptive icons -->
  <g transform="translate(256, 256) scale(0.72) translate(-256, -256)">
    <!-- Main Bubble -->
    <g filter="url(#bubbleDropShadow)">
      <path d="M 256 160
               C 336 160 415 186 415 272
               C 415 348 350 382 288 382
               C 264 382 238 376 216 388
               L 174 416
               C 161 425 148 418 148 402
               L 148 372
               C 112 355 95 318 95 272
               C 95 186 176 160 256 160 Z"
            fill="#FFFFFF" />
    </g>

    <!-- Heart inside Bubble -->
    <g filter="url(#heartShadow)">
      <path d="M 256 338
               C 250 338 214 308 178 268
               C 142 228 125 198 126 166
               C 127 132 153 112 186 112
               C 215 112 242 129 256 150
               C 270 129 297 112 326 112
               C 359 112 385 132 386 166
               C 387 198 370 228 334 268
               C 298 308 262 338 256 338 Z"
            transform="translate(256, 248) scale(0.68) translate(-256, -225)"
            fill="url(#heartGrad)" />
      
      <!-- Heart Gloss Highlight -->
      <path d="M 216 195
               C 210 205 210 222 215 236
               C 217 240 214 245 209 243
               C 204 241 201 234 199 226
               C 196 212 198 198 206 189
               C 210 184 218 188 216 195 Z"
            fill="#FFFFFF" opacity="0.92" />
    </g>
  </g>
</svg>`;

const resvgFg = new Resvg(fgSvg, { fitTo: { mode: 'width', value: 1024 } });
const fgPng = resvgFg.render().asPng();
fs.writeFileSync(path.join(ASSETS_DIR, 'icon-foreground.png'), fgPng);
console.log('✔ Generated assets/icon-foreground.png (1024x1024)');

// 4. Splash Screen (2732x2732)
async function generateSplash() {
  const splashBg = await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: { r: 248, g: 250, b: 252, alpha: 1 } // #F8FAFC clean light canvas
    }
  }).png().toBuffer();

  // Resize full logo to 512x512 for center of splash
  const centerLogo = await sharp(fullIconPng).resize(512, 512).toBuffer();

  const splashPng = await sharp(splashBg)
    .composite([
      { input: centerLogo, gravity: 'center' }
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(ASSETS_DIR, 'splash.png'), splashPng);

  // Dark splash screen
  const darkSplashBg = await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // #0F172A slate-900
    }
  }).png().toBuffer();

  const darkSplashPng = await sharp(darkSplashBg)
    .composite([
      { input: centerLogo, gravity: 'center' }
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(ASSETS_DIR, 'splash-dark.png'), darkSplashPng);
  console.log('✔ Generated assets/splash.png & assets/splash-dark.png (2732x2732)');
}

// 5. Generate Android Native Mipmaps directly into android/app/src/main/res
async function generateAndroidMipmaps() {
  if (!fs.existsSync(ANDROID_RES_DIR)) return;

  const mipmaps = [
    { dir: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 },
  ];

  for (const m of mipmaps) {
    const targetDir = path.join(ANDROID_RES_DIR, m.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // ic_launcher.png (Squircle icon)
    const iconResized = await sharp(fullIconPng).resize(m.iconSize, m.iconSize).png().toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), iconResized);

    // ic_launcher_round.png (Circular masked icon)
    const circleSvg = Buffer.from(
      `<svg><circle cx="${m.iconSize / 2}" cy="${m.iconSize / 2}" r="${m.iconSize / 2}" fill="#fff" /></svg>`
    );
    const roundIcon = await sharp(iconResized)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), roundIcon);

    // ic_launcher_foreground.png (Adaptive icon foreground)
    const fgResized = await sharp(fgPng).resize(m.fgSize, m.fgSize).png().toBuffer();
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), fgResized);

    console.log(`✔ Generated icons in ${m.dir}`);
  }

  // Update ic_launcher_background color
  const colorXmlPath = path.join(ANDROID_RES_DIR, 'values/ic_launcher_background.xml');
  if (fs.existsSync(colorXmlPath)) {
    fs.writeFileSync(colorXmlPath, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#016238</color>
</resources>
`);
    console.log('✔ Updated ic_launcher_background to LovyChat Emerald (#016238)');
  }
}

async function run() {
  await generateSplash();
  await generateAndroidMipmaps();
  console.log('\nAll Capacitor and Android assets generated successfully!');
}

run().catch(console.error);
