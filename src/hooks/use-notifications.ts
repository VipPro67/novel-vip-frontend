"use client"

import { useCallback, useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { type Notification } from "@/models"
import { connectNotifications, disconnectNotifications } from "@/lib/notifications"
import { useAuth } from "@/components/providers/auth-provider"
import { notificationsQueryOptions } from "@/lib/query/options/notifications"
import { queryKeys } from "@/lib/query/keys"

export function useNotifications() {
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  const unreadCountQuery = useQuery({
    ...notificationsQueryOptions.unreadCount(),
    enabled: isAuthenticated && Boolean(user?.id),
  })

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) {
      queryClient.setQueryData(queryKeys.notifications.unreadCount(), 0)
      return 0
    }

    const result = await unreadCountQuery.refetch()
    return result.data ?? 0
  }, [isAuthenticated, queryClient, unreadCountQuery, user])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setNotifications([])
      queryClient.setQueryData(queryKeys.notifications.unreadCount(), 0)
      disconnectNotifications()
      return
    }

    let isMounted = true
    const connectionTimeout = setTimeout(() => {
      if (!isMounted) {
        return
      }

      connectNotifications(user.id, (notification) => {
        if (!isMounted) {
          return
        }

        setNotifications((prev) => [notification, ...prev])
        if (!notification.read) {
          queryClient.setQueryData(queryKeys.notifications.unreadCount(), (prev?: number) => (prev ?? 0) + 1)
        }
      })
    }, 2000)

    return () => {
      isMounted = false
      clearTimeout(connectionTimeout)
      disconnectNotifications()
    }
  }, [isAuthenticated, queryClient, user])

  return {
    unreadCount: isAuthenticated ? unreadCountQuery.data ?? 0 : 0,
    notifications,
    setNotifications,
    refreshUnreadCount,
    setUnreadCount: (value: number | ((previous: number) => number)) => {
      queryClient.setQueryData(queryKeys.notifications.unreadCount(), (previous?: number) =>
        typeof value === "function" ? value(previous ?? 0) : value,
      )
    },
  }
}
