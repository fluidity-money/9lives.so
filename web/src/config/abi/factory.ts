const factoryAbi = [
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
    name: "newTrading03B23698",
    inputs: [
      {
        name: "outcomes",
        type: "tuple[]",
        internalType: "struct INineLivesFactory.Outcome[]",
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
    ],
    outputs: [
      {
        name: "",
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
