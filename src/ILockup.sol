// SPDX-Identifier: MIT
pragma solidity 0.8.20;

interface ILockup {
    /**
     * @notice lockup funds to receive StakedARB until the deadline given.
     * @param amount to lock up.
     * @param untilTimestamp to do the lockup for, to earn extra power.
     * @param recipient to send the Locked ARB to.
     * @dev a debt id that's needed to redeem amounts deposited.
     */
    function lockup(
        uint256 amount,
        uint256 untilTimestamp,
        address recipient
    ) external returns (uint256 debtId);

    function tokenAddr() external view returns (address);

    /**
     * @notice Staked ARB vested by the user at this point in time.
     * @param holder to query for
     */
    function stakedArbBal(address holder) external view returns (uint256);

    /**
     * @notice slash a user's entire position portfolio on request. only usable by
     * InfraMarket. This can be called repeatedly safely without context. When this is used
     * the user's amount before they started to lose funds is tracked to be drawn down.
     * @param victim to take money from
     */
    function slash(address victim) external;

    /**
     * @notice confiscate from the victim that bet incorrectly. This should be called
     * after slash, and the infra market is responsible for doing this correctly.
     * @param victim to take money from, setting their staked arb to 0.
     * @param recipient to send the staked arb to
     */
    function confiscate(address victim, address recipient) external returns (
        uint256 amountTaken
    );

    /**
     * @notice freeze a user's position to prevent it from being taken until after this
     * deadline. If the amount is already set, then we use the latest value. The infra
     * market is responsible for a correct interaction here.
     */
    function freeze(address spender, uint256 until) external;
}
