# Make Demo - Skills Learning Project

This project is a learning playground for Claude Code Skills.

## Custom Skills Available

- `/explain-file [path]` - Explains any file with analogies and diagrams
- `/create-api [resource] [method]` - Scaffolds a REST API endpoint
- `/summarize-folder [path]` - Summarizes any folder's architecture

## Project Structure
```
make-demo/
├── CLAUDE.md                          # You are here
├── .claude/
│   └── skills/
│       ├── explain-file/SKILL.md      # Skill 1: Simple skill
│       ├── create-api/SKILL.md        # Skill 2: With arguments
│       └── summarize-folder/SKILL.md  # Skill 3: Subagent skill
└── src/                               # Demo app (created by skills)
```
