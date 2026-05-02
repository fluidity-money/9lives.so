import { strict as assert } from "node:assert";
import { execFile } from "node:child_process";
import { test } from "node:test";
import { promisify } from "node:util";

import { generateOutcomeId } from "../web/src/utils/generateId";

const getGoId = promisify(execFile);

test("Go and TypeScript outcome ID generation match", async () => {
  const name = "Yes";
  const seed = 2429095232877049;
  const { stdout } = await getGoId("go", [
    "run",
    "./scripts/outcome-id",
    name,
    seed.toString(),
  ]);
  const generatedGoId = stdout.trim();

  assert.equal(generatedGoId, generateOutcomeId(name, seed));
});
