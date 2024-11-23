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
     * @notice Staked ARB vested by the user at this point in time.
     * @param holder address
     */
    function stakedArbBal(address _holder) external view returns (uint256);

    /**
     * @notice slash a user's entire position portfolio on request. only usable by
     * InfraMarket. This can be called repeatedly safely without context. When this is used
     * the user's amount before they started to lose funds is tracked to be drawn down.
     * @param spender
     */
    function slash(address loser) external;

    /**
     * @notice takeStakedArb from the pool that we have locked up
     * @param victim to take money from, setting their staked arb to 0.
     * @param recipient to send the staked arb to
    function takeStakedArb(address victim, address recipient) external;

    /**
     * @notice freeze a user's position to prevent it from being taken until after this deadline. If the amount is already set, then we use the latest value.
     */
    function freeze(address spender, uint256 until) external;
}
