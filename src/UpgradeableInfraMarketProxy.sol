// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProxyAdmin.sol";
import "./IInfraMarket.sol";

bytes32 constant ADMIN_SLOT = bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1);
bytes32 constant IMPL_PREDICT_SLOT = bytes32(uint256(keccak256("9lives.impl.predict")) - 1);
bytes32 constant IMPL_SWEEP_SLOT = bytes32(uint256(keccak256("9lives.impl.sweep")) - 1);
bytes32 constant IMPL_EXTRAS_SLOT = bytes32(uint256(keccak256("9lives.impl.sweep")) - 1);

library StorageSlot {
    struct AddressSlot {
        address value;
    }
    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly {
            r.slot := slot
        }
    }
}

contract UpgradeableInfraMarketProxy is IInfraMarket {
    event UpgradedPredict(address impl);
    event UpgradedSweep(address impl);
    event UpgradedExtras(address impl);

    event AdminChanged(address previousAdmin, address newAdmin);

    // OpenZeppelin 2024.
    function directDelegate(address to) internal {
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), to, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    constructor(
        address _admin,
        address _implPredict,
        address _implSweep,
        address _implExtras
    ) {
        address admin = address(new ProxyAdmin(_admin));
        require(_implPredict.code.length > 0, "empty predict");
        require(_implSweep.code.length > 0, "empty sweep");
        require(_implExtras.code.length > 0, "empty extras");
        StorageSlot.getAddressSlot(ADMIN_SLOT).value = admin;
        StorageSlot.getAddressSlot(IMPL_PREDICT_SLOT).value = _implPredict;
        emit UpgradedPredict(_implPredict);
        StorageSlot.getAddressSlot(IMPL_SWEEP_SLOT).value = _implSweep;
        emit UpgradedSweep(_implSweep);
        StorageSlot.getAddressSlot(IMPL_EXTRAS_SLOT).value = _implExtras;
        emit UpgradedExtras(_implExtras);
        emit AdminChanged(address(0), admin);
    }

    function upgrade(
        address _implPredict,
        address _implSweep,
        address _implExtras
    ) external {
        require(msg.sender == StorageSlot.getAddressSlot(ADMIN_SLOT).value, "not admin");
        StorageSlot.getAddressSlot(IMPL_PREDICT_SLOT).value = _implPredict;
        StorageSlot.getAddressSlot(IMPL_SWEEP_SLOT).value = _implSweep;
        StorageSlot.getAddressSlot(IMPL_EXTRAS_SLOT).value = _implExtras;
    }

    /// @inheritdoc IInfraMarket
    function register(
        address /* tradingAddr */,
        address /* incentiveSender */,
        bytes32 /* desc */,
        uint64 /* launchTs */,
        bytes8 /* defaultWinner */
    ) external returns (uint256) {
        directDelegate(StorageSlot.getAddressSlot(IMPL_EXTRAS_SLOT).value);
    }

    function call(
        address /* trading */,
        bytes8 /* winner */,
        address /* incentiveRecipient */
    ) external {
        directDelegate(StorageSlot.getAddressSlot(IMPL_EXTRAS_SLOT).value);
    }

    function close(
        address /* trading */,
        address /* feeRecipient */
    ) external {
        directDelegate(StorageSlot.getAddressSlot(IMPL_EXTRAS_SLOT).value);
    }

    function whinge(
        address /* trading */,
        bytes8 /* preferredOutcome */,
        address /* bondRecipient */
    ) external {
        directDelegate(StorageSlot.getAddressSlot(IMPL_EXTRAS_SLOT).value);
    }

    /// @inheritdoc IInfraMarket
    function predict(
        address /* tradingAddr */,
        bytes8 /* winner */,
        uint256 /* amount */
    ) external {
        directDelegate(StorageSlot.getAddressSlot(IMPL_PREDICT_SLOT).value);
    }

    /// @inheritdoc IInfraMarket
    function winner(address /* trading */) external returns (bytes8) {
        directDelegate(StorageSlot.getAddressSlot(IMPL_EXTRAS_SLOT).value);
    }

    /// @inheritdoc IInfraMarket
    function globalPowerVested(
        address /* trading */
    ) external returns (uint256) {
        directDelegate(StorageSlot.getAddressSlot(IMPL_EXTRAS_SLOT).value);
    }

    /// @inheritdoc IInfraMarket
    function marketPowerVested(
        address /* trading */,
        bytes8 /* outcome */
    ) external returns (uint256) {
        directDelegate(StorageSlot.getAddressSlot(IMPL_EXTRAS_SLOT).value);
    }

    /// @inheritdoc IInfraMarket
    function userPowerVested(
        address /* trading */,
        address /* spender */
    ) external returns (uint256) {
        directDelegate(StorageSlot.getAddressSlot(IMPL_EXTRAS_SLOT).value);
    }

    /// @inheritdoc IInfraMarket
    function sweep(
        address /* trading */,
        address /* victim */,
        bytes8[] calldata /* outcomes */,
        address /* onBehalfOfAddr */,
        address /* feeRecipientAddr */
    ) external returns (uint256) {
        directDelegate(StorageSlot.getAddressSlot(IMPL_SWEEP_SLOT).value);
    }

    fallback() external {
        directDelegate(StorageSlot.getAddressSlot(IMPL_EXTRAS_SLOT).value);
    }
}
