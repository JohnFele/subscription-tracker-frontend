# Subtrack

Build a modern React + TypeScript dashboard with Tailwind CSS v4 for the supplied Express subscription API. Reuse the installed Vite/React starter and its Tailwind v4 plugin. Serve the frontend as static assets; the existing external backend remains responsible for sessions, authorization and persistence. The app requires an authenticated backend session before showing subscription data. Signed-out users are redirected to the dedicated sign-in page.

## Scope and implementation

Provide overview, subscriptions, renewal calendar/list, settings, login/registration and role-aware administration. A typed, centralized REST client uses credentials: include and normalizes data.user/data.userData and error/message responses. Cache only a user ID for session initialization; verify it with GET /users/:id before allowing live protected access. Clear user/records on 401. Fetch every subscription page before deriving full-account analytics and client-side filtering. CRUD forms allow only editable fields; all enums match the supplied backend. Cancel/delete require confirmation. Admin users can manage users and inspect/cancel selected user subscriptions; admins cannot delete themselves. Profile/password changes and deletion use the specified endpoints.

Overview derives monthly equivalents (daily × 365/12, weekly × 52/12, yearly ÷ 12), separates currencies and uses a selectable reporting currency. No invented exchange rates, charge history, reminders, savings comparisons or aggregate endpoints. Renewal views sort actual renewalDate from the complete record collection and do not call the defective upcoming endpoint. A spending visualization is explicitly a projected recurring cost based on records, not paid transactions.

Build responsive, keyboard-accessible interfaces with loading, empty, error and confirmation states. Use Radix dialogs for focus management, Lucide UI icons, and verified Simple Icons assets for service logos. The external backend needs allowlisted credentialed CORS and SameSite=None; Secure cookies for embedded HTTPS Preview. Document known backend issues without attempting unavailable source edits.

## Structure

- client/src/api: typed backend transport and endpoint services.
- client/src/lib: domain types, formatting, dates and analytics.
- client/src/contexts: application data, API connection and real session state.
- client/src/components: navigation shell, charts, tables, service marks and dialogs.
- client/src/pages: overview, subscriptions, renewals, settings, authentication and administration.
- client/src/index.css: Tailwind v4 tokens and shared visual rules.
- client/public: favicon, service logo assets and route manifest.
- README.md: connection and backend compatibility instructions.

## Design directions

1. Botanical Swiss: spacious, warm-neutral personal finance workspace with forest accents (probability 0.07; selected).
2. Technical monochrome: compact graphite surfaces and precise electric-blue controls (probability 0.04).
3. Editorial clay: asymmetric cream panels and terracotta typography (probability 0.06).

## Selected design

**Design Movement:** Botanical Swiss, drawing on Swiss information design and contemporary financial editorial layouts.

**Core Principles:** Quiet hierarchy; transparent, useful numbers; generous breathing room; restrained color used for state and action.

**Color Philosophy:** Warm off-white supports a comfortable working surface, forest green signals control, mint provides calm context, charcoal brings precision. Purple, blue and ochre are reserved for categorical charts.

**Layout Paradigm:** A slim fixed left rail and broad workspace. A horizontal summary band sits above an asymmetric chart-and-renewals split. A full-width subscription table anchors the operational content.

**Signature Elements:** A stacked loop brand mark, soft mint progress chips, inset service tiles and subtly dotted chart guides.

**Interaction Philosophy:** Every control reveals or changes something meaningful. Record actions use focused dialogs and confirmations. Demo/live context is always visible. Search is quick and predictable.

**Animation:** 180ms color and shadow transitions, 220ms dialog fades, a subtle 350ms page entrance; charts animate once without looping. Respect prefers-reduced-motion.

**Typography System:** Plus Jakarta Sans for headings and brand; Inter for interface labels and body. Use tabular numerals for monetary values, modest 13–14px supporting text, 28–30px page titles and 32px summary numbers.

**Brand Essence:** A clear home for every recurring expense, designed for people who want control without a spreadsheet. Calm, precise, approachable.

**Brand Voice:** Direct, reassuring and practical. “A little clarity for your recurring costs.” “Know what’s coming, before it renews.”

**Wordmark & Logo:** A forest square carrying two linked horizontal loops, paired with a tight lowercase wordmark.

**Signature Brand Color:** Evergreen #176B4B.
