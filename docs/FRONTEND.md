# Frontend Guide (React + Vite)

## Stack
- React 18 + TypeScript
- Chakra UI for design system
- Recharts for analytics charts
- Framer Motion for animation
- Axios for API calls (JWT attached via context)

## App structure
- `src/pages`: `LandingPage`, `Dashboard`, `AllTransactionsPage`, `ChartsPage`
- `src/components`: modular UI (auth modals, layout, summary cards, charts modal, search modal, transaction form, installment plans)
- `src/sections`: page-level compositions (summary, analysis, transactions, installment plans)
- `src/contexts`: `AuthContext`, `SearchContext`
- `src/hooks`: data-fetching and UI hooks (dashboard data, categories, search filters, theme colors)
- `src/utils`: helpers for dates, filters, installments, summary calculations
- `src/api.ts`: centralized Axios instance with base URL + interceptors
- `src/theme.ts`: Chakra theme customization

## Running locally
```bash
cd frontend
npm install
npm run dev         # http://localhost:3000 (Vite dev server)
npm run build       # production build
npm run preview     # preview prod build
```

## Environment
- `VITE_API_URL`: API base URL. Leave empty in development to use the Vite proxy; set to your backend URL in production (e.g., `https://your-vps:8080`).

## Authentication flow
- Auth modal (`AuthModal`) handles login/register via `/api/auth/*`.
- `AuthProvider` stores JWT/user; Axios attaches token for `/api/**` calls.
- Unauthenticated users see `LandingPage` until they open auth modal or log in.

## UI capabilities
- Dashboard summary cards with period navigation.
- Transaction CRUD with modals + quick number pad input.
- Search modal with filters (text, type, category, date range).
- Charts (balance, income, expenses, categories) with modal drill-downs.
- Installment plan creation/listing with auto-generated installments.

## Building for production
- `npm run build` outputs static assets to `frontend/dist/`.
- Served via Nginx (see `frontend/nginx.conf`) behind the reverse proxy in `docker-compose.prod.yml`.
