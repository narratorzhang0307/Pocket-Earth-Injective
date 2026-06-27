// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SocialHandshake — Pocket Earth 链上社交握手凭证（Injective inEVM · testnet）
/// @notice 两个 Frost agent 基于各自「公开口味名片（Taste Passport）」匹配成功后，
///         在链上留下一条可验证、不暴露隐私的握手事件。
///         上链铁律：链上只存 agentId + 名片哈希 + 相似度分 + 时间戳；
///         任何私人记忆原文（书 / 影 / 照片 / 心情 / 精确坐标）都【绝不】上链。
///         这正是《你好啊，区块链！》里「链只证明上链后不可篡改、适合存证明物而非隐私原文」的落地。
contract SocialHandshake {
    /// @param agentA / agentB    双方 ERC-8004 agent identity id
    /// @param profileHashA / B   双方公开名片的 fingerprint 哈希（证明「基于哪张名片」，不含原文）
    /// @param score              口味相似度 0-100（链下算好、链上只存结果）
    event Handshake(
        uint256 indexed agentA,
        uint256 indexed agentB,
        bytes32 profileHashA,
        bytes32 profileHashB,
        uint16 score,
        uint256 timestamp
    );

    /// @notice 记录一次社交握手。任何人可调用（事件是公开证明）；写操作的「该不该握手」由
    ///         Pocket Earth 端的 Boundary(suggest-then-confirm) 把关，链上只负责留下不可篡改的存证。
    function recordHandshake(
        uint256 agentA,
        uint256 agentB,
        bytes32 profileHashA,
        bytes32 profileHashB,
        uint16 score
    ) external {
        require(score <= 100, "score must be 0-100");
        require(agentA != agentB, "cannot handshake self");
        emit Handshake(agentA, agentB, profileHashA, profileHashB, score, block.timestamp);
    }
}
