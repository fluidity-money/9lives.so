// SPDX-Identifier: MIT
pragma solidity 0.8.20;

interface ILockup {
    /**
     * @notice Lockup ARB to receive LARB.
     * @param amount to lock up.
     * @param recipient to send the Locked ARB to.
     * @return the amount of LARB sent to the recipient.
     */
    function lockup(uint256 amount, address recipient) external returns (uint256);

    /**
     * @notice Token address of LARB.
     */
    function tokenAddr() external view returns (address);

    /**
     * @notice Get the until locked time timestamp.
     * @param spender to get the locked until for.
     */
    function lockedUntil(address spender) external view returns (uint64 timestamp);

    /**
     * @notice Withdraw some LARB to ARB.
     * @param amount to withdraw.
     * @param recipient to send the returned amounts to.
     * @return the amount that was sent back.
     */
    function withdraw(uint256 amount, address recipient) external returns (uint256);

    /**
     * @notice Slash a user's entire position portfolio on request. only usable by
     *         InfraMarket. This can be called repeatedly safely without context.
     *         When this is used the user's amount before they started to lose
     *         funds is tracked to be drawn down.
     * @param victim to take money from.
     * @param amount to take from the victim.
     * @param recipient to send the slashed amounts to.
     * @return amount taken from the victim.
     */
    function slash(address victim, uint256 amount, address recipient) external returns (uint256);

    /**
     * @notice freeze a user's position to prevent it from being taken until after this
     * deadline. If the amount is already set, then we use the latest value. The infra
     * market is responsible for a correct interaction here.
     */
    function freeze(address spender, uint64 until) external;

    function updateInfraMarket(address addr) external;
}
