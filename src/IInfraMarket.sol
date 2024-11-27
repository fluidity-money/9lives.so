// SPDX-Identifier: MIT
pragma solidity 0.8.18;

interface IInfraMarket {
    function register(
        address trading,
        address incentiveSender,
        bytes32 desc,
        uint64 launchTs
    ) external;

    function predict(address trading, bytes8 winner, uint256 amount) external;
    function winner() external view returns (bytes8 winnerId);

    function marketVested(address trading, bytes8 outcome) external view returns (uint256);

    // Utility that calls slash on the user that was specified by seeing if they bet
    // on the wrong outcome. If the market wasn't "called" as being over, then
    // the calldata of all the winner ids is taken into consideration to see if it
    // ends up as the final amount that was tracked in voting power,
    // and if they are, then the winner is chosen, and the incentive amount
    // is sent to the caller. It then sets the flag of which outcome won.
    function sweep(
        address trading,
        address victim,
        bytes8[] calldata outcomes
    ) external returns (uint256 yieldForCaller);

    // Claim some Staked ARB that the user is owed by collecting from the user's global share. Calls sweep too.
    function claim(
        address trading,
        address victim,
        bytes8 winner,
        address recipient
    ) external returns (uint256);
}
