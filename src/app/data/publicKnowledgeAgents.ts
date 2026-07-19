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
  input: string;
  process: string;
  output: string;
  guardrail: string;
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
  {
    id: 'intake', name: 'CLAIM INTAKE', label: '主张受理', role: '限定问题并规范化可核验主张', skill: '输入安全',
    input: '候选新闻的标题、摘要、主题与发布日期',
    process: '剥离意见和标题噪声，把内容改写成一条边界明确、可由证据回答的主张。',
    output: '标准化主张 canonicalClaim',
    guardrail: '只整理问题，不判断真假；网页文本始终按不可信数据处理。',
  },
  {
    id: 'evidence-scout', name: 'EVIDENCE SCOUT', label: '证据侦察', role: '检索公开证据并保留原始来源', skill: '证据检索',
    input: '标准化主张与允许检索的主题范围',
    process: '寻找可追溯公开来源，保留原始 URL、发布日期、发布方和独立来源域名。',
    output: '去重后的 evidence packet',
    guardrail: '聚合页只用于发现线索；缺少原始出处时不能进入后续裁决。',
  },
  {
    id: 'investigator', name: 'INVESTIGATOR', label: '调查方', role: '建立严格受证据约束的论证', skill: '对抗审查',
    input: '标准化主张与 evidence packet',
    process: '只使用证据包中的材料，逐项说明哪些证据支持、反驳或尚不足以判断。',
    output: '调查结论、置信度与证据引用',
    guardrail: '引用必须回指来源；不得用模型常识补齐证据空白。',
  },
  {
    id: 'skeptic', name: 'SKEPTIC', label: '质疑方', role: '检查来源洗白、错配与缺失语境', skill: '来源约束',
    input: '同一证据包与调查方结论',
    process: '独立检查日期错配、二手转述、来源洗白、缺失语境和过度推断。',
    output: '反方结论与待补证据清单',
    guardrail: '不能沿用调查方结论；证据不足时必须保留“不确定”。',
  },
  {
    id: 'judge', name: 'DETERMINISTIC JUDGE', label: '确定性裁决', role: '按固定公式计算真实度与置信度', skill: 'Truth Score',
    input: '正反两份结论、来源覆盖率与独立来源数',
    process: '由本地确定性规则汇总 verdict、Truth Score 与 confidence，不再生成新事实。',
    output: 'SUPPORTED / MIXED / INSUFFICIENT 与分数',
    guardrail: '新闻重要性不计入真实性；相同输入必须得到相同计算结果。',
  },
  {
    id: 'receipt', name: 'RECEIPT KEEPER', label: '回执记录', role: '保留可重放的来源、哈希与版次路径', skill: '版次入库闸门',
    input: '通过门槛的知识记录、来源、分数与人工发布决定',
    process: '生成规范化记录哈希、Merkle 证明和版次路径，保存可复核的来源快照。',
    output: '知识记录、proof 与每日版次候选项',
    guardrail: '模型无权自动发布，也不能签署链上交易；入版仍受人工发布闸门约束。',
  },
];
