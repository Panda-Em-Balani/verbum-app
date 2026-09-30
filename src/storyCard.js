import qrcode from "qrcode-generator";
import { SITE_URL, INSTALL_PATH } from "./config.js";
import { shareUrl } from "./share.js";

// 9:16 card sized for Instagram / Facebook / WhatsApp Stories.
export const STORY_W = 1080;
export const STORY_H = 1920;

const SERIF = "Cinzel, 'Times New Roman', Georgia, serif";
const SANS = "Lato, Helvetica, Arial, sans-serif";

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Largest font size (px) at which the verse fits the given box.
function fitVerse(ctx, text, maxWidth, maxHeight) {
  for (let size = 72; size >= 34; size -= 2) {
    ctx.font = `700 ${size}px ${SERIF}`;
    const lines = wrapLines(ctx, text, maxWidth);
    if (lines.length * size * 1.5 <= maxHeight) return { size, lines };
  }
  ctx.font = `700 34px ${SERIF}`;
  return { size: 34, lines: wrapLines(ctx, text, maxWidth) };
}

function spacedText(ctx, text, cx, y, spacing) {
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1);
  let x = cx - total / 2;
  ctx.textAlign = "left";
  [...text].forEach((ch, i) => {
    ctx.fillText(ch, x, y);
    x += widths[i] + spacing;
  });
  ctx.textAlign = "center";
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawQr(ctx, url, x, y, size) {
  const qr = qrcode(0, "M");
  qr.addData(url);
  qr.make();
  const n = qr.getModuleCount();
  const cell = size / n;
  ctx.fillStyle = "#3B1E08";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) ctx.fillRect(x + c * cell, y + r * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }
}

// Renders the verse card to a PNG Blob.
export async function renderStoryCard({ text, ref }) {
  try {
    await Promise.all([document.fonts.load(`700 48px Cinzel`), document.fonts.load(`700 30px Lato`)]);
  } catch {
    // fall back to system fonts
  }
  const canvas = document.createElement("canvas");
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext("2d");
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, STORY_H);
  bg.addColorStop(0, "#8B4513");
  bg.addColorStop(1, "#4A2508");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, STORY_W, STORY_H);
  const glow = ctx.createRadialGradient(STORY_W / 2, 760, 60, STORY_W / 2, 760, 820);
  glow.addColorStop(0, "rgba(218,165,32,0.28)");
  glow.addColorStop(1, "rgba(218,165,32,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  // Brand (kept below the top ~250px that Stories overlays with its own UI)
  const icon = await loadImage("/icon-192.png");
  if (icon) {
    ctx.save();
    roundRect(ctx, STORY_W / 2 - 60, 270, 120, 120, 28);
    ctx.clip();
    ctx.drawImage(icon, STORY_W / 2 - 60, 270, 120, 120);
    ctx.restore();
  }
  ctx.fillStyle = "#F5E6C8";
  ctx.font = `700 52px ${SERIF}`;
  spacedText(ctx, "VERBUM", STORY_W / 2, 470, 16);

  // Verse
  const boxW = 860;
  const top = 560;
  const bottom = 1250;
  const { size, lines } = fitVerse(ctx, `“${text}”`, boxW, bottom - top - 130);
  const blockH = lines.length * size * 1.5;
  const refH = 100;
  let y = top + (bottom - top - blockH - refH) / 2 + size;
  ctx.fillStyle = "#FFF8E7";
  ctx.font = `700 ${size}px ${SERIF}`;
  for (const l of lines) {
    ctx.fillText(l, STORY_W / 2, y);
    y += size * 1.5;
  }
  ctx.fillStyle = "#DAA520";
  ctx.fillRect(STORY_W / 2 - 60, y - size * 0.5 + 10, 120, 4);
  ctx.font = `700 44px ${SERIF}`;
  spacedText(ctx, String(ref).toUpperCase(), STORY_W / 2, y + 60, 6);

  // Install card with QR (kept above the bottom ~270px Stories overlays)
  const cardX = 80, cardY = 1330, cardW = STORY_W - 160, cardH = 300;
  ctx.fillStyle = "#FFF8E7";
  roundRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fill();
  drawQr(ctx, shareUrl("story-qr"), cardX + 40, cardY + 40, 220);
  ctx.textAlign = "left";
  ctx.fillStyle = "#3B1E08";
  ctx.font = `700 46px ${SERIF}`;
  ctx.fillText("Get Verbum free", cardX + 300, cardY + 100);
  ctx.fillStyle = "#5D3A1A";
  ctx.font = `500 30px ${SANS}`;
  ctx.fillText("Daily Scripture & prayer", cardX + 300, cardY + 152);
  ctx.fillText("Scan, or visit:", cardX + 300, cardY + 204);
  ctx.fillStyle = "#B8860B";
  ctx.font = `700 29px ${SANS}`;
  ctx.fillText(`${SITE_URL.replace(/^https?:\/\//, "")}${INSTALL_PATH}`, cardX + 300, cardY + 250, cardW - 330);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("render failed"))), "image/png");
  });
}
