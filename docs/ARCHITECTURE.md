# Architecture

## System Overview

GymLogger is a single Expo Router application for iPhone. It has no server, network API, authentication, or cloud synchronization. SQLite stores the schedule, exercises, workout history, and app settings on the device. AsyncStorage stores only the current unfinished workout draft.

The three tabs are:

- Workout: `app/(tabs)/index.tsx`
- Schedule: `app/(tabs)/schedule.tsx`
- History: `app/(tabs)/history.tsx`

Route files own screen selection and coordinate persistence. Feature presentation is grouped under the matching `components/*Tab/` directory. SQL and persisted calculations live under `database/`.

## Startup

`app/_layout.tsx` prevents automatic splash dismissal and runs `setupDatabase()` before mounting the provider and router tree. Setup:

1. Opens `gymLogger.db` and enables SQLite foreign keys.
2. Creates the `day`, `exercise`, and `log` tables when absent.
3. Seeds weekday IDs `0` through `4`.
4. Removes any orphan logs left by older versions that did not enable foreign keys.
5. Mounts `DayProvider` and navigation, then hides the splash screen.

`DayProvider` loads `restDaysMask` from `app_settings`. It recomputes the current local weekday when the app becomes active. Rest-day changes are disabled until settings load and while a setting write is in progress.

## State Boundaries

- React local state controls each screen's current selection and edit form.
- `DayContext` owns the current weekday and weekday rest mask.
- AsyncStorage key `dayLog` owns the unfinished workout draft.
- SQLite owns durable schedules, current exercise weights, settings, and workout history.
- `useFocusEffect` reloads tab data and resets each tab's local drill-down state.

The workout draft shape is:

```ts
interface WorkoutDraft {
  date: string; // local YYYY-MM-DD
  dayId: number;
  logs: DayLogs;
}
```

A draft is restored only when both its local date and weekday match the current workout. Older draft formats and stale drafts are removed rather than applied to another day.

## SQLite Model

### `day`

- `id`: Monday `0` through Friday `4`.
- `name`: unique weekday name.

### `exercise`

- Belongs to one `day`; deleting a day cascades to its exercises.
- `orderNum` is constrained to one of five schedule slots.
- Stores name, one-limb flag, current weight, and progression increment.

### `log`

- Belongs to one `exercise`; deleting an exercise intentionally deletes its history.
- `setNum` is constrained to `1` through `3`.
- `isLeft` is null for a shared bilateral set, `1` for left, and `0` for right.
- Stores reps, the historical weight used for that workout, and a UTC timestamp.

### `app_settings`

- Key/value storage for app-level preferences.
- Currently stores `restDaysMask`, where each Monday-Friday ID is its bit position.

Table creation uses `CREATE TABLE IF NOT EXISTS`; it is initialization, not schema migration. Existing installations need an explicit upgrade strategy for future schema changes.

## Main Flows

### Schedule

Schedule loads weekdays in ID order and displays five exercise slots per weekday. Add and update operations require a trimmed non-empty name and finite, non-negative weight and increment. Exercise deletion explicitly includes all associated history because foreign-key cascades are enabled.

A long press on a weekday toggles its rest status. The UI includes visible instructions for this interaction. Weekends are always rest days and are not stored in the weekday mask.

### Workout

Workout resolves the current local weekday, loads that day's exercise slots, and restores only a matching draft. Rep edits update the draft under `dayLog`.

An exercise becomes touched when any applicable input has a value. Saving requires all three shared sets for a bilateral exercise or all three left and three right sets for a one-limb exercise. Untouched exercises are ignored. Empty or incomplete saves retain the draft and show a message.

`insertDayLogs()` uses one exclusive SQLite transaction. It inserts all sets using the exercise's pre-progression weight and increments the future exercise weight only when every applicable set is exactly 10 reps. A failed transaction changes neither logs nor weight. The UI disables Save during the transaction, clears the draft only after success, and then shows completion feedback.

### History And Progress

History drills down from weeks to weekdays, exercises, and sets. Persisted set reps can be edited or the selected workout entry can be deleted.

Timestamps are written as UTC ISO strings. All user-facing grouping and filtering converts them to local calendar dates first. Weeks begin on Monday, including Sundays, which belong to the preceding Monday. Week, day, exercise, set detail, and progress queries therefore use the same local-date convention.

Weekly volume is `reps * logged weight`. One-limb exercises keep separate left and right totals. Progress displays the most recent five Monday-starting weeks, with missing weeks represented as chart gaps.

## Directory Map

```text
app/                    Route composition and screen state
components/             Shared UI and tab-specific presentation
constants/              Theme values
context/                Current day and rest-day state
database/               Schema, queries, types, and progress calculations
database/__tests__/     Pure date, volume, and dataset tests
hooks/                  Shared React hooks
assets/                 Packaged iPhone images
```

## Runtime And Release

`app.json` contains the EAS project ID, update URL, and a fingerprint runtime policy. Native dependency changes produce a new runtime fingerprint, so a compatible iPhone build must exist before an update is published. There is no `eas.json` and no repository deployment automation. The app is configured for iPhone only and does not claim web support.

The intended Git default branch and EAS Update branch are both named `dev`, but they are independent: renaming one does not rename the other. Publishing remains an explicit external action.
