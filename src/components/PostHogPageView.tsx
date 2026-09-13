'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

function PageViewCapture() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname || typeof window === 'undefined') return
    let url = window.origin + pathname
    const qs = searchParams.toString()
    if (qs) url += '?' + qs
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}

export default function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PageViewCapture />
    </Suspense>
  )
}
