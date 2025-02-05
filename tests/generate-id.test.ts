import assert from 'assert';
import { generateOutcomeId } from '../web/src/utils/generateId';
import { exec } from "child_process";
import { describe, it } from "node:test"
import { promisify } from 'util';

describe('Node,js and Go id generation should be same', async () => {
    const name = 'Yes'
    const seed = 2429095232877049
    const command = `go run scripts/generate-id.go ${name} ${seed}`;
    const getGoId = promisify(exec)
    const { stdout } = await getGoId(command)
    const stdoutArr = stdout.trim().split(',')
    const generatedGoId = stdoutArr[stdoutArr.length - 1]
    assert.equal(generatedGoId, generateOutcomeId(name, seed), 'ids have to be equal')
})