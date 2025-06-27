// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;


import "./INineLivesTrading.sol";

bytes32 constant PAYMASTER_TYPEHASH =
    keccak256("NineLivesPaymaster(address owner,uint256 nonce,uint256 deadline,uint8 typ,address market,uint256 maximumFee,uint256 amountToSpend,uint256 minimumBack,address referrer,bytes8 outcome)");

enum PaymasterType {
    MINT,
    BURN,
    ADD_LIQUIDITY,
    REMOVE_LIQUIDITY
}

struct Operation {
    address owner;
    /// @dev originatingChainId is used to avoid asking users to change their
    ///      wallet for a native experience regardless where they are.
    uint256 originatingChainId;
    uint256 nonce;
    uint256 deadline;
    PaymasterType typ;
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

    /// @dev NAME here is a concatenation of the chain id as well! We don't
    /// intend to deploy this anywhere else, but we want cross-chain signing
    /// functionality, so we reuse the domain separator to discover nonces
    /// that we supply to this contract relative to the chain id here.
    string constant NAME = "NineLivesPaymaster";

    IERC20 immutable USDC;

    uint256 public immutable INITIAL_CHAIN_ID;
    bytes32 public immutable INITIAL_SALT;

    mapping(bytes32 domain => mapping(address addr => uint256 nonce)) public nonces;

    mapping(uint256 => bytes32) public domainSeparators;

    constructor(address _erc20) {
        USDC = IERC20(_erc20);
        INITIAL_CHAIN_ID = block.chainid;
        INITIAL_SALT = keccak256(abi.encode(INITIAL_CHAIN_ID));
        domainSeparators[INITIAL_CHAIN_ID] = computeDomainSeparator(
            INITIAL_CHAIN_ID
        );
    }

    function NEW_DOMAIN_SEPARATOR(uint256 _chainId) internal returns (bytes32 sep) {
        sep = domainSeparators[_chainId];
        if (sep == bytes32(0)) {
            domainSeparators[_chainId] = computeDomainSeparator(_chainId);
            sep = domainSeparators[_chainId];
        }
    }

    function computeDomainSeparator(uint256 _chainId) public view virtual returns (bytes32) {
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

    function recoverAddress(bytes32 domain, Operation calldata op) public view returns (address) {
        return ecrecover(
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

    function execute(Operation calldata op) internal returns (uint256, bool) {
        if (op.deadline < block.timestamp)
            return (op.maximumFee, false);
        (bytes32 domain, address recovered) = recoverAddressNewChain(op);
        if (op.owner != recovered)
            return (op.maximumFee, false);
        nonces[domain][op.owner]++;
        uint256 amountInclusiveOfFee = op.amountToSpend + op.maximumFee;
        if (op.permitV != 0)
            USDC.permit(
                op.owner,
                address(this),
                amountInclusiveOfFee,
                op.deadline,
                op.permitV,
                op.permitR,
                op.permitS
            );
        if (op.typ == PaymasterType.MINT) {
            try USDC.transferFrom(op.owner, address(this), amountInclusiveOfFee) {}
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
                )
            {} catch {
                return (op.maximumFee, false);
            }
            return (op.maximumFee, true);
        } else if (op.typ == PaymasterType.BURN) {
            if (op.minimumBack < op.maximumFee) return (op.maximumFee, false);
            try
                op.market.burn854CC96E(
                    op.outcome,
                    op.amountToSpend,
                    true,
                    op.minimumBack,
                    op.referrer,
                    msg.sender
                )
            {} catch {
                return (op.maximumFee, false);
            }
            return (op.maximumFee, true);
        } else {
            // TODO
            return (0, false);
        }
    }

    function multicall(
        Operation[] calldata operations
    ) external returns (bool[] memory statuses) {
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
        USDC.transfer(msg.sender, acc);
    }
}
