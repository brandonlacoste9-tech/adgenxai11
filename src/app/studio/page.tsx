"use client";

import { useState } from "react";
import { Sparkles, Copy, BookmarkPlus, CheckCheck } from "lucide-react";

type AdType = "Social Media Post" | "Banner Ad" | "Email Subject" | "Display Ad" | "Video Script";
type Tone = "Professional" | "Playful" | "Urgent" | "Inspirational" | "Casual";

interface GeneratedAd {
  id: number;
  headline: string;
  body: string;
  cta: string;
}

const sampleResults: Record<string, GeneratedAd[]> = {
  default: [
    {
      id: 1,
      headline: "Transform Your Business with Cutting-Edge AI",
      body: "Stop wasting hours on manual tasks. Our AI platform automates your workflow, saving you 10+ hours every week. Trusted by 50,000+ professionals worldwide.",
      cta: "Start Free Trial →",
    },
    {
      id: 2,
      headline: "The Smart Way to Scale Your Operations",
      body: "Designed for forward-thinking businesses, our solution delivers measurable results from day one. Join thousands of teams already seeing 3x productivity gains.",
      cta: "See It In Action",
    },
    {
      id: 3,
      headline: "Work Less, Achieve More — Guaranteed",
      body: "Our customers report saving an average of $12,000 per year while doubling output. Isn't it time you worked smarter, not harder?",
      cta: "Get Started Today",
    },
  ],
};

export default function StudioPage() {
  const [adType, setAdType] = useState<AdType>("Social Media Post");
  const [audience, setAudience] = useState("");
  const [brand, setBrand] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedAd[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const handleGenerate = () => {
    setIsGenerating(true);
    setResults([]);
    setTimeout(() => {
      setResults(sampleResults.default);
      setIsGenerating(false);
    }, 1800);
  };

  const handleCopy = (ad: GeneratedAd) => {
    const text = `${ad.headline}\n\n${ad.body}\n\n${ad.cta}`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(ad.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (id: number) => {
    setSavedIds((prev) => new Set(prev).add(id));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">AI Studio</h1>
        </div>
        <p className="text-gray-500">
          Describe your campaign and let AI craft compelling ad copy in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">
            Configure Your Ad
          </h2>

          <div className="space-y-4">
            {/* Ad Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ad Type
              </label>
              <select
                value={adType}
                onChange={(e) => setAdType(e.target.value as AdType)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option>Social Media Post</option>
                <option>Banner Ad</option>
                <option>Email Subject</option>
                <option>Display Ad</option>
                <option>Video Script</option>
              </select>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Target Audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Small business owners aged 30–50"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Brand / Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Brand / Product
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Acme Project Management Suite"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Key Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Key Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's the core value or offer you want to communicate?"
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option>Professional</option>
                <option>Playful</option>
                <option>Urgent</option>
                <option>Inspirational</option>
                <option>Casual</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/30 hover:from-brand-600 hover:to-brand-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Ad Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-5">
            Generated Variations
          </h2>

          {results.length === 0 && !isGenerating && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                Fill in the form and click{" "}
                <span className="font-medium text-gray-500">
                  Generate Ad Copy
                </span>{" "}
                to see AI-crafted variations here.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {results.map((ad, index) => (
              <div
                key={ad.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    Variation {index + 1}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(ad)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      title="Copy"
                    >
                      {copiedId === ad.id ? (
                        <CheckCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSave(ad.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        savedIds.has(ad.id)
                          ? "text-brand-600 bg-brand-50"
                          : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                      }`}
                      title="Save"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2">
                  {ad.headline}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {ad.body}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                    CTA: {ad.cta}
                  </span>
                  {savedIds.has(ad.id) && (
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Saved to Gallery
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
