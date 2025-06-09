// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./INineLivesTrading.sol";

contract ClaimantHelper {
    function claim(address[] calldata _pools) external returns (uint256[] memory results) {
        for (uint i = 0; i < _pools.length; ++i) results[i] =
            INineLivesTrading(_pools[i]).claimAllFees71949EC8(msg.sender);
    }
}
