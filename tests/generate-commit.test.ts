import assert from 'assert';
import { generateCommit } from '../web/src/utils/generateCommit';
import { describe, it } from "node:test"

describe('Node.js and Rust commit hash generation should be the same', async () => {
    const committer = '0xd8e78951d5bd1dee358d9772464d45025338b6bf';
    const outcome = '0x21e44c00f545271b';
    const seed1 = 123;
    const expectedHash1 = "0x05e244a43f9f06def22e334260ba61a0c9a147fe05ea4aeda79cd7f6212e53de"
    it("Hash should be the same", () => assert.equal(generateCommit(committer, outcome, seed1), expectedHash1, 'Commit hashes must be equal'))

    const seed2 = BigInt(9007199254740991);
    const expectedHash2 = "0xe64424daa61a96b362f80495e452f87b684e374069c53af3d08c9758db8c2a98"
    it("Hash should be the same", () => assert.equal(generateCommit(committer, outcome, seed2), expectedHash2, 'Commit hashes must be equal'))

    const seed3 = BigInt("340282366920938463463374607431768211454") // or 340282366920938463463374607431768211454n
    const expectedHash3 = "0xcd5cc073f288e1a22a42327b6831eb29b0c09bbf7b8a95386d0b55e2a24be97f"
    it("Hash should be the same", () => assert.equal(generateCommit(committer, outcome, seed3), expectedHash3, 'Commit hashes must be equal'))
});