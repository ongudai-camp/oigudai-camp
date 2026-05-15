# Fix: React DevTools "children should not have changed" error

## Problem
React DevTools extension throws `The children should not have changed if we pass in the same set` — triggered by unstable children/keys in the fiber tree.

## Root Causes & Fixes

### 1. BottomNav.tsx — conditional `return null` inside `.map()`
- **Lines 95, 182**: `tabs.map()` returns `null` for unauthorized tabs, creating holes in the children array.
- **Fix**: Pre-filter with `visibleTabs` before `.map()`.
- **Files to change**: `src/components/layout/BottomNav.tsx`

**Change A** (line 95):
```
-  const tabs = loaded ? (isAdminUser ? adminTabs : userTabs) : userTabs.slice(0, 2);
+  const tabs = loaded ? (isAdminUser ? adminTabs : userTabs) : userTabs.slice(0, 2);
+  const visibleTabs = tabs.filter(tab => !(tab.auth && !userId && tab.key !== "profile"));
```

**Change B** (line 182):
```
-          {tabs.map((tab) => {
-            if (tab.auth && !userId && tab.key !== "profile") return null;
+          {visibleTabs.map((tab) => {
```

---

### 2. HotelWizard.tsx — `key={index}` on mutable rooms array
- **Lines 237, 429**: `key={index}` on rooms array where items are addable/removable.
- **Fix**: Assign stable `_key` to each room on creation via a ref counter.
- **Files to change**: `src/components/admin/HotelWizard.tsx`

**Change A** — import `useRef`:
```
- import { useState, useEffect } from "react";
+ import { useState, useEffect, useRef } from "react";
```

**Change B** — add key counter after state declarations (after line 64):
```
+  const roomKeyRef = useRef(0);
   const [rooms, setRooms] = useState<RoomData[]>([
-    { title: "", description: "", price: "", guests: 1, beds: 1, bathrooms: 1, floor: null, roomTypeId: null, facilityIds: [] },
+    { ...({ title: "", description: "", price: "", guests: 1, beds: 1, bathrooms: 1, floor: null, roomTypeId: null, facilityIds: null }), _key: ++roomKeyRef.current },
   ]);
```

Wait, RoomData is an interface - I can't spread it. Let me think about this differently.

Actually, the simplest approach: I'll add a `_key` field to the `rooms.map()`. But since RoomData is an interface, I need to either extend it or use a different pattern.

Better approach — use the array index but compute a stable key from room content. Or even simpler: keep a simple counter in state and use it to generate keys.

Actually, the cleanest approach: add a `_key` field to RoomData:
```tsx
interface RoomData {
  _key: number;
  title: string;
  ...
}
```

And maintain a counter:
```tsx
let _keyCounter = 0;
```

But module-level state is problematic in React with HMR. Let me use a ref:

```tsx
const keyRef = useRef(0);
const addRoom = () => {
  keyRef.current += 1;
  setRooms([...rooms, { _key: keyRef.current, title: "", ... }]);
};
```

But this means the initial room also needs a _key. Let me handle this by restructuring.

Actually wait — the user is in plan mode. I should just write the plan. Let me complete the plan file.

---

### 3. TourWizard.tsx — `key={index}` on mutable itinerary array
- **Lines 259, 330**: `key={index}` on itinerary where days are addable/removable.
- **Fix**: Use `day.day` as key — it's a stable numeric field.

**Line 259**:
```
-                <div key={index} className="bg-gray-50 rounded-lg p-6 space-y-4">
+                <div key={day.day} className="bg-gray-50 rounded-lg p-6 space-y-4">
```

**Line 330**:
```
-                  <div key={index} className="ml-4 text-[#1A2B48]">
+                  <div key={day.day} className="ml-4 text-[#1A2B48]">
```

---

### 4. LocationPicker.tsx — `key={i}` on API results
- **Line 187**: `key={i}` on Nominatim search suggestions (API results can reorder).
- **Fix**: Use suggestion string as key.

```
-              <li key={i}>
+              <li key={s}>
```

---

### 5. AdminLayout.tsx — inline `menuItems` array recreated each render
- **Lines 13-24**: `menuItems` array of objects recreated on every render, passed to `AdminSidebarClient`.
- **Fix**: Extract `getMenuItems` function or use a stable reference. Since this is a server component and called in an async function with `await getTranslations()`, extracting a stable function won't help. The fix: memoize in the client component via `useMemo`.

Actually since `AdminLayout` is a server component (async), the objects pass through to the client component `AdminSidebarClient`. The issue is that `AdminSidebarClient` receives new prop references each time. The proper fix is to move the menu item creation into `AdminSidebarClient` itself, or use `useMemo` there.

Better fix for `AdminSidebarClient`:
```tsx
const menuItems = useMemo(() => props.menuItems, [/* deps that change */]);
```

But the simpler fix: just pass the translation strings more granularly.

Actually, the simplest proper fix: In `AdminSidebarClient`, wrap the mapping in `useMemo` keyed on `pathname` (which already drives the active state):

```tsx
const navItems = useMemo(() => 
  menuItems.map(item => ({
    ...item,
    isActive: isActive(item.href)
  })), 
  [menuItems, pathname]
);
```

This doesn't fully solve the root problem though. A better approach: The parent `AdminLayout` creates new objects each time, so the child re-renders. But since `AdminSidebarClient` is a client component, React needs to reconcile it.

For now, the quickest win is to simply not pass the full `menuItems` array but just pass `title` and `backLabel` separately (which are already separate), and move the menu structure into `AdminSidebarClient` itself. But that's a bigger refactor.

Simpler: pass raw translation strings as individual props instead of an array of objects. Since `title` and `backLabel` are already individual props, this pattern is already in use.

Even simpler for the plan: just extract the menu to a static const in `AdminSidebarClient` and use `getTranslations` there. But `AdminSidebarClient` is a client component (`"use client"`) and can't use `getTranslations` (server only).

OK, the most practical fix that doesn't require architecture changes:

In `AdminLayout.tsx`, use the `key` prop on `<AdminSidebarClient>` to force a remount only when needed... no, that's worse.

The actual fix: In `AdminLayout.tsx`, only pass the raw value strings, and have AdminSidebarClient build the menu items internally. Since AdminSidebarClient already has `title` and `backLabel` as individual props, and renders `href="/admin"` directly, the menuItems are the only remaining issue.

Let me just recommend splitting menu items into individual prop slots in the plan.
