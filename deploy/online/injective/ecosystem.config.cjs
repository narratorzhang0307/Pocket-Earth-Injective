module.exports = {
  apps: [
    {
      name: 'pocket-earth-injective',
      script: 'server.mjs',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        API_PORT: '3018',
      },
    },
    {
      name: 'pocket-earth-injective-knowledge',
      script: 'knowledge/daily-worker.mjs',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        KNOWLEDGE_TOPICS: 'ai,finance,science,climate,culture',
        KNOWLEDGE_DATA_DIR: 'var/knowledge',
        KNOWLEDGE_RUN_HOUR_UTC: '0',
        KNOWLEDGE_RUN_MINUTE_UTC: '10',
      },
    },
  ],
}
