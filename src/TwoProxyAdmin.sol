// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IProxy {
    function upgradeAndCall(address, address, bytes memory) external;
}

contract TwoProxyAdmin {
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
    function upgrade(
        address _proxy,
        address _impl1,
        address _impl2,
        bytes memory _data
    ) external {
        require(msg.sender == admin, "only admin");
        require(_proxy.code.length > 0, "no proxy code");
        // We don't have to check impls code, since the other proxy will
        // do it for us.
        IProxy(_proxy).upgradeAndCall(_impl1, _impl2, _data);
    }
}
