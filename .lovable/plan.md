

## Fix Merge Conflicts to Restore Site

The site is not loading because three files contain **Git merge conflict markers** that break the TypeScript build. These markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`) are leftover from an unresolved merge and must be removed.

### Affected Files

| File | Lines with Conflicts | Severity |
|------|---------------------|----------|
| `src/components/auth/AuthModal.tsx` | 40+ conflict markers | Critical |
| `src/components/auth/ScrollListener.tsx` | 6 conflict sections | Critical |
| `src/components/home/Hero.tsx` | 4 conflict sections | Critical |

### Resolution Strategy

For each file, I will resolve the conflicts by keeping the **HEAD version** (the newer, more feature-rich implementation) since it includes:
- Dark mode support via `useTheme` hook
- Better component structure
- Enhanced animations
- Integration with the current `AuthProvider` pattern

---

### File 1: `src/components/auth/AuthModal.tsx`

**Action:** Rewrite the file with resolved conflicts, keeping HEAD version features:
- Dark mode styling support (`isDarkMode` variable)
- Google, GitHub, and Twitter OAuth buttons
- `InputField` helper component for cleaner forms
- Integration with `useAuth` from `@/providers/AuthProvider`
- Proper `DialogClose` button

---

### File 2: `src/components/auth/ScrollListener.tsx`

**Action:** Rewrite with HEAD version:
- Simple toast-based scroll reminder (no modal popup)
- Uses `useAuth` from `@/providers/AuthProvider`
- Uses `useLocation` for route checking
- Minimal and non-intrusive UX

---

### File 3: `src/components/home/Hero.tsx`

**Action:** Rewrite with HEAD version:
- Interactive card animations using Framer Motion
- Animation decay pattern for better UX
- Links on cards for direct navigation

---

### Technical Details

The HEAD version is preferred because:
1. It uses `@/providers/AuthProvider` which is the correct auth pattern in the current codebase
2. It includes dark mode support via `useTheme`
3. It has cleaner, more modular code with helper components
4. The alternative version uses `@/App` for auth which doesn't match current architecture

### Expected Outcome

After resolving these conflicts:
- The build will succeed
- The site will load normally
- All authentication features will work
- Dark mode theming will be properly applied

