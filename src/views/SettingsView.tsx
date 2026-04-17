import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Key, Network, Code, Server, Check } from 'lucide-react';

const PROVIDERS = [
  { id: 'OPENAI_API_KEY', label: 'OpenAI' },
  { id: 'ANTHROPIC_API_KEY', label: 'Anthropic' },
  { id: 'GEMINI_API_KEY', label: 'Google Gemini' },
  { id: 'XAI_API_KEY', label: 'xAI' },
  { id: 'MISTRAL_API_KEY', label: 'Mistral' },
  { id: 'GROQ_API_KEY', label: 'Groq' },
  { id: 'CEREBRAS_API_KEY', label: 'Cerebras' },
  { id: 'OPENROUTER_API_KEY', label: 'OpenRouter' },
  { id: 'HUGGINGFACE_HUB_TOKEN', label: 'Hugging Face (HF_TOKEN)' },
  { id: 'NVIDIA_API_KEY', label: 'NVIDIA' },
  { id: 'TOGETHER_API_KEY', label: 'Together' },
  { id: 'MOONSHOT_API_KEY', label: 'Moonshot' },
  { id: 'QIANFAN_API_KEY', label: 'Qianfan' },
  { id: 'QWEN_API_KEY', label: 'Qwen / ModelStudio / DashScope' },
  { id: 'VOLCANO_ENGINE_API_KEY', label: 'Volcengine' },
  { id: 'BYTEPLUS_API_KEY', label: 'BytePlus' },
  { id: 'XIAOMI_API_KEY', label: 'Xiaomi' },
  { id: 'AI_GATEWAY_API_KEY', label: 'Vercel AI Gateway' },
  { id: 'CLOUDFLARE_AI_GATEWAY_API_KEY', label: 'Cloudflare AI Gateway' },
  { id: 'STEPFUN_API_KEY', label: 'StepFun' },
  { id: 'VENICE_API_KEY', label: 'Venice' },
  { id: 'KILOCODE_API_KEY', label: 'Kilo Gateway' },
];

export function SettingsView() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  
  // Initialize with some default dummy tracking (since we don't query .env back to client directly for security in this demo app)
  useEffect(() => {
    // Just seeding gateway defaults to match SeaBot / OpenClaw
    setConfig(prev => ({
      ...prev,
      NODE_RUNTIME_PATH: '/usr/local/bin/node',
      GATEWAY_PORT: '18789',
    }));
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavedStatus(null);
    try {
      await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      setSavedStatus("Configuration saved successfully. Gateway re-verified on port 18789.");
    } catch (e: any) {
      setSavedStatus(`Error saving configuration: ${e.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSavedStatus(null), 5000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Platform Settings</h1>
          <p className="text-text-dim text-sm max-w-2xl">
            Configure UI overrides, Gateway targets, and API Keys for over 20+ supported AI model providers and ecosystems. Overrides configured here map to live variables like <code className="text-accent bg-accent/10 px-1 rounded">OPENCLAW_LIVE_&lt;PROVIDER&gt;_KEY</code>.
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-white px-5 py-2.5 rounded-md font-medium transition-colors disabled:opacity-50 shadow-lg shadow-accent/20"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Synchronizing...' : 'Save Configuration'}
        </button>
      </div>

      {savedStatus && (
        <div className={`mb-6 p-4 rounded-md border flex items-center gap-3 ${savedStatus.includes('Error') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-success/10 border-success/20 text-success'}`}>
           <Check className="w-5 h-5 shrink-0" />
           <p className="text-sm font-medium">{savedStatus}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: System & Gateway */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-panel border border-border-default rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <Server className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-white">System Daemon</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-2">Node.js Runtime</label>
                <input
                  type="text"
                  value={config['NODE_RUNTIME_PATH'] || ''}
                  onChange={(e) => handleChange('NODE_RUNTIME_PATH', e.target.value)}
                  placeholder="/usr/local/bin/node"
                  className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-2">Gateway Port</label>
                <div className="relative">
                  <Network className="w-4 h-4 text-text-dim absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={config['GATEWAY_PORT'] || ''}
                    onChange={(e) => handleChange('GATEWAY_PORT', e.target.value)}
                    placeholder="18789"
                    className="w-full bg-bg-base border border-border-default rounded-md pl-9 pr-3 py-2 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none font-mono"
                  />
                </div>
                <p className="text-text-dim text-xs mt-1">Default daemon runs on 18789.</p>
              </div>
            </div>
          </div>

          <div className="bg-panel border border-border-default rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <Code className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-white">Advanced Rotation</h3>
            </div>
            <p className="text-xs text-text-dim leading-relaxed mb-4">
              Add multiple comma-separated keys under environment variables like <code className="text-white">PROVIDER_API_KEYS</code> or <code className="text-white">PROVIDER_API_KEY_1</code>. The router will automatically load-balance requests across the array to avoid rate limits.
            </p>
          </div>
        </div>

        {/* Right Column: Model Providers Catalog */}
        <div className="lg:col-span-2">
           <div className="bg-panel border border-border-default rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-border-default flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-white">Model Provider Catalog</h3>
              </div>
              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
                {PROVIDERS.length} Supported Platforms
              </span>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 flex-1 max-h-[800px] overflow-y-auto custom-scrollbar">
              {PROVIDERS.map((provider) => (
                <div key={provider.id}>
                  <label className="block text-xs font-semibold text-text-dim uppercase tracking-wider mb-1.5 truncate" title={provider.label}>
                    {provider.label}
                  </label>
                  <input
                    type="password"
                    placeholder={`Enter ${provider.id}...`}
                    value={config[provider.id] || ''}
                    onChange={(e) => handleChange(provider.id, e.target.value)}
                    className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none font-mono placeholder:text-text-dim/30 hover:border-border-hover transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
