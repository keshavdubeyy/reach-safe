# ReachSafe Database Schema

This document outlines the Supabase database structure for ReachSafe.

## Tables

### `users`
Core user profiles for travellers.
- `id` (uuid, PK): Matches Supabase Auth user ID.
- `name` (text): Display name.
- `phone` (text): Verified phone number.
- `email` (text): Primary email.
- `created_at` (timestamp): Record creation time.

### `trusted_contacts`
Individuals authorized to receive safety updates.
- `id` (uuid, PK)
- `traveller_id` (uuid, FK -> users.id): The user who owns this contact.
- `name` (text): Contact's name.
- `phone_number` (text): Contact's phone.
- `relationship` (text): e.g., "Mother", "Partner".
- `permission_level` (text): `sos_only`, `commute_only`, `full_guardian`.
- `receives_sos` (boolean): Whether to notify on SOS.
- `receives_commute_updates` (boolean): Whether to notify on commute starts/ends.
- `priority` (text): `primary` or `secondary`.
- `created_at` (timestamp)

### `commute_sessions`
Active and historical commute records.
- `id` (uuid, PK)
- `traveller_id` (uuid, FK -> users.id)
- `route_name` (text): e.g., "Work to Home".
- `from_label` (text)
- `to_label` (text)
- `transport_mode` (text): `walking`, `transit`, `driving`, `cycling`.
- `started_at` (timestamp)
- `expected_arrival` (timestamp)
- `ended_at` (timestamp, nullable)
- `status` (text): `active`, `completed`, `cancelled`.

### `emergency_events`
SOS events triggered by travellers.
- `id` (uuid, PK)
- `traveller_id` (uuid, FK -> users.id)
- `triggered_at` (timestamp)
- `resolved_at` (timestamp, nullable)
- `latest_latitude` (double precision, nullable)
- `latest_longitude` (double precision, nullable)
- `selected_contacts` (jsonb): Snapshot of contacts notified.
- `call_112_opened` (boolean): Whether user opened the system dialer.
- `status` (text): `active`, `resolved`.

### `location_pings`
High-frequency location updates during active sessions.
- `id` (uuid, PK)
- `traveller_id` (uuid, FK -> users.id)
- `commute_session_id` (uuid, FK, nullable)
- `emergency_event_id` (uuid, FK, nullable)
- `latitude` (double precision)
- `longitude` (double precision)
- `accuracy` (double precision)
- `battery_level` (integer, nullable)
- `network_status` (text, nullable)
- `created_at` (timestamp)

## Security Patterns (RLS)

- **Privacy First**: By default, `location_pings` are private to the `traveller_id`.
- **Shared Access**: During an `active` commute or emergency, trusted contacts with the correct `permission_level` gain READ access to the traveller's current session and related pings.
- **Write Access**: Only the owner (`traveller_id`) can INSERT or UPDATE their own records.
