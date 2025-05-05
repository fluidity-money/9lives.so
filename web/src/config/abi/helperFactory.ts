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
      {
        name: "_beautyContest",
        type: "address",
        internalType: "address",
      },
      {
        name: "_sarpAi",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "BEAUTY_CONTEST",
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
    name: "INFRA_MARKET",
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
    name: "SARP_AI",
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
    name: "createWithAI",
    inputs: [
      {
        name: "_a",
        type: "tuple",
        internalType: "struct CreateArgs",
        components: [
          {
            name: "oracle",
            type: "address",
            internalType: "address",
          },
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
            name: "feeCreator",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "feeLp",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "feeMinter",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "feeReferrer",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "seedLiquidity",
            type: "uint256",
            internalType: "uint256",
          },
        ],
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
    name: "createWithBeautyContest",
    inputs: [
      {
        name: "_a",
        type: "tuple",
        internalType: "struct CreateArgs",
        components: [
          {
            name: "oracle",
            type: "address",
            internalType: "address",
          },
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
            name: "feeCreator",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "feeLp",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "feeMinter",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "feeReferrer",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "seedLiquidity",
            type: "uint256",
            internalType: "uint256",
          },
        ],
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
    name: "createWithCustom",
    inputs: [
      {
        name: "_a",
        type: "tuple",
        internalType: "struct CreateArgs",
        components: [
          {
            name: "oracle",
            type: "address",
            internalType: "address",
          },
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
            name: "feeCreator",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "feeLp",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "feeMinter",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "feeReferrer",
            type: "uint64",
            internalType: "uint64",
          },
          {
            name: "seedLiquidity",
            type: "uint256",
            internalType: "uint256",
          },
        ],
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
] as const;
export default helperAbi;
