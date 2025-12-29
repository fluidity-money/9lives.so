// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

contract TradingBeacon {
    event AdminChanged(address previousAdmin, address newAdmin);

    event NewAdmin(address indexed newAdmin, bool indexed isDppm);
    event UpgradedMint(address indexed impl, bool indexed isDppm);
    event UpgradedQuotes(address indexed impl, bool indexed isDppm);
    event UpgradedPrice(address indexed price, bool indexed isDppm);
    event UpgradedExtras(address indexed extras, bool indexed isDppm);

    address public operator;

    // The addresses of the implementations, true for the DPPM:

    mapping(bool => address) public mintAddr;
    mapping(bool => address) public quotesAddr;
    mapping(bool => address) public priceAddr;
    mapping(bool => address) public extrasAddr;

    constructor() {
        operator = msg.sender;
    }

    function changeAdmin(address _newAdmin) external {
        require(msg.sender == operator, "not operator");
        emit AdminChanged(operator, _newAdmin);
        operator = _newAdmin;
    }

    function upgradeContracts(
        address _dppmExtras,
        address _dppmMint,
        address _dppmQuotes,
        address _dppmPrice,
        address _ammExtras,
        address _ammMint,
        address _ammQuotes,
        address _ammPrice
    ) external {
        upgradeDppmContracts(_dppmExtras, _dppmMint, _dppmQuotes, _dppmPrice);
        upgradeAmmContracts(_ammExtras, _ammMint, _ammQuotes, _ammPrice);
    }

    function upgradeDppmContracts(
        address _extras,
        address _mint,
        address _quotes,
        address _price
    ) public {
        require(msg.sender == operator, "not operator");
        if (_extras != address(0)) {
            emit UpgradedExtras(_extras, true);
            extrasAddr[true] = _extras;
        }
        if (_mint != address(0)) {
            emit UpgradedMint(_mint, true);
            mintAddr[true] = _mint;
        }
        if (_quotes != address(0)) {
            emit UpgradedQuotes(_quotes, true);
            quotesAddr[true] = _quotes;
        }
        if (_price != address(0)) {
            emit UpgradedPrice(_price, true);
            priceAddr[true] = _price;
        }
    }

    function upgradeAmmContracts(
        address _extras,
        address _mint,
        address _quotes,
        address _price
    ) public {
        require(msg.sender == operator, "not operator");
        if (_extras != address(0)) {
            emit UpgradedExtras(_extras, false);
            extrasAddr[false] = _extras;
        }
        if (_mint != address(0)) {
            emit UpgradedMint(_mint, false);
            mintAddr[false] = _mint;
        }
        if (_quotes != address(0)) {
            emit UpgradedQuotes(_quotes, false);
            quotesAddr[false] = _quotes;
        }
        if (_price != address(0)) {
            emit UpgradedPrice(_price, false);
            priceAddr[false] = _price;
        }
    }

    function findImpl(bool forDppm, bytes4 sel) internal view returns (address) {
        uint8 s = uint8(sel[2]);
        if (s == 1) return mintAddr[forDppm];
        else if (s == 2) return quotesAddr[forDppm];
        else if (s == 3) return priceAddr[forDppm];
        else return extrasAddr[forDppm];
    }

    function ammImpl(bytes4 sel) external view returns (address) {
        return findImpl(false, sel);
    }

    function dppmImpl(bytes4 sel) external view returns (address) {
        return findImpl(true, sel);
    }
}
