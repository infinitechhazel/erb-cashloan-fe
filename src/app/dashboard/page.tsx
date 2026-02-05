"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { BorrowerSidebar } from "@/components/borrower/borrower-sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DollarSign, TrendingUp, Users, FileText, Calendar, Activity, CreditCard, CheckCircle, Clock, BarChart3 } from "lucide-react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { LenderSidebar } from "@/components/lender/lender-sidebar"
import { LoanOfficerSidebar } from "@/components/loan-officer/loan-officer-sidebar"

function StatCard({ title, value, icon, trend, trendValue, iconBg }: any) {
  return (
    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 ${iconBg} rounded-lg`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
              {trendValue}
            </div>
          )}
        </div>
        <p className="text-sm text-slate-600 font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, authenticated } = useAuth()

  const handleLogout = () => {
    // Logout logic here
  }

  const getRoleDashboard = () => {
    switch (user?.role) {
      case "admin":
        return <AdminDashboard onLogout={handleLogout} user={user} />
      case "lender":
        return <LenderDashboard onLogout={handleLogout} user={user} />
      case "borrower":
        return <BorrowerDashboard onLogout={handleLogout} user={user} />
      case "loan_officer":
        return <LoanOfficerDashboard onLogout={handleLogout} user={user} />
      default:
        return <BorrowerDashboard onLogout={handleLogout} user={user} />
    }
  }

  return getRoleDashboard()
}

function AdminDashboard({ onLogout, user }: any) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="w-full flex-1 ml-0 lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white sticky top-16 lg:top-0 z-40 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600 mt-1">Welcome back, {user.firstName}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={onLogout}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Total Loans" 
              value="248" 
              icon={<FileText className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-50"
              trend="up"
              trendValue="12%"
            />
            <StatCard 
              title="Active Users" 
              value="1,250" 
              icon={<Users className="h-6 w-6 text-indigo-600" />}
              iconBg="bg-indigo-50"
              trend="up"
              trendValue="8%"
            />
            <StatCard 
              title="Total Volume" 
              value="$2.5M" 
              icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
              iconBg="bg-emerald-50"
              trend="up"
              trendValue="15%"
            />
            <StatCard 
              title="Repayment Rate" 
              value="94.2%" 
              icon={<TrendingUp className="h-6 w-6 text-violet-600" />}
              iconBg="bg-violet-50"
              trend="up"
              trendValue="2.1%"
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">Recent Loans</h2>
                  <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Loan #{1000 + i}</p>
                          <p className="text-sm text-slate-500">Applied 2 days ago</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">$25,000</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">System Overview</h2>
                  <Activity className="h-5 w-5 text-slate-400" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span className="text-slate-700">Applications Approved</span>
                    </div>
                    <span className="font-semibold text-slate-900">187</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <span className="text-slate-700">Pending Review</span>
                    </div>
                    <span className="font-semibold text-slate-900">23</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span className="text-slate-700">Active Disbursements</span>
                    </div>
                    <span className="font-semibold text-slate-900">38</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function LenderDashboard({ onLogout, user }: any) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <LenderSidebar />
      <main className="w-full flex-1 ml-0 lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white sticky top-16 lg:top-0 z-40 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Lender Dashboard</h1>
                <p className="text-slate-600 mt-1">Manage your investment portfolio</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-500">Lender</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={onLogout}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard 
              title="Portfolio Value" 
              value="$450K" 
              icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
              iconBg="bg-emerald-50"
              trend="up"
              trendValue="5.2%"
            />
            <StatCard 
              title="Active Loans" 
              value="12" 
              icon={<FileText className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-50"
            />
            <StatCard 
              title="Monthly Returns" 
              value="$3,200" 
              icon={<TrendingUp className="h-6 w-6 text-indigo-600" />}
              iconBg="bg-indigo-50"
              trend="up"
              trendValue="3.8%"
            />
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">Your Active Loans</h2>
                  <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Loan #{5000 + i}</p>
                          <p className="text-sm text-slate-500">Principal: ${(Math.random() * 50000 + 20000).toFixed(0)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-emerald-600">6.5% APR</p>
                        <p className="text-xs text-slate-500">Next payment in {Math.floor(Math.random() * 20 + 5)} days</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Performance Metrics</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-medium text-emerald-900">Return Rate</p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-900">8.5%</p>
                    <p className="text-xs text-emerald-700 mt-1">Annual return</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">On-time Payments</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">96.7%</p>
                    <p className="text-xs text-blue-700 mt-1">Reliability score</p>
                  </div>
                  <div className="p-4 bg-violet-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-violet-600" />
                      <p className="text-sm font-medium text-violet-900">Avg Loan Term</p>
                    </div>
                    <p className="text-2xl font-bold text-violet-900">36 mo</p>
                    <p className="text-xs text-violet-700 mt-1">Portfolio average</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function BorrowerDashboard({ onLogout, user }: any) {
  const router = useRouter()

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <BorrowerSidebar />

      {/* Main Content */}
      <main className="w-full flex-1 ml-0 lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white sticky top-16 lg:top-0 z-40 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Borrower Dashboard</h1>
                <p className="text-slate-600 mt-1">Track your loans and payments</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-slate-500">Borrower</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard 
              title="Total Borrowed" 
              value="$50K" 
              icon={<DollarSign className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-50"
            />
            <StatCard 
              title="Active Loans" 
              value="2" 
              icon={<FileText className="h-6 w-6 text-indigo-600" />}
              iconBg="bg-indigo-50"
            />
            <StatCard 
              title="Next Payment" 
              value="$1,250" 
              icon={<Calendar className="h-6 w-6 text-amber-600" />}
              iconBg="bg-amber-50"
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">Your Active Loans</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Apply for New Loan
                  </Button>
                </div>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Personal Loan #{3000 + i}</p>
                            <p className="text-sm text-slate-500">6.5% APR • 36 months</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200">
                        <div>
                          <p className="text-xs text-slate-500">Remaining</p>
                          <p className="text-sm font-semibold text-slate-900">${(25000 - i * 5000).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Next Payment</p>
                          <p className="text-sm font-semibold text-slate-900">Jan {15 + i}, 2026</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">Payment Schedule</h2>
                  <Calendar className="h-5 w-5 text-slate-400" />
                </div>
                <div className="space-y-3">
                  {[
                    { date: 'Jan 15, 2026', amount: '$1,250', status: 'upcoming' },
                    { date: 'Feb 15, 2026', amount: '$1,250', status: 'scheduled' },
                    { date: 'Mar 15, 2026', amount: '$1,250', status: 'scheduled' }
                  ].map((payment, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{payment.date}</p>
                        <p className="text-sm text-slate-500">Monthly payment</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{payment.amount}</p>
                        {payment.status === 'upcoming' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 mt-1">
                            Due Soon
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-slate-900 hover:bg-slate-800">
                  Make a Payment
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function LoanOfficerDashboard({ onLogout, user }: any) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <LoanOfficerSidebar />
      <main className="w-full flex-1 ml-0 lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white sticky top-16 lg:top-0 z-40 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Loan Officer Dashboard</h1>
                <p className="text-slate-600 mt-1">Review and process loan applications</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-500">Loan Officer</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={onLogout}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard 
              title="Loans Processed" 
              value="28" 
              icon={<FileText className="h-6 w-6 text-blue-600" />}
              iconBg="bg-blue-50"
              trend="up"
              trendValue="12%"
            />
            <StatCard 
              title="Pending Applications" 
              value="5" 
              icon={<Clock className="h-6 w-6 text-amber-600" />}
              iconBg="bg-amber-50"
            />
            <StatCard 
              title="Approval Rate" 
              value="87.5%" 
              icon={<CheckCircle className="h-6 w-6 text-emerald-600" />}
              iconBg="bg-emerald-50"
              trend="up"
              trendValue="2.3%"
            />
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900">Pending Applications</h2>
                  <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">John Doe {i}</p>
                            <p className="text-sm text-slate-500">Application #{7000 + i}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          Under Review
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-200">
                        <div>
                          <p className="text-xs text-slate-500">Amount</p>
                          <p className="text-sm font-semibold text-slate-900">${(Math.random() * 50000 + 10000).toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Credit Score</p>
                          <p className="text-sm font-semibold text-slate-900">{Math.floor(Math.random() * 100 + 650)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Submitted</p>
                          <p className="text-sm font-semibold text-slate-900">{i} days ago</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">This Week</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">12</p>
                    <p className="text-xs text-blue-700 mt-1">Applications reviewed</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-medium text-emerald-900">Approved</p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-900">8</p>
                    <p className="text-xs text-emerald-700 mt-1">This month</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-medium text-amber-900">Avg Review Time</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-900">2.3</p>
                    <p className="text-xs text-amber-700 mt-1">Days per application</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}