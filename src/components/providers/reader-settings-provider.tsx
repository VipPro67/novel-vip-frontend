"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ReaderSettings } from "@/models"
import { useAuth } from "./auth-provider"
import { api } from "@/services/api"
import { queryKeys } from "@/lib/query/keys"
import { readerSettingsQueryOptions } from "@/lib/query/options/reader-settings"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"

interface ReaderSettingsContextValue {
  settings: ReaderSettings | null
  loading: boolean
  saving: boolean
  error: string | null
  refreshSettings: (options?: { silent?: boolean }) => Promise<ReaderSettings | null>
  updateSettings: (changes: Partial<ReaderSettings>) => Promise<ReaderSettings | null>
}

const ReaderSettingsContext = createContext<ReaderSettingsContextValue | undefined>(undefined)
const STORAGE_KEY = "readerSettings"

export function ReaderSettingsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  const cacheSettings = useCallback((value: ReaderSettings | null) => {
    if (typeof window === "undefined") {
      return
    }

    if (!value) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  }, [])

  const loadCachedSettings = useCallback((): ReaderSettings | null => {
    if (typeof window === "undefined" || !user) {
      return null
    }

    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    try {
      const parsed = JSON.parse(raw) as ReaderSettings
      if (parsed.userId !== user.id) {
        window.localStorage.removeItem(STORAGE_KEY)
        return null
      }

      return parsed
    } catch (parseError) {
      console.error("Failed to parse cached reader settings", parseError)
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }
  }, [user])

  const cachedSettings = useMemo(() => loadCachedSettings(), [loadCachedSettings])

  const settingsQuery = useQuery({
    ...readerSettingsQueryOptions.detail(user?.id),
    enabled: !authLoading && isAuthenticated && Boolean(user?.id),
    placeholderData: cachedSettings ?? undefined,
  })

  const updateSettingsMutation = useMutation({
    mutationFn: async (changes: Partial<ReaderSettings>) => unwrapApiResponse(await api.updateReaderSettings(changes)),
    onSuccess: (data) => {
      if (!user?.id) {
        return
      }

      queryClient.setQueryData(queryKeys.readerSettings.detail(user.id), data)
      cacheSettings(data)
    },
  })

  useEffect(() => {
    if (!isAuthenticated || !user) {
      cacheSettings(null)
      queryClient.removeQueries({ queryKey: queryKeys.readerSettings.all })
    }
  }, [cacheSettings, isAuthenticated, queryClient, user])

  useEffect(() => {
    if (settingsQuery.data) {
      cacheSettings(settingsQuery.data)
    }
  }, [cacheSettings, settingsQuery.data])

  const refreshSettings = useCallback(
    async (_options?: { silent?: boolean }): Promise<ReaderSettings | null> => {
      if (!isAuthenticated || !user) {
        cacheSettings(null)
        return null
      }

      const freshSettings = await queryClient.fetchQuery(readerSettingsQueryOptions.detail(user.id))
      cacheSettings(freshSettings)
      return freshSettings
    },
    [cacheSettings, isAuthenticated, queryClient, user],
  )

  const updateSettings = useCallback(
    async (changes: Partial<ReaderSettings>): Promise<ReaderSettings | null> => {
      if (!isAuthenticated || !user) {
        throw new Error("You need to be logged in to update reader settings.")
      }

      return updateSettingsMutation.mutateAsync(changes)
    },
    [isAuthenticated, updateSettingsMutation, user],
  )

  const contextValue = useMemo<ReaderSettingsContextValue>(
    () => ({
      settings: settingsQuery.data ?? cachedSettings ?? null,
      loading: authLoading || (settingsQuery.isPending && !cachedSettings),
      saving: updateSettingsMutation.isPending,
      error:
        (updateSettingsMutation.error instanceof Error && updateSettingsMutation.error.message) ||
        (settingsQuery.error instanceof Error && settingsQuery.error.message) ||
        null,
      refreshSettings,
      updateSettings,
    }),
    [
      authLoading,
      cachedSettings,
      refreshSettings,
      settingsQuery.data,
      settingsQuery.error,
      settingsQuery.isPending,
      updateSettings,
      updateSettingsMutation.error,
      updateSettingsMutation.isPending,
    ],
  )

  return <ReaderSettingsContext.Provider value={contextValue}>{children}</ReaderSettingsContext.Provider>
}

export function useReaderSettings() {
  const context = useContext(ReaderSettingsContext)
  if (!context) {
    throw new Error("useReaderSettings must be used within a ReaderSettingsProvider")
  }
  return context
}
