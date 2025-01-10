// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../src/IInfraMarket.sol";

interface IERC20 {
    function transferFrom(address, address, uint256) external;
}

contract WhingeHelper {
    constructor(
        address _token,
        IInfraMarket _infraMarket,
        address _tradingAddr,
        bytes8 _outcome
    ) {
        IERC20(_token).transferFrom(msg.sender, address(this), 7e6);
        _infraMarket.whinge(_tradingAddr, _outcome, msg.sender);
    }
}
