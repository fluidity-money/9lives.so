const buyHelper2Abi = [
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
      {
        name: "_camelotSwapRouter",
        type: "address",
        internalType: "contract ICamelotSwapRouter",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "CAMELOT_SWAP_ROUTER",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ICamelotSwapRouter",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ERC20_HASH",
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
    name: "FUSDC",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IERC20",
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
    name: "WETH",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IWETH10",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addLiquidity",
    inputs: [
      {
        name: "_tradingAddr",
        type: "address",
        internalType: "address",
      },
      {
        name: "_amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_recipient",
        type: "address",
        internalType: "address",
      },
      {
        name: "_minLiquidity",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_maxLiquidity",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_tokens",
        type: "tuple[]",
        internalType: "struct AddLiquidityTokens[]",
        components: [
          {
            name: "identifier",
            type: "bytes8",
            internalType: "bytes8",
          },
          {
            name: "minToken",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "maxToken",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "res",
        type: "tuple",
        internalType: "struct BuyHelper2.AddLiquidityRes",
        components: [
          {
            name: "liq",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "tokens",
            type: "tuple[]",
            internalType: "struct BuyHelper2.AddLiquidityResToken[]",
            components: [
              {
                name: "token",
                type: "bytes8",
                internalType: "bytes8",
              },
              {
                name: "amt",
                type: "uint256",
                internalType: "uint256",
              },
            ],
          },
        ],
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
        name: "_minFusdc",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_sharesToBurn",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_minShareOut",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_maxShareBurned",
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
    name: "getShareAddr",
    inputs: [
      {
        name: "_factory",
        type: "address",
        internalType: "contract INineLivesFactory",
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
        name: "",
        type: "address",
        internalType: "contract IERC20",
      },
    ],
    stateMutability: "view",
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
        name: "_maxSharesOut",
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
      {
        name: "_rebate",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_deadline",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_recipient",
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

export default buyHelper2Abi;
