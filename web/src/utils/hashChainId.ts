import keccak from "keccak";
export function hashChainId(preImg: number) {
  const value = BigInt(preImg);
  const hex = value.toString(16).padStart(64, "0"); // to uint256
  const encoded = Buffer.from(hex, "hex");
  const hash = keccak("keccak256").update(encoded).digest("hex");
  return `0x${hash}` as const;
}
