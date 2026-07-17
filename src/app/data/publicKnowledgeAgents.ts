import type { KnowledgeTopic } from '../lib/chronicle/types';

export interface PublicSignalAgent {
  id: KnowledgeTopic;
  name: string;
  label: string;
  role: string;
  color: string;
}

export interface VerificationAgent {
  id: string;
  name: string;
  label: string;
  role: string;
  skill: string;
}

// Adapted from the user's FactAtlas agent system. Pocket Earth keeps the roles,
// but presents them as one public-knowledge network tied to the spatial product.
export const PUBLIC_SIGNAL_AGENTS: PublicSignalAgent[] = [
  { id: 'ai', name: 'AI FRONTIER SCOUT', label: 'AI 前沿侦察员', role: '模型、研究、监管与芯片', color: '#7CFF6B' },
  { id: 'technology', name: 'TECHNOLOGY SCOUT', label: '科技侦察员', role: '半导体、机器人、网络安全与航天', color: '#7c5cff' },
  { id: 'finance', name: 'MARKETS SCOUT', label: '金融侦察员', role: '市场、央行、监管与全球经济', color: '#f4c542' },
  { id: 'climate', name: 'CLIMATE SCOUT', label: '气候侦察员', role: '气候、能源转型与极端天气', color: '#35d4c7' },
  { id: 'science', name: 'SCIENCE SCOUT', label: '科学侦察员', role: '太空、生命、物理与研究发现', color: '#ff5ca8' },
  { id: 'health', name: 'LIFE SCIENCE SCOUT', label: '生命科学侦察员', role: '健康、医学、生物技术与公共卫生', color: '#ff756d' },
  { id: 'culture', name: 'CULTURE CARTOGRAPHER', label: '文化地图师', role: '城市、文化、考古、遗产与设计', color: '#d3c0ff' },
  { id: 'policy', name: 'PUBLIC INTEREST SCOUT', label: '公共利益侦察员', role: '政策、监管、社会与公共制度', color: '#b8d2ff' },
];

export const VERIFICATION_AGENTS: VerificationAgent[] = [
  { id: 'intake', name: 'CLAIM INTAKE', label: '主张受理', role: '限定问题并规范化可核验主张', skill: '输入安全' },
  { id: 'evidence-scout', name: 'EVIDENCE SCOUT', label: '证据侦察', role: '检索公开证据并保留原始来源', skill: '证据检索' },
  { id: 'investigator', name: 'INVESTIGATOR', label: '调查方', role: '建立严格受证据约束的论证', skill: '对抗审查' },
  { id: 'skeptic', name: 'SKEPTIC', label: '质疑方', role: '检查来源洗白、错配与缺失语境', skill: '来源约束' },
  { id: 'judge', name: 'DETERMINISTIC JUDGE', label: '确定性裁决', role: '按固定公式计算真实度与置信度', skill: 'Truth Score' },
  { id: 'receipt', name: 'RECEIPT KEEPER', label: '回执记录', role: '保留可重放的来源、哈希与版次路径', skill: '版次入库闸门' },
];
