// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./IEvents.sol";

/**
 * @notice SARPSignaller is a on-chain system with a bond that allows a user to formally
 *         request conclusion of a market with SARP. This is done so as an alternative
 *         to an off-chain system based on the conclusion of a market.
 */
contract SARPSignaller is IEvents {
    struct Ticket {
        address addr;
    }

    mapping(uint256 => Ticket) public tickets;
    uint256 private ticketCount;

    uint256 public feeCollection;

    address immutable SARP;

    constructor(address _sarp) {
        SARP = _sarp;
    }

    /**
     * @notice Request a conclusion to a market using SARP, transferring the bond payment
     *         from the user to escrow here for redemption.
     */
    function request(address _trading, address _recipient) external {
        uint256 t = ticketCount++;
        tickets[t].addr = _recipient;
        emit Requested(_trading, t);
    }

    /**
     * @notice Conclude a market if the outcome was not an indeterminate state by
     *         refunding the spender. In the calldata, it logs the receipt of the
     *         justification for its decision.
     * @param _ticket that is relevant to this.
     */
    function conclude(uint256 _ticket, bytes32 _note) external {
        require(msg.sender == SARP, "only sarp");
        emit Concluded(_ticket, _note);
    }
}
