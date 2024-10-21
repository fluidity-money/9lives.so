// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./INineLivesFactory.sol";

import "forge-std/console.sol";

interface ILongtail {
    function quote72E2ADE7(address, bool, int256, uint256) external;
}

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
}

contract LensesV1 {
    ILongtail immutable public longtail;
    INineLivesFactory immutable public factory;

    struct Balances {
        bytes8 campaign;
        bytes32[] word;
    }

    constructor(ILongtail _longtail, INineLivesFactory _factory) {
        longtail = _longtail;
        factory = _factory;
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

    function createShareId(bytes8 _x, bytes8 _y) internal pure returns (bytes32) {
        if (_x > _y) {
            _x = _y;
            _y = _x;
        }
        return keccak256(abi.encodePacked(_x, _y));
    }

    function getShareAddr(bytes8 _campaignId, bytes8 _outcomeId) public view returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(
            hex"ff",
            factory,
            createShareId(_campaignId, _outcomeId),
            factory.tradingHash()
        )))));
    }

    function unpackBalancesWordAddrs(bytes8 id, bytes32 word) internal view returns (
        address word1,
        address word2,
        address word3,
        address word4
    ) {
        word1 = getShareAddr(id, bytes8(word));
        word2 = getShareAddr(id, bytes8(word << 64));
        word3 = getShareAddr(id, bytes8(word << 128));
        word4 = getShareAddr(id, bytes8(word << 192));
    }

    function balances(
        address _spender,
        Balances[] calldata _identifiers
    ) external view returns (uint256[] memory bals) {
        uint256 wordsLen;
        uint256 i;
        for (;i < _identifiers.length; ++i) {
            wordsLen += _identifiers[i].word.length * 4;
        }
        bals = new uint256[](wordsLen);
        i = 0;
        for (uint256 idI = 0; idI < _identifiers.length; ++idI) {
            for (uint256 wordI = 0; wordI < _identifiers[idI].word.length; wordI++) {
                bytes8 campaignId = _identifiers[idI].campaign;
                bytes32 word = _identifiers[idI].word[wordI];
                (address word1, address word2, address word3, address word4) =
                    unpackBalancesWordAddrs(campaignId, word);
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
