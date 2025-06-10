// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./INineLivesTrading.sol";

contract ClaimantHelper {
    function claim(address[] calldata _pools) external returns (uint256[] memory results) {
        results = new uint256[](_pools.length);
        for (uint i = 0; i < _pools.length; ++i) results[i] =
            INineLivesTrading(_pools[i]).claimAllFees332D7968(msg.sender);
    }
}
