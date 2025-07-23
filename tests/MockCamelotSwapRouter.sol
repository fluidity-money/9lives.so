// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { MockWETH10 } from "./MockWETH10.sol";

import {
    ICamelotSwapRouter,
    ExactInputSingleParams,
    ExactOutputSingleParams } from "../src/ICamelotSwapRouter.sol";

contract MockCamelotSwapRouter is ICamelotSwapRouter {
    MockWETH10 public WETH;

    constructor(MockWETH10 _weth) {
        WETH = _weth;
    }

    function exactInputSingle(
        ExactInputSingleParams memory /* params */
    ) external payable returns (uint256) {
        revert("unimplemented");
    }

    function exactOutputSingle(
        ExactOutputSingleParams memory params
    ) external payable returns (uint256 amountIn) {
        // Stargate messaging fee:
        require(params.amountOut == 76973247383465, "not mocked");
        // Assuming we're already prefunded here!
        WETH.transfer(params.recipient, 76973247383465);
        return 286498;
    }
}
