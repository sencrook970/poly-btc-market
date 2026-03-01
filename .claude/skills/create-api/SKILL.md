---
name: create-api
description: Scaffolds a new REST API endpoint with route, controller, and types. Use when someone asks to "create an endpoint" or "add an API route".
argument-hint: "[resource-name] [method]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Create API Endpoint Skill

Create a REST API endpoint for resource: **$ARGUMENTS[0]** with HTTP method: **$ARGUMENTS[1]**

If no method is specified, default to GET.

## Steps to Follow:

### Step 1: Check Existing Structure
First, look at the project structure to understand the existing patterns:
- Look for existing route files
- Check if there's an Express/Fastify/Hono setup
- Match the existing code style

### Step 2: Create the Route File
Create `src/routes/$ARGUMENTS[0].route.ts` with:
- Proper imports
- Route handler with request/response types
- Input validation
- Error handling with try/catch
- Proper HTTP status codes

### Step 3: Create Types
Create `src/types/$ARGUMENTS[0].types.ts` with:
- Request interface
- Response interface
- Any needed enums

### Step 4: Register the Route
Find the main app/router file and register the new route.

### Step 5: Summary
Print a summary of what was created:
```
Created:
  - src/routes/$ARGUMENTS[0].route.ts
  - src/types/$ARGUMENTS[0].types.ts
  - Updated: main router
```

## Code Style Rules:
- Use TypeScript
- Use async/await (no callbacks)
- Add JSDoc comments on the handler function
- Return JSON responses
- Use proper HTTP status codes (200, 201, 400, 404, 500)
