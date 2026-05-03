# Memory

Long-form, durable context for Claude (and any human collaborator) about this project.

`CLAUDE.md` at the repo root is the **working memory** — short, always-loaded, refreshed often.
This `memory/` directory is the **knowledge base** — deeper, slower-changing, loaded on demand.

## Files

| File             | What it holds                                               |
| ---------------- | ----------------------------------------------------------- |
| `glossary.md`    | Project-specific terms, acronyms, and shorthand             |
| `people.md`      | Collaborators, roles, and how to reach them                 |
| `projects.md`    | Related projects, upstream/downstream dependencies          |
| `decisions.md`   | Architecture Decision Records — choices and their rationale |
| `conventions.md` | Coding and review conventions in detail                     |

## How to use it

- **Adding a fact?** If it's a one-line tip Claude will need every session, put it in `CLAUDE.md`. If it's a paragraph of background, put it here and link to it from `CLAUDE.md`.
- **Adding a decision?** Append to `decisions.md` as `ADR-NNN: <title>` with date, context, decision, consequences.
- **Updating people/projects?** Keep entries terse — name, role, one-line context, link.

Keep this directory honest. Stale memory is worse than no memory.
