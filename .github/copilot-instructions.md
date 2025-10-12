# Auto-Podcast-Generator Project Instructions

## Project Overview

You are working with an **AI-powered Hacker News Chinese Podcast Generator** that automatically creates daily Chinese podcasts from trending Hacker News articles. This is a sophisticated system built with Next.js and Cloudflare Workers that:

1. **Automatically scrapes** Hacker News top stories daily
2. **Generates Chinese summaries** using AI (OpenAI GPT models)
3. **Creates podcast scripts** with natural dialogue between two hosts
4. **Converts text to speech** using Edge TTS and Minimax Audio
5. **Hosts content** via web interface and RSS feed
6. **Deploys on Cloudflare** infrastructure (Workers, R2, KV)

## Architecture Components

### 🏗️ Core Structure

- **Next.js Web App**: Frontend for podcast display and RSS feed
- **Cloudflare Workers**: Backend processing and workflow automation
- **Workflow Engine**: Automated daily content generation pipeline
- **Storage**: Cloudflare R2 (audio files) + KV (metadata)

### 🔧 Key Technologies

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn-ui
- **Backend**: Cloudflare Workers, TypeScript
- **AI**: OpenAI API (GPT models), custom prompts
- **Audio**: Edge TTS, Minimax Audio, browser rendering for audio merging
- **Storage**: Cloudflare R2, KV
- **Package Manager**: pnpm

## File Structure Guide

```
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Homepage with podcast episodes
│   ├── post/[date]/       # Individual episode pages
│   └── rss.xml/           # RSS feed endpoint
├── components/            # React components
│   ├── article-card.tsx   # Episode display component
│   └── ui/               # shadcn-ui components
├── worker/               # Cloudflare Worker entry point
│   └── index.ts          # Worker request handler
├── workflow/             # Core workflow logic
│   ├── index.ts          # Main workflow orchestration
│   ├── prompt.ts         # AI prompts for content generation
│   ├── tts.ts           # Text-to-speech conversion
│   └── utils.ts         # Utility functions
├── types/               # TypeScript definitions
├── config.ts           # Global configuration
└── wrangler.jsonc      # Cloudflare deployment config
```

## Development Workflow

### 🚀 Local Development

1. **Install dependencies**: `pnpm install`
2. **Set up environment variables** (see Environment Variables section)
3. **Start worker development**: `pnpm dev:worker`
4. **Start web development**: `pnpm dev`
5. **Test workflow**: `curl -X POST http://localhost:8787`

### 📦 Deployment

#### Pre-deployment Setup

1. **Create R2 Bucket**:
   ```bash
   wrangler r2 bucket create hacker-news
   ```
2. **Create KV Namespace**:
   ```bash
   wrangler kv:namespace create "HACKER_NEWS_KV"
   ```
3. **Update wrangler.jsonc** with generated IDs
4. **Configure Custom Domain** for R2 bucket (required for public access)

#### Worker Deployment Process

```bash
# Set worker environment variables
pnpx wrangler secret put --cwd worker HACKER_NEWS_WORKER_URL
pnpx wrangler secret put --cwd worker HACKER_NEWS_R2_BUCKET_URL
pnpx wrangler secret put --cwd worker OPENAI_API_KEY
pnpx wrangler secret put --cwd worker OPENAI_BASE_URL
pnpx wrangler secret put --cwd worker OPENAI_MODEL

# Deploy worker with workflows enabled
pnpm deploy:worker
```

#### Web App Deployment Process

```bash
# Set web app environment variables
pnpx wrangler secret put NEXTJS_ENV
pnpx wrangler secret put NEXT_PUBLIC_BASE_URL
pnpx wrangler secret put NEXT_STATIC_HOST

# Build and deploy using OpenNext
pnpm deploy
```

#### Important Configuration Notes

- **Workflows**: Must be enabled in worker wrangler.jsonc
- **Browser Binding**: Required for audio processing with Puppeteer
- **Custom Domains**: Essential for R2 public access and CORS
- **KV Namespace ID**: Must match between worker and web configurations

## Environment Variables

### Worker Environment (`.dev.vars` in worker/)

```bash
WORKER_ENV=development
HACKER_NEWS_WORKER_URL=https://your-worker-url
HACKER_NEWS_R2_BUCKET_URL=https://your-bucket-url
OPENAI_API_KEY=your_openai_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
OPENAI_THINKING_MODEL=o1-mini  # Optional for complex reasoning
JINA_KEY=your_jina_key  # Optional for content extraction
```

### Web Environment (`.dev.vars` in root)

```bash
NEXTJS_ENV=development
NEXT_STATIC_HOST=http://localhost:3000/static
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Workflow Process

### 📋 Daily Automation Pipeline

1. **Scheduled trigger** (daily via Cloudflare cron)
2. **Fetch top stories** from Hacker News API
3. **Extract content** from each article and comments
4. **Generate summaries** using AI with specialized prompts
5. **Create podcast script** with natural dialogue between hosts
6. **Convert to audio** using TTS services
7. **Merge audio files** using browser rendering
8. **Store files** in R2 and metadata in KV
9. **Update RSS feed** and web interface

### 🤖 AI Prompt System

- **Story Summarization**: Converts articles and comments to Chinese summaries
- **Podcast Script**: Creates natural dialogue between male and female hosts
- **Blog Generation**: Produces SEO-friendly blog content
- **Intro Generation**: Creates brief episode descriptions

## Key Features

### 🎙️ Podcast Generation

- **Two-host format**: Natural conversation between male and female hosts
- **Chinese localization**: All content translated to Chinese
- **Comment integration**: Includes discussion from Hacker News comments
- **Quality filtering**: Skips content violating Chinese regulations

### 📱 Web Interface

- **Episode listing**: Shows all generated episodes
- **Audio player**: Built-in web audio player
- **RSS feed**: Standard podcast RSS for apps
- **Responsive design**: Works on all devices

### ☁️ Cloudflare Integration

#### Core Cloudflare Services

- **Workers**: Serverless execution environment for backend logic
- **R2 Storage**: Object storage for audio files and static assets
- **KV Storage**: Key-value store for metadata and configuration
- **Browser Rendering**: Puppeteer-based audio processing in browser context
- **Workflows**: Automated scheduled execution with retry logic
- **Durable Objects**: Next.js cache management and queue processing

#### Detailed Service Configuration

**🔧 Workers Configuration** (`worker/wrangler.jsonc`):

```jsonc
{
  "name": "hacker-news-worker",
  "main": "./index.ts",
  "triggers": {
    "crons": ["30 23 * * *"] // Daily at 23:30 UTC
  },
  "browser": {
    "binding": "BROWSER" // For audio processing
  },
  "workflows": [{
    "name": "hacker-news-workflow",
    "binding": "HACKER_NEWS_WORKFLOW",
    "class_name": "HackerNewsWorkflow"
  }]
}
```

**📦 Storage Bindings**:

- `HACKER_NEWS_R2`: Primary bucket for audio files and assets
- `HACKER_NEWS_KV`: Metadata storage for episodes and configuration
- `NEXT_INC_CACHE_R2_BUCKET`: Next.js incremental cache storage

**🎯 Web App Configuration** (`wrangler.jsonc`):

```jsonc
{
  "name": "hacker-news",
  "main": ".open-next/worker.js", // OpenNext adapter
  "assets": {
    "binding": "ASSETS",
    "directory": ".open-next/assets"
  },
  "durable_objects": {
    "bindings": [
      { "name": "NEXT_CACHE_DO_QUEUE", "class_name": "DOQueueHandler" },
      { "name": "NEXT_TAG_CACHE_DO_SHARDED", "class_name": "DOShardedTagCache" },
      { "name": "NEXT_CACHE_DO_PURGE", "class_name": "BucketCachePurge" }
    ]
  }
}
```

#### Service Interactions

**🔄 Workflow Execution**:

1. **Cron Trigger**: Daily at 23:30 UTC via `scheduled` event
2. **Manual Trigger**: POST to worker endpoint for testing
3. **Retry Logic**: 5 retries with exponential backoff
4. **Browser Context**: Audio merging via Puppeteer in browser binding

**💾 Data Flow**:

- **Articles** → Worker processing → KV storage (metadata)
- **Audio files** → TTS generation → Browser merging → R2 storage
- **Web requests** → Next.js app → R2/KV data retrieval

**🌐 URL Structure**:

- Worker: `https://hacker-news-worker.your-domain.workers.dev`
- Web App: `https://hacker-news.your-domain.pages.dev`
- Static Files: `https://your-bucket-url/filename.mp3`

#### Environment Variables by Service

**Worker Secrets** (via `wrangler secret put`):

```bash
HACKER_NEWS_WORKER_URL     # Worker URL for self-reference
HACKER_NEWS_R2_BUCKET_URL  # Public R2 bucket URL
OPENAI_API_KEY             # OpenAI API access
OPENAI_BASE_URL            # OpenAI endpoint
OPENAI_MODEL               # GPT model name
JINA_KEY                   # Optional: Content extraction
```

**Web App Secrets**:

```bash
NEXTJS_ENV                 # production/development
NEXT_PUBLIC_BASE_URL       # Web app public URL
NEXT_STATIC_HOST           # Static asset host URL
```

## Development Guidelines

### 🔍 When Working on This Project

1. **Understanding the Flow**: Always consider the full pipeline from HN scraping to audio generation
2. **AI Prompts**: Located in `workflow/prompt.ts` - these are crucial for content quality
3. **Workflow Logic**: Main orchestration in `workflow/index.ts` with retry and error handling
4. **Environment**: Dual environment (worker + web app) requires careful variable management
5. **Audio Processing**: Complex browser-based audio merging - debug remotely if needed
6. **Chinese Content**: All output should be in simplified Chinese, tech terms can stay English

### 🛠️ Common Tasks

**Adding New AI Features**:

- Modify prompts in `workflow/prompt.ts`
- Update workflow logic in `workflow/index.ts`
- Test with `pnpm dev:worker` and manual triggers

**Frontend Changes**:

- Components in `components/`
- Pages in `app/`
- Styling with Tailwind CSS

**Worker Updates**:

- Core logic in `worker/index.ts`
- Deploy with `pnpm deploy:worker`

**Configuration**:

- Global settings in `config.ts`
- Environment variables in respective `.dev.vars` files
- Cloudflare bindings in `wrangler.jsonc`

### ⚠️ Important Notes

1. **Local Limitations**: Audio processing (TTS + merging) may not work locally - use remote debugging
2. **Content Filtering**: All content must comply with Chinese regulations
3. **API Costs**: OpenAI and TTS services have usage costs - monitor in production
4. **Storage Limits**: R2 and KV have storage quotas in Cloudflare free tier
5. **Workflow Timing**: Scheduled workflows run in UTC timezone

### 🌩️ Cloudflare-Specific Development Notes

**Worker Runtime Limitations**:

- **CPU Time**: Workers have 30-second execution limit (can be extended to 15 minutes with Unbound)
- **Memory**: 128MB memory limit per worker execution
- **Request Size**: 100MB maximum request/response size
- **Concurrent Connections**: Limited outbound connections per worker

**Browser Rendering Constraints**:

- **Puppeteer Sessions**: Limited concurrent browser sessions
- **Memory Usage**: Browser rendering consumes significant memory
- **Timeout Handling**: Browser operations must complete within worker timeout
- **Static File Serving**: Use R2 custom domains for optimal performance

**Storage Considerations**:

- **KV Eventual Consistency**: KV writes may take time to propagate globally
- **R2 Bandwidth**: Free tier has monthly bandwidth limits
- **Cache Invalidation**: Durable Objects handle Next.js cache purging
- **CORS Configuration**: R2 bucket CORS must be configured for web access

**Workflow Specifics**:

- **Retry Logic**: Workflows handle transient failures with exponential backoff
- **State Management**: Workflow state persists across retries and restarts
- **Error Handling**: Failed steps don't affect subsequent workflow runs
- **Manual Triggers**: Can trigger workflows via HTTP POST for testing

### 🔧 Troubleshooting

**Common Issues**:

**🚨 Audio Generation Issues**:

- Audio generation hanging locally → Comment out TTS code for debugging
- Browser rendering timeout → Check Puppeteer browser binding configuration
- Audio files not merging → Verify browser context has sufficient memory/timeout

**⚙️ Worker Deployment Failures**:

- Worker deployment fails → Check wrangler.jsonc bindings and KV namespace IDs
- Workflow not triggering → Verify workflows are uncommented in wrangler.jsonc
- Cron schedule not working → Ensure triggers.crons format is correct

**🌐 Web App Issues**:

- Web app not updating → Verify R2 bucket permissions and public domain setup
- Static files 404 → Check NEXT_STATIC_HOST environment variable points to R2 domain
- Cache issues → Verify Durable Objects bindings and migrations

**📡 API and Integration Problems**:

- RSS feed errors → Check KV storage permissions and data format
- AI generation fails → Verify OpenAI API keys, quotas, and model availability
- Content extraction timeout → Check Jina API key and rate limits

**💾 Storage and Configuration**:

- KV namespace not found → Verify KV namespace ID matches in both wrangler.jsonc files
- R2 bucket access denied → Ensure bucket exists and custom domain is configured
- Environment variables not accessible → Use `wrangler secret put` not `.env` files for production

**🔍 Debugging Strategies**:

- Use `wrangler tail --cwd worker` for real-time worker logs
- Test workflows locally with `curl -X POST http://localhost:8787`
- Check Cloudflare dashboard for service metrics and error logs
- Use `wrangler dev --remote` for testing with production bindings

### 📚 Key Dependencies

**Critical Packages**:

- `@ai-sdk/openai`: AI text generation
- `@echristian/edge-tts`: Text-to-speech conversion
- `@cloudflare/puppeteer`: Browser rendering for audio
- `next`: Web framework
- `cheerio`: HTML parsing for content extraction
- `zod`: Data validation

Remember: This is a production-ready system handling real user traffic. Always test changes thoroughly and consider the impact on the automated daily workflow.
