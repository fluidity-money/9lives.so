// SPDX-Identifier: MIT
pragma solidity 0.8.18;

import "./IInfraMarket.sol";

contract MockInfraMarket is IInfraMarket {
    uint256 counter_;
    bytes8 winner_;
    function register(address /* trading */, uint256 /* launchTs */) external {
        ++counter_;
    }
    function predict(address /* trading */, bytes8 _winner, uint256 /* amount */) external {
        winner_ = _winner;
    }
    function winner() external view returns (bytes8) {
        require(winner_ != bytes8(0), "winner not picked");
        return winner_;
    }
    function marketVestedA(bytes8 /* outcome */) external pure returns (uint256) {
        return 100;
    }
    function marketVestedB(bytes8 /* outcome */) external pure returns (uint256) {
        return 200;
    }
}
