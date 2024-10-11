const tradingAbi = [
    {
        "type": "function",
        "name": "decide",
        "inputs": [
            {
                "name": "outcome",
                "type": "bytes8",
                "internalType": "bytes8"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "details",
        "inputs": [
            {
                "name": "outcomeId",
                "type": "bytes8",
                "internalType": "bytes8"
            }
        ],
        "outputs": [
            {
                "name": "shares",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "invested",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "isWinner",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "invested",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "mint",
        "inputs": [
            {
                "name": "outcome",
                "type": "bytes8",
                "internalType": "bytes8"
            },
            {
                "name": "value",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "recipient",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "mintPermit",
        "inputs": [
            {
                "name": "outcome",
                "type": "bytes8",
                "internalType": "bytes8"
            },
            {
                "name": "value",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "deadline",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "recipient",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "v",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "r",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "s",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "payoff",
        "inputs": [
            {
                "name": "outcomeId",
                "type": "bytes8",
                "internalType": "bytes8"
            },
            {
                "name": "recipient",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "shareAddr",
        "inputs": [
            {
                "name": "outcomeId",
                "type": "bytes8",
                "internalType": "bytes8"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    }
] as const;

export default tradingAbi;
