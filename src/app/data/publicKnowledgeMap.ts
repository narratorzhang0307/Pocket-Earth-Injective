import type { KnowledgeTopic } from '../lib/chronicle/types';

export interface PublicKnowledgeMapCard {
  id: string;
  topic: KnowledgeTopic;
  topicLabel: string;
  date: string;
  headline: string;
  claim: string;
  why: string;
  publisher: string;
  importance: number;
  coordinates: [number, number];
}

// FactAtlas 2026-07-15 公共信号缓存的地图精选。
// 这些是“等待核验的新闻信号”，不是已进入 Merkle 版次的事实；
// 地图卡片和详情页必须始终保留这一状态边界。
export const PUBLIC_KNOWLEDGE_MAP_CARDS: PublicKnowledgeMapCard[] = [
  {
    id: 'signal-ai-us-regulation', topic: 'ai', topicLabel: 'AI', date: '07.15',
    headline: '美国暗示新的芯片与 AI 监管行动',
    claim: '美国商务部在 7 月 14 日当周暗示将对芯片和人工智能采取新的监管行动。',
    why: '出口管制与补贴信号会影响半导体供应链、晶圆厂计划和模型部署成本。',
    publisher: 'Crypto Briefing', importance: 88, coordinates: [-96, 42],
  },
  {
    id: 'signal-technology-india', topic: 'technology', topicLabel: '科技', date: '07.15',
    headline: '印度城市成为深科技创新中心',
    claim: '印度多个城市正在成为深科技创新的中心。',
    why: '若属实，深科技研发与风险投资正在从传统中心向外转移。',
    publisher: 'Analytics Insight', importance: 78, coordinates: [78, 18],
  },
  {
    id: 'signal-finance-cn', topic: 'finance', topicLabel: '金融', date: '07.15',
    headline: '央行释放资本市场稳定工具信号',
    claim: '中国人民银行行长表示将会同证监会实施支持资本市场的结构性货币政策工具。',
    why: '主要监管者描述市场稳定机制，会影响资本流动和投资者预期。',
    publisher: '每日经济新闻', importance: 92, coordinates: [116, 38],
  },
  {
    id: 'signal-climate-eu', topic: 'climate', topicLabel: '气候', date: '07.15',
    headline: '欧盟电气化计划草案提前泄露',
    claim: '2026 年 7 月，一份欧盟电气化计划草案在正式发布前被泄露。',
    why: '政策草案可能影响能源市场、电网投资时间表与国际气候谈判。',
    publisher: 'Carbon Brief', importance: 92, coordinates: [12, 55],
  },
  {
    id: 'signal-science-space-xray', topic: 'science', topicLabel: '科学', date: '07.15',
    headline: '平民乘组在太空拍摄诊断用 X 光片',
    claim: '一支平民乘组在太空中获取了首批诊断用 X 光片。',
    why: '若属实，可能影响未来轨道与月球任务的远程医疗能力。',
    publisher: 'Chosunbiz', importance: 88, coordinates: [-78, 20],
  },
  {
    id: 'signal-health-cn', topic: 'health', topicLabel: '健康', date: '07.15',
    headline: '国务院印发国民健康十五五规划',
    claim: '中国国务院于 2026 年 7 月 13 日前后印发国民健康十五五规划。',
    why: '国家级规划会影响医疗基础设施、资金优先级和公共卫生目标。',
    publisher: '大河财立方', importance: 92, coordinates: [105, 30],
  },
  {
    id: 'signal-culture-bangladesh', topic: 'culture', topicLabel: '文化', date: '07.15',
    headline: '达卡历史遗产在城市发展中消失',
    claim: '随着城市发展，达卡的历史建筑正在消失或被拆除。',
    why: '快速城市化会影响文化遗产、居民记忆与城市规划。',
    publisher: 'The Financial Express', importance: 86, coordinates: [90, 10],
  },
  {
    id: 'signal-policy-cn', topic: 'policy', topicLabel: '政策', date: '07.15',
    headline: '中国扩大反制裁工具',
    claim: '中国以扩大反制裁法律工具的方式，提高了在华外国企业的合规风险。',
    why: '反制裁法律变化会影响跨国公司、供应链和国际贸易执法。',
    publisher: 'Al Jazeera', importance: 88, coordinates: [45, 42],
  },
];

