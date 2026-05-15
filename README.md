# ReachSafe

ReachSafe is a commute safety app that helps users share commute status, alert trusted contacts during emergencies, and stay in control of when their location is shared.

---

### 📊 Project Status Dashboard

| Category | Completed (Prod) | In Progress / Mocked | Not Started | Total | Prod % | Proto % |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Functional Requirements (FR)** | 13 | 1 | 8 | 22 | **59.1%** | **63.6%** |
| **Non-Functional Requirements (NFR)** | 0 | 8 | 7 | 15 | **0%** | **53.3%** |
| **Overall Project Status** | **13** | **9** | **15** | **37** | **35.1%** | **59.5%** |

**Note on Status**: 
*   **Production Completion (Prod %)**: Reflects requirements with full business logic, backend integration, and verified testing.
*   **Prototype Coverage (Proto %)**: Reflects requirements with at least a UI/UX mock or simulated flow in the current codebase.

---

## Problem Statement

Daily commutes can be long and uncertain, often involving varying routes and modes of transport. Currently, safety updates are scattered across phone calls, WhatsApp location shares, cab links, and manual check-ins with family or friends. This fragmentation makes it difficult for both the traveller and their contacts to maintain a clear, unified view of safety status. ReachSafe combines commute tracking, SOS triggers, trusted contact management, safety check-ins, emergency alerts, and granular privacy controls into a single, cohesive flow.

## Platform Decision

*   **Traveller App (Mobile-First)**: Built using **Expo + React Native**. This is a strategic requirement to support:
    *   System-level location permission management.
    *   Location access during active commute sessions, with background support explored after core tracking works.
    *   Push notifications for check-in requests.
    *   Hardware access (battery status, network state).
    *   Ability to open the system dialer/emergency call screen for 112, subject to OS restrictions.
*   **Guardian Dashboard (Web-Optional)**: A dedicated guardian view can be added after traveller-side flows are stable. While it may initially exist as a view within the mobile app, it can be extended to a web-based dashboard in future milestones.

## Scope for MVP

**In Scope:**
* Commute tracking (session-based)
* SOS flow (trigger and resolution)
* Trusted contacts management
* Safety check-ins
* Emergency alerts through push/SMS-ready architecture
* Privacy controls (visibility management)
* Basic battery/network/status display (using mock data initially)

**Out of Scope:**
* AI safety prediction or anomaly detection
* Police-side or emergency responder dashboard
* Full 24/7 background tracking (outside of commute/emergency)
* Crime-area scoring or "safe route" suggestions
* Wearable integration (Apple Watch, etc.)
* Automatic emergency calling without user action

## MVP Release Criteria

*   [ ] User can successfully sign up and add at least one trusted contact.
*   [ ] App captures location in background during an active commute.
*   [ ] Trusted contacts receive a link or notification to view live commute status.
*   [ ] SOS trigger successfully notifies all trusted contacts with live location.
*   [ ] App opens 112 call screen after SOS confirmation.
*   [ ] Commute automatically times out or alerts if traveller doesn't "reach safely" by ETA.
*   [ ] Battery/Network status of traveller is visible to the guardian.
*   [ ] Traveller can stop all sharing with a single tap after commute ends.

## Functional Requirements

| ID | Requirement | Description | Priority | Status |
|----|-------------|-------------|----------|--------|
| FR-00 | Location permission | Traveller can grant foreground location permission and view current coordinates | Must Have | Completed (Prod) |
| FR-01 | Traveller onboarding | User can enter basic profile details and use the app as a traveller | Must Have | Not Started |
| FR-02 | View trusted contacts | Traveller can see their current list of trusted contacts | Must Have | Completed (Prod) |
| FR-03 | Add/manage contacts | Traveller can add, edit, and remove trusted contacts | Must Have | Completed (Prod) |
| FR-04 | Contact permission levels | Traveller can define what each trusted contact can see: SOS only, commute only, or full guardian access | Must Have | Completed (Prod) |
| FR-05 | Start commute | Traveller can start a commute session with destination and ETA | Must Have | Completed (Prod) |
| FR-06 | Active commute view | Traveller can see active commute status, ETA, and connected contacts | Must Have | Completed (Prod) |
| FR-07 | Live commute tracking | App can capture and share live location during an active commute session | Must Have | Completed (Prod) |
| FR-08 | End commute / reached safely | Traveller can mark commute as completed and stop sharing | Must Have | Completed (Prod) |
| FR-09 | SOS trigger | Traveller can trigger SOS using a deliberate action from the home screen | Must Have | Completed (Prod) |
| FR-10 | Emergency alert message | App prepares/sends emergency alert with location, battery, and timestamp | Must Have | Completed (Prod) |
| FR-11 | 112 call support | App opens the 112 emergency call screen after SOS trigger | Must Have | Completed (Prod) |
| FR-12 | Check-in request | Trusted contact can request a safety check-in from traveller | Should Have | Not Started |
| FR-13 | Missed check-in handling | App can detect missed commute confirmation and notify trusted contact | Should Have | Not Started |
| FR-14 | Guardian view | Trusted contact can view traveller’s permitted status and commute information | Should Have | Not Started |
| FR-15 | Battery status display | App shows traveller battery status where available | Should Have | Completed (Prod) |
| FR-16 | Network status display | App shows traveller network status where available | Should Have | Completed (Prod) |
| FR-17 | Privacy visibility | Traveller can see who can view their location and when sharing is active | Must Have | In Progress (UI Mock) |
| FR-18 | Emergency resolved / I’m safe | Traveller can end emergency mode and notify contacts they are safe | Must Have | Completed (Prod) |
| FR-19 | Fake call / soft safety action | Traveller can trigger a fake call or soft safety action | Could Have | Not Started |
| FR-20 | Location sharing history | Traveller can view when location was shared and with whom | Could Have | Completed (Prod) |
| FR-21 | Test SOS mode | Traveller can test SOS flow without notifying real contacts | Should Have | Not Started |

## Non-Functional Requirements

| ID | Requirement | Description | Priority | Status |
|----|-------------|-------------|----------|--------|
| NFR-01 | Privacy-first design | Location sharing must be consent-based and visible | Must Have | In Progress |
| NFR-02 | User control | Traveller must control who can see their status | Must Have | In Progress |
| NFR-03 | Reliability | SMS fallback for SOS should be considered | Must Have | Not Started |
| NFR-04 | Low latency emergency alert | Alerts should be triggered quickly (target < 5s) | Must Have | Not Started |
| NFR-05 | Data Sync | Local-first architecture with background sync to Supabase | Must Have | In Progress |
| NFR-06 | Security | Sensitive data (location, phone numbers) must be protected | Must Have | In Progress |
| NFR-07 | Transparency | Clear logs of when location was shared and with whom | Must Have | Not Started |
| NFR-08 | Accessibility | Readable text, large touch targets, clear contrast | Should Have | In Progress |
| NFR-09 | Usability | Core actions reachable within 1-2 taps/long-press | Must Have | Completed (Prod) |
| NFR-10 | Error handling | Graceful handling of no GPS, no network, low battery | Must Have | Not Started |
| NFR-11 | Scalability | Backend support for multiple concurrent travellers/contacts | Should Have | Not Started |
| NFR-12 | Maintainability | Modular code, reusable components, clear structure | Must Have | In Progress |
| NFR-13 | Cross-platform support | Native Android/iOS support via React Native | Should Have | Not Started |
| NFR-14 | Calm visual design | Premium, minimal UI that doesn't create unnecessary panic | Should Have | In Progress |
| NFR-15 | Data minimization | Collect only data required for safety flows | Must Have | Not Started |

## Requirement Status Legend

* **Not Started**: No work has begun on this requirement.
* **In Progress**: Actively being developed or prototyped.
* **In Progress (UI Mock)**: User interface is built but functionality is simulated.
* **Mock Data**: UI displays hardcoded or simulated values for demonstration.
* **Completed (Prod)**: Requirement fully implemented and verified in production code.

## MVP Progress Summary

* [x] Static app setup complete (Expo + TypeScript)
* [x] Home screen created (Premium Minimal UI)
* [x] Commute flow implemented locally (Milestone 4)
* [x] Active commute view with periodic updates (30s)
* [x] SOS local trigger and countdown (Milestone 5)
* [x] 112 call screen integration (Milestone 5)
* [x] Local trusted contact management (Milestone 6)
* [x] Emergency message preview with location (Milestone 6)
* [x] Local persistence and state recovery (Milestone 7)
* [x] Supabase backend foundation and local-first sync (Milestone 8)
* [ ] Emergency alerts (SMS/Push) (Not Started)
* [ ] Background tracking (Not Started)
* [ ] Guardian dashboard (Not Started)
* [ ] Backend connected
* [ ] Emergency alerts connected
* [ ] Guardian dashboard created
* [ ] Privacy controls implemented (In Progress)

## Current Milestone

**Current milestone**: Clickable prototype with mock data.  
**Next milestone**: Implement real location permission and current location display.

## Engineering Notes

* The app is currently a **High-Fidelity Prototype** with a real Supabase backend foundation.
* Milestone 4-7 focus on local-only logic and persistence.
* Milestone 8 introduces Supabase backend foundation and local-first sync. The app still works offline/local-only if Supabase is not configured.
* Sync logic handles contacts, commute sessions, location pings, and emergency events.
* Logic is local-first; if sync fails, the user experience is not interrupted.
* Privacy and explicit consent are the core design constraints driving the architecture.
