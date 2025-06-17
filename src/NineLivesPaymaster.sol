// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./INineLivesTrading.sol";

bytes32 constant PAYMASTER_TYPEHASH =
    keccak256("NineLivesPaymaster(address owner,address spender,uint256 nonce,uint256 deadline,uint8 typ,address market,uint256 maximumFee,uint256 amountToSpend,uint256 minimumBack,bytes calldata)");

enum PaymasterType {
    MINT,
    SELL,
    ADD_LIQUIDITY,
    REMOVE_LIQUIDITY
}

struct Operation {
    address owner;
    address nonce;
    uint256 deadline;
    PaymasterType typ;
    bytes32 permitR;
    bytes32 permitS;
    uint8 permitV;
    INineLivesTrading market;
    uint256 maximumFee;
    uint256 amountToSpend;
    uint256 minimumBack;
    bytes cd;
    uint8 v;
    bytes32 r;
    bytes32 s;
}

interface IERC20 {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function approve(address spender, uint256 amount) external;
}

contract Paymaster {
    string constant NAME = "NineLivesPaymaster";

    IERC20 immutable USDC;

    uint256 internal immutable INITIAL_CHAIN_ID;

    bytes32 internal immutable INITIAL_DOMAIN_SEPARATOR;

    mapping(address => uint256) public nonces;

    constructor(address _erc20) {
        USDC = IERC20(_erc20);

        INITIAL_CHAIN_ID = block.chainid;
        INITIAL_DOMAIN_SEPARATOR = computeDomainSeparator();
    }

    function DOMAIN_SEPARATOR() public view virtual returns (bytes32) {
        return block.chainid == INITIAL_CHAIN_ID ? INITIAL_DOMAIN_SEPARATOR : computeDomainSeparator();
    }

    function computeDomainSeparator() internal view virtual returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                    keccak256(bytes(NAME)),
                    keccak256("1"),
                    block.chainid,
                    address(this)
                )
            );
    }

    function recoverAddress(Operation calldata op) public view returns (address) {
        return ecrecover(
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR(),
                    keccak256(
                        abi.encode(
                            PAYMASTER_TYPEHASH,
                            op.owner,
                            address(this),
                            nonces[op.owner],
                            op.deadline,
                            uint8(op.typ),
                            op.market,
                            op.maximumFee,
                            op.amountToSpend,
                            op.minimumBack
                        )
                    )
                )
            ),
            op.v,
            op.r,
            op.s
        );
    }

    function execute(Operation calldata op) public returns (bool) {
        if (op.deadline < block.timestamp) return false;
        if (op.owner != recoverAddress(op)) return false;
        nonces[op.owner]++;
        uint256 amountInclusiveOfFee = op.amountToSpend + op.maximumFee;
        USDC.permit(
            op.owner,
            address(this),
            amountInclusiveOfFee,
            op.deadline,
            op.permitV,
            op.permitR,
            op.permitS
        );
        USDC.approve(address(op.market), op.amountToSpend);
        address market = address(op.market);
        if (op.typ == PaymasterType.MINT) {
            (bool rc,) = market.call(abi.encodePacked(
                INineLivesTrading.mint8A059B6E.selector,
                op.cd
            ));
            return rc;
        } else {
            // TODO
            return false;
        }
    }

    function multicall(
        Operation[] calldata operations
    ) external returns (bool[] memory statuses) {
        statuses = new bool[](operations.length);
        for (uint i = 0; i < operations.length; ++i) {
            statuses[i] = execute(operations[i]);
        }
    }
}
