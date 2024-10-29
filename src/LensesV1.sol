// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./INineLivesFactory.sol";

import "./WordPackingLib.sol";

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
            factory.erc20Hash()
        )))));
    }

    function balances(
        address _tradingAddr,
        bytes32[] calldata _words,
        address _spender
    ) external view returns (uint256[] memory bals) {
        bals = new uint256[](_words.length * 4); // TODO: trim suffix of return array
        uint x = 0;
        for (uint256 i = 0; i < _words.length; ++i) {
            (bytes8 word1, bytes8 word2, bytes8 word3, bytes8 word4) =
                WordPackingLib.unpack(_words[i]);
            if (word1 != bytes8(0)) {
                bals[x] = IERC20(getShareAddr(_tradingAddr, word1)).balanceOf(_spender);
                ++x;
            }
            if (word2 != bytes8(0)) {
                bals[x] = IERC20(getShareAddr(_tradingAddr, word2)).balanceOf(_spender);
                ++x;
            }
            if (word3 != bytes8(0)) {
                bals[x] = IERC20(getShareAddr(_tradingAddr, word3)).balanceOf(_spender);
                ++x;
            }
            if (word4 != bytes8(0)) {
                bals[x] = IERC20(getShareAddr(_tradingAddr, word4)).balanceOf(_spender);
                ++x;
            }
        }
    }
}
