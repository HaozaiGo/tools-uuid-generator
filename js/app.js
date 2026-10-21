/* === UUID Generator - App Logic === */

function uiText(en, zh) {
  return document.documentElement.lang.startsWith('zh') ? zh : en;
}

document.addEventListener('DOMContentLoaded', () => {
  initControls();
  generateUUIDs();
});

/* ---- Init ---- */
function initControls() {
  // Range <-> Number sync
  const range = document.getElementById('uuid-count-range');
  const num = document.getElementById('uuid-count');
  range.addEventListener('input', () => { num.value = range.value; });
  num.addEventListener('input', () => { range.value = Math.min(1000, Math.max(1, parseInt(num.value) || 1)); });

  // Auto-generate on option change
  ['uuid-version', 'uuid-count', 'uuid-count-range', 'opt-upper', 'opt-dashes', 'opt-braces', 'opt-quotes', 'opt-commas'].forEach(id => {
    document.getElementById(id).addEventListener('change', generateUUIDs);
  });
}

/* ---- UUID Generation ---- */
function generateUUIDs() {
  const version = document.getElementById('uuid-version').value;
  const count = Math.min(10000, Math.max(1, parseInt(document.getElementById('uuid-count').value) || 1));
  document.getElementById('uuid-count').value = count;
  document.getElementById('uuid-count-range').value = Math.min(1000, count);
  const upper = document.getElementById('opt-upper').checked;
  const dashes = document.getElementById('opt-dashes').checked;
  const braces = document.getElementById('opt-braces').checked;
  const quotes = document.getElementById('opt-quotes').checked;
  const commas = document.getElementById('opt-commas').checked;

  const startTime = performance.now();
  const uuids = [];

  for (let i = 0; i < count; i++) {
    let uuid;
    switch (version) {
      case 'v4': uuid = uuidV4(); break;
      case 'v7': uuid = uuidV7(); break;
      case 'v1': uuid = uuidV1(); break;
    }
    uuids.push(uuid);
  }

  // Format
  let formatted = uuids.map(u => {
    let s = upper ? u.toUpperCase() : u.toLowerCase();
    if (!dashes) s = s.replace(/-/g, '');
    if (braces) s = '{' + s + '}';
    if (quotes) s = '"' + s + '"';
    return s;
  });

  const output = commas ? formatted.join(',\n') : formatted.join('\n');
  document.getElementById('uuid-output').value = output;
  document.getElementById('uuid-count-display').textContent = count;

  const elapsed = ((performance.now() - startTime)).toFixed(2);
  document.getElementById('gen-stats').textContent = `⚡ ${elapsed}ms`;
}

/* ---- UUID v4 (Random) ---- */
function uuidV4() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Set version 4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant to RFC 4122
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return hex(bytes, [4, 2, 2, 2, 6]);
}

/* ---- UUID v7 (Time-ordered) ---- */
function uuidV7() {
  // 48-bit timestamp (milliseconds since epoch)
  const now = Date.now();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Set first 6 bytes to timestamp
  bytes[0] = (now / 0x10000000000) & 0xff;
  bytes[1] = (now / 0x100000000) & 0xff;
  bytes[2] = (now / 0x1000000) & 0xff;
  bytes[3] = (now / 0x10000) & 0xff;
  bytes[4] = (now / 0x100) & 0xff;
  bytes[5] = now & 0xff;

  // Set version 7
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // Set variant
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return hex(bytes, [4, 2, 2, 2, 6]);
}

/* ---- UUID v1 (Timestamp + node) ---- */
let uuidV1ClockSeq = crypto.getRandomValues(new Uint16Array(1))[0] & 0x3fff;
let uuidV1LastTime = 0;
let uuidV1LastTimestamp = 0n;
const uuidV1Node = crypto.getRandomValues(new Uint8Array(6));
uuidV1Node[0] |= 1;

function uuidV1() {
  const bytes = new Uint8Array(16);
  const now = Date.now();
  if (now < uuidV1LastTime) {
    uuidV1ClockSeq = (uuidV1ClockSeq + 1) & 0x3fff;
  }
  uuidV1LastTime = now;

  // RFC 9562: Gregorian epoch ticks require exact 100ns arithmetic.
  let timestamp = BigInt(now) * 10000n + 0x01b21dd213814000n;
  if (timestamp <= uuidV1LastTimestamp) timestamp = uuidV1LastTimestamp + 1n;
  uuidV1LastTimestamp = timestamp;
  const timeHex = timestamp.toString(16).padStart(15, '0');
  const timeLow = parseInt(timeHex.substring(timeHex.length - 8), 16);
  const timeMid = parseInt(timeHex.substring(timeHex.length - 12, timeHex.length - 8), 16);
  const timeHi = parseInt(timeHex.substring(0, timeHex.length - 12), 16) & 0x0fff;

  // Set fields
  bytes[0] = (timeLow >> 24) & 0xff;
  bytes[1] = (timeLow >> 16) & 0xff;
  bytes[2] = (timeLow >> 8) & 0xff;
  bytes[3] = timeLow & 0xff;
  bytes[4] = (timeMid >> 8) & 0xff;
  bytes[5] = timeMid & 0xff;
  bytes[6] = ((timeHi >> 8) & 0x0f) | 0x10; // version 1
  bytes[7] = timeHi & 0xff;

  // Clock sequence
  const clockSeq = uuidV1ClockSeq;
  bytes[8] = ((clockSeq >> 8) & 0x3f) | 0x80; // variant
  bytes[9] = clockSeq & 0xff;

  bytes.set(uuidV1Node, 10);

  return hex(bytes, [4, 2, 2, 2, 6]);
}

/* ---- Hex Formatting ---- */
function hex(bytes, groups) {
  const full = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  let result = '';
  let idx = 0;
  for (let i = 0; i < groups.length; i++) {
    if (i > 0) result += '-';
    result += full.substring(idx, idx + groups[i] * 2);
    idx += groups[i] * 2;
  }
  return result;
}

/* ======== Actions ======== */
async function copyAll() {
  const output = document.getElementById('uuid-output');
  if (!output.value) { showToast(uiText('No content', '没有内容')); return; }
  
  // If commas mode, join properly
  try {
    await navigator.clipboard.writeText(output.value);
    showToast(uiText('Copied', '已复制'));
  } catch {
    showToast(uiText('Copy failed', '复制失败'));
  }
}

function downloadAll() {
  const output = document.getElementById('uuid-output');
  if (!output.value) { showToast(uiText('No content', '没有内容')); return; }

  const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'uuids.txt';
  a.click();
  URL.revokeObjectURL(url);
  showToast(uiText('Downloaded', '已下载'));
}

/* ======== Utility ======== */
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 2000);
}
