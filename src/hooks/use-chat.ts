"use client"

import { useCallback, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query/keys"
import { chatQueryOptions } from "@/lib/query/options/chat"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"
import { api } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { User, Group } from "@/models"

export interface ChatMessage {
  id: string
  content: string
  sender: User
  receiver: User
  group: Group
  senderAvatar?: string
  timestamp: string
  isSystem?: boolean
  edited?: boolean
}

export interface ChatGroup {
  id: string
  name: string
  description?: string
  avatar?: string
  memberCount: number
  lastMessage?: string
  lastMessageTime?: string
  isPrivate: boolean
  createdAt: string
}

export function useChat() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const groupsQuery = useQuery({
    ...chatQueryOptions.groups(),
    enabled: false,
  })

  const messagesQuery = useQuery({
    ...chatQueryOptions.messages(selectedGroupId ?? ""),
    enabled: Boolean(selectedGroupId),
  })

  const sendMessageMutation = useMutation({
    mutationFn: async ({ groupId, content }: { groupId: string; content: string }) =>
      unwrapApiResponse(await api.sendMessage(groupId, content)),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(variables.groupId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.chat.groups() })
      toast({ title: "Message sent" })
    },
  })

  const createGroupMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) =>
      unwrapApiResponse(await api.createGroup(name, description)),
    onSuccess: async (group) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.chat.groups() })
      setSelectedGroupId(group.id)
      toast({ title: "Group created successfully" })
    },
  })

  const fetchGroups = useCallback(async () => {
    await groupsQuery.refetch()
  }, [groupsQuery])

  const fetchGroupMessages = useCallback((groupId: string) => {
    setSelectedGroupId(groupId)
  }, [])

  const sendMessage = useCallback(
    async (groupId: string, content: string) => {
      try {
        await sendMessageMutation.mutateAsync({ groupId, content })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to send message"
        toast({ title: "Error", description: errorMessage, variant: "destructive" })
      }
    },
    [sendMessageMutation, toast],
  )

  const createGroup = useCallback(
    async (name: string, description?: string) => {
      try {
        return await createGroupMutation.mutateAsync({ name, description })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create group"
        toast({ title: "Error", description: errorMessage, variant: "destructive" })
        return undefined
      }
    },
    [createGroupMutation, toast],
  )

  return {
    groups: ((groupsQuery.data?.content as ChatGroup[] | undefined) ?? []),
    messages: ((messagesQuery.data?.content as ChatMessage[] | undefined) ?? []),
    loading: groupsQuery.isFetching || messagesQuery.isFetching || sendMessageMutation.isPending || createGroupMutation.isPending,
    error:
      (groupsQuery.error instanceof Error && groupsQuery.error.message) ||
      (messagesQuery.error instanceof Error && messagesQuery.error.message) ||
      null,
    fetchGroups,
    fetchGroupMessages,
    sendMessage,
    createGroup,
  }
}
