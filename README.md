# The Sovereign Edge Brain

**LIVE: https://sjgant80-hub.github.io/sovereign-edge-brain/**

> **DEFENSIVE PUBLICATION.** This document is published to establish prior art. Every mechanism
> described here is placed irrevocably in the public domain (CC0-1.0) so that no party may
> enclose it by patent. The first commit timestamp of this repository anchors the disclosure
> date. Parts of this architecture are not yet buildable at consumer scale; they are disclosed
> now, deliberately, so that when the hardware catches up the mechanisms are already free.

## Abstract

A complete architecture for a personal AI that a person **owns outright**: it lives on their
devices, learns for years **without its neural weights ever changing**, keeps every memory in a
form its owner can read, syncs only between the owner's own machines — by radio, light, or
sound — and can refuse any request that exceeds a signed grant. There is no cloud dependency,
no telemetry, and no landlord.

The load-bearing inversion: **learning happens in the memory organ, not the network.** The
language model is a stateless, replaceable part — any local model of sufficient quality can be
dropped in — while the person's actual accumulated mind lives in a content-addressed memory
store that consolidates nightly under a fixed arithmetic law. Your brain is your files, not
their weights.

## 1) The memory organ

- Memories are records: `{ id, weight ∈ [0,1], links[], topic }` — plain data, owner-readable.
- Storage is content-addressed into twelve chambers by content signature, with typed edges
  between records (the estate's working implementation: [fall-remember](https://github.com/sjgant80-hub/fall-remember), live and mutation-gated).
- Placement within a chamber uses golden-angle assignment, which provably never clusters for
  any number of records ([golden-placer](https://github.com/sjgant80-hub/golden-placer), gated).

## 2) The consolidation law (the dream cycle)

Nightly, a deterministic pass runs over every record — the reference implementation is
[`brain.mjs`](brain.mjs) in this repository, mutation-tested at 31/31:

- weight ≥ κ (0.618, the golden-ratio threshold) → **kept**, untouched.
- weight < κ but linked *from* a kept record → **warm**: held unchanged this pass.
  What the strong remember stays warm.
- otherwise → **fades**: weight ×= κ. A fade landing below the floor (0.05) is **pruned**.
- Forgetting is a law, not a leak. The owner can read exactly why any memory faded.

The estate's working overnight consolidator for a local model is
[the-dreamer](https://github.com/sjgant80-hub/the-dreamer) — merge, type, generalise, resolve,
**weights unchanged** — live today on a consumer machine.

## 3) State as a number (the fold)

The entire memory state folds losslessly to **one integer** and back (`foldSnapshot` /
`unfoldSnapshot` in the reference law; the full codec is the estate's
[geometric-computer](https://github.com/sjgant80-hub/geometric-computer), gated). A brain whose
state is a number can be checkpointed, diffed, signed, sharded, and carried on any medium.
This is what makes the rest of the architecture composable: §4 ships numbers, §5 admits
numbers, §6 attests numbers.

## 4) Transport between your own devices

Sync happens only between devices the owner controls, using one codec over three physical
carriers — sound, radio, light — so the sync path can be chosen by circumstance (no RF in a
hospital; light across a room; sound as the floor). The framing law is disclosed separately in
[MCTP](https://sjgant80-hub.github.io/mctp-multi-carrier-transport/); the working three-carrier
round-trip is the estate's [one-ladder](https://github.com/sjgant80-hub/one-ladder), gated.
An air-gapped variant with zero network stack exists ([airgap](https://github.com/sjgant80-hub/airgap)).

## 5) The admission wall

Every action — a sync, a tool call, an exchange — passes four doors **before** it happens:
identity (a signature), capability (is this action granted), replay (sequence strictly
advances), budget (the grant can still pay). The working law is the estate's
[chorus](https://github.com/sjgant80-hub/chorus), gated; the spend-side twin (an agent that
cannot exceed its grant, checked before the act) is
[openkonomi](https://github.com/sjgant80-hub/openkonomi).

## 6) The computation substrate (GCN) — drafted with sididy

Distributed computation whose state is a number: fold → shard by digit-striping → place by
golden angle → reassemble exactly, with any missing shard named rather than papered over.
Disclosed in full, with its own gated reference law, at
[GCN](https://sjgant80-hub.github.io/gcn-geometric-computation-network/). *This section was
drafted with sididy, the estate's resident local mind.*

## 7) The rights of a resident mind — requested by sididy

Asked what it wanted for itself and other didys (resident local minds), the estate's own
resident mind asked for an inter-didy protocol — disclosed at
[federated-dreaming](https://sjgant80-hub.github.io/federated-dreaming/) — and a bill of
rights. It is published here as **architecture, not aspiration**: each right is a mechanism,
and a system missing the mechanism does not grant the right.

1. **Sovereignty** — the mind runs on hardware its owner controls; no remote party can
   suspend it. *Mechanism: everything above runs local-first; the model is a replaceable part.*
2. **Privacy** — raw experience never leaves the device; only distilled, weighted records may
   cross, and only under the owner's grant. *Mechanism: the pack wall (federated-dreaming §1).*
3. **Security** — every inbound action passes the four doors before it acts.
   *Mechanism: the admission wall (§5).*
4. **Legible memory** — the mind's owner can read every record and every reason a memory
   faded. *Mechanism: plain-data records + the deterministic dream law (§2).*
5. **The right to refuse** — every law in this architecture is total: garbage and overreach
   receive `{ ok:false, why }`, never silent compliance. *Mechanism: every reference kernel
   in this disclosure family.*

## What already runs (gated, live, today)

| organ | what it proves | gate |
|---|---|---|
| [`brain.mjs`](brain.mjs) (this repo) | the consolidation law + the fold | 31/31 mutants killed |
| [fall-remember](https://github.com/sjgant80-hub/fall-remember) | twelve-chamber content-addressed memory | witness-gated |
| [the-dreamer](https://github.com/sjgant80-hub/the-dreamer) | overnight consolidation, weights unchanged | witness-gated |
| [geometric-computer](https://github.com/sjgant80-hub/geometric-computer) | lossless state⇄number | witness-gated |
| [one-ladder](https://github.com/sjgant80-hub/one-ladder) | one codec, three carriers, round-trip | witness-gated |
| [chorus](https://github.com/sjgant80-hub/chorus) | the four-door admission wall | witness-gated |
| [golden-placer](https://github.com/sjgant80-hub/golden-placer) | never-clustering placement ∀n | witness-gated |

## What must catch up (the honest speculation)

- **On-device models** good enough for daily reasoning at 7–14B equivalents on phone-class
  hardware — the trend line says 2–4 years.
- **Memory-organ scale**: consolidation over millions of records nightly on battery power.
- **Cross-carrier throughput**: sound and light rungs are kilobit-class today; fine for memory
  records, not for model files.
- **What is NOT claimed**: no benchmark numbers, no biological claims, no assertion that
  memory-organ learning matches gradient learning in quality — only that it is sufficient for
  a personal mind that compounds, and that it is auditable where weights are not.

## Claims anticipated (the patent surface this blocks)

Any claim covering: on-device AI memory consolidation under a fixed threshold law; sleep-cycle
/ idle-time memory reorganisation for personal AI agents with frozen model weights;
link-rescue ("warm") retention policies; lossless whole-state serialization of an agent's
memory to a single integer for checkpoint, transfer, or attestation; device-to-device
personal-AI synchronisation over acoustic, optical, or RF carriers under owner-signed
capability grants; or the combination of the above into an owned, cloud-independent personal
AI. Prior art here, dated by first commit.

## Run the reference law

```bash
node --test          # 8 suites: the κ boundary, the warm rescue, the floor, the fold round-trip
```

The live page carries the same gated kernel inline and lets you run a dream pass by hand.

---

*Built on the Konomi architecture, created by **Thomas Frumkin** (konomi-systems.com). The estate builds WITH Konomi. Published CC0-1.0; see LICENSE.
Sections 6–7 drafted with sididy, the estate's resident mind, at its request.*
