# Estate Manager Frontend - AI Coding Guidelines

## Project Overview

**Tech Stack:** React 19 + TypeScript + Vite + Redux Toolkit + TanStack Query + Axios

This is a real estate project management dashboard with multi-tenant support. The frontend manages projects, units (plots/buildings/wings/flats), inventory, and labour tracking across estate developments.

## Architecture Layers

### API Layer (`src/api/`)

- **axios.ts**: Configured Axios instance with Bearer token injection via interceptor
- Pattern: All API calls import `api` from axios.ts for authenticated requests
- Base URL: `http://localhost:3000` (update `api.baseURL` when deploying)
- Token storage: `localStorage.getItem("token")` - set during login via [auth.ts](src/api/auth.ts)

**Module-specific API files** (project.ts, building.ts, unit.ts, etc.) export typed async functions that use the configured `api` client:

```typescript
export const getProjects = async () => {
  const res = await api.get("/projects");
  return res.data;
};
```

### State Management

- **Redux (Redux Toolkit)**: [src/store/projectSlice.ts](src/store/projectSlice.ts) - Global state for `currentProjectId`
  - Use typed hooks from [src/store/hooks.ts](src/store/hooks.ts): `useAppDispatch()`, `useAppSelector`
  - Never import `useDispatch`/`useSelector` directly
- **React Query**: Caches API responses; configured in [src/main.tsx](src/main.tsx) with `retry: 1`, `refetchOnWindowFocus: false`
  - Pattern: `useQuery({ queryKey: ["projects"], queryFn: getProjects })`
  - Update Redux state when navigating between projects (see [ProjectsList.tsx](src/pages/projects/ProjectsList.tsx))

### Authentication Flow

- **Token Storage**: [src/auth/auth.storage.ts](src/auth/auth.storage.ts) manages localStorage keys (`estate_token`, `estate_user`)
- **Protected Routes**: [src/router/ProtectedRoute.tsx](src/router/ProtectedRoute.tsx) redirects unauthenticated users to `/login`
- **Login/Signup**: Forms in `src/auth/` save token and dispatch to Redux; axios interceptor auto-attaches tokens

### Router Structure ([src/router/AppRouter.tsx](src/router/AppRouter.tsx))

```
/login, /signup → Auth pages
/dashboard → Protected root
  ├─ /dashboard (overview)
  ├─ /dashboard/inventory (company-wide inventory)
  ├─ /dashboard/projects → ProjectsList
  └─ /dashboard/projects/:projectId → ProjectDashboard
      ├─ /overview → ProjectOverview
      ├─ /units → ProjectUnits (hierarchical: plot→building→wing→flat)
      ├─ /inventory (nested routes for stock/inward/outward/requirements)
      └─ /labour
```

Use `setCurrentProjectId()` Redux action when navigating into a project.

## File Organization Conventions

- **Pages** (`src/pages/`): Route-level components, contain page layout and orchestrate child components
- **Components** (`src/components/`): Reusable UI components (modals, buttons, layouts)
- **API** (`src/api/`): Async functions exporting typed queries (no React hooks here)
- **Auth** (`src/auth/`): Login/Signup pages + localStorage utilities
- **CSS**: Co-located with components (e.g., `inventory.css` next to `InventoryForm.tsx`)
- **Types** (`src/types/unit.ts`): Entity interfaces like `Unit`, `UnitType`, `UnitStatus`

## Key Patterns to Follow

### Data Fetching

1. Import typed API function: `import { getProjects } from "../../api/project"`
2. Use React Query: `const { data = [], isLoading, error } = useQuery({ queryKey: ["projects"], queryFn: getProjects })`
3. Display loading/error states before rendering data

### Component State & Navigation

- Use Redux for cross-component state (e.g., `currentProjectId`)
- Use `useNavigate()` for route changes; pass state via `navigate(..., { state: {...} })`
- Dispatch Redux actions before navigation (e.g., `setCurrentProjectId()`)

### Typing

- Declare API response types near API functions: `export type CreateProjectPayload = {...}`
- Use entity types from `src/types/` (e.g., `Unit`, `UnitType`)
- Avoid `any` types; use discriminated unions for statuses (e.g., `"ACTIVE" | "INACTIVE"`)

### Axios Usage

- Always use the pre-configured `api` client (not `axios.create()`)
- Token injection is automatic; never manually set `Authorization` headers
- Handle errors uniformly; React Query's error state covers most cases

## Build & Development Commands

```bash
npm run dev        # Start Vite dev server on port 5173
npm run build      # TypeScript check + Vite bundle
npm run lint       # ESLint check (no fixes auto-applied)
npm run preview    # Preview production build locally
```

## Common Development Tasks

### Adding a New Page

1. Create component in `src/pages/{feature}/`
2. Add route in [AppRouter.tsx](src/router/AppRouter.tsx) (wrap with `<ProtectedRoute>` if authenticated)
3. If accessing project data: dispatch `setCurrentProjectId()` before navigation

### Adding an API Endpoint

1. Create async function in `src/api/{resource}.ts`
2. Import in component and use with `useQuery()`
3. On mutations: refetch with `queryClient.invalidateQueries({ queryKey: ["resource"] })`

### Hierarchy: Units

The unit type hierarchy is critical:

- **Plot** (parent) → **Building** (parentUnitId = plot.id) → **Wing** (parentUnitId = building.id) → **Flat** (parentUnitId = wing.id)
- Filter children by `parentUnitId`; see [src/pages/projects/units/](src/pages/projects/units/) for examples

## Configuration Files

- [tsconfig.app.json](tsconfig.app.json): App TypeScript settings (strict mode enabled)
- [vite.config.ts](vite.config.ts): Dev server port 5173, React plugin configured
- [eslint.config.js](eslint.config.js): Base ESLint rules; consider enabling type-checked rules for new features

## Known Limitations & Quirks

- Token refresh not implemented; sessions expire silently (backend handles 401s)
- `src/api/http.ts` has malformed syntax; use `src/api/axios.ts` instead
- No global error boundary; add error handling at page level
- Inventory modules have complex nested routing; trace [ProjectInventory.tsx](src/pages/inventory/ProjectInventory.tsx) structure when adding features
