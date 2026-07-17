// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAgentIdentityRegistry {
    function ownerOf(uint256 agentId) external view returns (address);
}

/// @title Pocket Earth Public Earth Registry
/// @notice Gives an existing Injective agent identity a symbolic public residence.
/// @dev A residence is not land: cells are not scarce, transferable, auctionable, or exclusive.
///      Private memories, raw profile data, and real-world locations never enter this contract.
contract PublicEarthRegistry {
    struct Residence {
        uint16 zone;
        int32 x;
        int32 y;
        bytes32 cardHash;
        uint32 revision;
        uint64 updatedAt;
    }

    IAgentIdentityRegistry public immutable identityRegistry;
    mapping(uint256 agentId => Residence) public residences;

    error NotAgentOwner();
    error InvalidIdentityRegistry();
    error InvalidZone();
    error InvalidCoordinate();
    error InvalidCardHash();

    event ResidenceSet(
        uint256 indexed agentId,
        address indexed owner,
        uint16 zone,
        int32 x,
        int32 y,
        bytes32 cardHash,
        uint32 revision,
        uint64 updatedAt
    );

    constructor(address identityRegistry_) {
        if (identityRegistry_ == address(0)) revert InvalidIdentityRegistry();
        identityRegistry = IAgentIdentityRegistry(identityRegistry_);
    }

    /// @notice Sets or moves the caller's agent residence and anchors its public card snapshot.
    /// @dev Coordinates are symbolic Public Earth canvas positions, never real-world coordinates.
    function setResidence(
        uint256 agentId,
        uint16 zone,
        int32 x,
        int32 y,
        bytes32 cardHash
    ) external returns (uint32 revision) {
        if (identityRegistry.ownerOf(agentId) != msg.sender) revert NotAgentOwner();
        if (zone == 0 || zone > 5) revert InvalidZone();
        if (x < -1000 || x > 1000 || y < -1000 || y > 1000) revert InvalidCoordinate();
        if (cardHash == bytes32(0)) revert InvalidCardHash();

        Residence memory previous = residences[agentId];
        revision = previous.revision + 1;
        uint64 updatedAt = uint64(block.timestamp);
        residences[agentId] = Residence({
            zone: zone,
            x: x,
            y: y,
            cardHash: cardHash,
            revision: revision,
            updatedAt: updatedAt
        });

        emit ResidenceSet(agentId, msg.sender, zone, x, y, cardHash, revision, updatedAt);
    }
}
