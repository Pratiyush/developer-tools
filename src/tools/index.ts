import type { ToolModule } from '../lib/types';
import { tool as base64StringConverter } from './01-encoding/001-base64-string-converter';
import { tool as base64BasicAuth } from './01-encoding/002-base64-basic-auth';
import { tool as htmlEntities } from './01-encoding/003-html-entities';

// Auto-managed by `pnpm new-tool`. Add new tool imports above the closing `];`.
// Each tool module's state generic is widened to `never` for the registry —
// the registry itself never reads tool state, only routes between them.
export const TOOLS: readonly ToolModule<never>[] = [
  base64StringConverter as unknown as ToolModule<never>,
  base64BasicAuth as unknown as ToolModule<never>,
  htmlEntities as unknown as ToolModule<never>,
];
