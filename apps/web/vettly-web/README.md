# vettly-web

React web frontend for Vettly — the candidate and recruiter portal. Talks to the backend microservices described in the [root README](../../../README.md).

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router v7 (route paths centralized in `src/router/routes.ts`)
- TanStack Query v5 (persisted server-state cache)
- Zustand (client/UI state)
- React Hook Form + Zod (forms & validation)
- Axios (HTTP clients)
- `@microsoft/signalr` (real-time messaging)

## Folder structure

```
src/
├── api/          # Axios clients, one module per backend service (auth, candidate, job, esign, interview, messaging, organization)
├── pages/        # Route-level pages, organized by role: auth/, candidate/, recruiter/, messages/
├── router/        # Route tree (index.tsx) and centralized path constants (routes.ts)
├── stores/        # Zustand stores: auth, theme, nav badges
├── hooks/         # Shared hooks (messaging hub, candidate/nav data)
├── types/         # TypeScript types per domain
├── components/    # Shared UI components
└── utils/         # Formatting and misc helpers
```

## Environment variables

Create a `.env` file in this directory (there is currently no `.env.example` to copy):

```
VITE_AUTH_API_URL=
VITE_CANDIDATE_API_URL=
VITE_JOB_API_URL=
VITE_ORG_API_URL=
VITE_MESSAGING_API_URL=
VITE_ESIGN_API_URL=
VITE_INTERVIEW_API_URL=
```

Point each at the corresponding backend service (see ports in the root README).

## Development

```
npm install
npm run dev       # start dev server
npm run build     # type-check and build for production
npm run lint      # eslint
npm run preview   # preview the production build
```
