// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../src/ILockup.sol";
import "../src/IInfraMarket.sol";

interface IERC20 {
    function transferFrom(address, address, uint256) external;
    function approve(address, uint256) external;
}

contract TestPredictor {
    IERC20 immutable TOKEN;
    ILockup immutable LOCKUP;
    IInfraMarket immutable INFRA_MARKET;

    bytes32 private commitment;
    uint256 private seed;

    constructor(
        address _token,
        ILockup _lockup,
        IInfraMarket _infraMarket
    ) {
        TOKEN = IERC20(_token);
        LOCKUP = _lockup;
        INFRA_MARKET = _infraMarket;
        TOKEN.approve(address(LOCKUP), type(uint256).max);
    }

    function lockup(uint256 _amount) external {
        TOKEN.transferFrom(msg.sender, address(this), _amount);
        LOCKUP.lockup(_amount, address(this));
    }

    function predict(address _trading, bytes8 _outcome) external {
        seed = block.timestamp;
        INFRA_MARKET.predict(
          _trading,
          keccak256(abi.encodePacked(address(this), _outcome, seed))
        );
    }

    function reveal(address _trading, bytes8 _outcome) external {
        INFRA_MARKET.reveal(_trading, address(this), _outcome, seed);
    }

    function capture(address _trading) external returns (uint256) {
        return INFRA_MARKET.capture(_trading, 0, address(this));
    }
}
