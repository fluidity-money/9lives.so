const helperAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_fusdc",
        type: "address",
        internalType: "contract IERC20Permit",
      },
      {
        name: "_factory",
        type: "address",
        internalType: "contract INineLivesFactory",
      },
      {
        name: "_infraMarket",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createWithInfraMarket",
    inputs: [
      {
        name: "outcomes",
        type: "tuple[]",
        internalType: "struct FactoryOutcome[]",
        components: [
          {
            name: "identifier",
            type: "bytes8",
            internalType: "bytes8",
          },
          {
            name: "sqrtPrice",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
        ],
      },
      {
        name: "timeEnding",
        type: "uint64",
        internalType: "uint64",
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
    name: "createWithInfraMarketPermit",
    inputs: [
      {
        name: "outcomes",
        type: "tuple[]",
        internalType: "struct FactoryOutcome[]",
        components: [
          {
            name: "identifier",
            type: "bytes8",
            internalType: "bytes8",
          },
          {
            name: "sqrtPrice",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
        ],
      },
      {
        name: "timeEnding",
        type: "uint64",
        internalType: "uint64",
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
        name: "tradingAddr",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
];
export default helperAbi;
