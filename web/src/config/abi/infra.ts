const infraAbi = [
  {
    type: "function",
    name: "call",
    inputs: [
      {
        name: "trading",
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
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "close",
    inputs: [
      {
        name: "trading",
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
    name: "predict",
    inputs: [
      {
        name: "trading",
        type: "address",
        internalType: "address",
      },
      {
        name: "winner",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
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
        name: "incentiveSender",
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
        name: "defaultWinner",
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
    name: "sweep",
    inputs: [
      {
        name: "trading",
        type: "address",
        internalType: "address",
      },
      {
        name: "victim",
        type: "address",
        internalType: "address",
      },
      {
        name: "outcomes",
        type: "bytes8[]",
        internalType: "bytes8[]",
      },
      {
        name: "onBehalfOfAddr",
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
        name: "yieldForCaller",
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
        name: "trading",
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
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "winner",
    inputs: [
      {
        name: "trading",
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
    stateMutability: "nonpayable",
  },
] as const;
export default infraAbi;
