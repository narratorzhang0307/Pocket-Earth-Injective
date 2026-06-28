import type { SpaceAgent } from './spaceAgent';

// 「链上见闻 agent」的链上身份指向 Injective testnet 上真实部署的 ERC-8004 IdentityRegistry（blockscout 可查，非示意）。
const INJ_EXPLORER = 'https://testnet.blockscout.injective.network/token/0x8004A818BFB912233c491871b3d84c89A494BD9e';

// 空间 Agent 广场货架。
// featured = 口播点名的四个前瞻示例（观鸟 / 播客 / 旅行 / 链上见闻）；installed = 已上架的真 agent（OPEN 直达真页，让前瞻广场立刻可信）。
// runTarget 必须是 MusicAgentsTab 的 RUN_BY_NAME 真实 key（'music-agent' 等），OPEN 走 onRun(runTarget) → runSkill 直达。
export const SPACE_AGENTS: SpaceAgent[] = [
  // ——— 精选 · 四个口播前瞻例 ———
  {
    id: 'birding-map', name: '观鸟地图', tagline: '拍鸟照本机识种 → 钉到观测坐标', publisher: 'Pocket Earth 官方', color: '#2e8b57',
    spaceObject: 'sighting', permissions: { scopes: ['location', 'photos'], tools: ['edge_tag', 'geocode', 'mark_place'] },
    runtime: 'hybrid', onChain: null, pricing: { model: 'free' }, group: 'featured', reviewed: true,
  },
  {
    id: 'podcast-digest', name: '播客摘要', tagline: '一集播客 → 提到的城市落点', publisher: '@studio.fm', color: '#b06a00',
    spaceObject: 'media', permissions: { scopes: ['audio', 'clipboard', 'network'], tools: ['enrich', 'geocode', 'mark_place'] },
    runtime: 'cloud', onChain: null, pricing: { model: 'subscription', price: '¥9/月', comingSoon: true }, group: 'featured', reviewed: true,
  },
  {
    id: 'travel-planner', name: '旅行规划', tagline: '按喜好端侧规划行程，完成即钉地球', publisher: 'Pocket Earth 官方', color: '#3a6ea5',
    spaceObject: 'route', permissions: { scopes: ['location', 'network'], tools: ['enrich', 'geocode', 'mark_place'] },
    runtime: 'hybrid', onChain: null, pricing: { model: 'free' }, group: 'featured', reviewed: true, runTarget: 'travel-agent',
  },
  {
    id: 'onchain-sights', name: '链上见闻', tagline: 'Injective 链上事件 → 地理叙事', publisher: 'Pocket Earth 官方', color: '#7c5cff',
    spaceObject: 'onchain', permissions: { scopes: ['wallet-readonly', 'network'], tools: ['enrich', 'geocode', 'mark_place'] },
    runtime: 'cloud', onChain: { network: 'injective', label: 'Injective testnet', explorerUrl: INJ_EXPLORER },
    pricing: { model: 'one-time', price: '5 INJ', comingSoon: true }, group: 'featured', reviewed: true,
  },
  // ——— 自带 · 已上架运行的真 agent（OPEN 直达，去重：travel 只在精选段出现一次，这里不再列）———
  {
    id: 'music', name: '音乐', tagline: '把音乐钉到歌手出身地 / 歌曲城市', publisher: 'Pocket Earth 官方', color: '#00c46a',
    spaceObject: 'place', permissions: { scopes: ['network'], tools: ['enrich', 'geocode', 'mark_place'] },
    runtime: 'hybrid', onChain: null, pricing: { model: 'free' }, group: 'installed', reviewed: true, runTarget: 'music-agent',
  },
  {
    id: 'movies', name: '电影', tagline: '把电影钉到取景地 / 故事地', publisher: 'Pocket Earth 官方', color: '#e0a02a',
    spaceObject: 'place', permissions: { scopes: ['network'], tools: ['enrich', 'geocode', 'mark_place'] },
    runtime: 'hybrid', onChain: null, pricing: { model: 'free' }, group: 'installed', reviewed: true, runTarget: 'movies-agent',
  },
  {
    id: 'books', name: '读书', tagline: '把书钉到故事地 / 作者地 + 读完日期', publisher: 'Pocket Earth 官方', color: '#b388ff',
    spaceObject: 'place', permissions: { scopes: ['network'], tools: ['enrich', 'geocode', 'mark_place'] },
    runtime: 'hybrid', onChain: null, pricing: { model: 'free' }, group: 'installed', reviewed: true, runTarget: 'books-agent',
  },
  {
    id: 'photos', name: '照片', tagline: '端侧整理相册，高价值照片钉地球', publisher: 'Pocket Earth 官方', color: '#22b8cf',
    spaceObject: 'place', permissions: { scopes: ['photos', 'location'], tools: ['edge_tag', 'geocode', 'mark_place'] },
    runtime: 'edge', onChain: null, pricing: { model: 'free' }, group: 'installed', reviewed: true, runTarget: 'photos-agent',
  },
];
