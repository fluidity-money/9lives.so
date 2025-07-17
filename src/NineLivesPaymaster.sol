// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import { INineLivesTrading } from "./INineLivesTrading.sol";
import {
    IStargate,
    MessagingFee,
    SendParam,
    OFTReceipt } from "./IStargate.sol";

bytes32 constant PAYMASTER_TYPEHASH =
    keccak256("NineLivesPaymaster(address owner,uint256 nonce,uint256 deadline,uint8 typ,address market,uint256 maximumFee,uint256 amountToSpend,uint256 minimumBack,address referrer,bytes8 outcome)");

enum PaymasterType {
    MINT,
    BURN,
    ADD_LIQUIDITY,
    REMOVE_LIQUIDITY,
    BURN_SEND_OUT,
    REMOVE_LIQUIDITY_SEND_OUT
}

struct Operation {
    address owner;
    /// @dev originatingChainId is used to avoid asking users to change their
    ///      wallet for a native experience regardless where they are.
    uint256 originatingChainId;
    uint256 nonce;
    uint256 deadline;
    PaymasterType typ;
    uint256 permitAmount;
    bytes32 permitR;
    bytes32 permitS;
    uint8 permitV;
    INineLivesTrading market;
    uint256 maximumFee;
    uint256 amountToSpend;
    uint256 minimumBack;
    address referrer;
    bytes8 outcome;
    uint8 v;
    bytes32 r;
    bytes32 s;
    uint32 outgoingChainEid;
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

    function transferFrom(address owner, address spender, uint256 amount) external;

    function transfer(address owner, uint256 amount) external;

    function balanceOf(address) external returns (uint256);
}

contract NineLivesPaymaster {
    event PaymasterPaidFor(
        address indexed owner,
        uint256 indexed maximumFee,
        uint256 indexed amountToSpend,
        uint256 feeTaken,
        address referrer,
        bytes8 outcome
    );

    uint256 public version;

    /// @dev NAME here is a concatenation of the chain id as well! We don't
    /// intend to deploy this anywhere else, but we want cross-chain signing
    /// functionality, so we reuse the domain separator to discover nonces
    /// that we supply to this contract relative to the chain id here.
    string constant NAME = "NineLivesPaymaster";

    IERC20 public USDC;

    uint256 public INITIAL_CHAIN_ID;
    bytes32 public INITIAL_SALT;

    // An admin isn't needed in this contract, but it provides us with a
    // way to have some assurance against abuse if there's a signature
    // issue.
    address public ADMIN;

    IStargate public STARGATE;

    mapping(bytes32 domain => mapping(address addr => uint256 nonce)) public nonces;

    mapping(uint256 => bytes32) public domainSeparators;

    function initialise(address _erc20, address _admin, IStargate _stargate) external {
        require(version == 0, "already set up");
        USDC = IERC20(_erc20);
        INITIAL_CHAIN_ID = block.chainid;
        INITIAL_SALT = keccak256(abi.encode(INITIAL_CHAIN_ID));
        domainSeparators[INITIAL_CHAIN_ID] = computeDomainSeparator(
            INITIAL_CHAIN_ID
        );
        ADMIN = _admin;
        STARGATE = _stargate;
        version = 1;
    }

    function NEW_DOMAIN_SEPARATOR(uint256 _chainId) internal returns (bytes32 sep) {
        sep = domainSeparators[_chainId];
        if (sep == bytes32(0)) {
            domainSeparators[_chainId] = computeDomainSeparator(_chainId);
            sep = domainSeparators[_chainId];
        }
    }

    function computeDomainSeparator(uint256 _chainId) public view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)"),
                    keccak256(bytes(NAME)),
                    keccak256("1"),
                    _chainId,
                    address(this),
                    INITIAL_SALT
                )
            );
    }

    function recoverAddress(bytes32 domain, Operation calldata op) public view returns (address recovered) {
        (recovered,,) = ECDSA.tryRecover(
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    domain,
                    keccak256(
                        abi.encode(
                            PAYMASTER_TYPEHASH,
                            op.owner,
                            nonces[domain][op.owner],
                            op.deadline,
                            uint8(op.typ),
                            op.market,
                            op.maximumFee,
                            op.amountToSpend,
                            op.minimumBack,
                            op.referrer,
                            op.outcome
                        )
                    )
                )
            ),
            op.v,
            op.r,
            op.s
        );
    }

    function recoverAddressNewChain(
        Operation calldata op
    ) public returns (bytes32 domain, address recovered) {
        domain = NEW_DOMAIN_SEPARATOR(op.originatingChainId);
        return (domain, recoverAddress(domain, op));
    }

    function stargateSendAmount(uint256 amt, uint32 chainEid, address recipient) internal {
        USDC.approve(address(STARGATE), amt);
        SendParam memory sendParam = SendParam({
            dstEid: chainEid,
            to: bytes32(uint256(uint160(recipient))),
            amountLD: amt, // Not sent with local decimals (TODO?)
            minAmountLD: 0,
            extraOptions: new bytes(0),
            composeMsg: new bytes(0),
            oftCmd: ""                  // Empty for taxi mode
        });
        (, , OFTReceipt memory receipt) = STARGATE.quoteOFT(sendParam);
        sendParam.minAmountLD = receipt.amountReceivedLD;
        MessagingFee memory messagingFee = STARGATE.quoteSend(sendParam, false);
        STARGATE.sendToken(sendParam, messagingFee, recipient);
    }

    function execute(Operation calldata op) internal returns (uint256, bool) {
        if (op.deadline < block.timestamp) return (0, false);
        (bytes32 domain, address recovered) = recoverAddressNewChain(op);
        if (op.owner != recovered) return (op.maximumFee, false);
        nonces[domain][op.owner]++;
        uint256 amountInclusiveOfFee = op.amountToSpend + op.maximumFee;
        if (op.permitR != bytes32(0))
            try
                USDC.permit(
                    op.owner,
                    address(this),
                    op.permitAmount,
                    op.deadline,
                    op.permitV,
                    op.permitR,
                    op.permitS
                ) {}
            catch {
                return (0, false);
            }
        if (op.typ == PaymasterType.MINT) {
            try
                USDC.transferFrom(op.owner, address(this), amountInclusiveOfFee) {}
            catch {
                return (0, false);
            }
            USDC.approve(address(op.market), op.amountToSpend);
            try
                op.market.mint8A059B6E(
                    op.outcome,
                    op.amountToSpend,
                    op.referrer,
                    op.owner
                ) {}
            catch {
                USDC.transfer(op.owner, amountInclusiveOfFee);
                return (0, false);
            }
            return (op.maximumFee, true);
        } else if (op.typ == PaymasterType.BURN) {
            // For selling, we don't take a fee.
            try
                op.market.burn854CC96E(
                    op.outcome,
                    op.amountToSpend,
                    true,
                    op.minimumBack,
                    op.referrer,
                    op.owner
                ) {}
            catch {
                return (0, false);
            }
            return (0, true);
        } else if (op.typ == PaymasterType.ADD_LIQUIDITY) {
            // For adding liquidity, we don't take a fee.
            try
                USDC.transferFrom(op.owner, address(this), op.amountToSpend) {}
            catch {
                return (0, false);
            }
            USDC.approve(address(op.market), op.amountToSpend);
            try
                op.market.addLiquidityA975D995(op.amountToSpend, op.owner) {}
            catch {
                USDC.transfer(op.owner, op.amountToSpend);
                return (0, false);
            }
            return (0, true);
        } else if (op.typ == PaymasterType.REMOVE_LIQUIDITY) {
            // For removing liquidity, we don't take a fee.
            try
                op.market.removeLiquidity3C857A15(op.amountToSpend, op.owner) {}
            catch {
                return (0, false);
            }
            return (0, true);
        } else if (op.typ == PaymasterType.BURN_SEND_OUT) {
            // For selling, we don't take a fee. But Stargate will.
            try
                op.market.burn854CC96E(
                    op.outcome,
                    op.amountToSpend,
                    true,
                    op.minimumBack,
                    op.referrer,
                    op.owner
                )
            returns (uint256, uint256 fusdcReturned) {
                stargateSendAmount(fusdcReturned, op.outgoingChainEid, op.owner);
                return (0, true);
            }
            catch {
                return (0, false);
            }
        } else if (op.typ == PaymasterType.REMOVE_LIQUIDITY_SEND_OUT) {
            // For removing liquidity, we don't take a fee.
            try
                op.market.removeLiquidity3C857A15(op.amountToSpend, op.owner)
            returns (uint256 fusdcReturned, uint256) {
                stargateSendAmount(fusdcReturned, op.outgoingChainEid, op.owner);
            }
            catch {
                return (0, false);
            }
            return (0, true);
        }
        return (0, false);
    }

    function multicall(
        Operation[] calldata operations
    ) external returns (bool[] memory statuses) {
        require(msg.sender == ADMIN, "not admin");
        statuses = new bool[](operations.length);
        uint256 acc;
        for (uint i = 0; i < operations.length; ++i) {
            (uint256 amt, bool rd) = execute(operations[i]);
            statuses[i] = rd;
            if (rd) {
                emit PaymasterPaidFor(
                    operations[i].owner,
                    operations[i].maximumFee,
                    operations[i].amountToSpend,
                    operations[i].maximumFee,
                    operations[i].referrer,
                    operations[i].outcome
                );
            }
            acc += amt;
        }
        if (acc > 0) USDC.transfer(msg.sender, acc);
    }

    function drain(address _recipient) external {
        require(msg.sender == ADMIN, "not admin");
        USDC.transfer(_recipient, USDC.balanceOf(address(this)));
    }

    function changeAdmin(address _admin) external {
        require(msg.sender == ADMIN, "not admin");
        ADMIN = _admin;
    }

    function changeUsdc(IERC20 _newUsdc) external {
        require(msg.sender == ADMIN, "not admin");
        USDC = _newUsdc;
    }
}
