

## Subtrack dashboard and API connection

A responsive dashboard frontend is built with React, TypeScript, Vite and Tailwind CSS v4. During local development, it connects to the backend at `http://127.0.0.1:5500` automatically through the Vite proxy and opens sign-in when there is no valid saved session. Start the backend before signing in. For a deployed frontend, set `VITE_API_URL` to the backend origin at build time. The app appends `/api/v1`. Sign in using the backend's existing email/password authentication. Users without a valid session are sent to the sign-in page.

For cross-origin use, configure Express CORS with the frontend origin and credentials enabled. When HTTPS Preview is embedded across sites, auth cookies generally require `SameSite=None; Secure`. Browser third-party cookie policies may still block cookies. Review the provided backend analysis for route-order, registration-role, profile-ownership and renewal-date issues before production use.

Subscription pages load all API pages for local search and accurate totals. Monthly equivalents normalize daily, weekly, monthly and yearly amounts; currencies are shown separately without assumed exchange rates. The dashboard shows projected recurring costs, not paid transaction history. Upcoming renewals use the `renewalDate` on retrieved records rather than the supplied endpoint, which filters on `startDate` and may be shadowed by Express route order.

The dashboard does not implement payment processing, automatic renewals, reminders, exchange-rate conversion, password recovery, or backend analytics endpoints.
