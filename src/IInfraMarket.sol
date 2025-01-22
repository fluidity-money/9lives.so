// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./InfraMarketState.sol";

interface IInfraMarket {
    function ctor(
        address operator,
        address emergencyCouncil,
        address lockup,
        address lockedArbToken,
        address factory
    ) external;

    /**
     * @notice Register this campaign, taking a small stipend for management from the
     *         creator in the form of $3 fUSDC. Factory caller only.
     * @param trading address to configure this
     * @param desc of the contract to commit as info for users. Should be info for a oracle.
     * @param launchTs to use as the timestamp to begin this infra market.
     *        Could be the conclusion date.
     * @param callDeadlineTs, the last date that this should decide an outcome before
     *        entering into an emergency state.
     */
    function register(
        address trading,
        bytes32 desc,
        uint64 launchTs,
        uint64 callDeadlineTs
    ) external returns (uint256);

    /**
     * @notice Call the outcome, changing the state to allow a user to disagree
     *         with it with the whinge function. Takes a $2 fUSDC bond.
     * @param tradingAddr to call for.
     * @param winner to indicate is the preferred outcome by this user.
     * @param incentiveRecipient to send future incentive amounts, and the refund
     *        for the bond to.
     */
    function call(
        address tradingAddr,
        bytes8 winner,
        address incentiveRecipient
    ) external returns (uint256);

    /**
     * @notice Whinge the outcome, indicating that the sender disagrees with the call
     *         decision that was made. This is only possible during a two day window.
     *         A $7 fUSDC must be taken from the user.
     * @param tradingAddr to use for the disagreement that's taking place.
     * @param preferredOutcome to use as the outcome that the whinger disagrees is
     *        the best.
     * @param bondRecipient to send the bond that's refunded back to.
     */
    function whinge(
        address tradingAddr,
        bytes8 preferredOutcome,
        address bondRecipient
    ) external returns (uint256);

    /**
     * @notice Make a commitment as to what the preferred outcome should be, now
     *         that there's been calling and whinging. The voting power comes from
     *         the lockup contract, which takes ARB and locks it up for an amount
     *         of time that this trading should close.
     * @param tradingAddr to use as the trading address to make commitments for.
     * @param commit to use as the commitment for what the outcome should be.
     */
    function predict(address tradingAddr, bytes32 commit) external;

    /**
     * @notice Get the amount of vested ARB in a specific outcome produced by
     *         reveals up until now.
     * @param trading contract this is for.
     * @param outcome that we want to know.
     */
    function curOutcomeVestedArb(
        address trading,
        bytes8 outcome
    ) external view returns (uint256);

    /**
     * @notice Get the current epoch number for the trading contract given.
     * @param trading to check.
     */
    function epochNumber(address trading) external view returns (uint256 epochNo);

    /**
     * @notice Reveal a previously made commitment. Should be done in the revealing
     *         period (two days after the first whinge, for two days).
     * @param tradingAddr to use as the place for the commitments to be tracked.
     * @param committerAddr to use as the address of the user making commitments.
     * @param outcome to state the previously made commitment was for.
     * @param seed to use as the random nonce for the reveal.
     */
    function reveal(
        address tradingAddr,
        address committerAddr,
        bytes8 outcome,
        uint256 seed
    ) external;

    /**
     * @notice Sweep money from a bettor who bet incorrectly, or someone who neglected to
     *         reveal their commitment, who is assumed to be betting that the system
     *         is in an indeterminate state.
     * @param tradingAddr to use as the trading address for the campaign.
     * @param epochNo to use as the epoch number to take funds from.
     * @param victim to claim funds from.
     * @param feeRecipientAddr to send the small amount taken from the victim to (1%).
     */
    function sweep(
        address tradingAddr,
        uint256 epochNo,
        address victim,
        address feeRecipientAddr
    ) external returns (uint256 yieldForFeeRecipient);

    /**
     * @notice Capture amounts from the prize pool. Can only be done once, so be careful!
     * @param tradingAddr to capture amounts from.
     * @param epochNo to collect amounts from the pot from.
     * @param feeRecipient to send incentive amounts to.
     */
    function capture(
        address tradingAddr,
        uint256 epochNo,
        address feeRecipient
    ) external returns (uint256 yieldForFeeRecipient);

    /**
     * @notice Close this campaign if it's been in a state where anyone can whinge for
     *         some time, two days since someone whinged and no-one had whinged.
     * @param tradingAddr this market is for.
     * @param feeRecipient to send the incentive for closing to.
     */
    function close(address tradingAddr, address feeRecipient) external;

    /**
     * @notice Escape a trading market that has gone over the limit. This calls
     *         the escape function in the trading contract to indicate something
     *         has gone wrong. This should only be callable if the contract is in the
     *         state for calling past the deadline.
     * @param tradingAddr to escape.
     */
    function escape(address tradingAddr) external;

    /**
     * @notice Winner that was declared for this infra market, if there is one.
     */
    function winner(address tradingAddr) external view returns (bytes8 winnerId);

    /**
     * @notice Status of this trading contract's oracle.
     */
    function status(address tradingAddr) external view returns (
        InfraMarketState currentState,
        uint64 secsRemaining
    );

    /**
     * @notice Starting timestamp of the campaign.
     */
    function startTs(address trading) external view returns (uint64);

    /**
     * @notice Ending timestamp of the campaign.
     */
    function endTs(address trading) external view returns (uint64);

    /**
     * @notice Declare a winner, by providing the outcomes that were in use, along
     *         with a fee recipient to collect the fee for providing this correct calldata
     *         to.
     * @param tradingAddr to use as the trading address for the campaign.
     * @param outcomes to use as the outcomes that were in use.
     * @param feeRecipient to send the incentive for declaring to.
     */
    function declare(
        address tradingAddr,
        bytes8[] calldata outcomes,
        address feeRecipient
    ) external returns (uint256);

    /**
     * @notice Enable or disable the contract.
     * @param status to set the contract to.
     */
    function enable_contract(bool status) external returns (bool);
}
