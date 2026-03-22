import Link from "next/link";
import {
  TrendingUp,
  Users,
  MousePointerClick,
  Calendar,
  Sparkles,
  Images,
  Megaphone,
  ChevronRight,
} from "lucide-react";

const stats = [
  {
    label: "Ads Generated",
    value: "247",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-600",
    change: "+12% this week",
  },
  {
    label: "Active Campaigns",
    value: "12",
    icon: TrendingUp,
    color: "bg-blue-100 text-blue-600",
    change: "+3 this month",
  },
  {
    label: "Avg CTR",
    value: "3.8%",
    icon: MousePointerClick,
    color: "bg-green-100 text-green-600",
    change: "+0.4% vs last month",
  },
  {
    label: "This Month",
    value: "48",
    icon: Calendar,
    color: "bg-orange-100 text-orange-600",
    change: "Ads generated",
  },
];

const recentActivity = [
  {
    name: "Summer Sale Banner",
    type: "Banner Ad",
    status: "Generated",
    time: "2 min ago",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    name: "Product Launch Social Post",
    type: "Social Media",
    status: "Saved",
    time: "18 min ago",
    statusColor: "bg-blue-100 text-blue-700",
  },
  {
    name: "Flash Deal Email Subject",
    type: "Email",
    status: "Generated",
    time: "1 hr ago",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    name: "Brand Awareness Display",
    type: "Display Ad",
    status: "In Campaign",
    time: "3 hrs ago",
    statusColor: "bg-purple-100 text-purple-700",
  },
  {
    name: "Holiday Promo Video Script",
    type: "Video Script",
    status: "Saved",
    time: "Yesterday",
    statusColor: "bg-blue-100 text-blue-700",
  },
];

const quickActions = [
  {
    href: "/studio",
    label: "Open AI Studio",
    desc: "Generate new ad content",
    icon: Sparkles,
    gradient: "from-brand-500 to-brand-700",
  },
  {
    href: "/gallery",
    label: "View Gallery",
    desc: "Browse saved ads",
    icon: Images,
    gradient: "from-purple-500 to-pink-600",
  },
  {
    href: "/campaigns",
    label: "New Campaign",
    desc: "Launch a campaign",
    icon: Megaphone,
    gradient: "from-orange-400 to-rose-500",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to AdGenX AI Studio
        </h1>
        <p className="text-gray-500 mt-1">
          Create compelling ad content powered by AI — faster than ever.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="xl:col-span-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center flex-shrink-0`}
                >
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Performance Overview */}
          <div className="mt-6 bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <h3 className="font-semibold text-sm">Performance Overview</h3>
            </div>
            <p className="text-brand-100 text-xs leading-relaxed">
              Your ads are performing{" "}
              <span className="text-white font-semibold">23% better</span> than
              the industry average. AI-optimized copy is driving higher
              engagement across all campaigns this quarter.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-white/10 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold">89%</p>
                <p className="text-brand-200 text-xs">Approval Rate</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold">2.1x</p>
                <p className="text-brand-200 text-xs">Avg ROI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Activity
            </h2>
            <Link
              href="/gallery"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ad Name
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentActivity.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {item.name}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{item.type}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.statusColor}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Users stat */}
          <div className="mt-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                Audience Insights Active
              </p>
              <p className="text-sm text-gray-500">
                AI is analyzing 3 audience segments for your campaigns.{" "}
                <Link
                  href="/campaigns"
                  className="text-brand-600 hover:underline"
                >
                  View campaigns →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
