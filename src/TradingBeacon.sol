// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./ITradingBeacon.sol";

contract TradingBeacon is ITradingBeacon {
    address public admin;
    address public mint;
    address public quotes;
    address public price;
    address public extras;

    event NewAdmin(address indexed newAdmin);
    event UpgradedMint(address indexed impl);
    event UpgradedQuotes(address indexed impl);
    event UpgradedPrice(address indexed price);
    event UpgradedExtras(address indexed extras);

    constructor(
        address _admin,
        address _mintImpl,
        address _quotesImpl,
        address _priceImpl,
        address _extrasImpl
    ) {
        admin = _admin;
        mint = _mintImpl;
        quotes = _quotesImpl;
        price = _priceImpl;
        extras = _extrasImpl;
    }

    function changeAdmin(address _oldAdmin, address _newAdmin) external {
        require(msg.sender == admin, "not admin");
        require(admin == _oldAdmin, "admin inconsistent");
        admin = _newAdmin;
        emit NewAdmin(_newAdmin);
    }

    function upgradeMint(address _oldImpl, address _newImpl) external {
        require(msg.sender == admin, "not admin");
        require(mint == _oldImpl, "impls inconsistent");
        mint = _newImpl;
        emit UpgradedMint(_newImpl);
    }

    function upgradeQuotes(address _oldImpl, address _newImpl) external {
        require(msg.sender == admin, "not admin");
        require(quotes == _oldImpl, "impls inconsistent");
        quotes = _newImpl;
        emit UpgradedQuotes(_newImpl);
    }

    function upgradePrice(address _oldImpl, address _newImpl) external {
        require(msg.sender == admin, "not admin");
        require(price == _oldImpl, "impls inconsistent");
        price = _newImpl;
        emit UpgradedPrice(_newImpl);
    }

    function upgradeExtras(address _oldImpl, address _newImpl) external {
        require(msg.sender == admin, "not admin");
        require(extras == _oldImpl, "impls inconsistent");
        extras = _newImpl;
        emit UpgradedExtras(_newImpl);
    }
}
