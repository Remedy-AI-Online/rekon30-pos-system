<!-- 9b4e8a4a-64c9-47bc-b2df-7e4980d3cf6b dd421317-1dea-45e6-a439-2330d61a8f0d -->
# Fix All 2600+ Linter Errors

## Problem Analysis

The codebase has 2627 errors across 72 files. Main issues:

- Missing `node_modules` - dependencies not installed
- React JSX transform not configured in TypeScript
- Incorrect module imports (e.g., `sonner@2.0.3` instead of `sonner`)
- Missing TypeScript configuration for JSX
- CSS warnings from Tailwind v4 at-rules (can be ignored)

## Implementation Steps

### 1. Install Dependencies

- Run `npm install` to install all packages from `package.json`
- This will resolve 90% of "Cannot find module" errors

### 2. Configure TypeScript for Modern React JSX

- Create/update `tsconfig.json` with:
- `"jsx": "react-jsx"` (enables new JSX transform, no React import needed)
- `"jsxImportSource": "react"`
- Proper module resolution settings
- Path aliases for `@/` imports
- Include/exclude patterns

### 3. Fix Incorrect Import Statements

- Replace all `sonner@2.0.3` imports with `sonner`
- Fix any other versioned imports
- Files affected: ~15 component files

### 4. Add Missing Type Definitions

- Create `@types` directory if needed
- Add type declarations for any untyped modules
- Fix specific type mismatches (e.g., Customer interface with `address` field)

### 5. Configure Vite for TypeScript

- Ensure `vite.config.ts` has proper TypeScript support
- Configure path aliases to match tsconfig
- Add necessary type definitions

### 6. Handle Edge Cases

- Fix DateRange import issue (doesn't exist in lucide-react)
- Fix reportingService type mismatch
- Resolve Deno-specific code in server functions (leave as-is, meant for edge functions)

### 7. Verify Build

- Run type check to confirm 0 errors
- Test dev server starts successfully

## Files to Modify

**Primary fixes:**

- `tsconfig.json` - create/update with React JSX transform
- `package.json` - verify dependencies
- ~15 component files - fix sonner imports
- `src/components/AdminReportsPage.tsx` - remove invalid DateRange import
- `src/utils/reportingService.ts` - fix type mismatch

**Files with sonner import issues:**

- All files importing from `sonner@2.0.3` (search/replace)

## Notes

- CSS warnings from Tailwind v4 are expected and can be ignored
- Server function Deno errors are expected (edge functions)
- Maintain all existing code structure
- Zero breaking changes to functionality