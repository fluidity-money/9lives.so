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
    name: "FACTORY",
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
    name: "LONGTAIL",
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
  {
    type: "function",
    name: "balancesForAll",
    inputs: [
      {
        name: "_pools",
        type: "address[]",
        internalType: "contract INineLivesTrading[]",
      },
    ],
    outputs: [
      {
        name: "bals",
        type: "tuple[]",
        internalType: "struct LensesV1.BalancesForAll[]",
        components: [
          {
            name: "amount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "id",
            type: "bytes8",
            internalType: "bytes8",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balancesWithFactoryAndHash",
    inputs: [
      {
        name: "_factory",
        type: "address",
        internalType: "contract INineLivesFactory",
      },
      {
        name: "_hash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_tradingAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "_words",
        type: "bytes32[]",
        internalType: "bytes32[]",
      },
      {
        name: "_spender",
        type: "address",
        internalType: "address",
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
        name: "_factory",
        type: "address",
        internalType: "contract INineLivesFactory",
      },
      {
        name: "_hash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "_tradingAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "_outcomeId",
        type: "bytes8",
        internalType: "bytes8",
      },
    ],
    outputs: [
      {
        name: "shareAddr",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "pure",
  },
] as const;

export default lensAbi;
