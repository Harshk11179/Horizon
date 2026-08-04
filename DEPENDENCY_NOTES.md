# Dependency version notes

A couple of versions in `package.json` are pinned deliberately, not just
"whatever `npm install` grabbed." Documenting the reasoning here so a
future `npm audit fix --force` doesn't undo a considered choice.

## `three` — bumped to `^0.169.0`

`postprocessing@6.36.3+` (a peer of `@react-three/postprocessing`)
requires `three >= 0.168.0`. The originally-considered `^0.165.0` failed
`npm install` outright with an unresolvable `ERESOLVE` peer conflict.
`0.169.0` satisfies every package in the tree (`drei`, `fiber`,
`postprocessing`, `three-stdlib`) without duplication — confirmed via
`npm ls three`, single deduped version throughout except one internal
`stats-gl` sub-dependency on `0.170.0`, which is not a problem since
sub-dependencies of drei don't share the instanceof-sensitive Three.js
context that the top-level app does.

## `react-router-dom` — bumped to `^7.18.2`

Two relevant advisories, back to back:

1. **Open redirect via backslash in `<Link>`/`useNavigate`**
   (affects `6.0.0` – `7.17.0`, fixed in `7.18.2`) — this one DOES apply
   to Declarative Mode (`<BrowserRouter>`, `<Routes>`, `<Route>`), which
   is what this app uses. This is why the bump happened.

2. **RSC Mode CSRF Bypass** (GHSA-qwww-vcr4-c8h2, flagged by
   `npm audit` against `7.18.2` because it also covers `7.12.0`–`8.2.0`)
   — the advisory explicitly states it only affects applications using
   the unstable RSC APIs, and the CVE it follows up on
   (CVE-2026-22030) explicitly states it does NOT impact applications
   using Declarative Mode. This app uses only `<BrowserRouter>` /
   `<Routes>` / `<Route>` with no loaders, actions, or RSC — so this
   advisory does not apply here despite `npm audit` flagging it.

**Do not run `npm audit fix --force` on this package** without
re-reading this note — it will suggest downgrading to `7.11.0`, which
sits inside the open-redirect range (#1) that IS applicable to this
app. That would trade a non-applicable advisory for an applicable one.

If/when this project migrates to `createBrowserRouter` / `RouterProvider`
/ loaders (Data Mode) or adopts RSC, re-evaluate both advisories against
the code paths actually in use at that time.

## `esbuild` / `vite` dev-server advisory — not fixed, left as-is

`npm audit` flags esbuild's dev server as vulnerable to cross-origin
requests reading dev-server responses. This is a **dev-only** exposure
(doesn't ship in `vite build` output) and the fix path
(`vite@8.2.0`) is two majors ahead of what's pinned here. Not taking
that jump without hand-verifying config compatibility first — flagging
for a deliberate follow-up rather than an automatic force-upgrade.

## jspdf (^4.2.1)

Added for the Professional view's "Download PDF Report" button
(`src/utils/generateAssessmentPdf.js`). Chosen over a print-stylesheet
approach because the report needs to be a real downloadable artifact
(attachable to emails, saved into project files) with its own
print-friendly layout, independent of the app's dark neon theme.
Pure client-side — no server round-trip, consistent with the
frontend-only architecture.
