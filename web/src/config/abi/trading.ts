const tradingAbi = [
  {
    type: "function",
    name: "ctor",
    inputs: [
      {
        name: "outcomes",
        type: "tuple[]",
        internalType: "struct Outcome[]",
        components: [
          {
            name: "identifier",
            type: "bytes8",
            internalType: "bytes8",
          },
          {
            name: "amount",
            type: "uint256",
            internalType: "uint256",
          },
        ],
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
        name: "isWinner",
        type: "bool",
        internalType: "bool",
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
    name: "mint227CF432",
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
    name: "mintPermitB8D681AD",
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
        name: "deadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "recipient",
        type: "address",
        internalType: "address",
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
    name: "payoff",
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
    name: "priceF3C364BC",
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
    name: "quote101CBE35",
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
