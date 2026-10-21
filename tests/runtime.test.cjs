const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');
function app() {
  const context = vm.createContext({crypto, document: {addEventListener() {}}});
  vm.runInContext(source, context); return context;
}
function ticks(uuid) {
  const [low, mid, high] = uuid.split('-');
  return BigInt('0x' + high.slice(1) + mid + low);
}
test('v1 uses current Gregorian ticks, random multicast node and unique sub-ms ticks', () => {
  const c = app(), before = Date.now();
  const ids = Array.from({length:10000}, () => c.uuidV1());
  assert.equal(new Set(ids).size, ids.length);
  const ms = Number((ticks(ids[0]) - 0x01b21dd213814000n) / 10000n);
  assert.ok(ms >= before && ms <= Date.now());
  assert.ok(parseInt(ids[0].split('-')[4].slice(0,2),16) & 1);
  assert.ok(ticks(ids[9999]) > ticks(ids[0]));
  assert.notEqual(app().uuidV1().split('-')[4], ids[0].split('-')[4]);
});
test('v4/v7 versions, variant, uniqueness and v7 timestamp', () => {
  const c = app();
  for (const version of [4, 7]) {
    const ids = Array.from({length:1000}, () => c['uuidV'+version]());
    assert.equal(new Set(ids).size, 1000);
    for (const id of ids) assert.match(id, new RegExp(`^[0-9a-f]{8}-[0-9a-f]{4}-${version}[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`));
    if (version === 7) assert.ok(Math.abs(parseInt(ids[0].replaceAll('-','').slice(0,12),16) - Date.now()) < 1000);
  }
});
