// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

interface INineLivesVault {
    function borrow(address _for, uint256 amount) external;
    function ammRegister(address amm) external;
}
