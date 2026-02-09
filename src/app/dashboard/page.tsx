"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import BorrowerDashboard from "../borrower/dashboard/page"
import AdminDashboard from "../admin/dashboard/page"
import LenderDashboard from "../lender/dashboard/page"

export default function DashboardPage() {
  const router = useRouter()
  const { user, authenticated } = useAuth()

  useEffect(() => {
    if (!authenticated) {
      router.push("/")
    }
  }, [authenticated, router])

  const getRoleDashboard = () => {
    switch (user?.role) {
      case "admin":
        return <AdminDashboard />
      case "lender":
        return <LenderDashboard />
      case "borrower":
        return <BorrowerDashboard />
      default:
        return <BorrowerDashboard />
    }
  }

  if (!authenticated) return null

  return getRoleDashboard()
}
