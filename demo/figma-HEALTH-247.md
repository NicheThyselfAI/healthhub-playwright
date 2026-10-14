# Figma Design — HEALTH-247: Book New Appointment

*This file describes the Figma screens for the appointment booking feature.
Used as the design source during Demo 2 — "Figma to PR in 8 minutes."*

---

## Screen 1 — Appointments List Page

**URL**: `/appointments`

**Layout**:
- Page heading: "Appointments" (h1)
- Top-right: "New Appointment" button (primary, blue)
- Table with columns: Title, Type, Date, Time, Duration, Provider, Status, Actions
- Each row has Edit and Delete action buttons
- Search bar above the table: placeholder "Search appointments..."
- Empty state: "No appointments found" when list is empty

**Design notes**:
- "New Appointment" button is always visible regardless of list state
- Status column shows a badge: Scheduled (blue), Completed (green), Cancelled (grey)

---

## Screen 2 — New Appointment Modal

**Trigger**: Click "New Appointment" on Screen 1

**Layout**: Centred modal dialog, scrollable on small screens

### Form fields (top to bottom):

**Row 1** (2 columns):
| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| Title | Text input | ✅ Yes | Placeholder: "e.g., Annual Physical" |
| Type | Dropdown select | No | General, Physical, Mental Health, Follow-up |

**Row 2** (3 columns):
| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| Date | Date picker | ✅ Yes | Must be today or future |
| Time | Time picker | ✅ Yes | 24h format |
| Duration | Dropdown select | No | 15 min, 30 min, 45 min, 1 hour, 1.5 hours. Default: 30 min |

**Row 3** (2 columns):
| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| Provider | Text input | No | Placeholder: "e.g., Dr. Sarah Johnson" |
| Location | Text input | No | Placeholder: "e.g., Main Clinic, Room 204" |

**Full-width fields**:
| Field | Type | Required | Options/Notes |
|-------|------|----------|---------------|
| Description | Textarea (3 rows) | No | Placeholder: "Additional details about this appointment..." |
| Notes | Textarea (2 rows) | No | Placeholder: "Personal notes or reminders..." |

### Modal footer:
- Left: "Cancel" button (outline style)
- Right: "Create Appointment" button (primary, blue)

### Validation states (on submit with empty required fields):
- Title field: red border + error message "Title is required" below
- Date field: red border + "Date is required"
- Time field: red border + "Time is required"

---

## Screen 3 — Success State

**Trigger**: Successful form submission

- Modal closes
- Toast notification appears (top-right): "Appointment created successfully" (green)
- Toast auto-dismisses after 3 seconds
- New appointment row appears at the top of the appointments list
- Row shows the title, selected type, date, time, duration, and status "Scheduled"

---

## Screen 4 — Cancel State

**Trigger**: Click "Cancel" button in the modal

- Modal closes immediately
- No appointment is created
- Appointments list is unchanged

---

## Design tokens (for reference)

- Primary button: `bg-primary-600` (blue)
- Error state: `border-red-500`, `text-red-600`
- Success toast: `bg-green-500`
- Status badge — Scheduled: `bg-blue-100 text-blue-800`
