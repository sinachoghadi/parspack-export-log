# Parspack CDN Access Log Explorer

A local dashboard for exploring, filtering, and exporting Parspack CDN access logs for SEO analysis.

The application turns Parspack's access-log API into a focused workflow for people who need to investigate crawler activity and technical SEO issues without repeatedly building requests in Postman or working directly with raw JSON.

## Why I built this

The problem was not access to the data; it was access to the data in a workflow the SEO team could actually use.

Parspack exposes CDN access logs, but recurring SEO investigations often require several steps: selecting the correct domain, isolating crawler requests, checking error responses, inspecting long request metadata, and moving the result into Excel. Asking non-developers to repeat that process through an API client makes otherwise routine analysis unnecessarily technical.

I built this project as a small internal-tool concept: a browser-based interface that keeps the API's capabilities while making the common SEO workflow understandable and repeatable. It is intentionally local-only and does not claim production usage or invented impact metrics.

## Problem

- Raw CDN log records are technical, verbose, and difficult to scan quickly.
- Finding Googlebot or Bingbot traffic manually is slow.
- Investigating 4xx and 5xx responses requires precise, repeatable filtering.
- Long URI and User-Agent values do not fit comfortably in a compact table.
- Postman is useful for development, but not ideal as a recurring SEO-team workflow.
- Analysts need both a quick current-page export and a complete export of every record matching the applied filters.

## Solution

The dashboard provides a guided Parspack connection flow, CDN domain selection, explicit access-log filters, SEO-focused shortcuts, API-backed pagination, request-level inspection, current-page metrics, and two Excel export modes.

The token and active zone are stored only for the current browser session. There is no application database, authentication backend, or server-side job system.

## Key features

- Multi-zone CDN domain selection
- Date-range filtering
- URI filtering
- Status-code filtering with inline validation
- HTTP-method filtering
- User-Agent filtering
- WCDN state filtering
- Ray ID filtering
- Googlebot and Bingbot shortcuts
- `robots.txt`, `sitemap.xml`, and 404 shortcuts
- API-backed (server-side) pagination with 10, 25, 50, or 100 rows per page
- Current-page KPI cards for requests, crawlers, errors, and response time
- Keyboard-accessible log table and responsive request-detail drawer
- Copy actions for URI, User-Agent, remote IP, and Ray ID
- Excel export for the currently loaded page
- Sequential Excel export for all records matching the applied filters
- Export progress, cancellation, and defensive page/record limits
- Session-only token persistence with Change Token and Disconnect flows
- Responsive loading, empty, error, disabled, and toast states

Not included: real-time streaming, user accounts, database persistence, scheduled exports, background jobs, global analytics, or a server-side authentication layer.

## Screenshots

### Dashboard

<!-- Add screenshot: dashboard overview -->

### Filters and SEO quick filters

<!-- Add screenshot: filters and SEO quick filters -->

### Log details

<!-- Add screenshot: log detail drawer -->

### Excel export

<!-- Add screenshot: current-page and full-filtered export flow -->

## Tech stack

| Area | Technology |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4, CSS variables, lightweight internal UI components |
| Server state | TanStack Query 5 |
| Table rendering | TanStack Table 8 |
| Excel generation | SheetJS (`xlsx`) |
| Networking | Native Fetch API with `AbortSignal` support |
| Session state | Browser `sessionStorage` and React context providers |
| Quality checks | ESLint and the Next.js production build |

## Architecture

```text
┌────────────────────────────────────┐
│ UI                                 │
│ Filters · KPIs · Table · Drawer    │
│ Connection controls · Exports      │
└──────────────────┬─────────────────┘
                   │
                   ▼
┌────────────────────────────────────┐
│ React state and providers          │
│ Draft/applied filters · Token      │
│ Active zone · Toasts               │
└──────────────────┬─────────────────┘
                   │
                   ▼
┌────────────────────────────────────┐
│ TanStack Query                     │
│ Caching · cancellation · previous  │
│ page retention · scoped cleanup    │
└──────────────────┬─────────────────┘
                   │
                   ▼
┌────────────────────────────────────┐
│ Parspack service layer             │
│ Zones · access logs · normalization│
│ filter/query construction          │
└──────────────────┬─────────────────┘
                   │
                   ▼
┌────────────────────────────────────┐
│ Typed API client                   │
│ Bearer header · query serialization│
│ response parsing · safe errors     │
└──────────────────┬─────────────────┘
                   │
                   ▼
┌────────────────────────────────────┐
│ Parspack CDN API                   │
└────────────────────────────────────┘
```

### UI and local state

The filter form keeps `draftFilters` separate from `appliedFilters`. Typing remains immediate, but only **Apply filters** changes the API query. This avoids unexpected requests and lets several filter changes be submitted together. Page changes reset appropriately when filters or page size change.

The token, active zone, and toast systems use small React providers. These providers coordinate session restoration, connection changes, cache cleanup, and user feedback without introducing a global state library.

### Server state

TanStack Query owns zone and access-log requests. Query keys contain the zone, a non-secret token version, and normalized query parameters—never the raw token. Previous page data remains visible during background requests so pagination and filter changes do not blank the interface.

Changing or disconnecting a token cancels active Parspack queries and removes only the `['parspack']` cache namespace. Unrelated query data would remain untouched.

### Service and client layers

UI components do not call `fetch` directly. They use `getZones()` and `getAccessLogs()`, which validate and normalize external API data before it reaches the table, drawer, KPI calculations, or export utilities.

The shared client is responsible for:

- building URLs and omitting empty query parameters;
- adding the bearer token to the `Authorization` header;
- parsing JSON and empty responses safely;
- preserving HTTP status information in typed errors;
- forwarding `AbortSignal` cancellation;
- distinguishing API errors from network failures.

## API flow

1. The user enters a Parspack API token in the connection modal.
2. The token is retained in React memory and `sessionStorage` for the current browser session.
3. `GET /zones` loads the CDN zones available to that token.
4. The selected zone UUID is stored for the session and validated against the returned zone list.
5. Access logs are requested from:

   ```text
   GET /zones/{zoneUuid}/report/access-log
   ```

6. Applied filters are serialized as query parameters. Table requests include controlled `page` and `step` values.
7. The response is validated and converted from Parspack field names into the application's typed `AccessLog` model.
8. React Query caches the result and preserves the previous page while a new request is in progress.

The API base URL currently used by the client is:

```text
https://my.parspack.com/cdnapi/external/api/v1
```

## Excel export design

Both export modes reuse the same row transformation, column order, timestamp formatting, worksheet settings, and filename sanitization.

### Current results

- Uses only the records already loaded in the table.
- Makes no additional API request.
- Reflects the current page and current page size.

### All filtered logs

- Snapshots the token, active zone, domain, and applied filters when the export starts.
- Ignores the table's current page and page size.
- Fetches sequentially from page 1 with `step=100`.
- Preserves API pagination order and does not deduplicate records.
- Stops when a page contains fewer than 100 records.
- Reports fetched pages and records without inventing a percentage.
- Supports cancellation through `AbortController`.
- Fails rather than creating a partial workbook if any page request fails.
- Enforces limits of 500 pages and 50,000 records to avoid unbounded browser memory use.

SheetJS is dynamically imported only when an export is requested. The resulting workbook contains one `Access Logs` worksheet with an autofilter and readable column widths.

## Technical decisions

### Explicit Apply instead of automatic search

URI and User-Agent inputs stay responsive, but they do not automatically query while the user types. Because draft input performs no expensive local work, adding a debounce timer would delay state without reducing API traffic. The explicit Apply model is more predictable for a data-heavy dashboard.

### API-backed pagination

The table requests one page at a time and uses the API's supported page sizes. A full returned page is treated as the safe indication that another page may exist because the response currently does not expose reliable total-page metadata.

### Separate fetch and workbook responsibilities

The all-results pagination loop returns normalized `AccessLog[]`. Excel creation is a separate utility. This keeps API failure and cancellation behavior independent from workbook transformation and allows both export modes to share one schema.

### Small internal design system

Buttons, inputs, cards, badges, skeletons, toasts, modal patterns, focus treatment, and color tokens are implemented locally with Tailwind and CSS variables. This keeps the interface consistent without adding a large component or animation framework.

### Honest progress and failure states

The API does not provide a trustworthy total count, so full export reports pages and records rather than a fake completion percentage. A mid-export failure discards the collected in-memory data instead of silently producing an incomplete file.

## Security and privacy notes

- The API token is entered through a password field and is never redisplayed or fingerprinted.
- It is stored only in React memory and `sessionStorage` under `parspack_api_token`.
- The active zone is stored separately under `parspack_active_zone_uuid`.
- Disconnect removes both Parspack session keys, cancels in-flight Parspack queries, and clears their cache entries.
- Changing the token performs the same cache and zone cleanup before loading data for the replacement token.
- The raw token is not included in URLs, query keys, console output, UI messages, filenames, or Excel workbooks.
- The browser sends the token directly to Parspack in the `Authorization: Bearer …` header.
- No fake encryption or reversible obfuscation is used. In a local browser application, the browser owner can inspect network headers in developer tools; the goal is to prevent accidental exposure, not to claim client-side secrecy.
- Access logs may contain sensitive request metadata. Exported workbooks are saved to the user's device and should be handled according to the organization's data policy.

## Accessibility and responsive behavior

- Native inputs, selects, forms, and buttons are used where possible.
- The table is keyboard-operable and rows open details with Enter or Space.
- Token, confirmation, and log-detail dialogs trap focus, support Escape where appropriate, and restore focus on close.
- Status changes use visible text and live regions rather than color alone.
- Loading animations respect reduced-motion preferences.
- Filters and actions stack on small screens, quick filters wrap, and the wide data table scrolls inside its container.
- The detail drawer uses nearly the full mobile width and a fixed-width panel on larger screens.

## Project structure

```text
src/
├── app/                    # App Router entry points and global styles
├── components/
│   ├── auth/               # Token, connection, and disconnect flows
│   ├── layout/             # Dashboard shell, sidebar, and topbar
│   ├── logs/               # Filters, table, drawer, KPIs, and exports
│   ├── ui/                 # Small reusable design-system components
│   └── zones/              # CDN domain selector
├── hooks/                  # TanStack Query hooks
├── lib/
│   ├── export/             # Full-result fetching and XLSX generation
│   └── parspack/           # API client, services, types, and helpers
└── providers/              # Query, token, active-zone, and toast providers
```

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- pnpm 12.9.1 (the version declared in `package.json`)
- A Parspack API token with access to at least one CDN zone
- Browser network access to the Parspack API

No `.env` file, database, or backend service is required.

### Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), enter the API token when prompted, and choose a CDN domain.

### Production build

```bash
pnpm build
pnpm start
```

### Validation

```bash
pnpm lint
pnpm build
```

The repository currently has no automated test script; linting, the production build, and browser workflow checks are the available validation steps.

## Using the dashboard

1. Enter a Parspack API token. The raw token is not shown again.
2. Select a CDN domain if the token has access to multiple zones.
3. Enter filters and choose **Apply filters**, or use an SEO shortcut.
4. Change pages or rows per page to inspect the returned records.
5. Select a table row to open the complete request details.
6. Choose **Export current results** for the loaded page or **Export all filtered logs** for the complete applied result set.
7. Use **Change token** or **Disconnect** from the topbar when the connection needs to change.

## Scope and limitations

- The application runs locally and calls the Parspack API from the browser.
- KPI cards summarize the current table page, not every matching record.
- Full exports are assembled in browser memory and intentionally stop at the configured safety limit.
- Pagination uses the returned page length because reliable total-page metadata is not currently consumed.
- There is no user authentication, token refresh, database, backend proxy, offline mode, real-time stream, or scheduled export system.
- API availability, permissions, rate limits, and browser cross-origin policy remain external constraints.

## Portfolio notes

This project demonstrates more than rendering an API response. It covers the product and engineering decisions required to turn a technical endpoint into an internal tool:

- translating SEO investigation needs into focused filters and shortcuts;
- separating draft form state from server query state;
- validating and normalizing untrusted external data;
- preserving useful UI during background requests;
- designing cancellable, bounded multi-page exports;
- handling token replacement and cache isolation safely;
- building complete loading, empty, error, disabled, responsive, and keyboard states;
- keeping the architecture small enough for the problem instead of introducing a backend or large UI framework without a clear need.
