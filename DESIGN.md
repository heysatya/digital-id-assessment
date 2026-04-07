# Design System & DNA Strategy

## Overview
This document outlines the UI overhaul strategy for the Barbados Digital ID Assessment Framework, prioritizing a high-fidelity, interactive, and minimalist UX inspired by "Claude Artifacts" and modern web paradigms.

## Design DNA 🧬

1. **Typography**: 
   - **Inter** (via `next/font/google`): A clean, highly legible sans-serif font family.
   - Distinct typographic hierarchy: large, clean titles for questions, and subtle muted text for descriptions.

2. **Colors & Theming**:
   - **Backgrounds**: Very subtle and clean `slate-50` background (`#f8fafc`) to reduce eye strain, moving away from pure white.
   - **Surfaces**: Pure white `bg-white` cards with very subtle, refined borders (`slate-200`) and soft shadows (`shadow-sm` to `shadow-md`).
   - **Accents**: Vibrant, deep indigo (`indigo-600`) and blue (`blue-600`) to guide user action without overwhelming the layout.
   - **Text**: `slate-900` for primary text and `slate-500` for secondary text.

3. **Glassmorphism & Surfaces**:
   - Use of translucent elements and `backdrop-blur-md` for sticky headers or sidebars.
   - A floating persistent progress sidebar gives a mature dashboard feel, allowing easy orientation.

4. **Interactive Elements (Radio-Cards)**:
   - Moving away from tiny standard radio inputs to large, highly clickable "Cards" for option selection.
   - Smooth `transition-all duration-200` micro-animations for hover states and active selection states (e.g., slight scaling `scale-[1.01]`, ring highlights, distinct background shifts).

5. **Layouts (Focus Mode)**:
   - **Focus Mode**: A card-based layout where the user's attention is focused on one pillar or section at a time. Extraneous information is hidden or subdued.
   - **Layout Grid**: A flexible layout, such as a prominent left sidebar tracking progress, and a wider right area for the focused questions, avoiding the fatigue of an endless scroll.

## Why this fits
The assessment framework contains complex, multi-layered questions that can cause cognitive overload. A "Focus Mode" approach paired with a clean sidebar reduces distraction. Radio-Cards increase tap targets and make the process feel modern, effortless, and premium. This enhances completion rates and accuracy while presenting a highly professional aesthetic suitable for a national-scale tool.
