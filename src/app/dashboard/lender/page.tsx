"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LenderSidebar } from "@/components/lender/lender-sidebar"
import { DollarSign, TrendingUp, FileText } from "lucide-react"

interface User {
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
    loan_number: string
    outstanding_balance: number
    type: string
    principal_amount: number
    approved_amount: number
    interest_rate: number
    term_months: number
    status: string
    created_at: string
    updated_at: string
    next_payment_date?: string
    borrower?: { first_name: string; last_name: string }
}

interface LoanStats {
    totalBorrowed: number
    monthlyPayment: number
    outstandingBalance: number
    nextPayment: string | null
}

export default function LenderDashboard() {
    const router = useRouter()
    const { authenticated, loading: authLoading } = useAuth()
    const [user, setUser] = useState<User | null>(null)
    const [loans, setLoans] = useState<Loan[]>([])
    const [activeLoans, setActiveLoans] = useState<Loan[]>([])
    const [loanStats, setLoanStats] = useState<LoanStats>({
        totalBorrowed: 0,
        monthlyPayment: 0,
        outstandingBalance: 0,
        nextPayment: null,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authenticated && !authLoading) {
            router.push("/login")
            return
        }
        if (authenticated) {
            fetchUserAndLoans()
        }
    }, [authenticated, authLoading, router])

    const fetchUserAndLoans = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            if (!token) throw new Error("Unauthorized")

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

            // Fetch authenticated user
            const userRes = await fetch(`${baseUrl}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!userRes.ok) throw new Error("Failed to fetch user")
            const userData = await userRes.json()
            const u = userData.user || userData
            setUser({
                id: u.id,
                firstName: u.first_name,
                lastName: u.last_name,
                email: u.email,
                phone: u.phone,
                city: u.city,
                postalCode: u.postal_code,
                created_at: u.created_at,
            })

            // Fetch lender loans
            const loansRes = await fetch(`${baseUrl}/api/lenders/me/loans`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!loansRes.ok) throw new Error("Failed to fetch loans")
            const loansData = await loansRes.json()
            const loanList: Loan[] = loansData.loans || []

            // Compute stats
            let totalBorrowed = 0
            let monthlyPayment = 0
            let outstandingBalance = 0
            let nextPayment: string | null = null

            const active = loanList.filter(
                (l) => l.status.toLowerCase() === "approved" && Number(l.outstanding_balance) > 0
            )

            loanList.forEach((l) => {
                totalBorrowed += Number(l.approved_amount)
                outstandingBalance += Number(l.outstanding_balance)
            })

            active.forEach((l) => {
                monthlyPayment +=
                    Number(l.approved_amount) / Number(l.term_months) +
                    (Number(l.approved_amount) * Number(l.interest_rate)) / 100 / Number(l.term_months)

                if (!nextPayment && l.next_payment_date) {
                    nextPayment = l.next_payment_date
                }
            })

            setLoanStats({ totalBorrowed, monthlyPayment, outstandingBalance, nextPayment })
            setActiveLoans(active)
            setLoans(loanList)
        } catch (err: any) {
            console.error("Dashboard fetch error:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        const token = localStorage.getItem("token")
        if (token) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            })
        }
        localStorage.removeItem("token")
        router.push("/login")
    }

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex">
            <LenderSidebar />
            <div className="flex-1">
                <header className="border-b border-border bg-card">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-primary">LoanHub Lender</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                {user?.firstName} {user?.lastName}
                            </span>
                            <Button variant="outline" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                                <p className="text-xl font-bold">
                                    {loanStats.totalBorrowed.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
                                </p>
                            </div>
                            <DollarSign className="h-6 w-6 text-emerald-600" />
                        </Card>

                        <Card className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active Loans</p>
                                <p className="text-xl font-bold">{activeLoans.length}</p>
                            </div>
                            <FileText className="h-6 w-6 text-blue-600" />
                        </Card>

                        <Card className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Monthly Returns</p>
                                <p className="text-xl font-bold">
                                    {loanStats.monthlyPayment.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
                                </p>
                            </div>
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </Card>
                    </div>

                    {/* Active Loans Table */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Your Loans</h2>
                        {activeLoans.length === 0 ? (
                            <p className="text-muted-foreground">No active loans yet.</p>
                        ) : (
                            <table className="w-full text-left table-auto border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-2 text-sm text-muted-foreground">Type</th>
                                        <th className="px-4 py-2 text-sm text-muted-foreground">Approved Amount</th>
                                        <th className="px-4 py-2 text-sm text-muted-foreground">Outstanding</th>
                                        <th className="px-4 py-2 text-sm text-muted-foreground">Interest Rate</th>
                                        <th className="px-4 py-2 text-sm text-muted-foreground">Term</th>
                                        <th className="px-4 py-2 text-sm text-muted-foreground">Status</th>
                                        <th className="px-4 py-2 text-sm text-muted-foreground">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeLoans.map((loan) => (
                                        <tr key={loan.id} className="border-b border-gray-100">
                                            <td className="px-4 py-2">{loan.type}</td>
                                            <td className="px-4 py-2">
                                                {Number(loan.approved_amount).toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
                                            </td>
                                            <td className="px-4 py-2">
                                                {Number(loan.outstanding_balance).toLocaleString("en-PH", { style: "currency", currency: "PHP" })}
                                            </td>
                                            <td className="px-4 py-2">{loan.interest_rate}%</td>
                                            <td className="px-4 py-2">{loan.term_months} months</td>
                                            <td className="px-4 py-2 capitalize">{loan.status}</td>
                                            <td className="px-4 py-2">{new Date(loan.created_at).toLocaleDateString("en-PH")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>
                </main>
            </div>
        </div>
    )
}
