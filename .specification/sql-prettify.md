# SQL prettify and format

## Overview
- **Path:** `/sql-prettify`
- **Category:** Development
- **Description:** Format and prettify your SQL queries online (it supports various SQL dialects).
- **Keywords:** sql, prettify, beautify, GCP BigQuery, IBM DB2, Apache Hive, MariaDB, MySQL, Couchbase N1QL, Oracle PL/SQL, PostgreSQL, Amazon Redshift, Spark, SQL Server Transact-SQL
- **Redirect from:** (none)

## Purpose
Takes a raw, unformatted SQL query and produces a pretty-printed, indented version aligned to the conventions of a specific SQL dialect. Useful for auditing queries pasted from logs, normalizing query formatting before commit, or making complex generated SQL human-readable. Supports thirteen dialects from BigQuery to T-SQL, configurable keyword case, and three indentation styles.

## Inputs
| Name | Type | Default | Validation |
|------|------|---------|-----------|
| `rawSQL` | `string` (multiline, monospace, 20 rows) | `'select field1,field2,field3 from my_table where my_condition;'` | None — invalid SQL is passed to the formatter unchanged or raises a recoverable error. `autocomplete`, `autocorrect`, `autocapitalize`, `spellcheck` all disabled. |
| `config.language` | dialect enum (`'bigquery' \| 'db2' \| 'hive' \| 'mariadb' \| 'mysql' \| 'n1ql' \| 'plsql' \| 'postgresql' \| 'redshift' \| 'spark' \| 'sql' \| 'sqlite' \| 'tsql'`) | `'sql'` (Standard SQL) | One of the listed `<c-select>` options. |
| `config.keywordCase` | `'upper' \| 'lower' \| 'preserve'` | `'upper'` | One of the three `<c-select>` options. |
| `config.indentStyle` | `'standard' \| 'tabularLeft' \| 'tabularRight'` | `'standard'` | One of the three `<c-select>` options. |
| `config.useTabs` | `boolean` (internal — not exposed in UI) | `false` | Hard-coded — always uses spaces. |
| `config.tabulateAlias` | `boolean` (internal — not exposed in UI) | `true` | Hard-coded — aligns aliases on the same column. |

## Outputs
| Name | Type | Description |
|------|------|-------------|
| `prettySQL` | `string` | The formatted version of `rawSQL`, computed reactively from the current `config`. Rendered through `<TextareaCopyable>` with SQL syntax highlighting and a copy button overlay. |

## UI / Components
- **Top bar** with three `<c-select>` controls (stacked into a column on small screens):
  1. **Dialect** — 13 options (see Inputs).
  2. **Keyword case** — `UPPERCASE`, `lowercase`, `Preserve`.
  3. **Indent style** — `Standard`, `Tabular left`, `Tabular right`.
- **Input** `<c-input-text>` with label "Your SQL query", 20 rows, monospace, autocomplete/correct/capitalize/spellcheck off, multiline.
- **Output** `<TextareaCopyable>` with label "Prettify version of your query"; uses `language="sql"` to drive Prism/Highlight.js syntax highlighting and `:follow-height-of="inputElement"` so the output matches the input height.
- Output card uses scoped `.result-card` styling with an absolutely positioned copy button (`top: 10px; right: 10px`).

## Logic / Algorithm
The component delegates entirely to the `sql-formatter` library:

```ts
const config = reactive<FormatOptionsWithLanguage>({
  keywordCase: 'upper',
  useTabs: false,
  language: 'sql',
  indentStyle: 'standard',
  tabulateAlias: true,
});

const rawSQL = ref('select field1,field2,field3 from my_table where my_condition;');
const prettySQL = computed(() => formatSQL(rawSQL.value, config));
```

On each change to `rawSQL` or any field of `config`, the formatter:
1. Tokenizes input using the dialect-specific lexer (`language`).
2. Reformats keywords according to `keywordCase` (`UPPER`, `lower`, or original).
3. Reflows the AST into clauses on new lines, indented by 2 spaces (because `useTabs: false`), using either standard alignment, left-tabular, or right-tabular indentation.
4. With `tabulateAlias: true`, aligns column aliases vertically.
5. Emits a string.

If `formatSQL` throws on a syntax it cannot parse, the error propagates to Vue's reactive system. Note: there is no `withDefaultOnError` wrapper here — the output may show an error string from `sql-formatter` rather than a clean fallback.

## Dependencies
- **`sql-formatter`** — full SQL parser/formatter library; supplies dialect-aware lexers and the `format` function. Type `FormatOptionsWithLanguage` is imported alongside.
- **`@/components/TextareaCopyable`** — read-only textarea with syntax-highlighting (`language="sql"`) and a hover/anchored copy button; supports `follow-height-of` to size match another element.
- **`@/stores/style.store#useStyleStore`** — reactive store exposing `isSmallScreen` for responsive layout switching.
- Vue 3 Composition API (`ref`, `reactive`, `computed`).
- Naive UI: `n-form-item`. Custom `c-*` components: `c-select`, `c-input-text`.

## Edge Cases & Validation
- **Empty input** → `formatSQL('')` returns `''`.
- **Syntactically invalid SQL** → `sql-formatter` is intentionally lenient with most input but may throw on severe malformations; the error string from the throw bubbles up because there is no try/catch.
- **Very long queries** — formatter runs synchronously on every keystroke and on every option change. Could be slow on very large queries (no debounce).
- **Dialect mismatch** — feeding T-SQL into the `postgresql` formatter still works but reserved-word handling and case may be wrong.
- **Mixed quoting / odd identifiers** — quoted identifiers (`` `foo` ``, `[foo]`, `"foo"`) are dialect-specific; output may differ from input.

## Examples

### Example 1 — default content with default settings
**Input:**
```
select field1,field2,field3 from my_table where my_condition;
```
**Output (Standard SQL, UPPERCASE, Standard indent):**
```sql
SELECT
  field1,
  field2,
  field3
FROM
  my_table
WHERE
  my_condition;
```

### Example 2 — joined query with `tabularLeft`
**Input:**
```
select u.id, u.name as user_name, p.title as post_title from users u join posts p on p.user_id = u.id where u.active = 1 order by u.id desc;
```
**Output (PostgreSQL, UPPERCASE, Tabular left):**
```sql
SELECT    u.id,
          u.name AS user_name,
          p.title AS post_title
FROM      users u
JOIN      posts p
  ON      p.user_id = u.id
WHERE     u.active = 1
ORDER BY  u.id DESC;
```

### Example 3 — lowercase keyword preference
**Input:**
```
SELECT * FROM tbl WHERE x = 1;
```
**Output (Standard SQL, `lowercase`, Standard indent):**
```sql
select
  *
from
  tbl
where
  x = 1;
```

## File Structure
| File | Purpose |
|------|---------|
| `index.ts` | Tool registration metadata (name, path, description, keywords, icon, component loader). |
| `sql-prettify.vue` | Vue component with the dialect/case/indent selectors, raw input textarea, and copyable output. All formatting logic lives in `sql-formatter`. |

## Notes
- **i18n:** title and description come from `tools.sql-prettify.{title,description}` keys via `translate()`.
- **Persistence:** none — neither config nor input is saved across reloads.
- **Icon:** `Database` from `@vicons/tabler`.
- **Responsive:** the three selects collapse from a horizontal row to a vertical stack when `useStyleStore().isSmallScreen` is `true`.
- **Output sync:** the output textarea height tracks the input height via the `follow-height-of` prop on `<TextareaCopyable>`.
- **No download option** — output is copy-only.
- The hard-coded values `useTabs: false` and `tabulateAlias: true` are not user-configurable; users wanting tabs or non-tabular aliases would need to override at the source.
