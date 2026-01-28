# Storage Migration Fix - Telegraph Image API

## Problem
Bug terjadi setelah migrasi dari Supabase Storage ke Telegraph Image API:
- **Legacy (Supabase Storage)**: Database menyimpan path relatif (`user-id/gambar.png`), frontend menambahkan prefix via `getStorageUrl()`
- **Baru (Telegraph API)**: Database menyimpan URL lengkap (`https://telegraph-image-6l6.pages.dev/file/xxx.png`)
- **Bug**: URL Telegraph ditambahkan prefix Supabase, menghasilkan URL rusak: `https://supabase.../storage/.../https://telegraph...`

## Root Cause Analysis
1. ✅ Database storage format sudah benar (path relatif untuk legacy, full URL untuk Telegraph)
2. ✅ `getStorageUrl()` logic sudah benar (detect `https://` dan return as-is)
3. ❌ **Admin delete function** mencoba delete Telegraph URL dari Supabase Storage bucket
4. ⚠️ Potential browser caching issues

## Fixes Applied

### 1. Enhanced `getStorageUrl()` Function
**File**: `src/lib/supabase.ts`

```typescript
export function getStorageUrl(path: string): string {
  // Trim whitespace and check if empty
  const trimmedPath = path?.trim();
  if (!trimmedPath) {
    console.warn('[getStorageUrl] Empty path provided');
    return '';
  }
  
  // If path is already a full URL (Telegraph Image or any HTTP URL), return as-is
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }
  
  // Otherwise, treat as legacy Supabase Storage path
  return `${supabaseUrl}/storage/v1/object/public/generated-images/${trimmedPath}`;
}
```

**Changes**:
- Added `.trim()` to handle whitespace
- Added null/empty check
- Self-test in DEV mode to verify function behavior

### 2. Fixed Admin Delete Function
**File**: `src/pages/admin/AdminGallery.tsx`

```typescript
const handleDelete = async (item: GalleryItem) => {
  // Only delete from Supabase Storage if it's a legacy path (not a full URL)
  if (!item.image_path.startsWith('http://') && !item.image_path.startsWith('https://')) {
    const { error: storageError } = await supabase.storage
      .from('generated-images')
      .remove([item.image_path]);
    // ... error handling
  } else {
    console.log('[AdminGallery] Skipping storage deletion for external URL:', item.image_path);
  }
  
  // Always delete from database
  // ...
}
```

**Changes**:
- Check if path is external URL before attempting Supabase Storage deletion
- Skip storage deletion for Telegraph URLs (they're managed externally)
- Continue to delete database record regardless

## Verification Steps

### 1. Check Database Format
```sql
SELECT 
  id,
  image_path,
  POSITION('http' IN image_path) as is_external,
  created_at
FROM generation_history 
ORDER BY created_at DESC 
LIMIT 10;
```

**Expected**:
- Legacy images: `is_external = 0` (e.g., `user-id/image.png`)
- Telegraph images: `is_external = 1` (e.g., `https://telegraph-image-6l6.pages.dev/file/xxx.png`)

### 2. Test in Browser Console
Open DevTools Console and check for self-test output:
```
[getStorageUrl TEST PASSED] Telegraph URL should return as-is
[getStorageUrl TEST PASSED] Legacy path should add Supabase prefix
[getStorageUrl TEST PASSED] Telegraph URL with whitespace should trim and return as-is
```

### 3. Test Image Display
- ✅ History page (`/dashboard/history`) - both old and new images should display
- ✅ Admin gallery (`/admin/gallery`) - both old and new images should display
- ✅ Download function should work for both formats
- ✅ Admin delete should work for both formats

## Storage Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    generation_history                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ image_path: "user-id/image.png"                    │    │
│  │ → Legacy Supabase Storage (relative path)          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ image_path: "https://telegraph-.../file/xxx.png"   │    │
│  │ → Telegraph Image API (full URL)                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                  getStorageUrl(path)
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
        ▼                                      ▼
  Starts with http?                      Relative path?
      YES → Return as-is                 YES → Add Supabase prefix
      (Telegraph URL)                    (Legacy path)
```

## Migration Status

| Component | Status | Notes |
|-----------|--------|-------|
| Edge Function | ✅ | Stores full Telegraph URLs |
| Database Schema | ✅ | Supports both formats (text column) |
| `getStorageUrl()` | ✅ | Detects and handles both formats |
| Display (History) | ✅ | Uses `getStorageUrl()` |
| Display (Admin) | ✅ | Uses `getStorageUrl()` |
| Download | ✅ | Uses `getStorageUrl()` |
| Admin Delete | ✅ | Handles both formats correctly |

## Future Considerations

1. **Telegraph API Reliability**: No SLA, free service might have downtime
2. **Image Persistence**: Telegraph images not under our control
3. **Migration Path**: If needed to migrate back to Supabase or another provider:
   - Query all Telegraph URLs from database
   - Download and re-upload to new storage
   - Update database with new paths
4. **Cleanup**: Eventually migrate all legacy Supabase Storage images to Telegraph for consistency

## References
- Telegraph Image API: https://telegraph-image-6l6.pages.dev
- Edge Function: `supabase/functions/submit-generation/index.ts`
- Frontend Helper: `src/lib/supabase.ts`
