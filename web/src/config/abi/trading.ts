const tradingAbi = [
  {
    type: "function",
    name: "ctor",
    inputs: [
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
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "timeEnding",
        type: "uint256",
        internalType: "uint256",
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
    name: "mint0D365EC6",
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
    name: "payoff91FA8C2E",
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
        name: "value",
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
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export default tradingAbi;
