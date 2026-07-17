// 空间 Agent 广场的数据模型。
// 每个上架 agent 必须声明的「四要素」即审核清单：
//   ① 处理哪类空间对象 ② 需要哪些权限 ③ 端侧 / 云端 ④ 有没有 Injective 链上身份。
// 这套硬字段把「符合空间逻辑 + 有边界 + 有审核」落到 TS 类型约束上。
import type { AgentTool, AgentManifest, GeoStrategy } from '../agent/manifest';

/** ① 空间对象（审核闸：必须能落到地球某类对象上 = 符合空间逻辑，杂七杂八的 agent 进不来） */
export type SpaceObjectKind = 'sighting' | 'place' | 'route' | 'event' | 'media' | 'knowledge' | 'onchain';
export const SPACE_OBJECT_LABEL: Record<SpaceObjectKind, string> = {
  sighting: '观测点', place: '地点', route: '路线', event: '事件', media: '媒介落点', knowledge: '知识版次', onchain: '链上对象',
};

/** ② 权限 = 用户看得懂的数据访问域（与 manifest 的物理 tools 白名单分两栏并存，最小授权） */
export type DataScope = 'location' | 'photos' | 'audio' | 'wallet-readonly' | 'network' | 'clipboard';
export const SCOPE_LABEL: Record<DataScope, string> = {
  location: '位置', photos: '相册', audio: '音频', 'wallet-readonly': '钱包(只读)', network: '联网', clipboard: '剪贴板',
};

/** ③ 端 / 云 */
export type Runtime = 'edge' | 'cloud' | 'hybrid';
export const RUNTIME_LABEL: Record<Runtime, string> = { edge: '端侧', cloud: '云端', hybrid: '端+云' };

/** ④ Injective 链上身份（null = 没有，对应口播「有没有」） */
export interface OnChainIdentity {
  network: 'injective';
  label: string;        // 徽章文案，如 'Injective testnet'
  explorerUrl: string;  // 点徽章跳 blockscout（真实可查）
}

export interface SpaceAgent {
  id: string;
  name: string;            // 显示名，font-pixel
  tagline: string;         // 一句话说明，sans
  publisher: string;       // 'Pocket Earth 官方' | '@dev'
  emoji: string;           // 安装到控制台后的图标（单 emoji）
  color: string;           // 像素方块主色 #rrggbb（按领域分配，只在方块内用）
  // —— 四要素（硬字段，即审核清单）——
  spaceObject: SpaceObjectKind;                              // ①
  permissions: { scopes: DataScope[]; tools: AgentTool[] };  // ②（数据域 + manifest 物理白名单）
  runtime: Runtime;                                          // ③
  onChain: OnChainIdentity | null;                           // ④
  // —— 货架态 ——
  group: 'installed' | 'featured';   // installed=自带真 agent（OPEN 直达）；featured=口播前瞻例
  reviewed: boolean;                 // 过审（「有审核」）；false → 灰一档 + 「审核中」
  runTarget?: string;                // group==='installed' 时复用 RUN_BY_NAME 的 key，OPEN 走 onRun(runTarget)
}

// 空间对象 → 落点策略（复用 manifest 的 GeoStrategy 枚举），安装后让 agent 知道往哪钉。
const GEO_BY_OBJECT: Record<SpaceObjectKind, GeoStrategy[]> = {
  sighting: ['visited'], place: ['origin', 'story'], route: ['visited'],
  event: ['story'], media: ['story', 'made'], knowledge: ['manual'], onchain: ['manual'],
};

/** 把广场 agent 转成可安装的声明式 manifest（喂给 lib/agent 的 installAgent 过安全闸）。
 *  只取 manifest 白名单字段、不带 URL，避开 reviewManifest 的 DANGER 扫描。 */
export function toManifest(a: SpaceAgent): Partial<AgentManifest> {
  return {
    name: a.name.slice(0, 20),
    emoji: a.emoji,
    domain: SPACE_OBJECT_LABEL[a.spaceObject].slice(0, 12),
    desc: a.tagline.slice(0, 40),
    keywords: [a.name, SPACE_OBJECT_LABEL[a.spaceObject]].map((k) => k.slice(0, 12)),
    geoStrategy: GEO_BY_OBJECT[a.spaceObject],
    tagFields: ['类型', '位置'],
    tools: a.permissions.tools,
    cardStyle: 'generic',
    color: a.color,
    persona: '空间 agent · 把对象钉回地球',
  };
}
