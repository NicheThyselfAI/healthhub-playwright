# HEALTH-247 — Patient can book a new appointment

**Type**: Story
**Priority**: High
**Component**: Appointments
**Sprint**: Sprint 14
**Reporter**: Product Owner
**Status**: Ready for Testing

---

## User Story

As a **patient**, I want to **book a new appointment through the appointments page** so that I can **schedule time with my healthcare provider**.

---

## Acceptance Criteria

**AC1 — Navigate to appointments**
- Given I am logged in as a patient
- When I navigate to the Appointments page via the sidebar
- Then I see the appointments list and a "New Appointment" button

**AC2 — Open booking form**
- Given I am on the Appointments page
- When I click "New Appointment"
- Then a modal dialog opens with the appointment booking form

**AC3 — Required fields validated**
- Given the booking form is open
- When I submit the form without filling in Title, Date, or Time
- Then I see inline validation errors for each missing required field
- And the form is not submitted

**AC4 — Successfully book an appointment**
- Given the booking form is open
- When I fill in Title, Date (future date), Time, and Type
- And I click "Create Appointment"
- Then the modal closes
- And I see a success toast "Appointment created successfully"
- And the new appointment appears in the appointments list

**AC5 — Appointment type options**
- The Type field must offer: General, Physical, Mental Health, Follow-up

**AC6 — Duration options**
- The Duration field must offer: 15 min, 30 min, 45 min, 1 hour, 1.5 hours
- Default duration is 30 minutes

**AC7 — Cancel booking**
- Given the booking form is open
- When I click "Cancel"
- Then the modal closes without creating an appointment

---

## Out of Scope (this story)

- Recurring appointments
- Doctor availability checking
- Email confirmation
- Editing or cancelling existing appointments (separate stories)

---

## Test Data Notes

- Use a future date to avoid validation errors on the date field
- Title must be non-empty and at most 100 characters
- Provider name and Location are optional fields
