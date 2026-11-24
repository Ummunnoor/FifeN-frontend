# CLAUDE.md — Frontend (TradeNaija Web)

This is the web client for **TradeNaija**, talking to the FifeN .NET 9 backend. The API contract is
documented in [`FRONTEND_PDR.md`](FRONTEND_PDR.md) — **that PDR is the source of truth for every
endpoint, request/response shape, validation rule, and error code.** Read it before adding a feature.

## Tech Stack
- React 19 with TypeScript
- Vite (dev server / build)
- Axios for HTTP communication
- TailwindCSS 4.x for styling
- @heroicons/react for icons
- Zustand for state management

## Architecture
- **Vertical Slice Architecture**: organize by feature, not by type.
- Each feature owns: its page component, API service, types, and child components.

## Project Structure
```
src/
  features/[feature-name]/   # Page, components, service, types for one slice
    [Feature]Page.tsx
    [Feature]Service.ts      # typed API service (see Conventions)
    [feature].types.ts
    components/               # child components local to the feature
  shared/
    components/               # reusable UI (Button, Badge, Pagination, ...)
    hooks/                    # custom hooks (useAuth, useApi)
    lib/api.ts                # single Axios instance + interceptors
    types/                    # shared TypeScript types (PagedResponse, enums, ProblemDetails)
```
Suggested feature slices mirror the backend modules / PDR §2:
`auth`, `discovery`, `product`, `vendor` (onboarding/profile), `listings`, `leads`, `reviews`,
`reports`, `notifications`, `admin-dashboard`, `admin-vendors`, `admin-reports`, `admin-reviews`,
`admin-listings`.

## Conventions
- **Server URL in `.env`** as `VITE_API_URL` (e.g. `VITE_API_URL=https://localhost:5001/api/v1`).
  Never hardcode the base URL; read `import.meta.env.VITE_API_URL`.
- **Typed API service per feature** — components never call Axios directly. A service exposes typed
  functions returning the PDR's DTOs (`Promise<ProductDetail>`, `Promise<PagedResponse<LeadResponse>>`, …).
- **Single Axios instance** in `src/shared/lib/api.ts` with:
  - a request interceptor that attaches `Authorization: Bearer <accessToken>`;
  - a **401 → refresh interceptor**: on 401 (except `/auth/refresh` and `/auth/otp/*`), call
    `POST /auth/refresh` with the stored refresh token, store the rotated tokens, and retry the
    original request **once**. Serialize concurrent refreshes behind one shared promise (the refresh
    token is single-use). If refresh fails, run logout and redirect to `/login`. (PDR §1.4.)
- **State**: Zustand stores only. Auth state (`accessToken`, `refreshToken`, `user` summary) lives in
  a single `useAuthStore`; keep the access token in memory and the refresh token in the most secure
  storage available.
- **Errors**: parse every non-2xx as RFC 7807 `ProblemDetails` (`{ type, title, status, detail,
  traceId, errors? }`). Map the `errors` map (keyed by PascalCase DTO property) to form fields; show
  `detail` otherwise. (PDR §5.)
- **Paging**: `PagedResponse<T>` is `{ items, page, pageSize, total }`. Compute
  `totalPages = Math.ceil(total / pageSize)` client-side — the API does not send a page count.
  (PDR §4.) Note `GET /admin/vendor-requests` returns a plain array, not a `PagedResponse`.
- **Enums** are serialized as their **string names** (PascalCase) — mirror them as TS string-literal
  unions in `shared/types` (PDR Appendix B). Send/expect the exact names.

## Conditional Rendering / Authorization
> **FifeN does not emit HATEOAS `_links`.** Drive show/hide off **JWT claims** and **DTO boolean/enum
> flags**, not response links (PDR §3):
- **Navigation**: gate by the stored `user` summary — `user.isVendor` (vendor area),
  `user.isAdmin` **and** the `amr=mfa` claim (admin area; if admin without MFA, route to MFA enroll).
- **Action buttons**: gate by DTO flags — e.g. `vendorVerified`, `contactedVendor`, lead/listing
  `status`, `isCrossDiscovery`, review authorship + 30-day window, report `status === "Open"`.
- Treat UI gates as cosmetic only — the API re-enforces every rule, so still handle
  `401/403/409/422` on every mutating call.
- Decode the JWT (it's a standard token) to read `amr` and `is_owner` when needed; use the cached
  `user` flags for the common role checks.

## Patterns We Do NOT Use
- Redux, or React Context + hooks for app state (use Zustand).
- CSS modules or styled-components (use TailwindCSS utility classes).
- Default exports — **use named exports** everywhere (components, hooks, services, types).

## Build & Run
```bash
npm ci
npm run dev      # Vite dev server
npm run lint     # ESLint
npm run build    # production build
npm run preview  # serve the build
```
CORS on the backend is pre-configured for `http://localhost:5173` (Vite) and `http://localhost:3000`.

## CI
- GitHub Actions workflow: `.github/workflows/ci.yml`.
- Runs on pushes to `main` and pull requests. It installs dependencies with `npm ci`, runs the linter,
  runs tests when a `test` script is defined, and builds the production bundle.
- npm dependencies are cached using `package-lock.json`. A NuGet package cache is also configured
  for the backend if its .NET project is added to this repository.
- Set the repository Actions variable `VITE_API_URL` to the API base URL used for CI builds. Vite
  embeds `VITE_*` values in the client bundle, so they must not contain secrets. Keep deployment or
  other private credentials in GitHub Actions secrets and expose them only to steps that need them.
- There is currently no test script in `package.json`; add one when frontend tests are introduced.
