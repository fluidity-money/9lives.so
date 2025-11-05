// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { INineLivesTrading } from "./INineLivesTrading.sol";

contract ClaimantHelper {
    function claim(address[] calldata _pools) external returns (uint256[] memory results) {
        results = new uint256[](_pools.length);
        for (uint i = 0; i < _pools.length; ++i) results[i] =
            INineLivesTrading(_pools[i]).claimAllFees332D7968(msg.sender);
    }

    function payoff(address[] calldata _pools) external returns (uint256[] memory results) {
        results = new uint256[](_pools.length);
        for (uint i = 0; i < _pools.length; ++i) {
            INineLivesTrading p = INineLivesTrading(_pools[i]);
            if (p.isDppm()) {
                bytes8[] memory outcomes = p.outcomeList();
                for (uint x = 0; x < outcomes.length; ++x) results[i] +=
                    p.payoffCB6F2565(outcomes[x], type(uint256).max, msg.sender);
            } else {
                (uint256 o1, uint256 o2) =
                    p.dppmPayoffForAll58633B6E(msg.sender);
                results[i] = o1 + o2;
            }
        }
    }
}
