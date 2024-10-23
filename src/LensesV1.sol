// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./INineLivesFactory.sol";

import "./WordPackingLib.sol";

import "forge-std/console.sol";

interface ILongtail {
    function quote72E2ADE7(address, bool, int256, uint256) external;
}

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
}

contract LensesV1 {
    using WordPackingLib for bytes32;

    ILongtail immutable public longtail;
    INineLivesFactory immutable public factory;

    struct Balances {
        address tradingAddr;
        bytes32[] word;
    }

    bytes32 private TRADING_HASH;
    bytes32 private ERC20_HASH;

    constructor(ILongtail _longtail, INineLivesFactory _factory) {
        longtail = _longtail;
        factory = _factory;
        TRADING_HASH = factory.tradingHash();
        ERC20_HASH = factory.erc20Hash();
    }

    function getLongtailQuote(
        address _pool,
        bool _zeroForOne,
        int256 _amount,
        uint256 _priceLimit
    ) external returns (string memory data) {
        try
            longtail.quote72E2ADE7(_pool, _zeroForOne, _amount, _priceLimit)
        {} catch (bytes memory rc) {
            if (rc.length < 68) {
                revert("unexpected error");
            }
            assembly {
                rc := add(rc, 0x04)
            }
            return abi.decode(rc, (string));
        }
    }

    function getShareAddr(
        address _tradingAddr,
        bytes8 _outcomeId
    ) public view returns (address shareAddr) {
        shareAddr = address(uint160(uint256(keccak256(abi.encodePacked(
            hex"ff",
            factory,
            keccak256(abi.encodePacked(
                _outcomeId,
                _tradingAddr
            )),
            ERC20_HASH
        )))));
    }

    function unpackBalancesWordAddrs(
        address _tradingAddr,
        bytes32 word
    ) internal view returns (
        address word1,
        address word2,
        address word3,
        address word4
    ) {
        (bytes8 word1_, bytes8 word2_, bytes8 word3_, bytes8 word4_) =
            WordPackingLib.unpack(word);
        word1 = getShareAddr(_tradingAddr, word1_);
        word2 = getShareAddr(_tradingAddr, word2_);
        word3 = getShareAddr(_tradingAddr, word3_);
        word4 = getShareAddr(_tradingAddr, word4_);
    }

    function balances(
        address _spender,
        Balances[] calldata _identifiers
    ) external returns (uint256[] memory bals) {
        uint256 wordsLen;
        uint256 i;
        for (;i < _identifiers.length; ++i) {
            wordsLen += _identifiers[i].word.length * 4;
        }
        bals = new uint256[](wordsLen);
        i = 0;
        for (uint256 idI = 0; idI < _identifiers.length; ++idI) {
            for (uint256 wordI = 0; wordI < _identifiers[idI].word.length; wordI++) {
                address tradingAddr = _identifiers[idI].tradingAddr;
                bytes32 word = _identifiers[idI].word[wordI];
                (address word1, address word2, address word3, address word4) =
                    unpackBalancesWordAddrs(tradingAddr, word);
                if (word1 != address(0)) bals[i] = IERC20(word1).balanceOf(_spender);
                if (word2 != address(0)) bals[i+1] = IERC20(word2).balanceOf(_spender);
                if (word3 != address(0)) bals[i+2] = IERC20(word3).balanceOf(_spender);
                if (word4 != address(0)) bals[i+3] = IERC20(word4).balanceOf(_spender);
                i += 4;
            }
        }
        return bals;
    }
}
