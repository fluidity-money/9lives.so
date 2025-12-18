// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { INineLivesTrading } from "./INineLivesTrading.sol";

contract ClaimantHelper {
    uint256 version;
    address public paymaster;

    function initialise(address _paymaster) external {
        require(version == 0, "not version 0");
        paymaster = _paymaster;
        version = 1;
    }

    function _claim(
        address[] calldata _pools,
        address _recipient
     ) internal returns (uint256[] memory results) {
        results = new uint256[](_pools.length);
        for (uint i = 0; i < _pools.length; ++i) results[i] =
            INineLivesTrading(_pools[i]).claimAllFees332D7968(_recipient);
    }

    function paymasterClaim(address[] calldata _pools, address _recipient) external {
        require(msg.sender == paymaster, "not paymaster");
        _claim(_pools, _recipient);
    }

    function claim(address[] calldata _pools) external returns (uint256[] memory results) {
        return _claim(_pools, msg.sender);
    }

    function payoff(address[] calldata _pools) external returns (uint256[] memory results) {
        results = new uint256[](_pools.length);
        for (uint i = 0; i < _pools.length; ++i) {
            INineLivesTrading p = INineLivesTrading(_pools[i]);
            try p.isDppm() returns (bool d) {
                if (d) {
                    (uint256 o1, uint256 o2) =
                        p.dppmPayoffForAll58633B6E(msg.sender);
                    results[i] = o1 + o2;
                    continue;
                }
            } catch {}
            bytes8[] memory outcomes = p.outcomeList();
            for (uint x = 0; x < outcomes.length; ++x) {
                try p.payoffCB6F2565(outcomes[x], type(uint256).max, msg.sender)
                returns (uint256 amt) {
                    results[i] += amt;
                } catch {}
            }
        }
    }
}
