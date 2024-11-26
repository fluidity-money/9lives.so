import keccak from "keccak";

export function randomValue4Uint8() {
  return Math.floor(Math.random() * 256);
}

export function generateId(
  name: string | undefined,
  desc: string | undefined,
  seed: number,
) {
  try {
    // Ensure the seed is a valid uint8 value
    if (
      typeof seed !== "number" ||
      seed < 0 ||
      seed > 255 ||
      !Number.isInteger(seed)
    ) {
      throw new Error("Seed must be an 8-bit unsigned integer (uint8).");
    }
    const nameBuffer = Buffer.from(name ?? "", "utf-8");
    const descBuffer = Buffer.from(desc ?? "", "utf-8");
    const seedBuffer = Buffer.alloc(1);
    seedBuffer.writeUInt8(seed); // Write seed as uint8
    const combinedBuffer = Buffer.concat([nameBuffer, descBuffer, seedBuffer]);
    const hash = keccak("keccak256").update(combinedBuffer).digest();
    return `0x${hash.subarray(0, 8).toString("hex")}`;
  } catch (err) {
    console.error("Error generating outcome ID:", err);
    throw err;
  }
}
