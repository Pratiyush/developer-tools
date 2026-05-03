---
description: Append a new Architecture Decision Record to memory/decisions.md.
argument-hint: <short-title>
---

Add a new ADR to `memory/decisions.md` with the title `$ARGUMENTS`:

1. Read `memory/decisions.md` to find the next ADR number.
2. Insert the new entry **at the top** (newest-first), using the format already in the file:
   - **Date:** today's date (YYYY-MM-DD)
   - **Status:** Proposed
   - **Context:** ask the user 1–2 questions if it isn't already clear from the conversation
   - **Decision:** the decision in one or two sentences
   - **Consequences:** trade-offs accepted

Don't commit. Show the diff and stop.
