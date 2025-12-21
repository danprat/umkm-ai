# Frontend (src/)

## Package Identity
React 18 + TypeScript + Vite SPA. Shadcn/ui design system. Supabase client-side auth & realtime. Credit-based image generation platform for Indonesian UMKM.

## Setup & Run
```bash
# Install dependencies (from root)
npm install

# Development server (port 8080)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Patterns & Conventions

### File Organization
```
src/
├── components/          # Reusable components
│   ├── ui/             # Shadcn/ui primitives (Button, Dialog, etc.)
│   ├── DashboardLayout.tsx
│   ├── ImageUploader.tsx
│   └── ...
├── pages/              # Route pages (one per route)
│   ├── Dashboard.tsx
│   ├── GeneratePage.tsx
│   ├── FoodPage.tsx
│   └── admin/          # Admin-only pages
├── hooks/              # Custom React hooks (use-*.ts)
├── lib/                # Utilities, API clients
├── contexts/           # React Context providers
└── App.tsx             # Router & root component
```

### Import Patterns
**DO**: Use `@/` alias for absolute imports
```tsx
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useCredits } from "@/hooks/use-credits";
```

**DON'T**: Use relative imports across directories
```tsx
// ❌ Bad
import { Button } from "../../components/ui/button";
```

### Component Patterns

**Page Components** (in `src/pages/`)
- Must use `DashboardLayout` wrapper
- Handle auth with `useAuth()` hook
- Handle credits with `useCredits()` hook
- Example: [GeneratePage.tsx](pages/GeneratePage.tsx)

```tsx
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/use-credits";

export default function MyPage() {
  const { user } = useAuth();
  const { credits, checkAndDeductCredit } = useCredits({ pageType: 'generate' });
  
  // ... component logic
  
  return (
    <DashboardLayout>
      {/* page content */}
    </DashboardLayout>
  );
}
```

**Reusable Components** (in `src/components/`)
- Use TypeScript interfaces for props
- Use `cn()` from `@/lib/utils` for className merging
- Example: [ImageUploader.tsx](components/ImageUploader.tsx)

```tsx
interface ImageUploaderProps {
  onImageSelect: (base64: string) => void;
  className?: string;
}

export function ImageUploader({ onImageSelect, className }: ImageUploaderProps) {
  return <div className={cn("border rounded-lg", className)}>...</div>;
}
```

**Shadcn/ui Components** (in `src/components/ui/`)
- Generated via Shadcn CLI, minimal manual edits
- Always use Radix UI primitives underneath
- Example: [button.tsx](components/ui/button.tsx)

### API & Supabase Patterns

**API Calls** via `src/lib/api.ts`
- All image generation goes through Edge Functions
- Async job pattern for long-running tasks
- Example:
```tsx
import { generateImage } from "@/lib/api";

const result = await generateImage(prompt, 'generate', '1:1');
```

**Supabase Client** via `src/lib/supabase.ts`
- Singleton client instance
- Use for auth, database queries, storage
- Example:
```tsx
import { supabase } from "@/lib/supabase";

const { data, error } = await supabase
  .from('profiles')
  .select('credits')
  .eq('id', userId)
  .single();
```

**Auth Context** via `src/contexts/AuthContext.tsx`
```tsx
import { useAuth } from "@/contexts/AuthContext";

const { user, profile, isAdmin, logout } = useAuth();
```

### Credit System Patterns

**CRITICAL**: Always use `useCredits` hook for credit operations
```tsx
import { useCredits } from "@/hooks/use-credits";

const { credits, checkAndDeductCredit, refundCredit } = useCredits({ 
  pageType: 'generate' // or 'food', 'mascot', 'promo', 'style'
});

// Before generation
const { success, error } = await checkAndDeductCredit();
if (!success) {
  toast.error(error);
  return;
}

// On generation failure
await refundCredit();
```

**DO**:
- Use atomic credit operations via Edge Functions
- Handle rate limiting (429 errors with `waitSeconds`)
- Show clear error messages to users
- Refund credits on failures

**DON'T**:
- Read then write credits (race condition!)
- Deduct credits client-side
- Skip error handling

### Styling Patterns

**Tailwind + Shadcn**
- Use Tailwind utility classes
- Use `cn()` for conditional classes
- Follow Shadcn's design tokens (see `tailwind.config.ts`)

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "rounded-lg border p-4",
  isActive && "bg-primary text-primary-foreground",
  className
)} />
```

**Neobrutalism Theme**
- Bold borders: `border-[3px] border-foreground`
- Shadows: `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
- Uppercase titles: `uppercase tracking-wider`

### Toast Notifications
```tsx
import { toast } from "sonner";

toast.success("Generation complete!");
toast.error("Failed to generate image");
toast.loading("Generating...", { id: "gen-toast" });
toast.dismiss("gen-toast");
```

## Key Files

### Core Setup
- [App.tsx](App.tsx) - React Router setup, all routes defined here
- [main.tsx](main.tsx) - React root, providers, Supabase client init
- [vite.config.ts](../vite.config.ts) - Vite config, `@/` alias defined here

### API & Auth
- [lib/supabase.ts](lib/supabase.ts) - Supabase client singleton
- [lib/api.ts](lib/api.ts) - All image generation API functions
- [contexts/AuthContext.tsx](contexts/AuthContext.tsx) - Auth state & user profile

### Hooks
- [hooks/use-credits.ts](hooks/use-credits.ts) - Credit management (MUST USE)
- [hooks/use-referral.ts](hooks/use-referral.ts) - Referral system
- [hooks/use-toast.ts](hooks/use-toast.ts) - Toast notifications
- [hooks/use-mobile.tsx](hooks/use-mobile.tsx) - Responsive breakpoints

### Layout & Shared Components
- [components/DashboardLayout.tsx](components/DashboardLayout.tsx) - Main layout wrapper
- [components/CreditDisplay.tsx](components/CreditDisplay.tsx) - Credit counter
- [components/ImageUploader.tsx](components/ImageUploader.tsx) - Image upload widget
- [components/GeneratedImage.tsx](components/GeneratedImage.tsx) - Generated image display
- [components/AspectRatioSelector.tsx](components/AspectRatioSelector.tsx) - Aspect ratio picker

### Page Examples
- [pages/GeneratePage.tsx](pages/GeneratePage.tsx) - Basic text-to-image generation
- [pages/FoodPage.tsx](pages/FoodPage.tsx) - Food photo enhancement (image input)
- [pages/MascotPage.tsx](pages/MascotPage.tsx) - Mascot generation with options
- [pages/PromoPage.tsx](pages/PromoPage.tsx) - Promo image with templates
- [pages/StylePage.tsx](pages/StylePage.tsx) - Style transfer (2 image inputs)

## JIT Index Hints
```bash
# Find all pages
ls src/pages/*.tsx

# Find all hooks
ls src/hooks/use-*.ts

# Find API function
rg -n "export async function" src/lib/api.ts

# Find Shadcn component
ls src/components/ui/ | grep "tsx"

# Find useEffect in page
rg -n "useEffect" src/pages/GeneratePage.tsx

# Find toast usage
rg -n "toast\." src/pages/
```

## Common Gotchas

**Auth**:
- Always check `user` before authenticated actions
- Redirect to `/login` if not authenticated
- Use `isAdmin` from `useAuth()` for admin checks

**Credits**:
- NEVER deduct credits client-side - use `checkAndDeductCredit()`
- Handle rate limiting with countdown timer
- Always refund on failures

**Image Generation**:
- Async job pattern - poll for completion
- Show loading state with `CountdownTimer` component
- Handle timeouts (5 min max)

**Routing**:
- All routes defined in [App.tsx](App.tsx)
- Use React Router's `<Link>` or `useNavigate()`
- Admin routes protected by `isAdmin` check

**Environment Variables**:
- Must start with `VITE_` prefix
- Access via `import.meta.env.VITE_*`
- Defined in `.env` (not committed)

## Pre-PR Checks
```bash
# From root directory
npm run build    # Must succeed
npm run lint     # Must pass
npm run dev      # Manual smoke test
```

Test checklist:
- [ ] Login flow works
- [ ] Credit deduction works correctly
- [ ] Image generation completes
- [ ] Error states show proper messages
- [ ] Mobile responsive
- [ ] No console errors
