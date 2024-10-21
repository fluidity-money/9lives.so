// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/// @dev 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc
bytes32 constant ADMIN_SLOT = bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1);

/// @dev bytes32(uint256(keccak256('eip1967.proxy.implementation.1')) - 1)
bytes32 constant IMPL_1_SLOT = 0xb1367b25ecdd0d2df3db9449bc5ce8a546c54d6e9893823c94910167e4916b2e;

/// @dev bytes32(uint256(keccak256('eip1967.proxy.implementation.2')) - 1)
bytes32 constant IMPL_2_SLOT = 0xcd1ea76c08b49bd72e6fe67cc2f2768df0db665b5c9963a4b15b34c9fd225c4e;

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

interface IProxy {
    function upgradeAndCall(address, address, bytes memory) external;
}

contract ProxyAdmin {
    event TransferOwnership(address old, address new_);

    address public admin;
    constructor(address _admin) {
        admin = _admin;
        emit TransferOwnership(address(0), _admin);
    }
    function transferOwnership(address _newAdmin) external {
        require(msg.sender == admin, "only admin");
        emit TransferOwnership(admin, _newAdmin);
        admin = _newAdmin;
    }
    function upgrade(address _proxy, address _impl1, address _impl2, bytes memory _data) external {
        require(msg.sender == admin, "only admin");
        IProxy(_proxy).upgradeAndCall(_impl1, _impl2, _data);
    }
}

/**
 * @notice FactoryProxy is a proxy that does delegation based on the 3rd byte
 * of the signature used in the message received to the contract.
 */
contract FactoryProxy {
    event Upgraded1(address impl);
    event Upgraded2(address impl);
    event AdminChanged(address previousAdmin, address newAdmin);

    address private immutable admin_;

    constructor(address _admin, address _impl1, address _impl2, bytes memory _data) {
        address admin = address(new ProxyAdmin(_admin));
        admin_ = admin;
        require(_impl1.code.length > 0, "empty impl1");
        require(_impl2.code.length > 0, "empty impl2");
        // So we're compatible with ERC1967.
        StorageSlot.getAddressSlot(ADMIN_SLOT).value = admin;
        StorageSlot.getAddressSlot(IMPL_1_SLOT).value = _impl1;
        StorageSlot.getAddressSlot(IMPL_2_SLOT).value = _impl2;
        emit AdminChanged(address(0), admin);
        if (_data.length > 0) {
            (bool success,) = _impl2.delegatecall(_data);
            require(success, "call failed");
        }
    }

    fallback() external {
        if (msg.sender == StorageSlot.getAddressSlot(ADMIN_SLOT).value) {
            if (msg.sig == IProxy.upgradeAndCall.selector) {
                (
                    address impl1, // Used for the new trading code only.
                    address impl2, // Used for everything else, so the migration.
                    bytes memory data
                ) = abi.decode(msg.data[4:], (address, address, bytes));
                require(impl1.code.length > 0, "empty impl1");
                require(impl2.code.length > 0, "empty impl2");
                StorageSlot.getAddressSlot(IMPL_1_SLOT).value = impl1;
                StorageSlot.getAddressSlot(IMPL_2_SLOT).value = impl2;
                emit Upgraded1(impl1);
                emit Upgraded2(impl2);
                if (data.length > 0) {
                    bool success;
                    (success, data) = impl2.delegatecall(data);
                    if (data.length > 0 && !success) {
                        assembly {
                            revert(add(data, 0x20), mload(data))
                        }
                    } else {
                        require(success);
                        if (data.length > 0) {
                            assembly {
                                return(add(data, 0x20), mload(data))
                            }
                        }
                    }
                }
            } else {
                revert("bad call");
            }
        } else {
            bool success;
            bytes memory data;
            if (uint8(msg.data[2]) == 1)
                (success, data) = StorageSlot.getAddressSlot(IMPL_1_SLOT).value.delegatecall(msg.data);
            else
                (success, data) = StorageSlot.getAddressSlot(IMPL_2_SLOT).value.delegatecall(msg.data);
            if (data.length > 0 && !success) {
                assembly {
                    revert(add(data, 0x20), mload(data))
                }
            } else {
                require(success);
                if (data.length > 0) {
                    assembly {
                        return(add(data, 0x20), mload(data))
                    }
                }
            }
        }
    }
}
