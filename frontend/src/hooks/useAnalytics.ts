import { useEffect, useCallback } from 'react'
import { analytics, trackUserAction } from '../services/analytics'

export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackMetric: analytics.trackMetric.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    measureAsync: analytics.measureAsync.bind(analytics),
    measureSync: analytics.measureSync.bind(analytics),
    trackUserAction,
  }
}

export const usePageView = (pageName: string) => {
  useEffect(() => {
    trackUserAction.pageViewed(pageName)
  }, [pageName])
}

export const usePerformanceTracking = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now()

    return () => {
      const duration = performance.now() - startTime
      analytics.trackMetric(`component_mount_${componentName}`, duration)
    }
  }, [componentName])
}

export const useErrorTracking = () => {
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    analytics.trackError(error, context, 'medium')
  }, [])

  return { trackError }
}
