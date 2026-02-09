"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import BorrowerDashboard from "./borrower/page"
import AdminDashboard from "./admin/page"
import LenderDashboard from "./lender/page"

export default function DashboardPage() {
  const router = useRouter()
  const { user, authenticated } = useAuth()

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

  if (!authenticated) {
    router.push("/")
    return null
  }

  return getRoleDashboard()
}

