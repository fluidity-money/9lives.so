// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {INineLivesFactory} from "./INineLivesFactory.sol";
import {WordPackingLib} from "./WordPackingLib.sol";
import {INineLivesTrading} from "./INineLivesTrading.sol";

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function name() external view returns (string memory);
}

contract LensesV1 {
    using WordPackingLib for bytes32;

    INineLivesFactory public immutable FACTORY;

    constructor(INineLivesFactory _factory) {
        FACTORY = _factory;
    }

    function getShareAddr(INineLivesFactory _factory, bytes32 _hash, address _tradingAddr, bytes8 _outcomeId)
        public
        pure
        returns (address shareAddr)
    {
        shareAddr = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            hex"ff", _factory, keccak256(abi.encodePacked(_tradingAddr, _outcomeId)), _hash
                        )
                    )
                )
            )
        );
    }

    struct BalancesForAll {
        uint256 amount;
        bytes8 id;
        string name;
    }

    function balancesForAll(INineLivesTrading[] calldata _pools) external view returns (BalancesForAll[] memory bals) {
        bals = new BalancesForAll[](10 * _pools.length);
        for (uint256 i = 0; i < _pools.length; ++i) {
            bytes8[] memory outcomes = _pools[i].outcomeList();
            // This should only ever return up to 10!
            for (uint256 x = 0; x < outcomes.length; ++x) {
                IERC20 share = IERC20(_pools[i].shareAddr(outcomes[x]));
                bals[(i * 10) + x].amount = share.balanceOf(msg.sender);
                bals[(i * 10) + x].name = share.name();
                bals[(i * 10) + x].id = outcomes[x];
            }
        }
    }

    struct BalancesForDpm {
        INineLivesTrading trading;
        bytes8 outcomeA;
        bytes8 outcomeB;
    }

    struct BalancesForDpmOut {
        INineLivesTrading trading;
        uint256 outcomeA;
        string nameA;
        uint256 outcomeB;
        string nameB;
    }

    function balancesForAllDpm(BalancesForDpm[] calldata _pools)
        external
        view
        returns (BalancesForDpmOut[] memory bals)
    {
        bals = new BalancesForDpmOut[](_pools.length);
        for (uint256 i = 0; i < _pools.length; ++i) {
            IERC20 shareA = IERC20(_pools[i].trading.shareAddr(_pools[i].outcomeA));
            bals[i].outcomeA = shareA.balanceOf(msg.sender);
            bals[i].nameA = shareA.name();
            IERC20 shareB = IERC20(_pools[i].trading.shareAddr(_pools[i].outcomeB));
            bals[i].outcomeB = shareB.balanceOf(msg.sender);
            bals[i].nameB = shareB.name();
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
        uint256 x = 0;
        for (uint256 i = 0; i < _words.length; ++i) {
            (bytes8 word1, bytes8 word2, bytes8 word3, bytes8 word4) = WordPackingLib.unpack(_words[i]);
            if (word1 != bytes8(0)) {
                bals[x] = IERC20(getShareAddr(factory, hash, _tradingAddr, word1)).balanceOf(_spender);
                ++x;
            }
            if (word2 != bytes8(0)) {
                bals[x] = IERC20(getShareAddr(factory, hash, _tradingAddr, word2)).balanceOf(_spender);
                ++x;
            }
            if (word3 != bytes8(0)) {
                bals[x] = IERC20(getShareAddr(factory, hash, _tradingAddr, word3)).balanceOf(_spender);
                ++x;
            }
            if (word4 != bytes8(0)) {
                bals[x] = IERC20(getShareAddr(factory, hash, _tradingAddr, word4)).balanceOf(_spender);
                ++x;
            }
        }
    }
}
