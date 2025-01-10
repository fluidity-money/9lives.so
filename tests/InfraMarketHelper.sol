// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../src/IInfraMarket.sol";

interface IERC20 {
    function approve(address, uint256) external;
    function transferFrom(address, address, uint256) external;
}

contract InfraMarketHelper {
    IERC20 immutable TOKEN;
    IInfraMarket immutable INFRA_MARKET;

    constructor(address _token, address _infraMarket) {
        TOKEN = IERC20(_token);
        INFRA_MARKET = IInfraMarket(_infraMarket);
        TOKEN.approve(_infraMarket, type(uint256).max);
    }

    function register(address trading, bytes32 desc, uint64 deadline) external returns (uint256) {
        TOKEN.transferFrom(msg.sender, address(this), 600000 + 100000 + 300000);
        return INFRA_MARKET.register(trading, desc, uint64(block.timestamp + 1), deadline);
    }
}
