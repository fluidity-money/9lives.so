const sarpSignallerAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_sarp",
        type: "address",
        internalType: "address",
      },
      {
        name: "_fusdc",
        type: "address",
        internalType: "contract IERC20",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "conclude",
    inputs: [
      {
        name: "_ticket",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "_note",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "feeCollection",
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
    name: "request",
    inputs: [
      {
        name: "_trading",
        type: "address",
        internalType: "address",
      },
      {
        name: "_recipient",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "tickets",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "addr",
        type: "address",
        internalType: "address",
      },
      {
        name: "repaid",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "CallMade",
    inputs: [
      {
        name: "tradingAddr",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "winner",
        type: "bytes8",
        indexed: true,
        internalType: "bytes8",
      },
      {
        name: "incentiveRecipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CampaignEscaped",
    inputs: [
      {
        name: "tradingAddr",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ClaimedDAOFunds",
    inputs: [
      {
        name: "recipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "CommitmentRevealed",
    inputs: [
      {
        name: "trading",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "revealer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "outcome",
        type: "bytes8",
        indexed: true,
        internalType: "bytes8",
      },
      {
        name: "caller",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "bal",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Committed",
    inputs: [
      {
        name: "trading",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "predictor",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "commitment",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Concluded",
    inputs: [
      {
        name: "ticket",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "justification",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DAOMoneyDistributed",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "recipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "DeadlineExtension",
    inputs: [
      {
        name: "timeBefore",
        type: "uint64",
        indexed: true,
        internalType: "uint64",
      },
      {
        name: "timeAfter",
        type: "uint64",
        indexed: true,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Declared",
    inputs: [
      {
        name: "trading",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "winningOutcome",
        type: "bytes8",
        indexed: true,
        internalType: "bytes8",
      },
      {
        name: "feeRecipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Frozen",
    inputs: [
      {
        name: "victim",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "until",
        type: "uint64",
        indexed: true,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "InfraMarketClosed",
    inputs: [
      {
        name: "incentiveRecipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tradingAddr",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "winner",
        type: "bytes8",
        indexed: true,
        internalType: "bytes8",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "InfraMarketEnabled",
    inputs: [
      {
        name: "status",
        type: "bool",
        indexed: true,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "InfraMarketUpdated",
    inputs: [
      {
        name: "old",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "new_",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LockedUp",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "recipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LockupEnabled",
    inputs: [
      {
        name: "status",
        type: "bool",
        indexed: true,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LockupTokenProxyDeployed",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "MarketCreated2",
    inputs: [
      {
        name: "incentiveSender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tradingAddr",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "desc",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "launchTs",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
      {
        name: "callDeadline",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewTrading2",
    inputs: [
      {
        name: "identifier",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "addr",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "oracle",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "backend",
        type: "uint8",
        indexed: false,
        internalType: "uint8",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OutcomeCreated",
    inputs: [
      {
        name: "tradingIdentifier",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "erc20Identifier",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "erc20Addr",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OutcomeDecided",
    inputs: [
      {
        name: "identifier",
        type: "bytes8",
        indexed: true,
        internalType: "bytes8",
      },
      {
        name: "oracle",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PayoffActivated",
    inputs: [
      {
        name: "identifier",
        type: "bytes8",
        indexed: true,
        internalType: "bytes8",
      },
      {
        name: "sharesSpent",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "spender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "recipient",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "fusdcReceived",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Requested",
    inputs: [
      {
        name: "trading",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "ticket",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SharesMinted",
    inputs: [
      {
        name: "identifier",
        type: "bytes8",
        indexed: true,
        internalType: "bytes8",
      },
      {
        name: "shareAmount",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "spender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "recipient",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "fusdcSpent",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Slashed",
    inputs: [
      {
        name: "victim",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "recipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "slashedAmount",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Withdrew",
    inputs: [
      {
        name: "amount",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "recipient",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;

export default sarpSignallerAbi;
