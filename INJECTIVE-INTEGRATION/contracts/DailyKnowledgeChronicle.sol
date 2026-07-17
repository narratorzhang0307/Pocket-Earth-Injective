// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Pocket Earth Daily Knowledge Chronicle
/// @notice Anchors compact daily public-knowledge edition commitments on Injective.
/// @dev Claims, evidence, model receipts, and all private memories remain off-chain.
contract DailyKnowledgeChronicle {
    struct ChainHead {
        bytes32 editionRoot;
        uint32 day;
        uint32 revision;
        uint64 committedAt;
    }

    struct Edition {
        bytes32 editionRoot;
        bytes32 previousEditionRoot;
        bytes32 manifestHash;
        bytes32 policyRoot;
        uint32 factCount;
        uint32 revision;
        uint64 committedAt;
    }

    mapping(address publisher => ChainHead) public chainHeads;
    mapping(address publisher => mapping(uint32 day => mapping(uint32 revision => Edition))) public editions;

    error EmptyEdition();
    error InvalidDay();
    error InvalidPreviousRoot();
    error InvalidRoot();

    event EditionCommitted(
        address indexed publisher,
        uint32 indexed day,
        uint32 indexed revision,
        bytes32 editionRoot,
        bytes32 previousEditionRoot,
        bytes32 manifestHash,
        bytes32 policyRoot,
        uint32 factCount,
        uint64 committedAt
    );

    function commitEdition(
        uint32 day,
        bytes32 editionRoot,
        bytes32 previousEditionRoot,
        bytes32 manifestHash,
        bytes32 policyRoot,
        uint32 factCount
    ) external returns (uint32 revision) {
        if (factCount == 0) revert EmptyEdition();
        if (day < 20000101 || day > 29991231) revert InvalidDay();
        if (editionRoot == bytes32(0) || manifestHash == bytes32(0) || policyRoot == bytes32(0)) revert InvalidRoot();

        ChainHead memory head = chainHeads[msg.sender];
        if (previousEditionRoot != head.editionRoot) revert InvalidPreviousRoot();
        if (head.day != 0 && day < head.day) revert InvalidDay();
        uint32 revision = day == head.day ? head.revision + 1 : 1;
        uint64 committedAt = uint64(block.timestamp);

        editions[msg.sender][day][revision] = Edition({
            editionRoot: editionRoot,
            previousEditionRoot: previousEditionRoot,
            manifestHash: manifestHash,
            policyRoot: policyRoot,
            factCount: factCount,
            revision: revision,
            committedAt: committedAt
        });
        chainHeads[msg.sender] = ChainHead({
            editionRoot: editionRoot,
            day: day,
            revision: revision,
            committedAt: committedAt
        });

        emit EditionCommitted(
            msg.sender,
            day,
            revision,
            editionRoot,
            previousEditionRoot,
            manifestHash,
            policyRoot,
            factCount,
            committedAt
        );
    }
}

