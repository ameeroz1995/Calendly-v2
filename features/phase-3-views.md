# Phase 3: Views — UI Layer

## Goal
13 view templates. Each exports `template({ state, fn })` returning HTML string via `html` tagged template literal. Views call services, never RTDB directly. All use calendly-design tokens + ui-designer rules.

## View Pattern (every view follows this)

```js
import { html } from '../controller.js'
import * as SomeService from '../services/some.service.js'

export function someView({ state, fn }) {
  // Loading state
  if (state.loading) return html`<div id="some-view" class="...">loading skeleton</div>`

  // Empty state
  if (!state.data?.length) return html`<div id="some-view" class="...">empty state</div>`

  // Error state
  if (state.error) return html`<div id="some-view" class="...">error banner</div>`

  // Normal render
  return html`
    <div id="some-view" class="max-w-[992px] mx-auto p-6">
      <!-- content using calendly-design tokens -->
    </div>
  `
}
```

## Design Token Reference (apply consistently)

| Token | Tailwind | Notes |
|-------|----------|-------|
| Background | `bg-white` | Page bg |
| Surface | `bg-[#f0f3f8]` | Cards, panels |
| Text primary | `text-[#0a0a0a]` | Headings, body |
| Text muted | `text-[#0b3558]` | Captions, placeholders |
| Accent | `text-[#004eba]`, `bg-[#004eba]` | CTAs, links, focus rings |
| Border | `border-[#272727]` | Dividers, card borders |
| Font heading | `font-['Geist']` | Headings |
| Font body | `font-['gilroy']` | Body text |
| Radius default | `rounded-[10px]` | Cards, buttons, inputs |
| Spacing | `p-4`=16px, `gap-4`=16px, `p-6`=24px | 4px grid |
| Focus ring | `focus:ring-2 focus:ring-[#004eba]` | Inputs, buttons |

## View States (every view must handle)

1. **Loading**: Skeleton/pulse animation while data fetches
2. **Empty**: Friendly message when no data exists (e.g., "No event types yet. Create your first one!")
3. **Error**: Error banner with retry button
4. **Normal**: Data rendered
5. **Action-in-progress**: Button disabled + spinner during save/delete

## Mobile rules (every view)
- No horizontal scroll at 320px
- Touch targets ≥ 44×44px with ≥ 8px gaps
- Single-column forms below 768px
- Primary CTA in bottom thumb zone on mobile
- Body text ≥ 16px

## Views

### task-015: `login.js`
- **States**: loading, unauthenticated, authenticated (redirect message)
- **Layout**: Centered card (max-w-sm, mx-auto, mt-20). Branding: "Calendly" with heading 1. Google sign-in button (white bg, border, Google "G" icon + "Continue with Google"). Below: "Powered by Firebase" muted text.
- **Actions**: `onclick="${fn.signIn}"` calls `auth.signInWithGoogle()`

### task-016: `dashboard.js`
- **States**: loading (4 skeleton cards), loaded, empty, error
- **Layout**: Top: welcome message + date. 4 KPI cards in 2×2 grid (bookings today, pending, revenue, active workspaces). Below: "Recent Bookings" list (last 5) with status badges. Quick action buttons.
- **Data**: Fetched via service calls in `onRender` or via controller methods

### task-017: `calendar-connections.js`
- **States**: loading, connected (list), empty (no connections), syncing
- **Layout**: Header "Calendar Connections" + "Connect" button. Connection cards: provider icon (Google colored, Microsoft blue), email, "Last synced: X min ago", status dot (green=active, yellow=expiring, red=expired), "Sync Now" + "Disconnect" buttons.
- **OAuth**: Connect button opens Google/Microsoft OAuth window. Callback handled by service.

### task-018: `event-types.js`
- **States**: loading, loaded (card grid), empty, creating (inline form), editing
- **Layout**: Header + "New Event Type" button (accent bg). Card grid (2-3 columns). Each card: color dot, title, duration + price on one line, active toggle switch. Click card → inline edit form expands. Delete button with confirmation dialog.
- **Form fields**: title (input), duration (select: 15/30/45/60/90/120), price (number + currency select), requiresPhi (toggle), color (6 preset swatches), active (toggle)

### task-019: `availability.js`
- **States**: loading, loaded, saving
- **Layout**: Two-panel on desktop, stacked on mobile. Left: Month calendar grid (7 cols). Day cells show dot indicators (green=has free slots, gray=no slots, red=fully booked). Click day → right panel shows time slots. Working hours editor below calendar: per-day start/end time selects. Booking rules: number inputs for max/day, min notice, max advance, buffer.
- **Quick action**: "Copy booking link" button copies `/book/{hostId}/{eventTypeId}` to clipboard

### task-020: `booking.js`
- **States**: loading, date_select, slot_select, form, confirm, success, error, password_gate, slot_taken
- **Layout**: Multi-step wizard with progress indicator (dots + labels: Date → Time → Details → Confirm → Done). Max-w-lg centered card.
- **Step 1 (Date)**: Date list/carousel showing next 14 days. Disabled dates (no slots) grayed out.
- **Step 2 (Time)**: Time slots as selectable buttons in grid. Shows timezone. "X slots available".
- **Step 3 (Form)**: Invitee name + email inputs. Custom fields from event type (text, dropdown, checkbox). Validation on "Continue".
- **Step 4 (Confirm)**: Summary card: event name, date, time, invitee info. "Confirm Booking" button.
- **Step 5 (Success)**: Checkmark animation. "You're booked!" with booking details. "Add to Calendar" link (Google/Outlook/iCal).

### task-021: `routing-forms.js`
- **States**: loading, list, building, preview, saving
- **Layout**: Form list with "New Form" button. Builder view: title input, questions list (add button, drag handle, type selector, label input, options for dropdown/checkbox). Routing rules: "If [question] equals [value] → assign to [pool]" rule rows. Preview button → simulated form fill.

### task-022: `pools.js`
- **States**: loading, list, detail, editing
- **Layout**: Pool cards in list. Click → expand to show members. Each member: name, priority badge (High/Medium/Low as #), current assignment count. "Add Member" search input (searches users). Strategy toggle: Round Robin / Collective. Remove member with confirmation.

### task-023: `workspace.js`
- **States**: loading, loaded, timer_running, timer_paused
- **Layout**: Header: booking title + date + client name. Three-column on desktop, stacked on mobile. Column 1: Task checklist (add input, task list with checkboxes). Column 2: Timer (large elapsed display, start/pause/stop buttons). Column 3: Messages (thread list, compose input). Bottom: Billing summary card (hours × rate = amount).
- **Timer**: If running, elapsed updates every second via controller interval.

### task-024: `billing.js`
- **States**: loading, loaded, empty
- **Layout**: Filter bar (All / Pending / Paid / Overdue). Invoice list as table (desktop) or cards (mobile). Columns: workspace, amount, status badge, date, actions. Summary card at top: Total Billed / Total Collected / Outstanding.

### task-025: `compliance.js`
- **States**: loading, baa_unsigned, baa_signed, saving
- **Layout**: BAA card: status banner (green signed / yellow unsigned), sign button (if unsigned), "Download BAA" link (if signed), signed date + IP. PHI settings: encryption status indicator, notification masking toggle with explanation. Data retention policy text.

### task-026: `webhooks.js`
- **States**: loading, loaded, adding, testing
- **Layout**: Subscription list as cards. Each: URL (truncated), event badges, created date, test button, delete button. "Add Webhook" form: URL input, event checkboxes (invitee.created, invitee.canceled, routing.submitted), "Subscribe" button. Test result shows response status + body.

### task-027: `api-keys.js`
- **States**: loading, loaded, generating, key_revealed
- **Layout**: Key list as cards. Each: name, prefix (e.g., `cal_live_...`), scope badges, created, last used relative time. "Generate New Key" button → form (name, scope checkboxes: read/bookings, write/bookings, read/workspaces, admin) → submit → one-time reveal modal with copy button + red warning text. Revoke with confirmation dialog.
