// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../src/IInfraMarket.sol";

interface IERC20 {
    function transferFrom(address, address, uint256) external;
    function approve(address, uint256) external;
}

contract WhingeHelper {
    function whinge(
        address _token,
        IInfraMarket _infraMarket,
        address _tradingAddr,
        bytes8 _outcome
    ) external {
        IERC20(_token).transferFrom(msg.sender, address(this), 7e6);
        IERC20(_token).approve(address(_infraMarket), type(uint256).max);
        _infraMarket.whinge(_tradingAddr, _outcome, msg.sender);
    }
}
