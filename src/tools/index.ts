import type { ToolModule } from '../lib/types';
import { tool as base64StringConverter } from './01-encoding/001-base64-string-converter';
import { tool as base64BasicAuth } from './01-encoding/002-base64-basic-auth';
import { tool as htmlEntities } from './01-encoding/003-html-entities';
import { tool as urlEncodeDecode } from './01-encoding/004-url-encode-decode';
import { tool as jwtDecoder } from './01-encoding/005-jwt-decoder';
import { tool as uuidGenerator } from './10-data/006-uuid';
import { tool as ulidGenerator } from './10-data/007-ulid';
import { tool as passwordGenerator } from './10-data/008-password';
import { tool as hashTool } from './02-crypto/009-hash';
import { tool as caseTool } from './03-converter/010-case';
import { tool as baseConverter } from './07-math/011-base-converter';
import { tool as romanNumerals } from './07-math/012-roman';
import { tool as natoAlphabet } from './09-text/013-nato';
import { tool as wordcount } from './09-text/014-wordcount';
import { tool as lorem } from './09-text/015-lorem';
import { tool as chmodTool } from './08-measurement/016-chmod';
import { tool as asciiBinary } from './01-encoding/017-ascii-binary';
import { tool as colorTool } from './03-converter/018-color';
import { tool as unicodeTool } from './09-text/019-text-unicode';
import { tool as formatJson } from './06-development/020-format-json';
import { tool as regexTool } from './06-development/021-regex';
import { tool as diffTool } from './06-development/022-diff';
import { tool as mathEval } from './07-math/023-math-eval';
import { tool as datetimeTool } from './04-web/024-datetime';
import { tool as userAgentTool } from './04-web/025-user-agent';
import { tool as tokenGenerator } from './02-crypto/026-token-generator';
import { tool as hmacTool } from './02-crypto/027-hmac';
import { tool as base64File } from './01-encoding/028-base64-file';
import { tool as rsaKeyPair } from './02-crypto/029-rsa-keypair';
import { tool as encryptTool } from './02-crypto/030-encrypt';
import { tool as yamlJson } from './03-converter/031-yaml-json';
import { tool as yamlToml } from './03-converter/032-yaml-toml';
import { tool as jsonYaml } from './03-converter/033-json-yaml';
import { tool as jsonToml } from './03-converter/034-json-toml';
import { tool as bip39 } from './02-crypto/035-bip39';
import { tool as bcryptTool } from './02-crypto/036-bcrypt';

// Auto-managed by `pnpm new-tool`. Add new tool imports above the closing `];`.
// Each tool module's state generic is widened to `never` for the registry —
// the registry itself never reads tool state, only routes between them.
export const TOOLS: readonly ToolModule<never>[] = [
  base64StringConverter as unknown as ToolModule<never>,
  base64BasicAuth as unknown as ToolModule<never>,
  htmlEntities as unknown as ToolModule<never>,
  urlEncodeDecode as unknown as ToolModule<never>,
  jwtDecoder as unknown as ToolModule<never>,
  uuidGenerator as unknown as ToolModule<never>,
  ulidGenerator as unknown as ToolModule<never>,
  passwordGenerator as unknown as ToolModule<never>,
  hashTool as unknown as ToolModule<never>,
  caseTool as unknown as ToolModule<never>,
  baseConverter as unknown as ToolModule<never>,
  romanNumerals as unknown as ToolModule<never>,
  natoAlphabet as unknown as ToolModule<never>,
  wordcount as unknown as ToolModule<never>,
  lorem as unknown as ToolModule<never>,
  chmodTool as unknown as ToolModule<never>,
  asciiBinary as unknown as ToolModule<never>,
  colorTool as unknown as ToolModule<never>,
  unicodeTool as unknown as ToolModule<never>,
  formatJson as unknown as ToolModule<never>,
  regexTool as unknown as ToolModule<never>,
  diffTool as unknown as ToolModule<never>,
  mathEval as unknown as ToolModule<never>,
  datetimeTool as unknown as ToolModule<never>,
  userAgentTool as unknown as ToolModule<never>,
  tokenGenerator as unknown as ToolModule<never>,
  hmacTool as unknown as ToolModule<never>,
  base64File as unknown as ToolModule<never>,
  rsaKeyPair as unknown as ToolModule<never>,
  encryptTool as unknown as ToolModule<never>,
  yamlJson as unknown as ToolModule<never>,
  yamlToml as unknown as ToolModule<never>,
  jsonYaml as unknown as ToolModule<never>,
  jsonToml as unknown as ToolModule<never>,
  bip39 as unknown as ToolModule<never>,
  bcryptTool as unknown as ToolModule<never>,
];
