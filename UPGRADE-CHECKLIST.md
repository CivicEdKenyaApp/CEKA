# CEKA Upgrade Checklist

This document outlines the verification steps for the CEKA website upgrade.

## Pre-requisites

1. Node.js 18+ installed
2. npm or yarn package manager
3. Supabase project configured (URL and anon key)

## Setup Steps

### 1. Environment Configuration

```bash
# Copy environment example file
cp .env.example .env

# Edit .env and add your Supabase credentials:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Server

```bash
npm run dev
```

Verify the server starts without errors at http://localhost:5173

### 4. Production Build

```bash
npm run build
```

Verify the build completes without TypeScript or bundling errors.

## Manual Verification Checklist

### Layout & Responsiveness

- [ ] **Home page** loads correctly on desktop and mobile (375px)
- [ ] **No horizontal scroll** appears at 375px viewport width
- [ ] **Mobile hamburger menu** opens full-screen with close button
- [ ] **Mobile menu** navigation items work correctly
- [ ] **Tabs** (TabsList) scroll horizontally on mobile without page overflow

### Pages Verification

| Page | Route | Verification |
|------|-------|--------------|
| Home | `/` | Carousel loads, Hero displays, sections visible |
| Blog | `/blog` | Posts load from Supabase `blog_posts` table |
| Resources | `/resources` | Resources load from Supabase `resources` table |
| Calendar | `/calendar` | Events load from `civic_events` table |
| Legislative Tracker | `/legislative-tracker` | Bills load from `bills` table |
| Auth | `/auth` | Login/signup forms display correctly |
| Profile | `/profile` | User profile loads (when authenticated) |

### Supabase Integration

- [ ] **Blog posts** fetch from `public.blog_posts`
- [ ] **Resources** fetch from `public.resources`
- [ ] **Events** fetch from `public.civic_events`
- [ ] **Bills** fetch from `public.bills`
- [ ] **Carousel slides** fetch from `public.carousel_slides`
- [ ] **User profiles** sync with `public.profiles`
- [ ] **Authentication** works via Supabase Auth

### Events Calendar

- [ ] Month view renders correctly
- [ ] Date selection works with GSAP animation
- [ ] Events display for selected date
- [ ] **iCalendar (.ics)** download button works
- [ ] **Google Calendar** link opens correct URL

### Dark/Light Mode

- [ ] Theme toggle exists in settings
- [ ] Dark mode displays correctly (default)
- [ ] Light mode displays correctly
- [ ] Theme persists across page reloads

### Mobile Specific

- [ ] Touch interactions are responsive
- [ ] Pull-to-refresh doesn't break layout
- [ ] Safe area insets respected (iOS notch)
- [ ] Keyboard doesn't cause layout shift

## Database Verification

The following tables should exist in Supabase (reference: `migrations/20260125_ceka_schema_reference.sql`):

- `profiles`
- `resources`
- `resource_categories`
- `resource_views`
- `blog_posts`
- `blog_categories`
- `bills`
- `bill_follows`
- `civic_events`
- `carousel_slides`
- `volunteer_opportunities`
- `volunteer_applications`
- `discussions`
- `discussion_replies`
- `documents`
- `feedback`
- `notifications`
- `community_members`

## Known Issues & Notes

1. **TypeScript lint errors** about `useState`/`useEffect` are IDE configuration issues, not actual code problems. Run `npm run build` to verify.

2. **Mock data fallback** - Some components fall back to sample data if Supabase tables are empty. This is intentional for development.

3. **GSAP animations** require the `gsap` package. Verify it's installed.

4. **ICS calendar** requires the `ics` package for event downloads.

## Commit History

Changes were made in the following areas:

1. **Layout fixes** - Added `overflow-x-hidden` to prevent horizontal scroll
2. **Mobile menu** - Improved full-screen iOS-inspired design
3. **Storage adapter** - `src/lib/storage.ts` for multi-provider support
4. **Events Calendar** - GSAP animations, iCal download, Google Calendar links
5. **Migration reference** - `migrations/20260125_ceka_schema_reference.sql`
6. **Environment template** - `.env.example`

## Support

For issues or questions, refer to the CEKA repository documentation.
