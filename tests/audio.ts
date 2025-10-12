import { concatAudioFiles } from '@/workflow/utils'

interface Env {
  AUTO_PODCAST_GENERATOR_WORKER_URL: string
  BROWSER: Fetcher
}

export default {
  async fetch(request: Request, env: Env) {
    if (!request.url.includes('/tests')) {
      return new Response('not allowed')
    }
    const audioFiles = Array.from(
      { length: 169 },
      (_, i) => `https://hacker-news-static.agi.li/debug/2025/04/17/production/hacker-news-2025-04-17.mp3-${i}.mp3`,
    )
    const audio = await concatAudioFiles(audioFiles, env.BROWSER, { workerUrl: env.AUTO_PODCAST_GENERATOR_WORKER_URL })
    return new Response(audio)
  },
}
