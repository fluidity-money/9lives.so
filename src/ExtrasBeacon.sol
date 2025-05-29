// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract ExtrasBeacon {
    address immutable OWNER;

    address public defaultFacet;

    mapping(uint8 => address) public facet;

    constructor(address _owner, address _default) {
        OWNER = _owner;
        defaultFacet = _default;
    }

    function impl(bytes8 _sel) external view returns (address) {
        address a = facet[uint8(_sel[3])];
        if (a == address(0)) return defaultFacet;
        return a;
    }

    function upgradeDefault(address _new) external {
        require(msg.sender == OWNER);
        defaultFacet = _new;
    }

    function upgrade(uint8 _facet, address _new) external {
        require(msg.sender == OWNER);
        facet[_facet] = _new;
    }
}
