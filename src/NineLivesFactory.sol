// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {IEvents} from "./IEvents.sol";
import {INineLivesFactory, FactoryOutcome} from "./INineLivesFactory.sol";
import {INineLivesTrading, CtorArgs} from "./INineLivesTrading.sol";
import {INineLivesVault} from "./INineLivesVault.sol";
import {IShare} from "./IShare.sol";

interface IERC20 {
    function transfer(address recipient) external;
}

struct NewTradingState {
    bytes32 tradingId;
    bytes32 erc20Id;
    address tradingAddr;
    IShare erc20Addr;
    bytes8[] outcomes;
}

contract NineLivesFactory is IEvents, INineLivesFactory {
    address immutable BEACON_ADDR;

    address immutable DPPM_HOUR_CREATOR_ADDR;

    address immutable DPPM_15_MIN_CREATOR_ADDR;

    address immutable DPPM_5_MIN_CREATOR_ADDR;

    address immutable ORACLE_ADDR;

    INineLivesVault immutable VAULT_ADDR;

    address immutable SHARE_IMPL_ADDR;

    uint8 public version;

    address public operator;

    bool public enabled;

    bool public shouldTakeModFee;

    mapping(address => address) public tradingOwners;

    mapping(bytes32 => address) public tradingAddresses;

    mapping(address => uint8) public tradingBackends;

    uint256 public daoClaimable;

    constructor(
        address beaconAddr,
        address dppmHourCreatorAddr,
        address dppm15MinCreatorAddr,
        address dppm5MinCreatorAddr,
        address oracleAddr,
        address vaultAddr,
        address shareImplAddr
    ) {
        BEACON_ADDR = beaconAddr;
        DPPM_HOUR_CREATOR_ADDR = dppmHourCreatorAddr;
        DPPM_15_MIN_CREATOR_ADDR = dppm15MinCreatorAddr;
        DPPM_5_MIN_CREATOR_ADDR = dppm5MinCreatorAddr;
        ORACLE_ADDR = oracleAddr;
        VAULT_ADDR = INineLivesVault(vaultAddr);
        SHARE_IMPL_ADDR = shareImplAddr;
    }

    function ctor(address _operator) external {
        require(version == 0, "already upgraded");
        enabled = true;
        version = 1;
        operator = _operator;
    }

    /// @inheritdoc INineLivesFactory
    function isModerationFeeEnabled() external view returns (bool) {
        return shouldTakeModFee;
    }

    /// @inheritdoc INineLivesFactory
    function getOwner(address addr) external view returns (address) {
        return tradingOwners[addr];
    }

    /// @inheritdoc INineLivesFactory
    function getBackend(address addr) external view returns (uint8) {
        return tradingBackends[addr];
    }

    /// @inheritdoc INineLivesFactory
    function getTradingAddr(bytes32 id) external view returns (address) {
        address addr = tradingAddresses[id];
        require(addr != address(0), "trading addr non-existent");
        return addr;
    }

    /// @inheritdoc INineLivesFactory
    function shareImpl() external view returns (address) {
        return SHARE_IMPL_ADDR;
    }

    /// @inheritdoc INineLivesFactory
    function dppmTradingHash() external view returns (bytes32) {
        return keccak256(makeBeaconSelProxySel(bytes4(0x6f73cbd8), BEACON_ADDR));
    }

    /// @inheritdoc INineLivesFactory
    function ammTradingHash() external view returns (bytes32) {
        return keccak256(makeBeaconSelProxySel(bytes4(0x6b8e8d96), BEACON_ADDR));
    }

    /// @inheritdoc INineLivesFactory
    function erc20Hash() external view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                hex"602d5f8160095f39f35f5f365f5f37365f73", SHARE_IMPL_ADDR, hex"5af43d5f5f3e6029573d5ffd5b3d5ff3"
            )
        );
    }

    function createTradingId(bytes8[] memory outcomes) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(outcomes));
    }

    function createErc20Id(address tradingAddr, bytes8 outcomeId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(tradingAddr, outcomeId));
    }

    function makeBeaconSelProxySel(bytes4 sel, address beacon) internal pure returns (bytes memory) {
        return abi.encodePacked(
            hex"60518060093d393df3602460046020368282355f5f368663",
            sel,
            hex"5f52855f8937808a80601c73",
            beacon,
            hex"5afa1561004f578951368a8c375af43d5f5f3e5f3d911561004f57f35bfd"
        );
    }

    function deployTrading(bool isDppm, bytes32 seed) internal returns (INineLivesTrading) {
        address tradingAddr;
        bytes memory c;
        if (isDppm) {
            c = makeBeaconSelProxySel(bytes4(0x6f73cbd8), BEACON_ADDR);
        } else {
            c = makeBeaconSelProxySel(bytes4(0x6b8e8d96), BEACON_ADDR);
        }
        assembly {
            tradingAddr := create2(0, add(c, 0x20), mload(c), seed)
        }
        require(tradingAddr != address(0), "deploy failed");
        return INineLivesTrading(tradingAddr);
    }

    function deployErc20(address implAddr, bytes32 id) internal returns (IShare) {
        address erc20Addr;
        bytes memory c = abi.encodePacked(
            hex"602d5f8160095f39f35f5f365f5f37365f73", implAddr, hex"5af43d5f5f3e6029573d5ffd5b3d5ff3"
        );
        assembly {
            erc20Addr := create2(0, add(c, 0x20), mload(c), id)
        }
        require(erc20Addr != address(0), "deploy failed");
        return IShare(erc20Addr);
    }

    /// @inheritdoc INineLivesFactory
    function newTrading37E9F4BE(
        FactoryOutcome[] memory factoryOutcomes,
        address oracle,
        uint64 timeStart,
        uint64 timeEnding,
        bytes32,
        /* documentation */
        address feeRecipient,
        uint64 feeCreator,
        uint64 feeLp,
        uint64 feeMinter,
        uint64 feeReferrer,
        bool backendIsDppm,
        uint256 seedLiq
    ) external returns (INineLivesTrading trading) {
        require(factoryOutcomes.length > 0, "no outcomes");
        NewTradingState memory s;
        s.outcomes = new bytes8[](factoryOutcomes.length);
        for (uint256 i = 0; i < factoryOutcomes.length; ++i) {
            s.outcomes[i] = factoryOutcomes[i].identifier;
            if (i > 0) require(s.outcomes[i] > s.outcomes[i - 1], "array not sorted");
        }
        s.tradingId = createTradingId(s.outcomes);
        trading = deployTrading(backendIsDppm, s.tradingId);
        {
            tradingOwners[s.tradingAddr] = feeRecipient;
            if (backendIsDppm) {
                emit NewTrading2(s.tradingId, address(trading), oracle, 0);
            } else {
                emit NewTrading2(s.tradingId, address(trading), oracle, 1);
            }
            // 1 is the default type for the AMM.
            if (!backendIsDppm) tradingBackends[address(trading)] = 1;
            tradingAddresses[s.tradingId] = address(trading);
            if (backendIsDppm) {
                if (
                    msg.sender == DPPM_HOUR_CREATOR_ADDR || msg.sender == DPPM_15_MIN_CREATOR_ADDR
                        || msg.sender == DPPM_5_MIN_CREATOR_ADDR
                ) {} else {
                    revert("not dppm creator");
                }
                VAULT_ADDR.borrow(address(trading), seedLiq);
            }
            if (!backendIsDppm && oracle == ORACLE_ADDR && seedLiq > 0) {
                // This is a shortterm market. Register it with the vault:
                VAULT_ADDR.ammRegister(address(trading));
            }
        }
        for (uint256 i = 0; i < factoryOutcomes.length; ++i) {
            s.erc20Id = createErc20Id(address(trading), s.outcomes[i]);
            s.erc20Addr = deployErc20(SHARE_IMPL_ADDR, s.erc20Id);
            s.erc20Addr.ctor(factoryOutcomes[i].name, address(trading));
            emit OutcomeCreated(s.tradingId, s.erc20Id, address(s.erc20Addr));
        }
        trading.ctor(
            CtorArgs({
                outcomes: s.outcomes,
                oracle: oracle,
                timeStart: timeStart,
                timeEnding: timeEnding,
                feeRecipient: feeRecipient,
                shouldBufferTime: false,
                feeCreator: feeCreator,
                feeMinter: feeMinter,
                feeLp: feeLp,
                feeReferrer: feeReferrer,
                startingLiq: seedLiq
            })
        );
    }

    function disableShares(bytes8[] calldata) external {
        // no-op, matches Rust implementation
    }
}
