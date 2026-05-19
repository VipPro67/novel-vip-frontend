"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { flexRender, type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Shield, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination } from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { useServerTable } from "@/hooks/use-server-table"
import { adminQueryOptions } from "@/lib/query/options/admin"
import { unwrapApiResponse } from "@/lib/query/unwrap-api"
import { api, type User } from "@/services/api"

type RoleInput = string | { id?: string; name?: string }

function normalizeUserRoles(roles: RoleInput[] | undefined) {
  return (roles ?? [])
    .map((role) => (typeof role === "string" ? role : role.name))
    .filter((role): role is string => Boolean(role))
}

export function UserManagement() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editRolesDialog, setEditRolesDialog] = useState(false)
  const [deleteUserDialog, setDeleteUserDialog] = useState(false)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [tableData, setTableData] = useState<User[]>([])
  const [pageCount, setPageCount] = useState(0)

  const availableRoles = ["USER", "ADMIN", "MODERATOR"]

  const handleEditRoles = useCallback((user: User) => {
    setSelectedUser(user)
    setUserRoles(normalizeUserRoles(user.roles as RoleInput[]))
    setEditRolesDialog(true)
  }, [])

  const handleDeleteUser = useCallback((user: User) => {
    setSelectedUser(user)
    setDeleteUserDialog(true)
  }, [])

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "user",
        header: "User",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>{row.original.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{row.original.fullName || row.original.username}</p>
              <p className="text-sm text-muted-foreground">@{row.original.username}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        id: "roles",
        header: "Roles",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {normalizeUserRoles(row.original.roles as RoleInput[]).map((role) => (
              <Badge key={role} variant="secondary" className="text-xs">
                {role}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        id: "joined",
        header: "Joined",
        cell: () => <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</span>,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditRoles(row.original)}>
                <Shield className="mr-2 h-4 w-4" />
                Edit Roles
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeleteUser(row.original)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleDeleteUser, handleEditRoles],
  )

  const table = useServerTable<User>({
    data: tableData,
    columns,
    pageCount,
    initialPageSize: 10,
    initialSorting: [{ id: "createdAt", desc: true }],
  })

  const usersQuery = useQuery(adminQueryOptions.users(table.params))

  useEffect(() => {
    if (usersQuery.data) {
      setTableData(usersQuery.data.content)
      setPageCount(usersQuery.data.totalPages)
    } else if (!usersQuery.isPending) {
      setTableData([])
      setPageCount(0)
    }
  }, [usersQuery.data, usersQuery.isPending])

  useEffect(() => {
    if (usersQuery.error) {
      console.error("Failed to fetch users:", usersQuery.error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    }
  }, [toast, usersQuery.error])

  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: string[] }) =>
      unwrapApiResponse(await api.updateUserRoles(userId, roles)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast({
        title: "Success",
        description: "User roles updated successfully",
      })
      setEditRolesDialog(false)
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => unwrapApiResponse(await api.deleteUser(userId)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      setDeleteUserDialog(false)
    },
  })

  const saveUserRoles = async () => {
    if (!selectedUser) {
      return
    }

    try {
      await updateRolesMutation.mutateAsync({ userId: selectedUser.id, roles: userRoles })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user roles",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteUser = async () => {
    if (!selectedUser) {
      return
    }

    try {
      await deleteUserMutation.mutateAsync(selectedUser.id)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const toggleRole = (role: string) => {
    setUserRoles((previous) => (previous.includes(role) ? previous.filter((currentRole) => currentRole !== role) : [...previous, role]))
  }

  const loading = usersQuery.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user accounts and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by username or email..."
                value={table.globalFilter}
                onChange={(event) => {
                  table.setGlobalFilter(event.target.value)
                  table.table.setPageIndex(0)
                }}
                className="pl-8"
              />
            </div>
            {table.globalFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  table.setGlobalFilter("")
                  table.table.setPageIndex(0)
                }}
              >
                Clear
              </Button>
            )}
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                {table.table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-8 bg-muted rounded animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : tableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  table.table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={table.pagination.pageIndex}
            totalPages={pageCount}
            onPageChange={(page) => table.table.setPageIndex(page)}
            showPageNumbers={true}
            className="mt-4"
          />
        </div>
      </CardContent>

      <Dialog open={editRolesDialog} onOpenChange={setEditRolesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Roles</DialogTitle>
            <DialogDescription>Manage roles for {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableRoles.map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox id={role} checked={userRoles.includes(role)} onCheckedChange={() => toggleRole(role)} />
                <label htmlFor={role} className="text-sm font-medium">
                  {role}
                </label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRolesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveUserRoles} disabled={updateRolesMutation.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.username}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser} disabled={deleteUserMutation.isPending}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
