export const convertQuoteToRoute = (quote: any) => {
  if (!quote.estimate.fromAmountUSD) {
    throw new Error("Missing 'fromAmountUSD' in step estimate.");
  }

  if (!quote.estimate.toAmountUSD) {
    throw new Error("Missing 'toAmountUSD' in step estimate.");
  }

  const route = {
    id: quote.id,
    fromChainId: quote.action.fromToken.chainId,
    fromToken: quote.action.fromToken,
    fromAmount: quote.action.fromAmount,
    fromAmountUSD: quote.estimate.fromAmountUSD,
    fromAddress: quote.action.fromAddress,
    toChainId: quote.action.toToken.chainId,
    toToken: quote.action.toToken,
    toAmount: quote.estimate.toAmount,
    toAmountMin: quote.estimate.toAmountMin,
    toAmountUSD: quote.estimate.toAmountUSD,
    toAddress: quote.action.toAddress || quote.action.fromAddress,
    gasCostUSD: quote.estimate.gasCosts?.[0].amountUSD,
    steps: [quote],
    insurance: { state: "NOT_INSURABLE", feeAmountUsd: "0" },
  };

  return route;
};
