import { Settings, Bell, Shield, Palette, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-1">
        <Settings className="w-5 h-5 text-brand-600" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      <p className="text-gray-500 mb-8">
        Manage your account preferences and application settings.
      </p>

      <div className="max-w-2xl space-y-5">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-gray-800">Profile</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                defaultValue="AdGenX User"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                defaultValue="user@adgenx.ai"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-gray-800">Notifications</h2>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            {[
              "Generation complete alerts",
              "Campaign performance reports",
              "Weekly digest",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span>{item}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  Enabled
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-gray-800">Appearance</h2>
          </div>
          <div className="flex gap-3">
            {["Light", "Dark", "System"].map((mode) => (
              <button
                key={mode}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  mode === "Light"
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-600 hover:border-brand-300"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-gray-800">API Key</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              defaultValue="sk-adgenx-xxxxxxxxxxxxxxxxxxxx"
              className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono"
            />
            <button className="px-4 py-2.5 rounded-lg bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
              Reveal
            </button>
          </div>
        </div>

        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-semibold shadow-lg shadow-brand-500/20 hover:from-brand-600 hover:to-brand-800 transition-all">
          Save Changes
        </button>
      </div>
    </div>
  );
}
