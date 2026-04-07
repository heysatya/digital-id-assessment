# Digital ID Assessment Framework - V2 Implementation Plan

---

## Executive Summary

This document serves as the **Master Implementation Guide** for migrating the Digital ID Assessment Framework from **Version 1 (MVP)** to **Version 2 (Optimized Framework)**. 
Version 2 retains the core technology stack (Next.js, React, Tailwind CSS, Supabase) but fundamentally shifts how the application handles data mapping, user routing, security, and scoring.

### High-Level Upgrade Directives
1. **Version Control Integrity**: This must be executed on a separate Git branch (`v2-optimized-framework`) to preserve V1 functionality.
2. **Behaviorally Anchored Rating Scales (BARS)**: Transition from a generic 0-5 scale to specific descriptive anchors for every response.
3. **Dynamic Respondent Routing**: Questions must be dynamically filtered and presented based on the respondent’s stakeholder type (GOV, REG, PRIV, CIV).
4. **Segmented Maturity Assessment**: Recalibration of the scoring methodology to account for the fact that different stakeholders answer different sets of questions.
5. **Secure Authentication**: Elimination of hard-coded admin passwords in favor of secure Supabase Authentication and a dedicated admin tier.
6. **Enhanced UI/UX**: Introduce superior animations, transitions, and component layouts to make the interface "jazzier" and production-ready.
7. **Test Environment Isolation**: Retention of the V1 "Test Mode" with proper backend admin tools to flush test data routinely.

---

## Technical Enhancements Review
The V1 architecture (Next.js + Supabase) is excellent and remains for V2. However, these specific improvements must be layered on top to achieve V2 objectives:

### 1. Frontend Polish ("Jazzier UI")
- **Layout & Structure**: Migrate from small generic numerical buttons to vertical layout cards representing the Behavioral Anchors.
- **Animations**: Introduce `framer-motion` to smoothly fade in conditionally rendered questions and provide satisfying micro-interactions when users select an anchor.
- **Feedback Loops**: Implement `sonner` or `react-hot-toast` for elegant, non-intrusive notifications when data saves, when questions are missed, or when test data is wiped.
- **Progress Tracking**: Update the progress bar to dynamically reflect the *filtered* length of the questionnaire (not the total number of questions).

### 2. Backend Security (Supabase)
- **Supabase Auth**: Set up Email & Password authentication.
- **Role-Based Access Control (RBAC)**: Use a `settings` or `user_roles` table in Supabase to determine if an authenticated user is an `admin` or a `viewer`.
  - *Admin*: Can manipulate data, delete test data, and see everything.
  - *Viewer*: Only has access to view the Results Dashboard.
- **Row Level Security (RLS)**: Enforce RLS rules on the `assessments` and `responses` tables so unauthorized users cannot pull assessment records via simple API calls without an auth token. 

---

## Core V2 Features & Implementation Steps

### Phase 1: Branch Isolation & Foundation
- Setup a new Git branch: `git checkout -b v2-optimized-framework`.
- Install UI libraries (`framer-motion`, `lucide-react` for icons, `sonner` for toast notifications).

### Phase 2: The BARS & Question Framework
The V1 structure only contained strings for questions. In V2, the dataset (`src/data/questions.ts`) must be heavily modified.
- **Action**: Update the TypeScript `Question` interface.
- Add an `anchors` payload indicating the specific 0-4 or 1-5 behavior definitions for *each* question type.
- Ensure the number of questions reflects the optimized framework (71 Questions, structured as Anchor Questions and Diagnostic Questions as per the framework spec).

### Phase 3: Dynamic Respondent Routing
In V1, all respondents saw all questions regardless of origin. In V2, the interface adapts.
- **Action**: In `AssessmentForm.tsx`, once the user selects their `Stakeholder Group` (GOV, REG, PRIV, CIV) at the start of the form, immediately filter the visible questions.
- **Logic**: A question only shows if the respondent's stakeholder type matches the `primaryStakeholder` OR `secondaryStakeholder` field of the question.
- **Impact**: Progress tracking and completion logic must rely on `filteredQuestions.length` rather than `questions.length`.

### Phase 4: Segmented Maturity Assessment Methodology
Because respondents no longer answer a uniform set of questions, the maturity assessment engine (`src/lib/scoring.ts`) must support segmented calculations.
- **Step 1**: Calculate maturity *per respondent log*. If a CIVIL respondent answers 10 questions, their individual maturity snapshot is based structurally on how they answered those specific 10 areas.
- **Step 2**: The master "Global Dashboard" integrates data hierarchically. If we are calculating Pillar 1's score, it evaluates the `PrimaryStakeholder` responses first (GOV) holding a 70% weight, and crosses it with the `SecondaryStakeholder` (CIV/REG) holding a 30% weight.
- **Step 3**: Triangulation. Code a modifier function: if 3 or more stakeholder types submit data for the identical sub-pillar and their results align closely, +5% triangulation bonus is applied.

### Phase 5: Secure Admin Portal & Dashboards
Remove any files or environment variables that use standard `if (password === 'admin123')` blocks.
- **Action**: Build `/login`.
- Hook into `@supabase/auth-helpers-nextjs`.
- Create a protected `/admin` route.
- If the user's role is `viewer`, show the analytical charts.
- If the user's role is `admin`, show charts + "Data Management" tools.

### Phase 6: Lifecycle & Test Management
- **Action**: In the Admin portal, build a "Database Operations" section.
- Add a specific "Delete All Test Runs" button that calls a Supabase RPC or bulk delete query: `DELETE FROM assessments WHERE environment_mode = 'test'`.
- This ensures actual live data is preserved while test data generated during demos is safely cleaned.
