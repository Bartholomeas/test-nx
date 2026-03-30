# document-element

## Overview

Generate or update a single `COOKBOOK.md` file located at `docs/COOKBOOK.md`
in the project root. This file is a centralized developer encyclopedia — one
place to look up any reusable hook, component, utility, or provider in the
project. It is organized by chapters (sections) so developers can quickly
scan or Ctrl+F to find what they need.

## Instructions

1. **Identify the element(s)** – Determine what is being documented (a hook,
   component, util, provider, module, etc.) and read its source code.
2. **Open `docs/COOKBOOK.md`** – If it does not exist, create it with the
   full structure below. If it exists, add the new entry to the correct
   chapter in alphabetical order.
3. **Do not duplicate entries** – If the element already has an entry, update
   it in place.
4. **Keep the Table of Contents up to date** – Every entry must have a link
   in the ToC.

## File structure

The file lives at `docs/COOKBOOK.md` and follows this layout:

```markdown
# Cookbook

> Centralized developer reference for reusable elements across the project.
> Last updated: <YYYY-MM-DD>

## Table of Contents

### Hooks
- [useDebounce](#usedebounce)
- [useSearch](#usesearch)

### Components
- [AppProviders](#appproviders)
- [EmptyState](#emptystate)

### Utilities
- [cn](#cn)
- [formatDate](#formatdate)

### Providers & Context
- [AppProviders](#appproviders)

---

## Hooks

### useDebounce

**Path:** `src/hooks/use-debounce.ts`

Delays updating a value until a specified timeout has passed since the last
change. Useful for search inputs to avoid firing a request on every keystroke.

**API**

| Param / Return | Type     | Description                |
|----------------|----------|----------------------------|
| `value`        | `T`      | Value to debounce          |
| `delay`        | `number` | Delay in ms                |
| → returns      | `T`      | Debounced value            |

**Usage**

\```ts
const debouncedSearch = useDebounce(search, 300);
\```

---

### useSearch

...

---

## Components

### EmptyState

**Path:** `src/components/ui/empty.tsx`

...

---

## Utilities

### cn

**Path:** `src/lib/utils.ts`

...

---

## Providers & Context

### AppProviders

**Path:** `libs/shared-ui/src/lib/providers/app-providers.tsx`

...

---
```

## Rules

- Write everything in English.
- Do not invent behavior — document only what the source code actually does.
- Keep each entry short (5–15 lines). Purpose, API table, usage snippet,
  optional notes. If someone needs more detail, they read the source.
- Skip trivial or internal-only elements. Document only what other developers
  would look up.
- Remove empty chapters — if there are no providers yet, do not include that
  section.
- When an element belongs to a specific module, prefix the heading with the
  module name, e.g. `### orders / useOrderStatus` and place it in the
  matching chapter (Hooks, Components, etc.), not in a separate module section.
- When updating an existing COOKBOOK.md, preserve any manually written notes
  or context.
- Always update the Table of Contents when adding or removing entries.
