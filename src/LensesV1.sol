// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
}

contract LensesV1 {
    address public factory;

    bytes32 constant TRADING_HASH = 0xb76acf5e142590fb27653e1d0d9425270d8e048e85f6329ede467692bcb14279;

    struct Balances {
        bytes8 campaign;
        bytes32[] word;
    }

    constructor(address _factory) {
        factory = _factory;
    }

    function createShareId(bytes8 _x, bytes8 _y) internal pure returns (bytes32) {
        if (_x > _y) {
            _x = _y;
            _y = _x;
        }
        return keccak256(abi.encodePacked(_x, _y));
    }

    function getShareAddr(bytes8 _campaignId, bytes8 _outcomeId) internal view returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(
            hex"ff",
            factory,
            createShareId(_campaignId, _outcomeId),
            TRADING_HASH
        )))));
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
                address word1 = getShareAddr(campaignId, bytes8(word));
                if (word1 != address(0)) bals[i] = IERC20(word1).balanceOf(_spender);
                address word2 = getShareAddr(campaignId, bytes8(word << 64));
                if (word2 != address(0)) bals[i+1] = IERC20(word2).balanceOf(_spender);
                address word3 = getShareAddr(campaignId, bytes8(word << 128));
                if (word3 != address(0)) bals[i+2] = IERC20(word3).balanceOf(_spender);
                address word4 = getShareAddr(campaignId, bytes8(word << 192));
                if (word4 != address(0)) bals[i+3] = IERC20(word4).balanceOf(_spender);
                i += 4;
            }
        }
        return bals;
    }
}
