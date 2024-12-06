import keccak from "keccak";

export function randomValue4Uint8() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

export function generateId(
  name: string | undefined,
  desc: string | undefined,
  seed: number,
) {
  try {
    // Ensure the seed is a valid max safe integer of js value
    if (
      typeof seed !== "number" ||
      seed < 0 ||
      seed > Number.MAX_SAFE_INTEGER ||
      !Number.isInteger(seed)
    ) {
      throw new Error(
        "Seed must be an max safe integer (2 ^ 53 -1) unsigned integer (uint64 float).",
      );
    }
    const nameBuffer = Buffer.from(name ?? "", "utf-8");
    const descBuffer = Buffer.from(desc ?? "", "utf-8");
    const seedBuffer = Buffer.alloc(8);
    seedBuffer.writeBigUInt64BE(BigInt(seed)); // Use BigInt for a 64-bit unsigned integer
    const combinedBuffer = Buffer.concat([nameBuffer, descBuffer, seedBuffer]);
    const hash = keccak("keccak256").update(combinedBuffer).digest();
    return `0x${hash.subarray(0, 8).toString("hex")}` as `0x${string}`;
  } catch (err) {
    console.error("Error generating outcome ID:", err);
    throw err;
  }
}
