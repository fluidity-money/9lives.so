const factoryAbi = [
    {
        "type": "function",
        "name": "ctor",
        "inputs": [
            {
                "name": "oracle",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getOwner",
        "inputs": [
            {
                "name": "addr",
                "type": "address",
                "internalType": "address"
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
    },
    {
        "type": "function",
        "name": "newTrading",
        "inputs": [
            {
                "name": "outcomes",
                "type": "tuple[]",
                "internalType": "struct INineLivesFactory.Outcome[]",
                "components": [
                    {
                        "name": "identifier",
                        "type": "bytes8",
                        "internalType": "bytes8"
                    },
                    {
                        "name": "amount",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "nonpayable"
    }
] as const

export default factoryAbi