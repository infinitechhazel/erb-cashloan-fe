"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
  Mail,
  Phone,
  Eye,
  Calendar,
  User as UserIcon,
} from "lucide-react"
import Image from "next/image"

interface User {
  id: number
  name: string
  email: string
  phone: string | null
  profile_url: string | null
  status: string
  created_at: string
}

interface PaginationData {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

interface UsersDataTableProps {
  refresh: boolean
}

type SortField = 'name' | 'email' | 'created_at'
type SortOrder = 'asc' | 'desc' | null

export function UsersDataTable({ refresh }: UsersDataTableProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  })

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [perPage, setPerPage] = useState("10")
  const [statusFilter, setStatusFilter] = useState<string>("approved")
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
      setPagination(prev => ({ ...prev, current_page: 1 }))
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Fetch users
  useEffect(() => {
    fetchUsers()
  }, [pagination.current_page, perPage, searchTerm, refresh, sortField, sortOrder, statusFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: perPage,
        search: searchTerm,
        status: statusFilter,
      })

      if (sortField && sortOrder) {
        params.append('sort_by', sortField)
        params.append('sort_order', sortOrder)
      }

      const url = `/api/users?${params}`
      console.log('Fetching from Next.js API:', url) // DEBUG

      const response = await fetch(url)
      const data = await response.json()

      console.log('Response from Next.js API:', data) // DEBUG

      if (data.success) {
        setUsers(data.data.data || data.data)
        setPagination({
          current_page: data.data.current_page,
          last_page: data.data.last_page,
          per_page: data.data.per_page,
          total: data.data.total,
          from: data.data.from,
          to: data.data.to,
        })
      } else {
        console.error('API returned success: false', data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else if (sortOrder === 'desc') {
        setSortField(null)
        setSortOrder(null)
      }
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />
    }
    if (sortOrder === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4 text-blue-800" />
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-blue-800" />
  }

  const clearFilters = () => {
    setSearchInput("")
    setSearchTerm("")
    setStatusFilter("approved")
    setSortField(null)
    setSortOrder(null)
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const hasActiveFilters =
    searchTerm ||
    statusFilter !== "approved" ||
    sortField !== null

  // Update the status badge function:
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      approved: { className: "bg-green-100 text-green-800 border-green-200", label: "Approved" },
      pending: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
    }

    const variant = variants[status] || variants.pending

    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchTerm}
                <button onClick={() => { setSearchInput(""); setSearchTerm("") }}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== "approved" && (
              <Badge variant="secondary" className="gap-1">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter("approved")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {sortField && (
              <Badge variant="secondary" className="gap-1">
                Sort: {sortField} ({sortOrder})
                <button onClick={() => { setSortField(null); setSortOrder(null) }}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/10 hover:bg-primary/20 align-top transition-colors">
                <TableHead className="text-blue-800 text-center w-[100px]">Profile</TableHead>
                <TableHead className="w-[200px]">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center text-blue-800 font-semibold transition-colors"
                  >
                    Name
                    {getSortIcon('name')}
                  </button>
                </TableHead>
                <TableHead className="w-[250px]">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center text-blue-800 font-semibold transition-colors"
                  >
                    Email
                    {getSortIcon('email')}
                  </button>
                </TableHead>
                <TableHead className="text-blue-800 font-semibold w-[180px]">Phone</TableHead>
                <TableHead className="text-blue-800 font-semibold text-center w-[120px]">Status</TableHead>
                <TableHead className="text-blue-800 font-semibold text-center w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                    <TableCell className="text-center">
                      {user.profile_url ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden mx-auto border-2 border-blue-100">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${user.profile_url}`}
                            alt={user.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-800 to-blue-600 rounded-full flex items-center justify-center mx-auto text-white font-semibold shadow-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      <div className="break-words whitespace-normal">{user.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 text-blue-800/60 flex-shrink-0" />
                        <span className="text-sm break-words whitespace-normal">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {user.phone ? (
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4 text-blue-800/60 flex-shrink-0" />
                          <span className="text-sm break-words whitespace-normal">{user.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="group text-blue-800 hover:bg-blue-00 hover:text-white border-none transition-all"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsDetailsOpen(true)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-primary/10 text-blue-800 border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-blue-800 whitespace-nowrap">
              Showing {pagination.from} to {pagination.to} of {pagination.total} users
            </p>
            <Select value={perPage} onValueChange={(value) => {
              setPerPage(value)
              setPagination(prev => ({ ...prev, current_page: 1 }))
            }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, current_page: 1 }))}
              disabled={pagination.current_page === 1}
            >
              <ChevronsLeft className="h-4 w-4 text-blue-800" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
              disabled={pagination.current_page === 1}
            >
              <ChevronLeft className="h-4 w-4 text-blue-800" />
            </Button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-blue-800 whitespace-nowrap">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
              disabled={pagination.current_page === pagination.last_page}
            >
              <ChevronRight className="h-4 w-4 text-blue-800" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, current_page: pagination.last_page }))}
              disabled={pagination.current_page === pagination.last_page}
            >
              <ChevronsRight className="h-4 w-4 text-blue-800" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Details Dialog - Professional Design */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0">
          {selectedUser && (
            <>
              {/* Header with gradient background */}
              <div className="bg-gradient-to-br from-blue-800 to-blue-600 px-8 py-6">
                <DialogTitle className="text-2xl font-bold text-white mb-2">
                  Member Profile
                </DialogTitle>
                <p className="text-blue-100 text-sm">View detailed member information</p>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Profile Section */}
                <div className="bg-white px-8 py-6 border-b border-gray-200">
                  <div className="flex items-start gap-6">
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                      {selectedUser.profile_url ? (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${selectedUser.profile_url}`}
                            alt={selectedUser.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-800 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Name and Status */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedUser.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(selectedUser.status)}
                        <span className="text-sm text-gray-500">
                          Member ID: #{selectedUser.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="bg-gray-50 px-8 py-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-blue-800" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-800" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email Address
                          </label>
                          <p className="text-sm font-medium text-gray-900 mt-1 break-all">
                            {selectedUser.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Phone className="h-5 w-5 text-blue-800" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone Number
                          </label>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {selectedUser.phone || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm md:col-span-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-800" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Member Since
                          </label>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white px-8 py-4 border-t border-gray-200">
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailsOpen(false)}
                      className="border-gray-300"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}