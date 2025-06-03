// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

struct ExactInputSingleParams {
    address tokenIn;
    address tokenOut;
    address recipient;
    uint256 deadline;
    uint256 amountIn;
    uint256 amountOutMinimum;
    uint160 limitSqrtPrice;
}

interface ICamelotSwapRouter {
    function exactInputSingle(
        ExactInputSingleParams memory params
    ) external payable returns (uint256 amountOut);
}
