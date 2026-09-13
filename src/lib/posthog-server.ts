import { PostHog } from 'posthog-node'

let posthogServer: PostHog | null = null

export function getPostHogServer(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return null
  if (!posthogServer) {
    posthogServer = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      flushAt: 1,       // send immediately — low-traffic serverless
      flushInterval: 0,
    })
  }
  return posthogServer
}
