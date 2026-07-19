import type { CSSProperties } from 'react';

export const FROST_AGENT_IDS = [43, 44, 45, 46, 47] as const;
export type FrostAgentId = typeof FROST_AGENT_IDS[number];

const PORTRAITS: Record<FrostAgentId, { src: string; position: string; background: string }> = {
  43: { src: '/frost-identities/frost-nft-group-1.png', position: '0% 0%', background: '#293b7a' },
  44: { src: '/frost-identities/frost-nft-group-1.png', position: '50% 0%', background: '#e95d72' },
  45: { src: '/frost-identities/frost-nft-group-2.png', position: '100% 0%', background: '#bdebe4' },
  46: { src: '/frost-identities/frost-nft-group-1.png', position: '50% 100%', background: '#f2c14e' },
  47: { src: '/frost-identities/frost-nft-group-1.png', position: '100% 0%', background: '#7a5af8' },
};

export function frostAgentId(value: unknown, fallbackIndex = 0): FrostAgentId {
  const parsed = Number(value);
  if (FROST_AGENT_IDS.includes(parsed as FrostAgentId)) return parsed as FrostAgentId;
  return FROST_AGENT_IDS[((fallbackIndex % FROST_AGENT_IDS.length) + FROST_AGENT_IDS.length) % FROST_AGENT_IDS.length];
}

interface Props {
  agentId?: unknown;
  fallbackIndex?: number;
  label?: string;
  className?: string;
  style?: CSSProperties;
  imageStyle?: CSSProperties;
}

/**
 * The single Frost visual source used by identity cards, Agent Plaza and the
 * podcast UI. The original 3x2 contact sheets stay intact; CSS selects one
 * square without creating a second, drifting set of avatar files.
 */
export default function FrostNftAvatar({ agentId, fallbackIndex = 0, label, className = '', style, imageStyle }: Props) {
  const id = frostAgentId(agentId, fallbackIndex);
  const portrait = PORTRAITS[id];
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: portrait.background, ...style }}
      data-frost-agent-id={id}
    >
      <div
        role="img"
        aria-label={label || `Frost Agent #${id}`}
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: `url(${portrait.src})`,
          backgroundPosition: portrait.position,
          backgroundSize: '300% 200%',
          ...imageStyle,
        }}
      />
    </div>
  );
}
