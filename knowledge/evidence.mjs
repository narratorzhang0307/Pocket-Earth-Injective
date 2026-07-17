// Domain-neutral RSS evidence retrieval adapted from the user's FactAtlas project.
import { KNOWLEDGE_TOPICS } from './topics.mjs'

export function decodeEntities(value) {
  return String(value ?? '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
}

function textFromTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return decodeEntities(match?.[1] ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function parseGoogleNewsRss(xml, limit = 6) {
  const items = String(xml).match(/<item>[\s\S]*?<\/item>/gi) ?? []
  return items.slice(0, limit).map((item, index) => {
    const sourceMatch = item.match(/<source(?:\s+url="([^"]+)")?>([\s\S]*?)<\/source>/i)
    return {
      id: `google-${index + 1}`,
      title: textFromTag(item, 'title') || 'Untitled source',
      url: textFromTag(item, 'link'),
      publisher: decodeEntities(sourceMatch?.[2] ?? 'Unknown publisher').replace(/<[^>]+>/g, '').trim(),
      publisherUrl: decodeEntities(sourceMatch?.[1] ?? ''),
      publishedAt: textFromTag(item, 'pubDate') || null,
      snippet: textFromTag(item, 'description') || textFromTag(item, 'title'),
      origin: 'Google News RSS',
    }
  }).filter((item) => item.url)
}

export function parseBingNewsRss(xml, limit = 6) {
  const items = String(xml).match(/<item>[\s\S]*?<\/item>/gi) ?? []
  return items.slice(0, limit).map((item, index) => {
    const url = textFromTag(item, 'link')
    let publisher = textFromTag(item, 'News:Source')
    if (!publisher) {
      try { publisher = new URL(url).hostname.replace(/^www\./, '') } catch { publisher = 'Unknown publisher' }
    }
    return {
      id: `bing-${index + 1}`,
      title: textFromTag(item, 'title') || 'Untitled source',
      url,
      publisher,
      publisherUrl: 'https://www.bing.com/news',
      publishedAt: textFromTag(item, 'pubDate') || null,
      snippet: textFromTag(item, 'description') || textFromTag(item, 'title'),
      origin: 'Bing News RSS',
    }
  }).filter((item) => item.url)
}

export function dedupeSources(sources, limit = 8) {
  const seenUrls = new Set()
  const seenTitles = new Set()
  return sources.filter((source) => {
    const title = String(source.title || '').toLowerCase().replace(/\s+/g, ' ').replace(/\s[-–—|]\s[^-–—|]{2,80}$/, '').trim()
    let url = String(source.url || '')
    try {
      const parsed = new URL(url)
      parsed.hash = ''
      for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) parsed.searchParams.delete(key)
      url = parsed.toString()
    } catch { url = '' }
    if (!title || !url || seenUrls.has(url) || seenTitles.has(title)) return false
    seenUrls.add(url); seenTitles.add(title)
    return true
  }).slice(0, limit)
}

async function fetchFeed(url, parser, limit, signal, fetchImpl) {
  const response = await fetchImpl(url, { headers: { accept: 'application/rss+xml, application/xml, text/xml' }, signal })
  if (!response.ok) throw new Error(`evidence_feed_${response.status}`)
  const sources = parser(await response.text(), limit)
  if (!sources.length) throw new Error('evidence_feed_empty')
  return sources
}

export async function searchNewsEvidence(query, { limit = 8, signal, fetchImpl = fetch } = {}) {
  const clean = String(query || '').replace(/\s+/g, ' ').trim().slice(0, 320)
  if (!clean) return []
  const encoded = encodeURIComponent(clean)
  const urls = [
    { url: `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`, parser: parseGoogleNewsRss },
    { url: `https://www.bing.com/news/search?q=${encoded}&format=rss&mkt=en-US&setlang=en-US`, parser: parseBingNewsRss },
  ]
  const settled = await Promise.allSettled(urls.map((item) => fetchFeed(item.url, item.parser, limit, signal, fetchImpl)))
  const merged = settled.flatMap((item) => item.status === 'fulfilled' ? item.value : [])
  if (!merged.length) throw new Error('public_news_unavailable')
  return dedupeSources(merged, limit)
}

export async function searchDailySignals(topic, date, options = {}) {
  const query = KNOWLEDGE_TOPICS[topic]?.query
  if (!query) throw new Error('unsupported_knowledge_topic')
  const dated = `${query} after:${date}`
  return searchNewsEvidence(dated, { ...options, limit: options.limit || 12 })
}
