// brain.test.mjs — the consolidation law, falsifiable. The load-bearing properties: the κ boundary
// is exact, the warm rescue only flows FROM kept records, forgetting hits the floor, and the fold
// round-trips EVERY state — a brain whose snapshot loses a memory is not a brain.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KAPPA, FLOOR, admit, dream, foldSnapshot, unfoldSnapshot } from './brain.mjs';

test('ADMIT — canonical shape; garbage refuses as itself', () => {
  const a = admit({ id: 'm1', weight: 0.7 });
  assert.deepEqual(a.record, { id: 'm1', weight: 0.7, links: [], topic: '' });
  assert.match(admit(null).why, /must be an object/);
  assert.match(admit({ id: '', weight: 0.5 }).why, /id required/);
  assert.match(admit({ id: 'x', weight: 1.2 }).why, /\[0,1\]/);
  assert.match(admit({ id: 'x', weight: NaN }).why, /\[0,1\]/);
  assert.match(admit({ id: 'x', weight: 0.5, links: ['a', ''] }).why, /list of record ids/);
  assert.match(admit({ id: 'x', weight: 0.5, links: 'a' }).why, /list of record ids/);
  assert.match(admit({ id: 'x', weight: 0.5, topic: 7 }).why, /topic must be a string/);
  assert.match(admit([]).why, /must be an object/, 'an array refuses AS an array, not via a field check');
  assert.match(admit(7).why, /must be an object/, 'a primitive refuses AS a primitive, not via a field check');
  assert.equal(admit({ id: 'x', weight: 0.1234 }).record.weight, 0.123, 'weights live at 3dp');
});

test('DREAM — the κ boundary is exact: 0.618 is kept, 0.617 fades', () => {
  const r = dream([{ id: 'at', weight: 0.618 }, { id: 'under', weight: 0.617 }]);
  assert.deepEqual(r.kept.map((x) => x.id), ['at'], 'weight ≥ κ, inclusive, is consolidation');
  assert.deepEqual(r.faded.map((x) => x.id), ['under']);
  assert.equal(r.faded[0].weight, 0.381, 'fade is weight×κ at 3dp: 0.617×0.618 = 0.381');
  assert.equal(r.kept[0].weight, 0.618, 'kept weight is untouched');
});

test('DREAM — warm rescue flows only FROM kept records', () => {
  const records = [
    { id: 'strong', weight: 0.9, links: ['spared'] },
    { id: 'spared', weight: 0.2 },
    { id: 'weakLinker', weight: 0.3, links: ['notSpared'] },
    { id: 'notSpared', weight: 0.2 },
  ];
  const r = dream(records);
  assert.deepEqual(r.warm.map((x) => x.id), ['spared'], 'linked from a KEPT record → warm');
  assert.equal(r.warm[0].weight, 0.2, 'warm is held unchanged this pass');
  assert.deepEqual(r.faded.map((x) => x.id).sort(), ['notSpared', 'weakLinker'], 'a weak linker rescues nothing');
  // a kept record linking another kept record puts nobody in warm
  const r2 = dream([{ id: 'a', weight: 0.7, links: ['b'] }, { id: 'b', weight: 0.8 }]);
  assert.equal(r2.warm.length, 0);
  assert.equal(r2.kept.length, 2);
});

test('DREAM — the floor: a fade landing below 0.05 is pruned, recorded at the weight it died at', () => {
  // 0.08×0.618 = 0.049 < FLOOR → pruned; 0.081×0.618 = 0.05 ≥ FLOOR → survives
  const r = dream([{ id: 'dies', weight: 0.08 }, { id: 'lives', weight: 0.081 }]);
  assert.deepEqual(r.pruned, [{ id: 'dies', diedAt: 0.049 }]);
  assert.deepEqual(r.faded.map((x) => [x.id, x.weight]), [['lives', 0.05]], 'exactly at the floor survives');
  assert.equal(FLOOR, 0.05); assert.equal(KAPPA, 0.618);
});

test('DREAM — refuses garbage, never mutates, preserves order', () => {
  assert.match(dream('x').why, /must be a list/);
  assert.match(dream([{ id: 'ok', weight: 0.5 }, { id: '', weight: 0.5 }]).why, /id required/);
  assert.match(dream([], 0).why, /kappa/); assert.match(dream([], 1).why, /kappa/);
  const input = [{ id: 'a', weight: 0.3 }];
  dream(input);
  assert.equal(input[0].weight, 0.3, 'input untouched');
  const r = dream([{ id: 'z', weight: 0.9 }, { id: 'a', weight: 0.8 }]);
  assert.deepEqual(r.kept.map((x) => x.id), ['z', 'a'], 'input order, not id order');
});

test('FOLD — lossless round trip, including leading zeros and the empty brain', () => {
  const recs = [{ id: 'a', weight: 0 }, { id: 'b', weight: 0.618 }, { id: 'c', weight: 1 }];
  const f = foldSnapshot(recs);
  assert.ok(f.ok);
  const u = unfoldSnapshot(f.n);
  assert.deepEqual(u.weights, [0, 0.618, 1], 'the leading zero survives — the sentinel carries length');
  assert.equal(foldSnapshot([]).n, '1', 'the empty brain is the sentinel alone');
  assert.deepEqual(unfoldSnapshot('1').weights, [], 'and it unfolds to nothing');
  // the exact arithmetic: [0.5] → 1×1001 + 500 = 1501
  assert.equal(foldSnapshot([{ id: 'x', weight: 0.5 }]).n, '1501');
});

test('FOLD — refusals: junk, missing sentinel, malformed records', () => {
  assert.match(unfoldSnapshot('0').why, /sentinel/);
  assert.match(unfoldSnapshot('abc').why, /decimal integer/);
  assert.match(unfoldSnapshot(42).why, /decimal integer/);
  assert.match(unfoldSnapshot('-5').why, /decimal integer/);
  assert.match(foldSnapshot('x').why, /must be a list/);
  assert.match(foldSnapshot([{ id: 'x', weight: 2 }]).why, /\[0,1\]/);
});

test('THE FUZZ — 300 random brains round-trip exactly; dream never throws on garbage', () => {
  let seed = 42;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let t = 0; t < 300; t++) {
    const n = Math.floor(rnd() * 12);
    const recs = Array.from({ length: n }, (_, i) => ({ id: 'r' + i, weight: Math.round(rnd() * 1000) / 1000 }));
    const u = unfoldSnapshot(foldSnapshot(recs).n);
    assert.deepEqual(u.weights, recs.map((r) => r.weight), 'round trip holds for every state');
  }
  for (const junk of [null, 7, 'x', [{ id: 1 }], [{ id: 'a', weight: 'x' }], [[]], [null]]) {
    const r = dream(junk === null ? junk : junk);
    assert.equal(typeof r.ok, 'boolean', 'dream answers, never throws');
  }
});
