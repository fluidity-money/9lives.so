const buyHelperAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_factory",
        type: "address",
        internalType: "contract INineLivesFactory",
      },
      {
        name: "_longtail",
        type: "address",
        internalType: "contract ILongtail",
      },
      {
        name: "_fusdc",
        type: "address",
        internalType: "address",
      },
      {
        name: "_weth",
        type: "address",
        internalType: "contract IWETH10",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "burn",
    inputs: [
      {
        name: "_tradingAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "_outcome",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "_maxShareOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_minShareOut",
        type: "uint256",
        internalType: "uint256",
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
    name: "mint",
    inputs: [
      {
        name: "_tradingAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "_asset",
        type: "address",
        internalType: "address",
      },
      {
        name: "_outcome",
        type: "bytes8",
        internalType: "bytes8",
      },
      {
        name: "_minShareOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_referrer",
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
    stateMutability: "payable",
  },
] as const;
export default buyHelperAbi;
