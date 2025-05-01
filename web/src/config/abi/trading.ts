const tradingAbi = [
  {
    type: "function",
    name: "addLiquidityPermit",
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
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "v",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "r",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [
      {
        name: "userLiquidity",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "liquidityAdded",
        type: "tuple[]",
        internalType: "struct INineLivesTrading.UserLiqAdded[]",
        components: [
          {
            name: "outcome",
            type: "bytes8",
            internalType: "bytes8",
          },
          {
            name: "sharesReceived",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "burn9C54A443",
    inputs: [
      {
        name: "outcome",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "fusdcAmount",
        type: "uint256",
        internalType: "uint256",
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
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "burnByShares9F3CB274",
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
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
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
    name: "claimAddressFees70938D8",
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
    name: "escape",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "estimateBurnFFCEBFF5",
    inputs: [
      {
        name: "outcome",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "shares",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "estimatedFusdc",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "fees",
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
    stateMutability: "view",
  },
  {
    type: "function",
    name: "mintPermit243EEC56",
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
      {
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "v",
        type: "uint8",
        internalType: "uint8",
      },
      {
        name: "r",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "s",
        type: "bytes32",
        internalType: "bytes32",
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
    name: "payoff85D8DFC9",
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
    name: "payoffQuote1FA6DC28",
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
    name: "quoteBurn8DBDCAC7",
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
        name: "",
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
      {
        name: "liquidityRemoved",
        type: "tuple[]",
        internalType: "struct INineLivesTrading.UserLiqRemoved[]",
        components: [
          {
            name: "outcome",
            type: "bytes8",
            internalType: "bytes8",
          },
          {
            name: "sharesReceived",
            type: "uint256",
            internalType: "uint256",
          },
        ],
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
] as const;

export default tradingAbi;
