const paymasterAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_erc20",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "INITIAL_CHAIN_ID",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "INITIAL_SALT",
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
    name: "computeDomainSeparator",
    inputs: [
      {
        name: "_chainId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
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
    name: "domainSeparators",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
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
    name: "multicall",
    inputs: [
      {
        name: "operations",
        type: "tuple[]",
        internalType: "struct Operation[]",
        components: [
          {
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "originatingChainId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "typ",
            type: "uint8",
            internalType: "enum PaymasterType",
          },
          {
            name: "permitAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "permitR",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "permitS",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "permitV",
            type: "uint8",
            internalType: "uint8",
          },
          {
            name: "market",
            type: "address",
            internalType: "contract INineLivesTrading",
          },
          {
            name: "maximumFee",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amountToSpend",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "minimumBack",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "referrer",
            type: "address",
            internalType: "address",
          },
          {
            name: "outcome",
            type: "bytes8",
            internalType: "bytes8",
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
      },
    ],
    outputs: [
      {
        name: "statuses",
        type: "bool[]",
        internalType: "bool[]",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "nonces",
    inputs: [
      {
        name: "domain",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "addr",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "nonce",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "recoverAddress",
    inputs: [
      {
        name: "domain",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "op",
        type: "tuple",
        internalType: "struct Operation",
        components: [
          {
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "originatingChainId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "typ",
            type: "uint8",
            internalType: "enum PaymasterType",
          },
          {
            name: "permitAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "permitR",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "permitS",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "permitV",
            type: "uint8",
            internalType: "uint8",
          },
          {
            name: "market",
            type: "address",
            internalType: "contract INineLivesTrading",
          },
          {
            name: "maximumFee",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amountToSpend",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "minimumBack",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "referrer",
            type: "address",
            internalType: "address",
          },
          {
            name: "outcome",
            type: "bytes8",
            internalType: "bytes8",
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
    name: "recoverAddressNewChain",
    inputs: [
      {
        name: "op",
        type: "tuple",
        internalType: "struct Operation",
        components: [
          {
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "originatingChainId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "typ",
            type: "uint8",
            internalType: "enum PaymasterType",
          },
          {
            name: "permitAmount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "permitR",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "permitS",
            type: "bytes32",
            internalType: "bytes32",
          },
          {
            name: "permitV",
            type: "uint8",
            internalType: "uint8",
          },
          {
            name: "market",
            type: "address",
            internalType: "contract INineLivesTrading",
          },
          {
            name: "maximumFee",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "amountToSpend",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "minimumBack",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "referrer",
            type: "address",
            internalType: "address",
          },
          {
            name: "outcome",
            type: "bytes8",
            internalType: "bytes8",
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
      },
    ],
    outputs: [
      {
        name: "domain",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "recovered",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "PaymasterPaidFor",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "maximumFee",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "amountToSpend",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "feeTaken",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "referrer",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "outcome",
        type: "bytes8",
        indexed: false,
        internalType: "bytes8",
      },
    ],
    anonymous: false,
  },
] as const;
export default paymasterAbi;
