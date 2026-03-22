"use client";

import { useState } from "react";
import { Megaphone, Plus, Pencil, Trash2, Pause, Play } from "lucide-react";

type CampaignStatus = "Active" | "Paused" | "Draft";

interface Campaign {
  id: number;
  name: string;
  status: CampaignStatus;
  adsCount: number;
  created: string;
  reach: string;
}

const initialCampaigns: Campaign[] = [
  {
    id: 1,
    name: "Summer Sale 2024",
    status: "Active",
    adsCount: 14,
    created: "Jun 1, 2024",
    reach: "124K",
  },
  {
    id: 2,
    name: "Product Launch — ProSuite v3",
    status: "Active",
    adsCount: 8,
    created: "May 28, 2024",
    reach: "89K",
  },
  {
    id: 3,
    name: "Q2 Retargeting Push",
    status: "Paused",
    adsCount: 22,
    created: "May 15, 2024",
    reach: "201K",
  },
  {
    id: 4,
    name: "Holiday Preview Campaign",
    status: "Draft",
    adsCount: 5,
    created: "May 10, 2024",
    reach: "—",
  },
  {
    id: 5,
    name: "Brand Awareness Q2",
    status: "Active",
    adsCount: 11,
    created: "Apr 30, 2024",
    reach: "310K",
  },
];

const statusStyles: Record<CampaignStatus, string> = {
  Active: "bg-green-100 text-green-700",
  Paused: "bg-yellow-100 text-yellow-700",
  Draft: "bg-gray-100 text-gray-600",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);

  const toggleStatus = (id: number) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          status: c.status === "Active" ? "Paused" : "Active",
        };
      })
    );
  };

  const deleteCampaign = (id: number) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  };

  const addCampaign = () => {
    const newId = Math.max(...campaigns.map((c) => c.id), 0) + 1;
    setCampaigns((prev) => [
      {
        id: newId,
        name: `New Campaign ${newId}`,
        status: "Draft",
        adsCount: 0,
        created: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        reach: "—",
      },
      ...prev,
    ]);
  };

  const activeCount = campaigns.filter((c) => c.status === "Active").length;
  const totalAds = campaigns.reduce((sum, c) => sum + c.adsCount, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Megaphone className="w-5 h-5 text-brand-600" />
            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          </div>
          <p className="text-gray-500">
            Manage and track all your advertising campaigns.
          </p>
        </div>
        <button
          onClick={addCampaign}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-semibold shadow-lg shadow-brand-500/20 hover:from-brand-600 hover:to-brand-800 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500 mb-1">Total Campaigns</p>
          <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500 mb-1">Active Now</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500 mb-1">Total Ads</p>
          <p className="text-2xl font-bold text-gray-900">{totalAds}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Campaign Name
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ads
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Reach
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {campaign.name}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusStyles[campaign.status]
                    }`}
                  >
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{campaign.adsCount}</td>
                <td className="px-6 py-4 text-gray-600">{campaign.reach}</td>
                <td className="px-6 py-4 text-gray-400">{campaign.created}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleStatus(campaign.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      title={
                        campaign.status === "Active"
                          ? "Pause campaign"
                          : "Activate campaign"
                      }
                    >
                      {campaign.status === "Active" ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      title="Edit campaign"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {campaigns.length === 0 && (
          <div className="p-16 text-center">
            <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              No campaigns yet. Click{" "}
              <span className="font-medium text-gray-500">New Campaign</span> to
              get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
