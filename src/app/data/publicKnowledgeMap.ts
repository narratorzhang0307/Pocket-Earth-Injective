import type { KnowledgeTopic } from '../lib/chronicle/types';

export interface PublicKnowledgeStory {
  id: string;
  topic: KnowledgeTopic;
  topicLabel: string;
  /** Knowledge-edition intake date, not the publisher's publication date. */
  date: string;
  publishedAt: string;
  headline: string;
  claim: string;
  why: string;
  keyFacts: [string, string];
  publisher: string;
  importance: number;
  locationLabel: string;
}

export interface PublicKnowledgeMapCard extends PublicKnowledgeStory {
  coordinates: [number, number];
  imageUrl: string;
  imageAlt: string;
}

export const PUBLIC_KNOWLEDGE_TOPIC_BRIEFS: Record<KnowledgeTopic, string> = {
  ai: '2026 年 7 月 15 日人工智能版聚焦芯片监管与高级 AI 的网络安全治理。',
  technology: '2026 年 7 月 15 日科技版关注深科技城市、商业航天与跨行业创新资本。',
  finance: '2026 年 7 月 15 日金融版关注市场代币化、金融基础设施与国际协调机制。',
  climate: '2026 年 7 月 15 日气候与能源版聚焦电气化方案、可再生能源项目与极端天气响应。',
  science: '2026 年 7 月 15 日科学版聚焦太空医学、基础物理模拟与研究前沿的声称进展。',
  health: '2026 年 7 月 15 日健康与生命版关注国家规划、公共卫生资金与生命科学进展。',
  culture: '2026 年 7 月 15 日城市与文化版聚焦濒危遗产、世界遗产保护与公众阐释。',
  policy: '2026 年 7 月 15 日政策与社会版关注监管裁决、反制裁工具与公共治理变化。',
};

// Every candidate opens a directly checked publisher or primary-source page.
// The UI still labels these as candidate signals until independent cross-checks
// and the daily Merkle edition are complete.
export const PUBLIC_KNOWLEDGE_SOURCE_URLS: Record<string, string> = {
  'signal-ai-us-regulation': 'https://www.investing.com/news/economy-news/regulatory-action-on-chips-ai-is-coming-commerce-official-says-4791367',
  'signal-ai-eu-cyber': 'https://commission.europa.eu/news-and-media/news/new-eu-plan-address-risks-and-opportunities-advanced-ai-cybersecurity-2026-07-07_en',
  'signal-technology-india': 'https://www.analyticsinsight.net/ampstories/tech-news/indian-cities-emerging-as-deep-tech-innovation-hubs',
  'signal-technology-cn-space': 'https://www.ithome.com/0/975/540.htm',
  'signal-finance-uk-tokenisation': 'https://www.thebanker.com/content/cbf0d5ee-d866-4272-a888-175ff2140e95',
  'signal-finance-bis': 'https://www.thebanker.com/content/fadbd79c-c116-47d9-8f0e-eda1a7b386f4',
  'signal-climate-eu': 'https://www.carbonbrief.org/debriefed-10-july-2026-deadly-europe-heat-eu-electrification-leak-cop31-president-interview/',
  'signal-climate-bangladesh-solar': 'https://theclimatewatch.com/68mw-jamuna-solar-park-signals-bangladeshs-renewable-energy-transition/',
  'signal-science-space-xray': 'https://www.rsna.org/news/2026/july/first-x-rays-in-space',
  'signal-science-emergent-time': 'https://www.sciencedaily.com/releases/2026/07/260709160632.htm',
  'signal-health-cn': 'https://www.gov.cn/zhengce/content/202607/content_7075213.htm',
  'signal-health-us-tobacco': 'https://petrieflom.law.harvard.edu/2026/07/14/making-americans-smokers-again-new-article-examines-federal-cuts-to-anti-tobacco-programs/',
  'signal-culture-odesa': 'https://www.unesco.org/en/articles/unesco-reinforces-safeguarding-capacities-odesa-archaeological-museum',
  'signal-culture-xixia': 'https://difang.gmw.cn/2026-07/14/content_38885203.htm',
  'signal-policy-cn': 'https://www.aljazeera.com/news/2026/7/10/china-expands-anti-sanctions-toolkit-raising-risks-for-foreign-firms',
  'signal-policy-eu-football-agents': 'https://curia.europa.eu/site/upload/docs/application/pdf/2026-07/cp260099en.pdf',
};

// FactAtlas 2026-07-15 公共信号缓存的地图精选。
// 这些是“等待核验的新闻信号”，不是已进入 Merkle 版次的事实；
// 地图卡片和详情页必须始终保留这一状态边界。
export const PUBLIC_KNOWLEDGE_MAP_CARDS: PublicKnowledgeMapCard[] = [
  {
    id: 'signal-ai-us-regulation', topic: 'ai', topicLabel: 'AI', date: '07.15', publishedAt: '2026-07-14',
    headline: '美国暗示新的芯片与 AI 监管行动',
    claim: '美国商务部在 7 月 14 日当周暗示将对芯片和人工智能采取新的监管行动。',
    why: '出口管制与补贴信号会影响半导体供应链、晶圆厂计划和模型部署成本。',
    keyFacts: ['美国商务部负责工业与安全事务的官员表示，针对 AI 与半导体的监管行动即将到来。', '报道同时指出，具体规则与时间表尚未公布，因此这里保留为候选信号而非既成政策。'],
    publisher: 'Reuters', importance: 88, coordinates: [-96, 42], locationLabel: '美国 · 华盛顿',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/8LFHK6s5PHQ.jpg',
    imageAlt: '华盛顿城市情境图',
  },
  {
    id: 'signal-technology-india', topic: 'technology', topicLabel: '科技', date: '07.15', publishedAt: '2026-07-13',
    headline: '印度城市成为深科技创新中心',
    claim: '印度多个城市正在成为深科技创新的中心。',
    why: '若属实，深科技研发与风险投资正在从传统中心向外转移。',
    keyFacts: ['报道列举班加罗尔、海得拉巴、金奈、浦那、德里等城市的 AI、机器人、半导体和航天产业组合。', '这是一篇产业趋势梳理，而不是单一统计公告；后续核验应补充投资、专利或企业数量等量化证据。'],
    publisher: 'Analytics Insight', importance: 78, coordinates: [78, 18], locationLabel: '印度 · 班加罗尔',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/XDKhQW8pYlE.jpg',
    imageAlt: '班加罗尔城市情境图',
  },
  {
    id: 'signal-finance-uk-tokenisation', topic: 'finance', topicLabel: '金融', date: '07.15', publishedAt: '2026-07-13',
    headline: '英国启动批发金融市场代币化行动',
    claim: '54 家企业加入英国批发金融市场代币化计划，参与者包括多家全球大型银行。',
    why: '这项计划把代币化抵押品、二级市场与数字国债纳入同一行动框架，直接检验分布式账本能否改善真实金融基础设施。',
    keyFacts: ['参与计划的机构包括 JPMorgan、HSBC、Goldman Sachs、Barclays 等银行，行动范围覆盖九个市场环节。', '报告提出到 2035 年每年为英国经济增加 330 亿英镑的预测；这是模型估算，不是已经实现的收益。'],
    publisher: 'The Banker', importance: 93, coordinates: [-0.13, 51.51], locationLabel: '英国 · 伦敦',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/aqDJKl787PM.jpg',
    imageAlt: '伦敦金融市场情境图',
  },
  {
    id: 'signal-climate-eu', topic: 'climate', topicLabel: '气候', date: '07.15', publishedAt: '2026-07-10',
    headline: '欧盟电气化计划草案提前泄露',
    claim: '2026 年 7 月，一份欧盟电气化计划草案在正式发布前被泄露。',
    why: '政策草案可能影响能源市场、电网投资时间表与国际气候谈判。',
    keyFacts: ['Carbon Brief 转述的泄露草案提出，到 2040 年欧盟石油使用量减半、天然气使用量减少三分之二。', '草案原计划于 7 月 17 日公开，因此目标在正式文件发布前仍可能变化。'],
    publisher: 'Carbon Brief', importance: 92, coordinates: [12, 55], locationLabel: '欧盟 · 布鲁塞尔',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/pex_5512745.jpg',
    imageAlt: '布鲁塞尔城市情境图',
  },
  {
    id: 'signal-science-space-xray', topic: 'science', topicLabel: '科学', date: '07.15', publishedAt: '2026-07-14',
    headline: '平民乘组在太空拍摄诊断用 X 光片',
    claim: '一支平民乘组在太空中获取了首批诊断用 X 光片。',
    why: '若属实，可能影响未来轨道与月球任务的远程医疗能力。',
    keyFacts: ['Fram2 商业载人任务使用便携式设备完成了人体和设备 X 光成像，乘员仅接受约四小时训练。', '三名独立放射科医师评估后认为，轨道内图像达到诊断水平，整体质量与飞行前图像没有显著差异。'],
    publisher: 'RSNA', importance: 88, coordinates: [-78, 20], locationLabel: '太空医学 · 休斯顿',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/pex_10893475.jpg',
    imageAlt: '休斯顿城市情境图',
  },
  {
    id: 'signal-health-cn', topic: 'health', topicLabel: '健康', date: '07.15', publishedAt: '2026-07-13',
    headline: '国务院印发国民健康十五五规划',
    claim: '中国国务院于 2026 年 7 月 13 日前后印发国民健康十五五规划。',
    why: '国家级规划会影响医疗基础设施、资金优先级和公共卫生目标。',
    keyFacts: ['规划由国务院于 7 月 7 日成文，并在 7 月 13 日公开发布。', '文件提出到 2030 年人均预期寿命达到 80 岁，并强化基层服务、公共卫生与数智化转型。'],
    publisher: '中国政府网', importance: 92, coordinates: [105, 30], locationLabel: '中国 · 北京',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/iAywMjSK0nQ.jpg',
    imageAlt: '中国城市情境图',
  },
  {
    id: 'signal-culture-odesa', topic: 'culture', topicLabel: '文化', date: '07.15', publishedAt: '2026-07-13',
    headline: '敖德萨考古博物馆强化战时保护能力',
    claim: 'UNESCO 的保护项目已完成 9.7 万件藏品清点，并推进库房重组、档案数字化和应急准备。',
    why: '它展示了战争风险下，文化机构如何把文物清点、数字化与应急响应组合成可执行的保护系统。',
    keyFacts: ['项目面对的是一座拥有 16 万余件藏品、建筑曾受附近爆炸冲击的 19 世纪博物馆。', 'UNESCO 披露的阶段成果还包括 6,952 件藏品重新整理、3,400 余份档案扫描和 2 万件考古藏品拍摄。'],
    publisher: 'UNESCO', importance: 90, coordinates: [30.73, 46.48], locationLabel: '乌克兰 · 敖德萨',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/jGspVvaIHEY.jpg',
    imageAlt: '敖德萨文化遗产情境图',
  },
  {
    id: 'signal-policy-cn', topic: 'policy', topicLabel: '政策', date: '07.15', publishedAt: '2026-07-10',
    headline: '中国扩大反制裁工具',
    claim: '中国以扩大反制裁法律工具的方式，提高了在华外国企业的合规风险。',
    why: '反制裁法律变化会影响跨国公司、供应链和国际贸易执法。',
    keyFacts: ['报道梳理了 2026 年以来两项新规与一项草案，涉及供应链安全、域外制裁执行和公共利益诉讼。', '企业面临的核心难题是不同司法辖区义务可能冲突；报道没有声称所有措施都会被统一执行。'],
    publisher: 'Al Jazeera', importance: 88, coordinates: [105, 44], locationLabel: '中国 · 政策观察',
    imageUrl: 'https://last-night-on-earth.oss-cn-hangzhou.aliyuncs.com/%E5%A4%9C%E6%99%9A%E7%9A%84%E4%B8%96%E7%95%8C/curated/originals/YIL29ltf_Yg.jpg',
    imageAlt: '中国政策议题情境图',
  },
];

// Two recent source-checked signals per field power the detail reader. The map
// keeps one representative note per field so the world remains legible; arrows
// in the reader move through the full 16-signal cache without inventing filler.
export const PUBLIC_KNOWLEDGE_TOPIC_STORIES: PublicKnowledgeStory[] = [
  ...PUBLIC_KNOWLEDGE_MAP_CARDS,
  {
    id: 'signal-ai-eu-cyber', topic: 'ai', topicLabel: 'AI', date: '07.15', publishedAt: '2026-07-07',
    headline: '欧盟推出高级 AI 网络安全行动计划',
    claim: '欧盟委员会发布计划，将建设高级 AI 模型评估能力、安全测试平台和关键基础设施防护机制。',
    why: '这份计划同时处理 AI 带来的防御能力与自动化攻击风险，是模型能力进入公共安全治理的具体案例。',
    keyFacts: ['计划包含模型风险评估能力，以及由欧盟网络安全局和联合研究中心建设的安全测试平台。', '欧盟还计划为关键行业提供安全使用指导，并以 AI 工厂、未来 Gigafactory 和专项挑战支持防御能力。'],
    publisher: 'European Commission', importance: 91, locationLabel: '欧盟 · 布鲁塞尔',
  },
  {
    id: 'signal-technology-cn-space', topic: 'technology', topicLabel: '科技', date: '07.15', publishedAt: '2026-07-11',
    headline: '车企资本跨界投资商业航天',
    claim: '广汽资本对商业航天公司星河动力进行了战略投资。',
    why: '大型车企资本进入商业发射领域，显示航天产业正在获得新的跨行业资金来源。',
    keyFacts: ['星河动力称“谷神星一号”固体火箭已实现量产定型与常态化商业发射。', '公司同时推进可重复使用液体火箭“智神星”系列；本轮交易金额未在报道中披露。'],
    publisher: 'IT之家', importance: 85, locationLabel: '中国 · 商业航天',
  },
  {
    id: 'signal-finance-bis', topic: 'finance', topicLabel: '金融', date: '07.15', publishedAt: '2026-07-14',
    headline: '国际清算银行的协调角色受到质疑',
    claim: '一份金融分析质疑国际清算银行是否正在被推向全球金融治理的边缘。',
    why: '若其协调能力被削弱，可能影响跨境银行标准、监管合作与危机应对机制。',
    keyFacts: ['文章以欧盟为维护本地银行竞争力而调整巴塞尔 III 落地方式为例，讨论跨辖区协调压力。', '这是一篇分析文章提出的治理问题，不代表 BIS 已失去职能或成员央行已退出协调。'],
    publisher: 'The Banker', importance: 83, locationLabel: '瑞士 · 巴塞尔',
  },
  {
    id: 'signal-climate-bangladesh-solar', topic: 'climate', topicLabel: '气候', date: '07.15', publishedAt: '2026-07-13',
    headline: '孟加拉国启用 68 兆瓦太阳能公园',
    claim: '孟加拉国锡拉杰甘杰太阳能公园已向国家电网供应 68 兆瓦电力，两年累计发电超过 21.3 万兆瓦时。',
    why: '这一运行数据展示了大型光伏项目如何在洪泛平原上同时推进能源转型、电网供电和土地综合利用。',
    keyFacts: ['项目装机容量为 75 兆瓦，并按协议向孟加拉国国家电网供应 68 兆瓦。', '报道援引项目方数据称，其已生成 213,343 份可再生能源证书并减少约 142,942 吨二氧化碳排放。'],
    publisher: 'The Climate Watch', importance: 85, locationLabel: '孟加拉国 · 贾穆纳',
  },
  {
    id: 'signal-science-emergent-time', topic: 'science', topicLabel: '科学', date: '07.15', publishedAt: '2026-07-09',
    headline: '模拟系统中出现“时间涌现”现象',
    claim: '物理学家报告称创建了一个无需依赖外部时钟即可涌现出时间的物理系统。',
    why: '该研究触及时间本质这一基础问题，若经得起检验，可能推动新的实验与理论工作。',
    keyFacts: ['实验使用约 2.4 万个超冷原子构成“微型宇宙”，通过系统内部变化描述时间演化。', '研究发表于 Physical Review Research；它是受控量子系统实验，不等于证明现实宇宙不存在外部时间。'],
    publisher: 'ScienceDaily', importance: 85, locationLabel: '基础物理 · 研究前沿',
  },
  {
    id: 'signal-health-us-tobacco', topic: 'health', topicLabel: '健康', date: '07.15', publishedAt: '2026-07-14',
    headline: '美国联邦反烟草项目经费削减受到审视',
    claim: '一篇新文章审视了美国联邦反烟草项目经费的削减情况。',
    why: '控烟资金会直接影响吸烟预防、健康传播与长期公共卫生结果。',
    keyFacts: ['文章提到 CDC 的“Tips from Former Smokers”项目被撤下，以及吸烟与健康办公室关闭和人员裁撤。', '作者将这些变化与 2025 年美国成年人吸烟率首次降至 9% 的调查结果并置，强调政策倒退风险。'],
    publisher: 'Petrie-Flom Center', importance: 85, locationLabel: '美国 · 公共卫生',
  },
  {
    id: 'signal-culture-xixia', topic: 'culture', topicLabel: '文化', date: '07.15', publishedAt: '2026-07-14',
    headline: '西夏陵启动世界文化遗产保护活动',
    claim: '西夏陵世界文化遗产保护与价值阐释系列活动已经启幕。',
    why: '这批活动呈现了重要历史遗迹如何开展公众阐释、考古传播与长期保护。',
    keyFacts: ['活动包含学术研讨、文物联展、研学美育、非遗市集和产业联动等九项内容。', '31 位考古、建筑、民族学与文博专家围绕遗址保护、数字化研究和遗产教育展开交流。'],
    publisher: '光明网', importance: 82, locationLabel: '中国 · 西夏陵',
  },
  {
    id: 'signal-policy-eu-football-agents', topic: 'policy', topicLabel: '政策', date: '07.15', publishedAt: '2026-07-09',
    headline: '欧盟法院明确足协经纪人规则的适用边界',
    claim: '欧洲联盟法院裁定，德国足协针对球员经纪人的部分限制在满足公共利益目标等条件时，可能适用卡特尔禁令的例外。',
    why: '这项裁决没有简单批准全部规则，而是明确体育协会何时可以对第三方经纪服务施加竞争限制。',
    keyFacts: ['争议规则涉及经纪人登记、报酬披露、未成年人转会佣金和足协纪律管辖等要求。', '法院使用的是“在特定条件下可能适用例外”的限定判断，最终合规性仍需结合必要性与比例性审查。'],
    publisher: 'Court of Justice of the EU', importance: 84, locationLabel: '欧盟 · 体育治理',
  },
];
