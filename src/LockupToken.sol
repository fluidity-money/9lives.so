// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {ERC20VotesUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {NoncesUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/NoncesUpgradeable.sol";

contract LockupToken is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, OwnableUpgradeable, ERC20PermitUpgradeable, ERC20VotesUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function ctor(address initialOwner) initializer public {
        __ERC20_init("LockedARB", "LARB");
        __ERC20Burnable_init();
        __Ownable_init(initialOwner);
        __ERC20Permit_init("LockedARB");
        __ERC20Votes_init();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        _delegate(to, to);
    }

    function burn(address to, uint256 amount) public onlyOwner {
        _burn(to, amount);
        _delegate(to, address(0));
    }

    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20Upgradeable, ERC20VotesUpgradeable)
    {
        require(from == address(0) || to == address(0), "disabled");
        super._update(from, to, value);
    }

    function delegate(address /* delegatee */) public pure override {
        revert("disabled");
    }

    function delegateBySig(
        address /* delegatee */,
        uint256 /* nonce */,
        uint256 /* expiry */,
        uint8 /* v */,
        bytes32 /* r */,
        bytes32 /* s */
    ) public pure override {
        revert("disabled");
    }

    function nonces(address owner)
        public
        view
        override(ERC20PermitUpgradeable, NoncesUpgradeable)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}