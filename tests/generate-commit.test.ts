import assert from 'assert';
import { generateCommit } from '../web/src/utils/generateCommit';
import { exec } from "child_process";
import { describe, it } from "node:test"
import { promisify } from 'util';

describe('Node.js and Rust commit hash generation should be the same', async () => {
    const committer = '0xa56333f8738fcb8247e8a27aed8a207d981f79c0'; 
    const outcome = '0x32ff350d90e67a2e';
    const seed = 2429095232877049n; 

    const command = `rust-script scripts/generate_commit.rs ${committer} ${outcome} ${seed}`;
    const getRustCommit = promisify(exec);
    const { stdout } = await getRustCommit(command);
    
    const generatedRustCommit = stdout.trim();

    assert.equal(generatedRustCommit, generateCommit(committer, outcome, seed), 'Commit hashes must be equal');
});