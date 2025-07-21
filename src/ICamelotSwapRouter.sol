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

struct ExactOutputSingleParams {
    address tokenIn;
    address tokenOut;
    uint24 fee;
    address recipient;
    uint256 deadline;
    uint256 amountOut;
    uint256 amountInMaximum;
    uint160 limitSqrtPrice;
}

interface ICamelotSwapRouter {
    function exactInputSingle(
        ExactInputSingleParams memory params
    ) external payable returns (uint256 amountOut);

    function exactOutputSingle(
        ExactOutputSingleParams memory params
    ) external payable returns (uint256 amountIn);
}
