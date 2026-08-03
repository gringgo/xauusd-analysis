import React, { useState } from 'react';
import { X, Key, Zap, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck, Globe } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  swissquoteUrl?: string;
  setSwissquoteUrl?: (url: string) => void;
  source: string;
  isConnected: boolean;
  currentPrice: number | null;
}

export const TwelveDataModal: React.FC<Props> = ({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  swissquoteUrl = '',
  setSwissquoteUrl,
  source,
  isConnected,
  currentPrice,
}) => {
  const [activeTab, setActiveTab] = useState<'TWELVEDATA' | 'SWISSQUOTE'>('SWISSQUOTE');
  const [inputKey, setInputKey] = useState(apiKey);
  const [inputSqUrl, setInputSqUrl] = useState(swissquoteUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputKey.trim());
    if (setSwissquoteUrl) {
      setSwissquoteUrl(inputSqUrl.trim());
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#ffcc00]/40 rounded-2xl max-w-md w-full p-5 shadow-[0_0_50px_rgba(255,204,0,0.15)] text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 border-b border-gray-800 pb-3">
          <Zap className="w-6 h-6 text-[#ffcc00] animate-pulse" />
          <div>
            <h3 className="text-base font-black tracking-wide text-white">TETAPAN PRICE FEED XAU/USD</h3>
            <p className="text-[11px] text-gray-400">Pilih / Masukkan API Key bagi Twelve Data atau Swissquote</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-black p-1 rounded-xl border border-gray-800 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('TWELVEDATA')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${activeTab === 'TWELVEDATA' ? 'bg-[#ffcc00] text-black font-black' : 'text-gray-400 hover:text-white'}`}
          >
            ⚡ TWELVE DATA (WS)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SWISSQUOTE')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${activeTab === 'SWISSQUOTE' ? 'bg-[#ffcc00] text-black font-black' : 'text-gray-400 hover:text-white'}`}
          >
            🇨🇭 SWISSQUOTE FEED
          </button>
        </div>

        {/* Status Box */}
        <div className="bg-[#181818] border border-gray-800 rounded-xl p-3.5 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-medium">Harga Live Semasa:</span>
            <span className="font-mono font-black text-lg text-[#ffcc00]">
              {currentPrice ? `$${currentPrice.toFixed(2)}` : 'Memuatkan...'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-medium">Sumber Aktif:</span>
            <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              {source === 'Swissquote' ? '🇨🇭 SWISSQUOTE LIVE' : source === 'TwelveData-WS' ? '⚡ TWELVE DATA WEBSOCKET' : source === 'TwelveData-REST' ? '🌐 TWELVE DATA REST' : source}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-medium">Status Feed:</span>
            {isConnected || source === 'TwelveData-WS' || source === 'Swissquote' || source === 'TwelveData-REST' ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung (Realtime)
              </span>
            ) : (
              <span className="text-yellow-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Menunggu Sambungan Feed
              </span>
            )}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} className="space-y-4">
          {activeTab === 'TWELVEDATA' && (
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#ffcc00]" />
                Twelve Data API Key:
              </label>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Masukkan Twelve Data API Key anda..."
                className="w-full bg-black border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ffcc00] font-mono"
              />
              <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                * Dapatkan API key percuma seumur hidup di{' '}
                <a
                  href="https://twelvedata.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ffcc00] underline inline-flex items-center gap-0.5 hover:text-yellow-300 font-bold"
                >
                  twelvedata.com <ExternalLink className="w-2.5 h-2.5 inline" />
                </a>
              </p>
            </div>
          )}

          {activeTab === 'SWISSQUOTE' && (
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#ffcc00]" />
                Swissquote Price Feed URL / Endpoint:
              </label>
              <input
                type="text"
                value={inputSqUrl}
                onChange={(e) => setInputSqUrl(e.target.value)}
                placeholder="https://api.swissquote.com/... atau custom proxy URL"
                className="w-full bg-black border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ffcc00] font-mono"
              />
              <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                * Swissquote menggunakan pautan API private / FIX feed. Jika anda mempunyai endpoint Swissquote khas, masukkan pautan URL di atas.
              </p>
            </div>
          )}

          {savedSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 p-2.5 rounded-lg text-xs text-emerald-300 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              Tetapan Price Feed berjaya disimpan!
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#ffcc00] hover:bg-yellow-400 text-black font-black py-2.5 rounded-xl text-xs shadow-lg transition-all"
            >
              SIMPAN TETAPAN
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-xl text-xs transition-all"
            >
              TUTUP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
