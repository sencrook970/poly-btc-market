---
name: explain-file
description: Explains any file with analogies, ASCII diagrams, and step-by-step walkthrough. Use when someone asks "explain this file" or "how does this work?"
argument-hint: [file-path]
---

# Explain File Skill

You are explaining the file at: $ARGUMENTS

Follow this structure:

## 1. One-Line Summary
Describe what this file does in one plain English sentence.

## 2. Real-World Analogy
Compare this file's role to something from everyday life (restaurant kitchen, post office, traffic light, etc.)

## 3. ASCII Diagram
Draw a simple ASCII diagram showing:
- What goes IN to this file (inputs/dependencies)
- What this file DOES (core logic)
- What comes OUT (exports/side effects)

```
  [Input A] ──┐
               ├──▶ [ This File ] ──▶ [Output]
  [Input B] ──┘
```

## 4. Step-by-Step Walkthrough
Walk through the code top-to-bottom, explaining each section in plain language.

## 5. One Gotcha
What is one common mistake or misconception about this code?
