import type { KnowledgeTopic } from '../lib/chronicle/types';

export interface PublicKnowledgeStory {
  id: string;
  topic: KnowledgeTopic;
  topicLabel: string;
  date: string;
  headline: string;
  claim: string;
  why: string;
  publisher: string;
  importance: number;
  locationLabel: string;
}

export interface PublicKnowledgeMapCard extends PublicKnowledgeStory {
  coordinates: [number, number];
  imageUrl: string;
  imageAlt: string;
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
    publisher: 'Crypto Briefing', importance: 88, coordinates: [-96, 42], locationLabel: '美国 · 华盛顿',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/8LFHK6s5PHQ.jpg',
    imageAlt: '华盛顿城市情境图',
  },
  {
    id: 'signal-technology-india', topic: 'technology', topicLabel: '科技', date: '07.15',
    headline: '印度城市成为深科技创新中心',
    claim: '印度多个城市正在成为深科技创新的中心。',
    why: '若属实，深科技研发与风险投资正在从传统中心向外转移。',
    publisher: 'Analytics Insight', importance: 78, coordinates: [78, 18], locationLabel: '印度 · 班加罗尔',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/XDKhQW8pYlE.jpg',
    imageAlt: '班加罗尔城市情境图',
  },
  {
    id: 'signal-finance-cn', topic: 'finance', topicLabel: '金融', date: '07.15',
    headline: '央行释放资本市场稳定工具信号',
    claim: '中国人民银行行长表示将会同证监会实施支持资本市场的结构性货币政策工具。',
    why: '主要监管者描述市场稳定机制，会影响资本流动和投资者预期。',
    publisher: '每日经济新闻', importance: 92, coordinates: [116, 38], locationLabel: '中国 · 北京',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/aqDJKl787PM.jpg',
    imageAlt: '北京城市情境图',
  },
  {
    id: 'signal-climate-eu', topic: 'climate', topicLabel: '气候', date: '07.15',
    headline: '欧盟电气化计划草案提前泄露',
    claim: '2026 年 7 月，一份欧盟电气化计划草案在正式发布前被泄露。',
    why: '政策草案可能影响能源市场、电网投资时间表与国际气候谈判。',
    publisher: 'Carbon Brief', importance: 92, coordinates: [12, 55], locationLabel: '欧盟 · 布鲁塞尔',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/pex_5512745.jpg',
    imageAlt: '布鲁塞尔城市情境图',
  },
  {
    id: 'signal-science-space-xray', topic: 'science', topicLabel: '科学', date: '07.15',
    headline: '平民乘组在太空拍摄诊断用 X 光片',
    claim: '一支平民乘组在太空中获取了首批诊断用 X 光片。',
    why: '若属实，可能影响未来轨道与月球任务的远程医疗能力。',
    publisher: 'Chosunbiz', importance: 88, coordinates: [-78, 20], locationLabel: '太空医学 · 休斯顿',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/pex_10893475.jpg',
    imageAlt: '休斯顿城市情境图',
  },
  {
    id: 'signal-health-cn', topic: 'health', topicLabel: '健康', date: '07.15',
    headline: '国务院印发国民健康十五五规划',
    claim: '中国国务院于 2026 年 7 月 13 日前后印发国民健康十五五规划。',
    why: '国家级规划会影响医疗基础设施、资金优先级和公共卫生目标。',
    publisher: '大河财立方', importance: 92, coordinates: [105, 30], locationLabel: '中国 · 北京',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/iAywMjSK0nQ.jpg',
    imageAlt: '中国城市情境图',
  },
  {
    id: 'signal-culture-bangladesh', topic: 'culture', topicLabel: '文化', date: '07.15',
    headline: '达卡历史遗产在城市发展中消失',
    claim: '随着城市发展，达卡的历史建筑正在消失或被拆除。',
    why: '快速城市化会影响文化遗产、居民记忆与城市规划。',
    publisher: 'The Financial Express', importance: 86, coordinates: [90, 10], locationLabel: '孟加拉国 · 达卡',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/jGspVvaIHEY.jpg',
    imageAlt: '南亚城市遗产情境图',
  },
  {
    id: 'signal-policy-cn', topic: 'policy', topicLabel: '政策', date: '07.15',
    headline: '中国扩大反制裁工具',
    claim: '中国以扩大反制裁法律工具的方式，提高了在华外国企业的合规风险。',
    why: '反制裁法律变化会影响跨国公司、供应链和国际贸易执法。',
    publisher: 'Al Jazeera', importance: 88, coordinates: [105, 44], locationLabel: '中国 · 政策观察',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/YIL29ltf_Yg.jpg',
    imageAlt: '中国政策议题情境图',
  },
];

// Two real cached FactAtlas signals per field power the detail reader. The map
// keeps one representative note per field so the world remains legible; arrows
// in the reader move through the full 16-signal cache without inventing filler.
export const PUBLIC_KNOWLEDGE_TOPIC_STORIES: PublicKnowledgeStory[] = [
  ...PUBLIC_KNOWLEDGE_MAP_CARDS,
  {
    id: 'signal-ai-cn-chip', topic: 'ai', topicLabel: 'AI', date: '07.15',
    headline: '中国发布首款 4 纳米智驾芯片',
    claim: '中国在 2026 年 7 月 15 日或之前发布了其首款 4 纳米自动驾驶芯片。',
    why: '若首款 4 纳米车规芯片的说法成立，将影响汽车 AI 硬件供应链与全球技术竞争。',
    publisher: '财联社', importance: 92, locationLabel: '中国 · 智驾芯片',
  },
  {
    id: 'signal-technology-cn-space', topic: 'technology', topicLabel: '科技', date: '07.15',
    headline: '车企资本跨界投资商业航天',
    claim: '广汽资本对商业航天公司星河动力进行了战略投资。',
    why: '大型车企资本进入商业发射领域，显示航天产业正在获得新的跨行业资金来源。',
    publisher: 'core.dpangzi.com', importance: 85, locationLabel: '中国 · 商业航天',
  },
  {
    id: 'signal-finance-bis', topic: 'finance', topicLabel: '金融', date: '07.15',
    headline: '国际清算银行的协调角色受到质疑',
    claim: '一份金融分析质疑国际清算银行是否正在被推向全球金融治理的边缘。',
    why: '若其协调能力被削弱，可能影响跨境银行标准、监管合作与危机应对机制。',
    publisher: 'The Banker', importance: 83, locationLabel: '瑞士 · 巴塞尔',
  },
  {
    id: 'signal-climate-bangladesh-solar', topic: 'climate', topicLabel: '气候', date: '07.15',
    headline: '孟加拉国启用 68 兆瓦太阳能公园',
    claim: '孟加拉国于 2026 年 7 月启用了一座 68 兆瓦的贾穆纳太阳能公园。',
    why: '南亚大型可再生能源项目展示了新兴经济体如何同时推进能源转型与电网扩张。',
    publisher: 'The Climate Watch', importance: 85, locationLabel: '孟加拉国 · 贾穆纳',
  },
  {
    id: 'signal-science-emergent-time', topic: 'science', topicLabel: '科学', date: '07.15',
    headline: '模拟系统中出现“时间涌现”现象',
    claim: '物理学家报告称创建了一个无需依赖外部时钟即可涌现出时间的物理系统。',
    why: '该研究触及时间本质这一基础问题，若经得起检验，可能推动新的实验与理论工作。',
    publisher: 'ScienceDaily', importance: 85, locationLabel: '基础物理 · 研究前沿',
  },
  {
    id: 'signal-health-us-tobacco', topic: 'health', topicLabel: '健康', date: '07.15',
    headline: '美国联邦反烟草项目经费削减受到审视',
    claim: '一篇新文章审视了美国联邦反烟草项目经费的削减情况。',
    why: '控烟资金会直接影响吸烟预防、健康传播与长期公共卫生结果。',
    publisher: 'Petrie-Flom Center', importance: 85, locationLabel: '美国 · 公共卫生',
  },
  {
    id: 'signal-culture-xixia', topic: 'culture', topicLabel: '文化', date: '07.15',
    headline: '西夏陵启动世界文化遗产保护活动',
    claim: '西夏陵世界文化遗产保护与价值阐释系列活动已经启幕。',
    why: '这批活动呈现了重要历史遗迹如何开展公众阐释、考古传播与长期保护。',
    publisher: '网易新闻', importance: 82, locationLabel: '中国 · 西夏陵',
  },
  {
    id: 'signal-policy-eu-football-agents', topic: 'policy', topicLabel: '政策', date: '07.15',
    headline: '德国足协经纪人规则获欧盟最高法院认可',
    claim: '欧洲联盟法院裁定德国足球协会有关足球经纪人的规定符合欧盟法律。',
    why: '这项裁决为体育管理机构监管经纪人费用与劳动力市场提供了新的法律先例。',
    publisher: 'Reuters', importance: 84, locationLabel: '欧盟 · 体育治理',
  },
];
