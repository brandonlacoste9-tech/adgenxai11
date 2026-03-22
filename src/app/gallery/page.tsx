"use client";

import { useState } from "react";
import { Images, Copy, Download, Trash2 } from "lucide-react";

type FilterType = "All" | "Social Media" | "Banner" | "Email" | "Display";

interface AdCard {
  id: number;
  title: string;
  content: string;
  type: FilterType;
  date: string;
  typeColor: string;
}

const adCards: AdCard[] = [
  {
    id: 1,
    title: "Summer Blowout Sale",
    content:
      "☀️ Summer's hottest deals are HERE! Up to 60% off sitewide — but only while supplies last. Don't miss your chance to snag the styles everyone's talking about.",
    type: "Social Media",
    date: "Jun 12, 2024",
    typeColor: "bg-pink-100 text-pink-700",
  },
  {
    id: 2,
    title: "Enterprise SaaS Launch",
    content:
      "Automate. Integrate. Dominate. Our enterprise platform connects your entire stack so your team can focus on what matters. Trusted by 500+ Fortune 1000 companies.",
    type: "Banner",
    date: "Jun 10, 2024",
    typeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 3,
    title: "Last Chance — Deal Expires Tonight",
    content:
      "⏰ Your exclusive 40% discount expires at midnight. This is the last reminder — claim your deal before it's gone forever.",
    type: "Email",
    date: "Jun 9, 2024",
    typeColor: "bg-orange-100 text-orange-700",
  },
  {
    id: 4,
    title: "Fitness App Re-engagement",
    content:
      "Your goals haven't changed — have you? Get back on track with personalized AI workouts and nutrition plans. 10,000 steps start with one. Resume your journey today.",
    type: "Display",
    date: "Jun 8, 2024",
    typeColor: "bg-green-100 text-green-700",
  },
  {
    id: 5,
    title: "B2B Lead Gen — Productivity",
    content:
      "Teams that use our platform close 47% more deals per quarter. See why top-performing sales orgs switch to us and never look back. Book a 15-min demo today.",
    type: "Social Media",
    date: "Jun 7, 2024",
    typeColor: "bg-pink-100 text-pink-700",
  },
  {
    id: 6,
    title: "Flash Sale Banner Copy",
    content:
      "FLASH SALE — 24 HOURS ONLY. Up to 70% off premium electronics. Free same-day shipping on orders over $99. Shop now before it's too late.",
    type: "Banner",
    date: "Jun 5, 2024",
    typeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 7,
    title: "Welcome Series Email",
    content:
      "Welcome aboard! 🎉 You've just unlocked 30 days of free premium access. Here's what you can do right now to make the most of your trial…",
    type: "Email",
    date: "Jun 3, 2024",
    typeColor: "bg-orange-100 text-orange-700",
  },
  {
    id: 8,
    title: "Retargeting — Cart Abandonment",
    content:
      "Still thinking it over? Your cart is saved and your item is almost out of stock. Complete your purchase now and get free express shipping — today only.",
    type: "Display",
    date: "Jun 1, 2024",
    typeColor: "bg-green-100 text-green-700",
  },
];

const filters: FilterType[] = ["All", "Social Media", "Banner", "Email", "Display"];

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (card: AdCard) => {
    navigator.clipboard.writeText(card.content).catch(() => {});
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: number) => {
    setDeletedIds((prev) => new Set(prev).add(id));
  };

  const filtered = adCards.filter(
    (card) =>
      !deletedIds.has(card.id) &&
      (activeFilter === "All" || card.type === activeFilter)
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Images className="w-5 h-5 text-brand-600" />
            <h1 className="text-2xl font-bold text-gray-900">Ad Gallery</h1>
          </div>
          <p className="text-gray-500">
            All your saved and generated ad content in one place.
          </p>
        </div>
        <span className="text-sm text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
          {filtered.length} ads
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === f
                ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                : "bg-white text-gray-600 border border-gray-200 hover:border-brand-300 hover:text-brand-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <Images className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No ads in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${card.typeColor}`}
                >
                  {card.type}
                </span>
                <span className="text-xs text-gray-400">{card.date}</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">
                {card.content}
              </p>
              <div className="flex gap-2 pt-3 border-t border-gray-50">
                <button
                  onClick={() => handleCopy(card)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-brand-300 hover:text-brand-600 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedId === card.id ? "Copied!" : "Copy"}
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-green-300 hover:text-green-600 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Export
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
