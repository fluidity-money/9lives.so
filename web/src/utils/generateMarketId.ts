import keccak from "keccak";

export function generateMarketId(outcomeIds: string[]) {
  const bufferIds = outcomeIds.map((id) => Buffer.from(id, "hex"));
  bufferIds.sort((a, b) => {
    if (a.length !== b.length) {
      return a.length - b.length;
    }
    return Buffer.compare(a, b);
  });
  const combinedBuffer = Buffer.concat(bufferIds);
  const hash = keccak("keccak256")
    .update(combinedBuffer)
    .digest()
    .toString("hex");
  return hash as `0x${string}`;
}
