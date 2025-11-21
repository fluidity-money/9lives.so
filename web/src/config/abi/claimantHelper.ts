const claimantAbi = [
  {
    type: "function",
    name: "claim",
    inputs: [
      {
        name: "_pools",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [
      {
        name: "results",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "payoff",
    inputs: [
      {
        name: "_pools",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [
      {
        name: "results",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
  },
] as const;

export default claimantAbi;
