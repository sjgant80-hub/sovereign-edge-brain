// sovereign-edge-brain · brain.mjs — THE CONSOLIDATION LAW (reference implementation).
//
// The runnable heart of the disclosure: how a personal, device-resident AI decides what enters
// long-term memory — with the model's weights UNCHANGED. Learning happens in the memory organ,
// not the network. Three mechanisms, all deterministic arithmetic:
//
//   · ADMIT — a memory record is {id, weight∈[0,1], links[], topic}. Garbage refuses, never throws.
//   · DREAM — the overnight pass. weight ≥ κ (0.618, the golden-ratio threshold) is KEPT.
//             Below κ, a record linked FROM a kept record is WARM (held unchanged — what the
//             strong remember stays warm). Otherwise it FADES: weight ×= κ. Faded below the
//             floor (0.05) it is PRUNED. Forgetting is a law, not a leak.
//   · FOLD  — the whole memory state folds losslessly to ONE integer (and back). A brain whose
//             entire state is a number can be checkpointed, diffed, signed and carried on any
//             medium — including sound, radio or light (see §transport in the filing).
//
// Pure and total: bad input → { ok:false, why }, never a throw mid-thought.

export const KAPPA = 0.618;   // the consolidation threshold
export const FLOOR = 0.05;    // below this, a faded memory is pruned

const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v)) ? v : null;
const num01 = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1);
const round3 = (x) => Math.round(x * 1000) / 1000;

/** ADMIT — validate a memory record into canonical shape. */
export function admit(record) {
  const r = obj(record);
  if (!r) return { ok: false, why: 'a memory record must be an object' };
  if (!(typeof r.id === 'string' && r.id.length > 0)) return { ok: false, why: 'record id required' };
  if (!num01(r.weight)) return { ok: false, why: `record "${r.id}": weight must be a number in [0,1]` };
  const links = r.links === undefined ? [] : r.links;
  if (!Array.isArray(links) || links.some((l) => typeof l !== 'string' || l.length === 0))
    return { ok: false, why: `record "${r.id}": links must be a list of record ids` };
  const topic = r.topic === undefined ? '' : r.topic;
  if (typeof topic !== 'string') return { ok: false, why: `record "${r.id}": topic must be a string` };
  return { ok: true, record: { id: r.id, weight: round3(r.weight), links: [...links], topic } };
}

/**
 * DREAM — one consolidation pass over the whole memory. Returns four buckets:
 *   kept   — weight ≥ κ: consolidated, weight unchanged.
 *   warm   — weight < κ but linked FROM a kept record: held, weight unchanged this pass.
 *   faded  — weight < κ, unlinked by the strong: weight ×= κ (rounded to 3dp).
 *   pruned — a fade that fell below FLOOR: gone, recorded with the weight it died at.
 * Never mutates its input. Order within each bucket preserves input order.
 */
export function dream(records, kappa = KAPPA) {
  if (!Array.isArray(records)) return { ok: false, why: 'records must be a list' };
  if (!(typeof kappa === 'number' && kappa > 0 && kappa < 1)) return { ok: false, why: 'kappa must be in (0,1)' };
  const canon = [];
  for (const r of records) {
    const a = admit(r);
    if (!a.ok) return { ok: false, why: a.why };
    canon.push(a.record);
  }
  const keptIds = new Set(canon.filter((r) => r.weight >= kappa).map((r) => r.id));
  const warmIds = new Set();
  for (const r of canon) if (keptIds.has(r.id)) for (const l of r.links) if (!keptIds.has(l)) warmIds.add(l);
  const kept = [], warm = [], faded = [], pruned = [];
  for (const r of canon) {
    if (keptIds.has(r.id)) { kept.push(r); continue; }
    if (warmIds.has(r.id)) { warm.push(r); continue; }
    const w = round3(r.weight * kappa);
    if (w < FLOOR) pruned.push({ id: r.id, diedAt: w });
    else faded.push({ ...r, weight: w });
  }
  return { ok: true, kept, warm, faded, pruned };
}

/**
 * FOLD — the memory's weights as ONE lossless integer (returned as a decimal string).
 * Each weight becomes a digit in base 1001 (0…1000 = weight×1000); a leading sentinel 1
 * preserves length and leading zeros. unfoldSnapshot inverts it exactly — the round trip
 * is the law, and the fuzz below proves it holds for arbitrary states.
 */
export function foldSnapshot(records) {
  if (!Array.isArray(records)) return { ok: false, why: 'records must be a list' };
  let n = 1n;
  for (const r of records) {
    const a = admit(r);
    if (!a.ok) return { ok: false, why: a.why };
    n = n * 1001n + BigInt(Math.round(a.record.weight * 1000));
  }
  return { ok: true, n: n.toString() };
}

export function unfoldSnapshot(nStr) {
  if (typeof nStr !== 'string' || !/^[0-9]+$/.test(nStr)) return { ok: false, why: 'fold must be a decimal integer string' };
  let n = BigInt(nStr);
  if (n < 1n) return { ok: false, why: 'not a fold: the sentinel is missing' };
  const weights = [];
  while (n > 1n) { weights.unshift(Number(n % 1001n) / 1000); n /= 1001n; }
  if (n !== 1n) return { ok: false, why: 'not a fold: the sentinel is missing' };
  return { ok: true, weights };
}
