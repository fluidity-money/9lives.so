// SPDX-Identifier: MIT
pragma solidity 0.8.18;

interface ILockup {
    /**
     * @notice lockup funds to receive StakedARB until the deadline given.
     * @param amount to lock up.
     * @param recipient to send the Locked ARB to.
     * @dev a debt id that's needed to redeem amounts deposited.
     */
    function lockup(
        uint256 amount,
        address recipient
    ) external returns (uint256 debtId);

    /**
     * @notice slash a user's entire position portfolio on request. only usable by InfraMarket. This can be called repeatedly safely without context. When this is used the user's amount before they started to lose funds is tracked to be drawn down.
     * @param spender
     */
    function slash(address spender) external;

    /**
     * @notice drawDown a user's Staked ARB portfolio to a recipient based on the percent,
     scaled by 1e12.
     */
    function drawDown(address loser, address recipient, uint256 pct) external;

    /**
     * @notice freeze a user's position to prevent it from being taken until after this deadline. If the amount is already set, then we use the latest value.
     */
    function freeze(address spender, uint256 until) external;
}
