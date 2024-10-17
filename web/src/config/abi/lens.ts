const lensAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_factory",
        type: "address",
        internalType: "address",
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
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
] as const;

export default lensAbi;
