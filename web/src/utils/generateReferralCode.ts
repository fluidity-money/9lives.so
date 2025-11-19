export function generateReferralCode(length: number = 8) {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(
      (window.crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) *
        charset.length,
    );
    code += charset[randomIndex];
  }
  return code;
}
