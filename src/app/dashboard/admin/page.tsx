"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Card } from "@/components/ui/card"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DollarSign, TrendingUp, CreditCard, HandCoins } from "lucide-react"
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend, PointElement, LineElement } from "chart.js"
import { Pie, Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend, PointElement, LineElement)

interface BorrowerUser {
    id: number
    firstName: string
    lastName: string
    email: string
    phone?: string
    city?: string
    postalCode?: string
    created_at?: string
}

interface Loan {
    id: number
    status: string
    approved_amount: number
    outstanding_balance: number
    created_at: string
}

export default function AdminDashboard() {
    const router = useRouter()
    const { authenticated } = useAuth()
    const [users, setUsers] = useState<BorrowerUser[]>([])
    const [loans, setLoans] = useState<Loan[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [activeTab, setActiveTab] = useState<"users" | "pending">("users")

    useEffect(() => {
        if (!authenticated) {
            router.push("/login")
            return
        }
        if (authenticated) fetchAdminData()
    }, [authenticated, router])

    const fetchAdminData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            if (!token) throw new Error("Unauthorized")
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
            const [usersRes, loansRes] = await Promise.all([
                fetch(`${baseUrl}/api/user`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${baseUrl}/api/loans`, { headers: { Authorization: `Bearer ${token}` } }),
            ])
            if (!usersRes.ok) throw new Error("Failed to fetch users")
            if (!loansRes.ok) throw new Error("Failed to fetch loans")
            const usersData = await usersRes.json()
            const loansData = await loansRes.json()
            setUsers(Array.isArray(usersData?.users || usersData?.data || usersData) ? usersData?.users || usersData?.data || usersData : [])
            setLoans(Array.isArray(loansData?.loans || loansData?.data || loansData) ? loansData?.loans || loansData?.data || loansData : [])
        } catch (error) {
            console.error("Admin fetch error:", error)
            localStorage.removeItem("token")
            router.push("/login")
        } finally {
            setLoading(false)
        }
    }

    // Filters
    const filteredUsers = useMemo(() => users.filter(u => `${u.firstName} ${u.email}`.toLowerCase().includes(search.toLowerCase())), [users, search])
    const filteredLoans = useMemo(() => loans.filter(l => l.id.toString().includes(search)), [loans, search])

    // Stats
    const activeLoans = filteredLoans.filter(l => l.status === "approved" && l.outstanding_balance > 0)
    const monthlyVolume = filteredLoans.filter(l => l.status === "approved").reduce((sum, l) => sum + l.approved_amount, 0)
    const repaidLoans = filteredLoans.filter(l => l.status === "approved" && l.outstanding_balance === 0)
    const repaymentRate = filteredLoans.length > 0 ? ((repaidLoans.length / filteredLoans.length) * 100).toFixed(1) : "0"

    // Loan status distribution
    const loanStatusCounts = filteredLoans.reduce<Record<string, number>>((acc, loan) => {
        acc[loan.status] = (acc[loan.status] || 0) + 1
        return acc
    }, {})

    const loanStatusData = {
        labels: Object.keys(loanStatusCounts),
        datasets: [{
            label: "Loans by Status",
            data: Object.values(loanStatusCounts),
            backgroundColor: ["#FBBF24", "#34D399", "#F87171"], // approved, pending, rejected
        }],
    }

    // Monthly loan trends
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const loansByMonth = Array(12).fill(0)
    filteredLoans.forEach(loan => {
        const month = new Date(loan.created_at).getMonth()
        if (loan.status === "approved") loansByMonth[month] += loan.approved_amount
    })
    const monthlyTrendData = {
        labels: monthNames,
        datasets: [{
            label: "Approved Loan Volume",
            data: loansByMonth,
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
        }],
    }

    // Function to handle loan approval/rejection
    const handleLoanAction = async (loanId: number, action: "approve" | "reject") => {
        const confirmMessage = `Are you sure you want to ${action} loan #${loanId}?`
        if (!window.confirm(confirmMessage)) return

        try {
            const token = localStorage.getItem("token")
            if (!token) throw new Error("Unauthorized")
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

            const res = await fetch(`${baseUrl}/api/loans/${loanId}/${action}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!res.ok) throw new Error(`Failed to ${action} loan`)

            // Update state locally without refetching
            setLoans(prev =>
                prev.map(l =>
                    l.id === loanId ? { ...l, status: action === "approve" ? "approved" : "rejected" } : l
                )
            )

            alert(`Loan #${loanId} ${action}d successfully!`)
        } catch (error) {
            console.error(error)
            alert(`Error: Could not ${action} loan.`)
        }
    }

    const pendingApprovals = filteredLoans.filter(l => l.status === "pending")

    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <div className="flex-1 lg:ml-0">
                <div className="lg:hidden h-16" />
                <header className="border-b border-border bg-card">
                    <div className="w-full flex flex-col px-4 sm:px-6 py-4 justify-between">
                        <div className="flex justify-between">
                            <h2 className="text-2xl font-semibold leading-tight">Dashboard</h2>
                            <div className="mt-4 sm:mt-0">
                                <input
                                    type="text"
                                    placeholder="Search users or loan ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full sm:w-80 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                        <div className="block lg:hidden border border-t my-2" />
                    </div>
                </header>

                <main className="p-4 sm:p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total User</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{loading ? "--" : users.length}</p>
                                </div>
                                <div className="p-2 text-gray-500 bg-emerald-100 border-gray-300 rounded-sm">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Loans</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{loading ? "--" : activeLoans.length}</p>
                                </div>
                                <div className="p-2 text-gray-500 bg-emerald-100 border-gray-300 rounded-sm">
                                    <HandCoins className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Monthly Volume</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">
                                        {monthlyVolume.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
                                    </p>
                                </div>
                                <div className="p-2 text-gray-500 bg-emerald-100 border-gray-300 rounded-sm">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Repayment Rate</p>
                                    <p className="text-2xl font-bold text-foreground mt-1">{loading ? "--" : repaymentRate}%</p>
                                </div>
                                <div className="p-2 text-gray-500 bg-emerald-100 border-gray-300 rounded-sm">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Loan Status Distribution */}
                        <Card className="p-6 flex flex-col justify-between" style={{ minHeight: 350 }}>
                            <h2 className="text-lg font-semibold mb-4">Loan Status Distribution</h2>
                            <div className="flex-1">
                                <Pie
                                    data={loanStatusData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'bottom', labels: { padding: 20 } },
                                        },
                                    }}
                                />
                            </div>
                        </Card>

                        {/* Monthly Loan Trends */}
                        <Card className="p-6 flex flex-col justify-between" style={{ minHeight: 350 }}>
                            <h2 className="text-lg font-semibold mb-4">Monthly Loan Trends</h2>
                            <div className="flex-1">
                                <Line
                                    data={monthlyTrendData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'top' },
                                        },
                                        scales: {
                                            x: { grid: { display: false } },
                                            y: { grid: { drawBorder: false } },
                                        },
                                    }}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6">
                        <div className="flex border-b border-border mb-4">
                            <button
                                className={`px-4 py-2 ${activeTab === "users" ? "border-b-2 border-primary font-semibold" : ""}`}
                                onClick={() => setActiveTab("users")}
                            >
                                User Management
                            </button>
                            <button
                                className={`px-4 py-2 ${activeTab === "pending" ? "border-b-2 border-primary font-semibold" : ""}`}
                                onClick={() => setActiveTab("pending")}
                            >
                                Pending Approvals
                            </button>
                        </div>

                        {activeTab === "users" && (
                            <Card className="p-4">
                                {filteredUsers.length === 0 ? (
                                    <p className="text-muted-foreground">No users found.</p>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr>
                                                <th className="p-2 border-b">Name</th>
                                                <th className="p-2 border-b">Email</th>
                                                <th className="p-2 border-b">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map(u => (
                                                <tr key={u.id}>
                                                    <td className="p-2 border-b">{u.first_name} {u.last_name}</td>
                                                    <td className="p-2 border-b">{u.email}</td>
                                                    <td className="p-2 border-b">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "--"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </Card>
                        )}

                        {activeTab === "pending" && (
                            <Card className="p-4">
                                {pendingApprovals.length === 0 ? (
                                    <p className="text-muted-foreground">No pending loans.</p>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr>
                                                <th className="p-2 border-b">Loan ID</th>
                                                <th className="p-2 border-b">User ID</th>
                                                <th className="p-2 border-b">Amount</th>
                                                <th className="p-2 border-b">Applied On</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingApprovals.map(l => (
                                                <tr key={l.id}>
                                                    <td className="p-2 border-b">{l.id}</td>
                                                    <td className="p-2 border-b">{l.id}</td>
                                                    <td className="p-2 border-b">{l.approved_amount.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</td>
                                                    <td className="p-2 border-b">{new Date(l.created_at).toLocaleDateString()}</td>
                                                    <td className="p-2 border-b flex gap-2">
                                                        <button
                                                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                            onClick={() => handleLoanAction(l.id, "approve")}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                            onClick={() => handleLoanAction(l.id, "reject")}
                                                        >
                                                            Reject
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
