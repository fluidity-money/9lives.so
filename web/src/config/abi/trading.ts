const tradingAbi = [
  {
    type: "function",
    name: "addLiquidityB9DDA952",
    inputs: [
      {
        name: "liquidity",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "minShares",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxShares",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "userLiquidity",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "burn854CC96E",
    inputs: [
      {
        name: "outcome",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "shouldEstimateShares",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "minShares",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "referrer",
        type: "address",
        internalType: "address",
      },
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "burnedShares",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "fusdcReturned",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimAllFees332D7968",
    inputs: [
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "ctor",
    inputs: [
      {
        name: "ctorArgs",
        type: "tuple",
        internalType: "struct CtorArgs",
        components: [
          {
            name: "outcomes",
            type: "bytes8[]",
            internalType: "bytes8[]",
          },
          {
            name: "oracle",
            type: "address",
            internalType: "address",
          },
          {
            name: "timeStart",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "timeEnding",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "feeRecipient",
            type: "address",
            internalType: "address",
          },
          {
            name: "shareImpl",
            type: "address",
            internalType: "address",
          },
          {
            name: "shouldBufferTime",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "feeCreator",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "feeMinter",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "feeLp",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "feeReferrer",
            type: "uint64",
            internalType: "uint64",
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "decide",
    inputs: [
      {
        name: "outcome",
        type: "bytes8",
        internalType: "bytes8",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "details",
    inputs: [
      {
        name: "outcomeId",
        type: "bytes8",
        internalType: "bytes8",
      },
    ],
    outputs: [
      {
        name: "shares",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "invested",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "globalInvested",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "winner",
        type: "bytes8",
        internalType: "bytes8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "dppmClawback",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "dppmPayoffForAll58633B6E",
    inputs: [
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "outcome0Fusdc",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "outcome1Fusdc",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "dppmSimulateEarningsB866B112",
    inputs: [
      {
        name: "invested",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "outcome",
        type: "bytes8",
        internalType: "bytes8",
      },
    ],
    outputs: [
      {
        name: "dppmFusdc",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "ninetailsWinnerFusdc",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "ninetailsLoserFusdc",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "dppmSimulatePayoffForAddress",
    inputs: [
      {
        name: "spender",
        type: "address",
        internalType: "address",
      },
      {
        name: "outcome",
        type: "bytes8",
        internalType: "bytes8",
      },
    ],
    outputs: [
      {
        name: "dppmFusdc",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "ninetailsWinnerFusdc",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "ninetailsLoserFusdc",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "dppmSimulatePayoffForAddressAll",
    inputs: [
      {
        name: "spender",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "outcome1",
        type: "tuple",
        internalType: "struct INineLivesTrading.SimulatedPayoff1",
        components: [
          {
            name: "dppmFusdc",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "ninetailsWinnerFusdc",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "ninetailsLoserFusd",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "outcome2",
        type: "tuple",
        internalType: "struct INineLivesTrading.SimulatedPayoff2",
        components: [
          {
            name: "dppmFusdc",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "ninetailsWinnerFusdc",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "ninetailsLoserFusd",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "escape",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "estimateBurnE9B09A17",
    inputs: [
      {
        name: "outcome",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "shareAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "fees62DAA154",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct INineLivesTrading.Fees",
        components: [
          {
            name: "feeCreator",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "feeMinter",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "feeLp",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "feeReferrer",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "globalShares",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "invested",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isDpm",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "isDppm",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "mint8A059B6E",
    inputs: [
      {
        name: "outcome",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "value",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "referrer",
        type: "address",
        internalType: "address",
      },
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "oracle",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "outcomeList",
    inputs: [],
    outputs: [
      {
        name: "outcomes",
        type: "bytes8[]",
        internalType: "bytes8[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "payoffCB6F2565",
    inputs: [
      {
        name: "outcomeId",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "priceA827ED27",
    inputs: [
      {
        name: "outcome",
        type: "bytes8",
        internalType: "bytes8",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "quoteC0E17FC7",
    inputs: [
      {
        name: "outcome",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "fusdcValue",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "purchased",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "fees",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "boostedShares",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeLiquidity3C857A15",
    inputs: [
      {
        name: "liquidity",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "fusdcAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "lpFeesEarned",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "rescue276DD9AB",
    inputs: [
      {
        name: "recipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "shareAddr",
    inputs: [
      {
        name: "outcomeId",
        type: "bytes8",
        internalType: "bytes8",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "shutdown",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "timeEnding",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint64",
        internalType: "uint64",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "timeStart",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint64",
        internalType: "uint64",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "userLiquidityShares",
    inputs: [
      {
        name: "spender",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "pure",
  },
] as const;

export default tradingAbi;
