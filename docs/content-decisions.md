# InnerScript Landing Content Decisions

Purpose: preserve approved landing-page copy decisions before changing the live page.

## Approved Manifesto Copy

To whoever is reading this,

Most modern software is built to exploit your attention. Apps flash notifications, gamify basic habits, and mine your deepest memories to sell ads or train corporate base models.

I believe there is room for software that behaves like a quiet study. An archive that is local, completely owned by you, and designed to help you think rather than keep you scrolling.

InnerScript is an exploration of this idea. I am looking for collaborators, system engineers, designers, and testers who want to work on a local-first memory system.

If this resonates with you, let's build this together.

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
- Use both intro directions: "See how a current thought could surface older writing that explains it" and "Watch InnerScript turn a private entry into a grounded reflection question."
- The current `Product Principles` section feels excessive and is archived/commented out for the V3 pass.
- The `Give old notes a usable second life` audience/archive section is archived/commented out for the V3 pass.
- Approved problem copy: "Your old writing already contains emotional curves, recurring fears, repeated habits, and relationship histories. The tragedy is not that you failed to write. The tragedy is that the writing stopped speaking back."

## Signup And Sheet Decisions

- The visible CTA should include an early-bird offer for the first 100 signups.
- Current form wiring posts these fields to Google Apps Script: `email`, `source`, `timestamp`, `userAgent`.
- Use source-based tracking for now: `hero_early_bird` and `collaboration_early_bird`.
- The first-100 cutoff should happen in the Sheet or Apps Script because the static page cannot reliably know how many signups already exist.
- Do not add an `offer` field until the Apps Script and Google Sheet are confirmed to accept the new field.

## 3D Background Decision

- Fix the Three.js background so visible nodes belong to the same connected model as the wireframe.
- Avoid randomly scattered extra nodes that look disconnected from the sphere.
- Use a shared geometry or derived vertex positions so the node layer and line layer visually agree.

## Jung Quote Decision

- Desired quote: "Until you make the unconscious conscious, it will direct your life and you will call it fate."
- Use conservative attribution unless a primary source is found.
- Preferred page wording: "Until you make the unconscious conscious..." with "Often attributed to Carl Jung."
- Secondary attribution seen during planning: Economic Times quote-of-the-day article, July 2026.
