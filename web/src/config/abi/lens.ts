const lensAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_longtail",
        type: "address",
        internalType: "contract ILongtail",
      },
      {
        name: "_factory",
        type: "address",
        internalType: "contract INineLivesFactory",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balances",
    inputs: [
      {
        name: "_spender",
        type: "address",
        internalType: "address",
      },
      {
        name: "_identifiers",
        type: "tuple[]",
        internalType: "struct LensesV1.Balances[]",
        components: [
          {
            name: "campaign",
            type: "bytes8",
            internalType: "bytes8",
          },
          {
            name: "word",
            type: "bytes32[]",
            internalType: "bytes32[]",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "bals",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "factory",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract INineLivesFactory",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLongtailQuote",
    inputs: [
      {
        name: "_pool",
        type: "address",
        internalType: "address",
      },
      {
        name: "_zeroForOne",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "_amount",
        type: "int256",
        internalType: "int256",
      },
      {
        name: "_priceLimit",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "data",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getShareAddr",
    inputs: [
      {
        name: "_campaignId",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "_outcomeId",
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
    name: "longtail",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ILongtail",
      },
    ],
    stateMutability: "view",
  },
] as const;

export default lensAbi;
