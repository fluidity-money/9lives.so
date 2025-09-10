// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import { INineLivesTrading } from "./INineLivesTrading.sol";
import {
    IStargate,
    MessagingFee,
    SendParam,
    MessagingReceipt,
    OFTReceipt } from "./IStargate.sol";

import {
    ICamelotSwapRouter,
    ExactOutputSingleParams } from "./ICamelotSwapRouter.sol";

import { IWETH10 } from "./IWETH10.sol";

bytes32 constant PAYMASTER_TYPEHASH =
    keccak256("NineLivesPaymaster(address owner,uint256 nonce,uint256 deadline,uint8 typ,address market,uint256 maximumFee,uint256 amountToSpend,uint256 minimumBack,address referrer,bytes8 outcome,uint256 maxOutgoing)");

enum PaymasterType {
    MINT,
    BURN,
    ADD_LIQUIDITY,
    REMOVE_LIQUIDITY,
    WITHDRAW_USDC
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
    uint256 maxOutgoing;
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

interface DPMOld {
    function mintPermitE90275AB(bytes8,uint256,address,uint256,uint8,bytes32,bytes32) external returns (uint256);
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

    event StargateBridged(
        bytes32 indexed guid,
        address indexed spender,
        uint256 indexed amountReceived,
        uint256 amountFee,
        uint32 destinationEid
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

    ICamelotSwapRouter public CAMELOT_SWAP_ROUTER;

    IWETH10 public WETH;

    function initialise(
        address _erc20,
        address _admin,
        IStargate _stargate,
        ICamelotSwapRouter _swapRouter,
        IWETH10 _weth
    ) external {
        require(version == 0, "already set up");
        USDC = IERC20(_erc20);
        INITIAL_CHAIN_ID = block.chainid;
        INITIAL_SALT = keccak256(abi.encode(INITIAL_CHAIN_ID));
        domainSeparators[INITIAL_CHAIN_ID] = computeDomainSeparator(
            INITIAL_CHAIN_ID
        );
        ADMIN = _admin;
        STARGATE = _stargate;
        CAMELOT_SWAP_ROUTER = _swapRouter;
        WETH = _weth;
        version = 2;
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

    function stargateSendAmount(
        SendParam memory _sendParam,
        MessagingFee memory _messagingFee,
        Operation memory _op
    ) internal returns (uint256, bool) {
        (MessagingReceipt memory msgReceipt, OFTReceipt memory oftReceipt,) =
            STARGATE.sendToken{value: _messagingFee.nativeFee}(
                _sendParam,
                _messagingFee,
                _op.owner
            );
        if (_op.minimumBack > oftReceipt.amountReceivedLD) return (0, false);
        emit StargateBridged(
            msgReceipt.guid,
            _op.owner,
            oftReceipt.amountReceivedLD,
            _messagingFee.nativeFee,
            _sendParam.dstEid
        );
        return (_op.maximumFee, true);
    }

    function execute(Operation calldata op) internal returns (uint256, bool) {
        if (op.deadline < block.timestamp) revert("past deadline");
        (bytes32 domain, address recovered) = recoverAddressNewChain(op);
        if (op.owner != recovered) revert("bad address recovery");
        nonces[domain][op.owner]++;
        uint256 amountInclusiveOfFee = op.amountToSpend + op.maximumFee;
        if (op.permitR != bytes32(0))
                USDC.permit(
                    op.owner,
                    address(this),
                    op.permitAmount,
                    op.deadline,
                    op.permitV,
                    op.permitR,
                    op.permitS
                );
        if (op.typ == PaymasterType.MINT) {
            USDC.transferFrom(op.owner, address(this), amountInclusiveOfFee);
            USDC.approve(address(op.market), op.amountToSpend);
            try op.market.isDpm() returns (bool isDpm) {
                if (isDpm)
                    DPMOld(address(op.market)).mintPermitE90275AB(
                        op.outcome,
                        op.amountToSpend,
                        op.owner,
                        0,
                        0,
                        bytes32(0),
                        bytes32(0)
                    );
                else
                    op.market.mint8A059B6E(
                        op.outcome,
                        op.amountToSpend,
                        op.referrer,
                        op.owner
                    );
                return (op.maximumFee, true);
            } catch {
                DPMOld(address(op.market)).mintPermitE90275AB(
                    op.outcome,
                    op.amountToSpend,
                    op.owner,
                    0,
                    0,
                    bytes32(0),
                    bytes32(0)
                );
            }
        } else if (op.typ == PaymasterType.BURN) {
            // For selling, we don't take a fee.
            op.market.burn854CC96E(
                op.outcome,
                op.amountToSpend,
                true,
                op.minimumBack,
                op.referrer,
                op.owner
            );
            return (0, true);
        } else if (op.typ == PaymasterType.ADD_LIQUIDITY) {
            // For adding liquidity, we don't take a fee.
            USDC.transferFrom(op.owner, address(this), op.amountToSpend);
            USDC.approve(address(op.market), op.amountToSpend);
            op.market.addLiquidityB9DDA952(
                op.amountToSpend,
                op.owner,
                op.minimumBack,
                op.maxOutgoing
            );
            return (0, true);
        } else if (op.typ == PaymasterType.REMOVE_LIQUIDITY) {
            // For removing liquidity, we don't take a fee.
            op.market.removeLiquidity3C857A15(op.amountToSpend, op.owner);
            return (0, true);
        } else if (op.typ == PaymasterType.WITHDRAW_USDC) {
            // For withdrawing, we take a fee.
            USDC.transferFrom(op.owner, address(this), amountInclusiveOfFee);
            USDC.approve(address(STARGATE), op.amountToSpend);
            SendParam memory sendParam = SendParam({
                dstEid: op.outgoingChainEid,
                to: bytes32(uint256(uint160(op.owner))),
                amountLD: op.amountToSpend,
                minAmountLD: op.minimumBack,
                extraOptions: new bytes(0),
                composeMsg: new bytes(0),
                oftCmd: "" // Empty for taxi mode
            });
            MessagingFee memory messagingFee = STARGATE.quoteSend(sendParam, false);
            USDC.approve(address(CAMELOT_SWAP_ROUTER), op.amountToSpend);
            uint256 amountForFee = CAMELOT_SWAP_ROUTER.exactOutputSingle(ExactOutputSingleParams({
                tokenIn: address(USDC),
                tokenOut: address(WETH),
                fee: 0,
                recipient: address(this),
                deadline: type(uint256).max,
                amountOut: messagingFee.nativeFee,
                amountInMaximum: op.amountToSpend,
                limitSqrtPrice: type(uint160).min
            }));
            WETH.withdraw(messagingFee.nativeFee);
            sendParam.amountLD = op.amountToSpend - amountForFee;
            (, , OFTReceipt memory receipt) = STARGATE.quoteOFT(sendParam);
            sendParam.minAmountLD = receipt.amountReceivedLD;
            USDC.approve(address(STARGATE), sendParam.amountLD);
            return stargateSendAmount(sendParam, messagingFee, op);
        }
        return (0, false);
}

    error MulticallFailure(uint256);

    function multicall(
        Operation[] calldata operations
    ) external returns (bool[] memory statuses) {
        require(msg.sender == ADMIN, "not admin");
        statuses = new bool[](operations.length);
        uint256 acc;
        for (uint i = 0; i < operations.length; ++i) {
            (uint256 amt, bool rd) = execute(operations[i]);
            if (!rd) revert MulticallFailure(i);
            statuses[i] = true;
            emit PaymasterPaidFor(
                operations[i].owner,
                operations[i].maximumFee,
                operations[i].amountToSpend,
                operations[i].maximumFee,
                operations[i].referrer,
                operations[i].outcome
            );
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

    receive() external payable {}
}
