const factoryAbi = [
  {
    type: "function",
    name: "ctor",
    inputs: [
      {
        name: "shareImpl",
        type: "address",
        internalType: "address",
      },
      {
        name: "tradingExtrasImpl",
        type: "address",
        internalType: "address",
      },
      {
        name: "tradingMintImpl",
        type: "address",
        internalType: "address",
      },
      {
        name: "infraMarketOracle",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "erc20Hash",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "erc20Impl",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getOwner",
    inputs: [
      {
        name: "addr",
        type: "address",
        internalType: "address",
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
    name: "newTradingC11AAA3B",
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
        name: "documentation",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "feeRecipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "tradingAddr",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "tradingHash",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    stateMutability: "view",
  },
] as const;

export default factoryAbi;
