const infraAbi = [
  {
    type: "function",
    name: "call",
    inputs: [
      {
        name: "tradingAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "winner",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "incentiveRecipient",
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
    name: "capture",
    inputs: [
      {
        name: "tradingAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "epochNo",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "feeRecipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "yieldForFeeRecipient",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "close",
    inputs: [
      {
        name: "tradingAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "feeRecipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "declare",
    inputs: [
      {
        name: "tradingAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "outcomes",
        type: "bytes8[]",
        internalType: "bytes8[]",
      },
      {
        name: "feeRecipient",
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
    name: "enable_contract",
    inputs: [
      {
        name: "status",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "escape",
    inputs: [
      {
        name: "tradingAddr",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "predict",
    inputs: [
      {
        name: "tradingAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "commit",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "register",
    inputs: [
      {
        name: "trading",
        type: "address",
        internalType: "address",
      },
      {
        name: "desc",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "launchTs",
        type: "uint64",
        internalType: "uint64",
      },
      {
        name: "callDeadlineTs",
        type: "uint64",
        internalType: "uint64",
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
    name: "reveal",
    inputs: [
      {
        name: "tradingAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "committerAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "outcome",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "seed",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "status",
    inputs: [
      {
        name: "tradingAddr",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "currentState",
        type: "uint8",
        internalType: "enum InfraMarketState",
      },
      {
        name: "secsRemaining",
        type: "uint64",
        internalType: "uint64",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "sweep",
    inputs: [
      {
        name: "tradingAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "epochNo",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "victim",
        type: "address",
        internalType: "address",
      },
      {
        name: "feeRecipientAddr",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "yieldForFeeRecipient",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "whinge",
    inputs: [
      {
        name: "tradingAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "preferredOutcome",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "bondRecipient",
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
    name: "winner",
    inputs: [
      {
        name: "tradingAddr",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "winnerId",
        type: "bytes8",
        internalType: "bytes8",
      },
    ],
    stateMutability: "view",
  },
] as const;
export default infraAbi;
