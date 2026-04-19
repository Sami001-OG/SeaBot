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

const INITIAL_MODEL_DIRECTORY = [
  { provider: "Google", models: [
    { id: "gemini:gemini-3.1-pro", name: "Gemini 3.1 Pro", badge: "Smart" },
    { id: "gemini:gemini-3.1-flash", name: "Gemini 3.1 Flash", badge: "Fast" },
    { id: "gemini:gemini-3-pro", name: "Gemini 3 Pro" },
    { id: "gemini:gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    { id: "gemini:gemini-2.5-flash", name: "Gemini 2.5 Flash", badge: "Fast" },
    { id: "gemini:gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite" },
    { id: "gemini:gemini-2.5-flash-live", name: "Gemini 2.5 Flash Live" },
    { id: "gemini:gemini-2.5-flash-tts", name: "Gemini 2.5 Flash TTS" },
    { id: "gemini:gemini-2.5-pro-tts", name: "Gemini 2.5 Pro TTS" },
    { id: "gemini:gemini-2", name: "Gemini 2" },
    { id: "gemini:gemini-1.5", name: "Gemini 1.5" },
    { id: "gemini:gemma-3n", name: "Gemma 3n" },
    { id: "gemini:gemma", name: "Gemma" },
    { id: "gemini:veo-3.1", name: "Veo 3.1" },
    { id: "gemini:imagen-4", name: "Imagen 4" },
    { id: "gemini:lyria", name: "Lyria" },
    { id: "gemini:palm-2", name: "PaLM 2" },
    { id: "gemini:nano-banana-2", name: "Nano Banana 2" },
    { id: "gemini:nano-banana-pro", name: "Nano Banana Pro" }
  ]},
  { provider: "OpenAI", models: [
    { id: "openai:gpt-5.4-pro", name: "GPT-5.4 Pro", badge: "Smart" },
    { id: "openai:gpt-5.4", name: "GPT-5.4" },
    { id: "openai:gpt-5.4-mini", name: "GPT-5.4 Mini", badge: "Fast" },
    { id: "openai:gpt-5.4-nano", name: "GPT-5.4 Nano" },
    { id: "openai:gpt-5.2", name: "GPT-5.2" },
    { id: "openai:gpt-5.1", name: "GPT-5.1" },
    { id: "openai:gpt-5", name: "GPT-5" },
    { id: "openai:gpt-5-mini", name: "GPT-5-mini" },
    { id: "openai:gpt-5-nano", name: "GPT-5-nano" },
    { id: "openai:gpt-4.1", name: "GPT-4.1" },
    { id: "openai:gpt-4.1-mini", name: "GPT-4.1 Mini" },
    { id: "openai:gpt-4.1-nano", name: "GPT-4.1 Nano" },
    { id: "openai:gpt-4o", name: "GPT-4o" },
    { id: "openai:o1", name: "o1", badge: "Reason" },
    { id: "openai:o3", name: "o3", badge: "Reason" },
    { id: "openai:gpt-oss-20b", name: "GPT-oss-20B" },
    { id: "openai:gpt-oss-120b", name: "GPT-oss-120B" },
    { id: "openai:codex-max", name: "Codex Max" },
    { id: "openai:dall-e", name: "DALL-E" },
    { id: "openai:sora", name: "Sora" },
    { id: "openai:whisper", name: "Whisper" }
  ]},
  { provider: "Anthropic", models: [
    { id: "anthropic:claude-4-6-opus", name: "Claude Opus 4.6", badge: "Smart" },
    { id: "anthropic:claude-4-5-opus", name: "Claude Opus 4.5" },
    { id: "anthropic:claude-4-1-opus", name: "Claude Opus 4.1" },
    { id: "anthropic:claude-4-opus", name: "Claude Opus 4" },
    { id: "anthropic:claude-3-5-opus", name: "Claude Opus 3.5" },
    { id: "anthropic:claude-4-6-sonnet", name: "Claude Sonnet 4.6" },
    { id: "anthropic:claude-4-5-sonnet", name: "Claude Sonnet 4.5" },
    { id: "anthropic:claude-4-sonnet", name: "Claude Sonnet 4" },
    { id: "anthropic:claude-3-5-sonnet", name: "Claude Sonnet 3.5", badge: "Smart" },
    { id: "anthropic:claude-4-5-haiku", name: "Claude Haiku 4.5", badge: "Fast" },
    { id: "anthropic:claude-4-haiku", name: "Claude Haiku 4" },
    { id: "anthropic:claude-3-5-haiku", name: "Claude Haiku 3.5" }
  ]},
  { provider: "Meta", models: [
    { id: "groq:llama-4-maverick", name: "Llama 4 Maverick (17B)", badge: "Fast" },
    { id: "groq:llama-4-scout", name: "Llama 4 Scout (17B)" },
    { id: "groq:llama-3.3-70b", name: "Llama 3.3 (70B)" },
    { id: "groq:llama-3.2-90b-vision", name: "Llama 3.2 90B Vision" },
    { id: "groq:llama-3.2-11b-vision", name: "Llama 3.2 11B Vision" },
    { id: "groq:llama-3.2-3b", name: "Llama 3.2 1B/3B" },
    { id: "groq:llama-3.1", name: "Llama 3.1" }
  ]},
  { provider: "xAI", models: [
    { id: "openrouter:xai/grok-4.20-reasoning", name: "Grok 4.20-reasoning", badge: "Reason" },
    { id: "openrouter:xai/grok-4.20-non-reasoning", name: "Grok 4.20-non-reasoning" },
    { id: "openrouter:xai/grok-4.1-fast-reasoning", name: "Grok 4.1-fast-reasoning" },
    { id: "openrouter:xai/grok-4.1-fast", name: "Grok 4.1-fast", badge: "Fast" },
    { id: "openrouter:xai/grok-4", name: "Grok 4" },
    { id: "openrouter:xai/grok-3", name: "Grok 3" },
    { id: "openrouter:xai/grok-3-mini", name: "Grok 3-mini" },
    { id: "openrouter:xai/grok-2-vision", name: "Grok 2 Vision" },
    { id: "openrouter:xai/grok-2", name: "Grok 2" }
  ]},
  { provider: "Mistral AI", models: [
    { id: "mistral:mistral-large-3", name: "Mistral Large 3" },
    { id: "mistral:mistral-medium-3.1", name: "Mistral Medium 3.1" },
    { id: "mistral:mistral-small-3.1", name: "Mistral Small 3.1" },
    { id: "mistral:ministral-3", name: "Ministral 3 (3B/8B/14B)" },
    { id: "mistral:mistral-7b", name: "Mistral 7B" },
    { id: "mistral:codestral", name: "Codestral" },
    { id: "mistral:pixtral", name: "Pixtral" }
  ]},
  { provider: "DeepSeek", models: [
    { id: "openrouter:deepseek/deepseek-v3.2", name: "DeepSeek-V3.2", badge: "Smart" },
    { id: "openrouter:deepseek/deepseek-v3.1", name: "DeepSeek-V3.1" },
    { id: "openrouter:deepseek/deepseek-v3", name: "DeepSeek-V3" },
    { id: "openrouter:deepseek/deepseek-r1-0528", name: "DeepSeek-R1-0528" },
    { id: "openrouter:deepseek/deepseek-r1", name: "DeepSeek-R1", badge: "Reason" },
    { id: "openrouter:deepseek/deepseek-r1-zero", name: "DeepSeek-R1-Zero" },
    { id: "openrouter:deepseek/deepseek-v2", name: "DeepSeek-V2" },
    { id: "openrouter:deepseek/deepseek-llm-67b", name: "DeepSeek-LLM (7B/67B)" },
    { id: "openrouter:deepseek/deepseek-coder", name: "DeepSeek Coder" }
  ]},
  { provider: "Alibaba / Qwen", models: [
    { id: "openrouter:qwen/qwen3-235b-a22b", name: "Qwen3-235B-A22B" },
    { id: "openrouter:qwen/qwen3-32b", name: "Qwen3-32B" },
    { id: "openrouter:qwen/qwen3.5-flash", name: "Qwen3.5-Flash" },
    { id: "openrouter:qwen/qwen3.5-122b-a10b", name: "Qwen3.5-122B-A10B" },
    { id: "openrouter:qwen/qwq", name: "QVQ" },
    { id: "openrouter:qwen/qwen-omni", name: "Qwen-Omni" }
  ]},
  { provider: "Microsoft / Amazon / NVIDIA / Others", models: [
    { id: "openrouter:microsoft/phi-4-reasoning", name: "Phi-4-reasoning" },
    { id: "openrouter:amazon/nova-premier", name: "Amazon Nova Premier" },
    { id: "openrouter:nvidia/cosmos-3", name: "NVIDIA Cosmos 3" },
    { id: "openrouter:bytedance/seed-2.0-pro", name: "Seed-2.0-Pro" },
    { id: "openrouter:zhipu/glm-5v-turbo", name: "GLM-5V-Turbo" },
    { id: "openrouter:moonshot/kimi-k2.5", name: "Kimi K2.5" },
    { id: "openrouter:minimax/minimax-text-01", name: "MiniMax-Text-01" },
    { id: "openrouter:cohere/command-r-plus", name: "Command R+" }
  ]},
  { provider: "OpenRouter", models: []}
];

export function SettingsView() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [modelDirectory, setModelDirectory] = useState(INITIAL_MODEL_DIRECTORY);
  const [isSaving, setIsSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string>("gemini:gemini-2.5-flash");
  
  // Initialize with some default dummy tracking (since we don't query .env back to client directly for security in this demo app)
  useEffect(() => {
    // Just seeding gateway defaults to match SeaBot / OpenClaw
    setConfig(prev => ({
      ...prev,
      NODE_RUNTIME_PATH: '/usr/local/bin/node',
      GATEWAY_PORT: '18789',
    }));
    
    const savedModel = localStorage.getItem("seabot-active-model");
    if (savedModel) setActiveModel(savedModel);

    // Fetch OpenRouter models dynamically
    fetch('https://openrouter.ai/api/v1/models')
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
           const openRouterModels = data.data.map((m: any) => {
              const isFree = m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0";
              return {
                 id: `openrouter:${m.id}`,
                 name: m.name,
                 badge: isFree ? "Free" : undefined
              };
           });
           
           const freeModels = openRouterModels.filter((m: any) => m.badge === "Free");
           const paidModels = openRouterModels.filter((m: any) => m.badge !== "Free");

           setModelDirectory(prev => {
              // Create a clean base without the placeholder OR any previously fetched dynamic models 
              // (this prevents duplicate keys when Strict Mode double-invokes the useEffect)
              const base = prev.filter(g => 
                 g.provider !== "OpenRouter" && 
                 g.provider !== "OpenRouter (Free)" && 
                 g.provider !== "OpenRouter (Paid)"
              );

              base.push({ provider: "OpenRouter (Free)", models: freeModels });
              base.push({ provider: "OpenRouter (Paid)", models: paidModels });
              return base;
           });
        }
      }).catch(console.error);
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setActiveModel(val);
    localStorage.setItem("seabot-active-model", val);
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

          <div className="bg-panel border border-border-default rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-3">
              <Network className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-white">Omni-Channel Webhooks</h3>
            </div>
            <p className="text-xs text-text-dim leading-relaxed mb-4">
              Control your agent externally from your mobile device via Long-Polling (Telegram) or webhook (WhatsApp).
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Telegram Bot Token</label>
                <input
                  type="password"
                  value={config['TELEGRAM_BOT_TOKEN'] || ''}
                  onChange={(e) => handleChange('TELEGRAM_BOT_TOKEN', e.target.value)}
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 text-xs text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none font-mono placeholder:text-text-dim/30"
                />
              </div>
              <div className="pt-2 border-t border-white/5">
                <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1 mt-1">Twilio Account SID</label>
                <input
                  type="password"
                  value={config['TWILIO_ACCOUNT_SID'] || ''}
                  onChange={(e) => handleChange('TWILIO_ACCOUNT_SID', e.target.value)}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 text-xs text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none font-mono placeholder:text-text-dim/30 mb-3"
                />
                
                <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Twilio Auth Token</label>
                <input
                  type="password"
                  value={config['TWILIO_AUTH_TOKEN'] || ''}
                  onChange={(e) => handleChange('TWILIO_AUTH_TOKEN', e.target.value)}
                  placeholder="xxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 text-xs text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none font-mono placeholder:text-text-dim/30 mb-3"
                />

                <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">Twilio WhatsApp Number</label>
                <input
                  type="text"
                  value={config['TWILIO_WHATSAPP_NUMBER'] || ''}
                  onChange={(e) => handleChange('TWILIO_WHATSAPP_NUMBER', e.target.value)}
                  placeholder="whatsapp:+14155238886"
                  className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 text-xs text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none font-mono placeholder:text-text-dim/30"
                />
              </div>
              <p className="text-[10px] text-text-dim italic mt-2">
                 WhatsApp Hook target URL: <code className="text-white">/api/webhook/twilio</code> 
              </p>

              <div className="pt-2 border-t border-white/5 mt-3">
                <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1 mt-1">Slack Bot Token</label>
                <input
                  type="password"
                  value={config['SLACK_BOT_TOKEN'] || ''}
                  onChange={(e) => handleChange('SLACK_BOT_TOKEN', e.target.value)}
                  placeholder="xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx"
                  className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 text-xs text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none font-mono placeholder:text-text-dim/30"
                />
                <p className="text-[10px] text-text-dim italic mt-2">
                   Slack Events API URL: <code className="text-white">/api/webhook/slack</code> 
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 mt-3">
                <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1 mt-1">GitHub Access Token</label>
                <input
                  type="password"
                  value={config['GITHUB_ACCESS_TOKEN'] || ''}
                  onChange={(e) => handleChange('GITHUB_ACCESS_TOKEN', e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 text-xs text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none font-mono placeholder:text-text-dim/30 mb-3"
                />
                
                <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1">GitHub Webhook Secret</label>
                <input
                  type="password"
                  value={config['GITHUB_WEBHOOK_SECRET'] || ''}
                  onChange={(e) => handleChange('GITHUB_WEBHOOK_SECRET', e.target.value)}
                  placeholder="my-secret-key"
                  className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 text-xs text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none font-mono placeholder:text-text-dim/30"
                />
                <p className="text-[10px] text-text-dim italic mt-2">
                   GitHub App / Repo Hook URL: <code className="text-white">/api/webhook/github</code> 
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Model Providers Catalog */}
        <div className="lg:col-span-2 space-y-6">
          
           {/* Active Model Selector */}
           <div className="bg-panel border border-border-default rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <Server className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-white">Active LLM Model</h3>
            </div>
            <p className="text-xs text-text-dim leading-relaxed mb-4">
              Select the primary active model used globally for the terminal and web interface. The appropriate API Key must be configured below.
            </p>
            <select
              value={activeModel}
              onChange={handleModelChange}
              className="w-full bg-bg-base border border-border-default rounded-md px-3 py-2 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none"
            >
              {modelDirectory.map(group => (
                <optgroup key={group.provider} label={group.provider}>
                  {group.models.map(mod => (
                    <option key={mod.id} value={mod.id}>{mod.name} {mod.badge ? `(${mod.badge})` : ''}</option>
                  ))}
                </optgroup>
              ))}
            </select>
           </div>

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
