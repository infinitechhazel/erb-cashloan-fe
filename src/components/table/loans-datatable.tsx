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
    DialogFooter,
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
    Eye,
    Edit2,
    CheckCircle2,
    XCircle,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface LoanApplication {
    id: number
    loan_number: string
    type: string
    principal_amount: string
    approved_amount?: string
    interest_rate: string
    status: string
    term_months?: number
    purpose?: string
    created_at: string
    updated_at: string
    start_date?: string
    first_payment_date?: string
    notes?: string
    rejection_reason?: string
    outstanding_balance?: string
    borrower?: {
        first_name: string
        last_name: string
        email?: string
    }
    lender?: {
        first_name: string
        last_name: string
        email?: string
    }
}

interface Lender {
    id: number
    first_name: string
    last_name: string
    email?: string
}

interface PaginationData {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
}

interface LoansDataTableProps {
    refresh: boolean
}

type SortField = 'loan_number' | 'type' | 'principal_amount' | 'status' | 'created_at'
type SortOrder = 'asc' | 'desc' | null

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    approved: "bg-blue-100 text-blue-700 border-blue-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    active: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-gray-100 text-gray-700 border-gray-200",
    defaulted: "bg-black text-blue-800 border-black",
}

export function LoansDataTable({ refresh }: LoansDataTableProps) {
    const [loans, setLoans] = useState<LoanApplication[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [lenders, setLenders] = useState<Lender[]>([])

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
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [sortField, setSortField] = useState<SortField | null>(null)
    const [sortOrder, setSortOrder] = useState<SortOrder>(null)

    // Modals
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    const [showApproveModal, setShowApproveModal] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [showActivateModal, setShowActivateModal] = useState(false)

    // Form states
    const [status, setStatus] = useState("")
    const [approvedAmount, setApprovedAmount] = useState("")
    const [interestRate, setInterestRate] = useState("")
    const [notes, setNotes] = useState("")
    const [rejectionReason, setRejectionReason] = useState("")
    const [selectedLenderId, setSelectedLenderId] = useState<number | null>(null)
    const [activateStartDate, setActivateStartDate] = useState("")
    const [activateFirstPaymentDate, setActivateFirstPaymentDate] = useState("")
    const [updating, setUpdating] = useState(false)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput)
            setPagination(prev => ({ ...prev, current_page: 1 }))
        }, 500)

        return () => clearTimeout(timer)
    }, [searchInput])

    // Fetch loans
    useEffect(() => {
        fetchLoans()
    }, [pagination.current_page, perPage, searchTerm, refresh, sortField, sortOrder, statusFilter])

    // Fetch lenders on mount
    useEffect(() => {
        fetchLenders()
    }, [])

    const fetchLoans = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const params = new URLSearchParams({
                page: pagination.current_page.toString(),
                per_page: perPage,
                search: searchTerm,
            })

            if (statusFilter && statusFilter !== 'all') {
                params.append('status', statusFilter)
            }

            if (sortField && sortOrder) {
                params.append('sort_by', sortField)
                params.append('sort_order', sortOrder)
            }

            const url = `/api/loans?${params}`
            console.log('Fetching from Next.js API:', url)

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            })

            const data = await response.json()
            console.log('Response from Next.js API:', data)

            if (response.ok) {
                const loansData = data.loans?.data || data.loans || []
                setLoans(loansData)

                if (data.loans?.current_page) {
                    setPagination({
                        current_page: data.loans.current_page,
                        last_page: data.loans.last_page,
                        per_page: data.loans.per_page,
                        total: data.loans.total,
                        from: data.loans.from || 0,
                        to: data.loans.to || 0,
                    })
                }
            } else {
                console.error('API returned error:', data)
            }
        } catch (error) {
            console.error("Error fetching loans:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchLenders = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("/api/lenders", {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error("Failed to fetch lenders")
            const data = await res.json()
            setLenders(data.lenders || [])
        } catch (err) {
            console.error(err)
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
        setStatusFilter("all")
        setSortField(null)
        setSortOrder(null)
        setPagination(prev => ({ ...prev, current_page: 1 }))
    }

    const hasActiveFilters =
        searchTerm ||
        statusFilter !== "all" ||
        sortField !== null

    const getStatusBadge = (status: string) => {
        return (
            <Badge variant="outline" className={statusColors[status] || "bg-gray-100"}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        )
    }

    const handleApprove = async () => {
        if (!approvedAmount || !selectedLoan) {
            toast.error("Error", { description: "Amount is required" })
            return
        }

        try {
            const token = localStorage.getItem("token")
            if (!token) throw new Error("Not authenticated")

            const body: Record<string, any> = {
                approved_amount: Number(approvedAmount),
                interest_rate: interestRate ? Number(interestRate) : undefined,
            }

            if (selectedLenderId) body.lender_id = selectedLenderId

            const res = await fetch(`/api/loans/${selectedLoan.id}/approve`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(body),
            })

            if (!res.ok) {
                const error = await res.json().catch(() => ({ message: "Failed to approve loan" }))
                throw new Error(error.message || "Failed to approve loan")
            }

            const data = await res.json()
            toast.success("Success", { description: data.message })

            setApprovedAmount("")
            setInterestRate("")
            setSelectedLoan(null)
            setShowApproveModal(false)
            fetchLoans()
        } catch (err) {
            console.error(err)
            toast.error("Error", {
                description: err instanceof Error ? err.message : "An error occurred",
            })
        }
    }

    const handleReject = async () => {
        if (!selectedLoan) return

        try {
            const token = localStorage.getItem("token")
            if (!token) throw new Error("Not authenticated")

            const body = {
                reason: rejectionReason || null,
            }

            const res = await fetch(`/api/loans/${selectedLoan.id}/reject`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(body),
            })

            if (!res.ok) {
                const error = await res.json().catch(() => ({ message: "Failed to reject loan" }))
                throw new Error(error.message || "Failed to reject loan")
            }

            const data = await res.json()
            toast.success("Success", { description: data.message || "Loan rejected successfully" })

            setRejectionReason("")
            setSelectedLoan(null)
            setShowRejectModal(false)
            fetchLoans()
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "An error occurred"
            toast.error("Error", { description: errorMsg })
        }
    }

    const handleActivate = async () => {
        if (!selectedLoan) return
        setUpdating(true)
        try {
            const token = localStorage.getItem("token")
            if (!token) throw new Error("Not authenticated")

            const body = {
                start_date: activateStartDate || null,
                first_payment_date: activateFirstPaymentDate || null,
            }

            const res = await fetch(`/api/loans/${selectedLoan.id}/activate`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(body),
            })

            if (!res.ok) {
                const error = await res.json().catch(() => ({ message: "Failed to activate loan" }))
                throw new Error(error.message || "Failed to activate loan")
            }

            const data = await res.json()
            toast.success("Loan activated successfully", { description: data.message })
            setShowActivateModal(false)
            setActivateStartDate("")
            setActivateFirstPaymentDate("")
            setSelectedLoan(null)
            fetchLoans()
        } catch (err) {
            const message = err instanceof Error ? err.message : "An error occurred"
            toast.error("Error activating loan", { description: message })
        } finally {
            setUpdating(false)
        }
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
                                placeholder="Search by loan number or borrower name..."
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
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="defaulted">Defaulted</SelectItem>
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
                        {statusFilter !== "all" && (
                            <Badge variant="secondary" className="gap-1">
                                Status: {statusFilter}
                                <button onClick={() => setStatusFilter("all")}>
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
            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-w-full">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="bg-primary/10 hover:bg-primary/10">
                                <TableHead className="whitespace-nowrap">
                                    <button
                                        onClick={() => handleSort('loan_number')}
                                        className="flex items-center text-blue-800 font-semibold hover:text-amber-300 transition-colors"
                                    >
                                        Loan #
                                        {getSortIcon('loan_number')}
                                    </button>
                                </TableHead>
                                <TableHead className="text-blue-800 font-semibold whitespace-nowrap">Borrower</TableHead>
                                <TableHead className="whitespace-nowrap">
                                    <button
                                        onClick={() => handleSort('type')}
                                        className="flex items-center text-blue-800 font-semibold hover:text-amber-300 transition-colors"
                                    >
                                        Type
                                        {getSortIcon('type')}
                                    </button>
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                    <button
                                        onClick={() => handleSort('principal_amount')}
                                        className="flex items-center text-blue-800 font-semibold hover:text-amber-300 transition-colors"
                                    >
                                        Principal
                                        {getSortIcon('principal_amount')}
                                    </button>
                                </TableHead>
                                <TableHead className="text-blue-800 font-semibold whitespace-nowrap">Approved</TableHead>
                                <TableHead className="text-blue-800 font-semibold whitespace-nowrap">Rate</TableHead>
                                <TableHead className="whitespace-nowrap">
                                    <button
                                        onClick={() => handleSort('status')}
                                        className="flex items-center text-blue-800 font-semibold hover:text-amber-300 transition-colors"
                                    >
                                        Status
                                        {getSortIcon('status')}
                                    </button>
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                    <button
                                        onClick={() => handleSort('created_at')}
                                        className="flex items-center text-blue-800 font-semibold hover:text-amber-300 transition-colors"
                                    >
                                        Submitted
                                        {getSortIcon('created_at')}
                                    </button>
                                </TableHead>
                                <TableHead className="text-blue-800 font-semibold text-center whitespace-nowrap">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                        Loading loans...
                                    </TableCell>
                                </TableRow>
                            ) : loans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                        No loans found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                loans.map((loan) => (
                                    <TableRow key={loan.id} className="hover:bg-amber-50 transition-colors">
                                        <TableCell className="font-medium whitespace-nowrap">{loan.loan_number || loan.id}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {loan.borrower
                                                ? `${loan.borrower.first_name} ${loan.borrower.last_name}`
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell className="capitalize whitespace-nowrap">{loan.type}</TableCell>
                                        <TableCell className="whitespace-nowrap">₱{Number(loan.principal_amount).toLocaleString()}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {loan.approved_amount
                                                ? `₱${Number(loan.approved_amount).toLocaleString()}`
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{loan.interest_rate}%</TableCell>
                                        <TableCell className="whitespace-nowrap">{getStatusBadge(loan.status)}</TableCell>
                                        <TableCell className="whitespace-nowrap">{new Date(loan.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-center whitespace-nowrap">
                                            <div className="flex items-center gap-2 justify-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedLoan(loan)
                                                        setIsDetailsOpen(true)
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4 text-blue-500" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedLoan(loan)
                                                        setStatus(loan.status)
                                                        setApprovedAmount(loan.approved_amount ?? "")
                                                        setInterestRate(loan.interest_rate ?? "")
                                                        setNotes(loan.notes ?? "")
                                                        setRejectionReason(loan.rejection_reason ?? "")
                                                        setSelectedLenderId(loan.lender?.id ?? null)
                                                        setShowUpdateModal(true)
                                                    }}
                                                >
                                                    <Edit2 className="h-4 w-4 text-green-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            {/* Pagination */}
            <div className="bg-primary/10 text-blue-800 border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
                {/* Desktop Pagination */}
                <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-blue-800 whitespace-nowrap">
                            Showing {pagination.from} to {pagination.to} of {pagination.total} loans
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

                {/* Mobile Pagination */}
                <div className="sm:hidden space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-blue-800">
                            {pagination.from}-{pagination.to} of {pagination.total}
                        </p>
                        <Select value={perPage} onValueChange={(value) => {
                            setPerPage(value)
                            setPagination(prev => ({ ...prev, current_page: 1 }))
                        }}>
                            <SelectTrigger className="w-[100px] h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination(prev => ({ ...prev, current_page: 1 }))}
                            disabled={pagination.current_page === 1}
                            className="h-8"
                        >
                            <ChevronsLeft className="h-3 w-3 text-blue-800" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                            disabled={pagination.current_page === 1}
                            className="h-8"
                        >
                            <ChevronLeft className="h-3 w-3 text-blue-800" />
                        </Button>
                        <span className="text-xs text-blue-800 px-2">
                            {pagination.current_page} / {pagination.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                            disabled={pagination.current_page === pagination.last_page}
                            className="h-8"
                        >
                            <ChevronRight className="h-3 w-3 text-blue-800" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination(prev => ({ ...prev, current_page: pagination.last_page }))}
                            disabled={pagination.current_page === pagination.last_page}
                            className="h-8"
                        >
                            <ChevronsRight className="h-3 w-3 text-blue-800" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Loan Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
                    <DialogHeader className="bg-primary/10 rounded-t-lg p-6 -m-6 mb-0">
                        <DialogTitle className="text-2xl text-blue-800">Loan Details #{selectedLoan?.loan_number || selectedLoan?.id}</DialogTitle>
                    </DialogHeader>
                    {selectedLoan && (
                        <div className="space-y-4 p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Borrower</label>
                                    <p className="text-gray-900 mt-1">
                                        {selectedLoan.borrower
                                            ? `${selectedLoan.borrower.first_name} ${selectedLoan.borrower.last_name}`
                                            : "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Lender</label>
                                    <p className="text-gray-900 mt-1">
                                        {selectedLoan.lender
                                            ? `${selectedLoan.lender.first_name} ${selectedLoan.lender.last_name}`
                                            : "Unassigned"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Type</label>
                                    <p className="text-gray-900 mt-1 capitalize">{selectedLoan.type}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedLoan.status)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Principal Amount</label>
                                    <p className="text-gray-900 mt-1">₱{Number(selectedLoan.principal_amount).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Approved Amount</label>
                                    <p className="text-gray-900 mt-1">
                                        {selectedLoan.approved_amount
                                            ? `₱${Number(selectedLoan.approved_amount).toLocaleString()}`
                                            : "-"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Interest Rate</label>
                                    <p className="text-gray-900 mt-1">{selectedLoan.interest_rate}%</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Term</label>
                                    <p className="text-gray-900 mt-1">
                                        {selectedLoan.term_months ? `${selectedLoan.term_months} months` : "-"}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-500">Purpose</label>
                                    <p className="text-gray-900 mt-1">{selectedLoan.purpose || "-"}</p>
                                </div>
                                {selectedLoan.notes && (
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-500">Notes</label>
                                        <p className="text-gray-900 mt-1">{selectedLoan.notes}</p>
                                    </div>
                                )}
                                {selectedLoan.rejection_reason && (
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                                        <p className="text-gray-900 mt-1">{selectedLoan.rejection_reason}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Submitted</label>
                                    <p className="text-gray-900 mt-1">
                                        {new Date(selectedLoan.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approve Modal */}
            <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Approve Loan #{selectedLoan?.loan_number || selectedLoan?.id}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Assign Lender (Optional)</Label>
                            <Select value={selectedLenderId?.toString() || ""} onValueChange={(val) => setSelectedLenderId(Number(val))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Lender" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lenders.map((lender) => (
                                        <SelectItem key={lender.id} value={lender.id.toString()}>
                                            {lender.first_name} {lender.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Approved Amount</Label>
                            <Input
                                type="number"
                                placeholder="Approved Amount"
                                value={approvedAmount}
                                onChange={(e) => setApprovedAmount(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>Interest Rate (%)</Label>
                            <Input
                                type="number"
                                placeholder="Interest Rate"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                            />
                        </div>

                        <Button className="w-full" onClick={handleApprove}>
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setShowApproveModal(false)} variant="ghost">
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject Loan #{selectedLoan?.loan_number || selectedLoan?.id}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            placeholder="Rejection Reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <Button className="w-full" onClick={handleReject} variant="destructive">
                            <XCircle className="h-4 w-4 mr-2" /> Reject
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowRejectModal(false)} variant="ghost">
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Activate Modal */}
            <Dialog open={showActivateModal} onOpenChange={setShowActivateModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Activate Loan #{selectedLoan?.loan_number || selectedLoan?.id}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={activateStartDate}
                                onChange={(e) => setActivateStartDate(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label>First Payment Date</Label>
                            <Input
                                type="date"
                                value={activateFirstPaymentDate}
                                onChange={(e) => setActivateFirstPaymentDate(e.target.value)}
                            />
                        </div>

                        <Button className="w-full" onClick={handleActivate} disabled={updating}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {updating ? "Activating..." : "Activate Loan"}
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowActivateModal(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}