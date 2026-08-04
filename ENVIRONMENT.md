# Environment Setup

This document describes what's actually required to run this project,
verified against the real environment it was built and tested in — not
just the semver ranges declared in `package.json`.

---

## Required

| Tool | Minimum | Verified against |
|---|---|---|
| Node.js | 18.12+ (see constraint below) | v22.22.2 |
| npm | 9+ | 10.9.7 |

### Node version constraint — read this before installing

`package.json` includes `canvas` as a devDependency (used only by
`scripts/generateTextures.js`, the one-time texture generator — it is
**not** required for `npm run dev` or `npm run build` to work, only
for regenerating the Earth textures from scratch). The installed
`canvas` package declares:

```
"engines": { "node": "^18.12.0 || >= 20.9.0" }
```

This means Node **19.x and 20.0–20.8 are not supported** by `canvas` —
a narrow gap that's easy to land in if you install "Node 20" without
checking the patch version. If you're only running `npm run dev` /
`npm run build` and never touch the texture generator, this
constraint is unlikely to matter in practice, but `npm install` still
needs to build `canvas` successfully since it's a listed
devDependency. If your Node version falls in the unsupported gap,
either upgrade Node or remove `canvas` and `simplex-noise` from
`devDependencies` if you don't plan to regenerate textures (the
pre-generated PNG/JPG files are already committed under
`src/assets/textures/` and don't require `canvas` to load or run).

---

## Verified Resolved Versions

These are the actual versions `npm install` resolved and installed at
last verification — not the semver ranges in `package.json`, which
allow a range. If you install fresh and get slightly different patch
versions within those ranges, that's expected and fine; if you get a
different **major** version, something has changed upstream and
you should compare against `package-lock.json`, which pins exact
versions.

### Runtime dependencies

| Package | Verified version |
|---|---|
| react | 18.3.1 |
| react-dom | 18.3.1 |
| react-router-dom | 7.18.2 |
| three | 0.169.0 |
| @react-three/fiber | 8.18.0 |
| @react-three/drei | 9.122.0 |
| @react-three/postprocessing | 2.19.1 |
| postprocessing | 6.39.4 |
| framer-motion | 11.18.2 |
| gsap | 3.15.0 |
| zustand | 4.5.7 |

### Dev dependencies

| Package | Verified version | Used for |
|---|---|---|
| vite | 5.4.21 | Build tool / dev server |
| tailwindcss | 3.4.19 | Styling |
| canvas | 3.2.3 | Texture generation only (see note above) |
| simplex-noise | 4.0.3 | Texture generation only |

---

## Why `three` is pinned above `^0.165.0`

`postprocessing@6.36.3+` (a peer dependency of
`@react-three/postprocessing`) requires `three >= 0.168.0`. An earlier
version of this project specified `three@^0.165.0`, which failed
`npm install` outright with an unresolvable `ERESOLVE` peer conflict.
`three@^0.169.0` (as currently pinned in `package.json`) satisfies
every package in the dependency tree. Full reasoning, including a
similar note on the `react-router-dom` version, is in
[`DEPENDENCY_NOTES.md`](./DEPENDENCY_NOTES.md) — read that before
running `npm audit fix --force`, which would undo a deliberate,
verified security-tradeoff decision documented there.

---

## Platform Notes

This project was built and verified on:

```
Ubuntu 24.04.4 LTS, x86_64, Node v22.22.2, npm 10.9.7
```

`canvas` is a native-compiled Node module. It installed and ran without
issue in this Linux environment. On other platforms (Windows, macOS),
`canvas` may require platform-specific build tools (Python, a C++
compiler, and platform image libraries like Cairo/Pango) if a
prebuilt binary isn't available for your exact Node version and
architecture — this is a known characteristic of the `canvas` package
generally, not something specific to this project. If `npm install`
fails specifically on `canvas` and you don't need to regenerate
textures, removing it (and `simplex-noise`) from `devDependencies` is
a safe workaround — the pre-generated texture files already committed
to the project do not depend on it.

The application itself (everything under `src/`) is pure browser
JavaScript/React and has no platform-specific requirements once
installed — any OS that can run Node and a modern browser can develop
and build this project.

---

## No Environment Variables Required

This project makes no external network calls, requires no API keys,
and reads no environment variables. `npm install && npm run dev` is
the complete setup — there is no `.env` file to create or configure.

This will change once a real backend is connected (see
[`README.md`](./README.md#future-fastapi-integration-points)) — at
that point, an API base URL will likely need to be introduced as an
environment variable in `src/services/environmentalDataService.js`,
but that does not exist in the current frontend-only build.
