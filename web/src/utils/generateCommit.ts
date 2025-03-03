import keccak from "keccak";
import { Buffer } from "buffer";

export function generateCommit(
  committer: string,
  outcome: string,
  seed: bigint | number,
): `0x${string}` {
  if (!/^0x[a-fA-F0-9]{40}$/.test(committer)) {
    throw new Error("Invalid Ethereum address length");
  }
  if (!/^0x[a-fA-F0-9]{16}$/.test(outcome)) {
    throw new Error("Outcome must be a fixed 8-byte hex string (0x prefixed)");
  }
  const committerBuffer = Buffer.from(committer.slice(2), "hex"); // 20 byte
  const outcomeBuffer = Buffer.from(outcome.slice(2), "hex"); // 8 byte
  const seedBuffer = Buffer.from(seed.toString(16).padStart(64, "0"), "hex"); // 32 byte
  const concatenated = Buffer.concat([
    committerBuffer,
    outcomeBuffer,
    seedBuffer,
  ]);
  const hash = keccak("keccak256")
    .update(concatenated)
    .digest()
    .toString("hex");
  return `0x${hash}`;
}
