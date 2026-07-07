# InnerScript Landing Content Decisions

Purpose: preserve approved landing-page copy decisions before changing the live page.

## Approved Manifesto Copy

Dear reader,

Most modern software is built to exploit your attention. Apps flash notifications, gamify basic habits, and mine your deepest interests.

We believe there is room for software that behaves like a quiet study. An archive that is completely owned by you, and designed to help you think rather than keep you scrolling.

InnerScript is our exploration of this idea. We are looking for collaborators who want to work on a personal memory system.

If this resonates with you, let's build this together.

The InnerScript team

## Copy Rules

- Do not use more than four examples in one statement.
- Exception: more than four examples are allowed only when each example is surprising or increases attention.
- Default example limit exists because Joel loses attention after the third or fourth example, and definitely after the fifth.
- Prefer compact examples like: emotional curves, recurring fears, repeated habits, relationship histories.
- Avoid long list copy like: apple, banana, orange, kiwi, pomegranate.

## Current Content Decisions

- Work on `landing-page-V3` for the next landing content pass.
- The current workspace/demo section should be framed as a concept preview, not a live interactive product.
- Do not call the section `Interactive Workspace` unless the section actually behaves like a real workspace.
- Use `Concept Preview` for the current demo section.
- Simplify the preview intro to: "Write a thought. See what it connects to."
- Show multiple concept-preview treatments as manual tabs so Joel can decide which model is clearest.
- Use five preview variations for the decision pass: Live Recall, Timeline Replay, Source Stack, Pattern Map, and Before / After.
- Keep the variations meaningfully different in layout, not just copy swaps.
- The current `Product Principles` section feels excessive and is archived/commented out for the V3 pass.
- The `Give old notes a usable second life` audience/archive section is archived/commented out for the V3 pass.
- The `Two Loops of Self-Understanding` section is archived/commented out for the V3 pass.
- Approved problem copy: "Your old writing already contains emotional curves, recurring fears, repeated habits, and relationship histories. The tragedy is not that you failed to write. The tragedy is that the writing stopped speaking back. InnerScript brings old entries back as useful context when today's thought needs a longer memory."

## Signup And Sheet Decisions

- The header CTA should say `Early access`.
- The hero form CTA should say `Claim early access` with a footnote: `First 100 signups get the Founder Plan.`
- Current form wiring posts these fields to Google Apps Script: `email`, `source`, `timestamp`, `userAgent`.
- Use source-based tracking for now: `hero_early_bird` and `collaboration_early_bird`.
- The first-100 cutoff should happen in the Sheet or Apps Script because the static page cannot reliably know how many signups already exist.
- Do not add an `offer` field until the Apps Script and Google Sheet are confirmed to accept the new field.

## 3D Background Decision

- Fix the Three.js background so visible nodes belong to the same connected model as the wireframe.
- Avoid randomly scattered extra nodes that look disconnected from the sphere.
- Use a shared geometry or derived vertex positions so the node layer and line layer visually agree.

## Jung Quote Decision

- Removed from the live V3 page.
- Do not show the Jung attribution unless it is re-approved.
- Earlier secondary attribution seen during planning: Economic Times quote-of-the-day article, July 2026.
