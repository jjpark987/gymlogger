# Repository Guide

## Scope

- GymLogger is a small, offline iPhone app built with Expo SDK 54, React Native, React, Expo Router, and strict TypeScript.
- There is no backend, API, authentication, account system, or cloud sync. Do not add assumptions about them without an explicit task.
- SQLite is the durable source of truth. AsyncStorage contains only the unfinished workout draft.
- Use npm and preserve `package-lock.json`. All direct dependencies in `package.json` are intentionally pinned to exact versions.
- The README is intentionally minimal. Keep it that way unless a task explicitly requests README changes.

## Source Map

- `app/`: Expo Router routes, screen state, and feature coordination.
- `components/workoutTab/`, `components/scheduleTab/`, `components/historyTab/`: tab-specific presentation.
- `components/`: shared presentation and navigation primitives.
- `context/DayContext.tsx`: current local weekday and rest-day preferences.
- `database/`: SQLite setup, queries, persisted types, and progress calculations.
- `constants/` and `hooks/`: shared theme values and hooks.
- `app.json`: Expo runtime and EAS Update configuration.
- `docs/ARCHITECTURE.md`: data flows, schema, and domain invariants.

Keep SQL and SQLite access in `database/`. Route files should coordinate exported database functions rather than embedding SQL. Keep shared database shapes in `database/types.ts`, and preserve the `@/` root import alias.

## Commands

```sh
npm install
npm start
npm run lint
npm run format
npm run typecheck
npm test
npm run expo:check
npm run check
```

- `lint`, `format`, `typecheck`, `test`, and `expo:check` are non-mutating checks.
- Use `npm run lint:fix` or `npm run format:write` only when changes are intended.
- `npm run check` runs the full repository check sequence.
- For Expo configuration changes, also run `npx expo config --type public` and an iOS export outside the repository.

## Repository Boundaries

- Ignore `.kilo/`, `.expo/`, `dist/`, and `node_modules/` as source. `.kilo/` may contain duplicate checkouts that must not be searched or tested as part of this checkout.
- Do not manually edit generated Expo types. `.expo/types/**/*.ts` remains included for typed routes.
- This repository targets iPhone. Do not describe Android or web as supported from dependency or framework capability alone.
- Do not publish EAS updates, change the EAS project ID, or change app/runtime versions unless explicitly requested. The intended Git and EAS Update branch is `dev`; those branches remain independent service-side resources.

## Domain Invariants

- Weekday IDs are `0` through `4` for Monday through Friday.
- Saturday and Sunday are always rest days. `restDaysMask` uses weekday ID as its bit position.
- Each weekday has five exercise slots. `exercise.orderNum` is `1` through `5`.
- Each exercise has three sets. `log.setNum` is `1` through `3`.
- `isOneArm` is the stored/internal name; the UI calls this "one limb."
- Bilateral exercises store three shared set values. One-limb exercises store three left and three right values.
- A touched exercise must have every applicable set completed before a workout can be saved. Untouched exercises do not block saving.
- Automatic progression occurs only when every applicable set is exactly 10 reps.
- Logs preserve the weight used at logging time; progression changes only the exercise's future weight.
- Workout save inserts and progression updates belong in one exclusive SQLite transaction.

## Persistence And Time

- SQLite database: `gymLogger.db`.
- AsyncStorage key `dayLog` stores `{ date, dayId, logs }` for the current local calendar day. Legacy or mismatched drafts are discarded.
- Startup must finish database setup before mounting providers or routes and hiding the splash screen.
- Normal database startup enables foreign keys. Deleting an exercise intentionally cascades to its history.
- User-facing history and progress use local calendar dates and Monday-starting weeks. Timestamps remain stored as UTC ISO strings.
- Date changes require boundary coverage, especially Sunday, late evening, and month/year transitions.
- `CREATE TABLE IF NOT EXISTS` does not migrate an existing schema. Any schema change must define an upgrade for installed databases or explicitly state that it is destructive.
- The development reset deletes all local schedule, settings, draft, and history data. Do not use reset as an implicit migration.

## Validation

- Run `npm run check` for code changes.
- Database/query changes also require manually exercising the affected Workout, Schedule, or History flow on iPhone when feasible.
- Workout persistence changes must cover incomplete drafts, successful saves, failed saves, double taps, and progression.
- Exercise deletion changes must verify that the chosen history behavior remains explicit and consistent.
- The Jest suite intentionally covers only pure progress/date transformations. Do not add broad snapshots or mocked component suites without a concrete regression to protect.
