// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./IEvents.sol";

/// @dev Bond that's taken from users who request SARP's settlement
///      of a market.
uint256 constant SARP_BOND = 100000;

/// @dev Fee taken by SARP for ongoing management purposes.
uint256 constant SARP_FEE = (100 * SARP_BOND) / 1000;

/// @dev Refund fee that's paid back to the user if their request
///      resulted in a settled state.
uint256 constant SARP_REFUND = SARP_BOND - SARP_FEE;

interface IERC20 {
    function transferFrom(address, address, uint256) external;
    function transfer(address, uint256) external;
}

/**
 * @notice SARPSignaller is a on-chain system with a bond that allows a user to formally
 *         request conclusion of a market with SARP. This is done so as an alternative
 *         to an off-chain system based on the conclusion of a market.
 */
contract SARPSignaller is IEvents {
    struct Ticket {
        address addr;
        bool repaid;
    }

    mapping(uint256 => Ticket) public tickets;
    uint256 private ticketCount;

    uint256 public feeCollection;

    address immutable SARP;
    IERC20 immutable FUSDC;

    constructor(address _sarp, IERC20 _fusdc) {
        SARP = _sarp;
        FUSDC = _fusdc;
    }

    /**
     * @notice Request a conclusion to a market using SARP, transferring the bond payment
     *         from the user to escrow here for redemption.
     */
    function request(address _trading, address _recipient) external {
        FUSDC.transferFrom(msg.sender, address(this), SARP_BOND);
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
        require(!tickets[_ticket].repaid, "already repaid");
        tickets[_ticket].repaid = true;
        FUSDC.transfer(tickets[_ticket].addr, SARP_REFUND);
        emit Concluded(_ticket, _note);
    }
}
