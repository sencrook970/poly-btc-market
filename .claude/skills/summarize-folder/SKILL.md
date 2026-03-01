---
name: summarize-folder
description: Generates a comprehensive summary of any folder's contents, architecture, and purpose. Use when someone asks "what's in this folder" or "summarize this directory".
argument-hint: "[folder-path]"
context: fork
agent: Explore
---

# Summarize Folder Skill

Analyze the folder at: $ARGUMENTS

## What to Do:

### 1. File Inventory
List all files and directories, grouped by type:
- Source code files
- Configuration files
- Documentation
- Tests
- Assets/Other

### 2. Architecture Overview
Draw an ASCII diagram showing how the main files relate to each other:
```
[entry-point] --> [core-modules] --> [utilities]
                       |
                       v
                  [external-deps]
```

### 3. Tech Stack
Identify:
- Language(s) used
- Frameworks/libraries
- Build tools
- Database/storage

### 4. Key Patterns
Note any design patterns:
- MVC, Repository, Service layer, etc.
- How errors are handled
- How configuration is managed

### 5. Quick Start
If you can determine how to run this project, provide:
```bash
# Install
# Run
# Test
```
