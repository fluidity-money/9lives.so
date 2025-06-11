// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./INineLivesFactory.sol";
import "./ILongtail.sol";
import "./WordPackingLib.sol";
import "./INineLivesTrading.sol";

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
}

contract LensesV1 {
    using WordPackingLib for bytes32;

    ILongtail immutable public LONGTAIL;
    INineLivesFactory immutable public FACTORY;

    constructor(ILongtail _longtail, INineLivesFactory _factory) {
        LONGTAIL = _longtail;
        FACTORY = _factory;
    }

    function getLongtailQuote(
        address _pool,
        bool _zeroForOne,
        int256 _amount,
        uint256 _priceLimit
    ) external returns (string memory data) {
        try
            LONGTAIL.quote72E2ADE7(_pool, _zeroForOne, _amount, _priceLimit)
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
         INineLivesFactory _factory,
         bytes32 _hash,
        address _tradingAddr,
        bytes8 _outcomeId
    ) public pure returns (address shareAddr) {
        shareAddr = address(uint160(uint256(keccak256(abi.encodePacked(
            hex"ff",
            _factory,
            keccak256(abi.encodePacked(
                _outcomeId,
                _tradingAddr
            )),
            _hash
        )))));
    }

    struct BalancesForAll {
        uint256 amount;
        bytes8 id;
    }

    function balancesForAll(
        INineLivesTrading[] calldata _pools
    ) external view returns (BalancesForAll[] memory bals) {
        bals = new BalancesForAll[](10 * _pools.length);
        bytes32 hash = FACTORY.erc20Hash();
        for (uint i = 0; i < _pools.length; ++i) {
            bytes8[] memory outcomes = _pools[i].outcomeList();
            // This should only ever return up to 10!
            for (uint x = 0; x < outcomes.length; ++x) {
                address share = getShareAddr(FACTORY, hash, address(_pools[i]), outcomes[x]);
                bals[(i * 10) + x].amount = IERC20(share).balanceOf(msg.sender);
                bals[(i * 10) + x].id = outcomes[x];
            }
        }
    }

    function balancesWithFactoryAndHash(
        INineLivesFactory _factory,
        bytes32 _hash,
        address _tradingAddr,
        bytes32[] calldata _words,
        address _spender
    ) external view returns (uint256[] memory bals) {
        INineLivesFactory factory = _factory;
        bytes32 hash = _hash;
        if (address(factory) == address(0)) {
            factory = FACTORY;
        }
        if (hash == bytes32(0)) {
            hash = _factory.erc20Hash();
        }
        bals = new uint256[](_words.length * 4); // TODO: trim suffix of return array
        uint x = 0;
        for (uint256 i = 0; i < _words.length; ++i) {
            (bytes8 word1, bytes8 word2, bytes8 word3, bytes8 word4) =
                WordPackingLib.unpack(_words[i]);
            if (word1 != bytes8(0)) {
                bals[x] = IERC20(getShareAddr(
                    factory,
                    hash,
                    _tradingAddr,
                    word1
                )).balanceOf(_spender);
                ++x;
            }
            if (word2 != bytes8(0)) {
                bals[x] = IERC20(getShareAddr(
                    factory,
                    hash,
                    _tradingAddr,
                    word2
                )).balanceOf(_spender);
                ++x;
            }
            if (word3 != bytes8(0)) {
                bals[x] = IERC20(getShareAddr(
                    factory,
                    hash,
                    _tradingAddr,
                    word3
                )).balanceOf(_spender);
                ++x;
            }
            if (word4 != bytes8(0)) {
                bals[x] = IERC20(getShareAddr(
                    factory,
                    hash,
                    _tradingAddr,
                    word4
                )).balanceOf(_spender);
                ++x;
            }
        }
    }
}
