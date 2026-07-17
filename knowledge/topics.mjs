export const KNOWLEDGE_TOPICS = Object.freeze({
  ai: {
    label: 'AI',
    query: 'artificial intelligence models research regulation chips Microsoft',
    anchored: true,
  },
  technology: {
    label: '科技',
    query: 'technology semiconductors robotics cybersecurity space research',
    anchored: false,
  },
  finance: {
    label: '金融',
    query: 'global finance markets regulation AI agents Injective',
    anchored: true,
  },
  climate: {
    label: '气候',
    query: 'climate science energy transition emissions policy weather research',
    anchored: false,
  },
  science: {
    label: '科学',
    query: 'science research discovery peer reviewed space biology physics',
    anchored: false,
  },
  health: {
    label: '健康生命',
    query: 'global health medicine biotechnology public health research',
    anchored: false,
  },
  culture: {
    label: '文化',
    query: 'books film music museums cultural heritage research',
    anchored: false,
  },
  policy: {
    label: '政策社会',
    query: 'global public policy regulation society institutions public interest',
    anchored: false,
  },
})

export const PUBLIC_TOPIC_KEYS = Object.freeze(Object.keys(KNOWLEDGE_TOPICS))
export const ANCHORED_TOPIC_KEYS = Object.freeze(PUBLIC_TOPIC_KEYS.filter((key) => KNOWLEDGE_TOPICS[key].anchored))

export function isKnowledgeTopic(value) {
  return Object.hasOwn(KNOWLEDGE_TOPICS, String(value || '').toLowerCase())
}
