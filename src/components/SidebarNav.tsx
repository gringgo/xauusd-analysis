import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Newspaper, 
  LineChart, 
  Target, 
  Layers, 
  Ruler, 
  Droplets, 
  HistoryIcon, 
  AlertTriangle, 
  Menu, 
  X, 
  ChevronRight, 
  Maximize2, 
  Sliders,
  Flame,
  CheckCircle2,
  Sparkles,
  Camera,
  ClipboardList
} from 'lucide-react';

export interface NavSection {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface SidebarNavProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
  viewMode: 'ALL' | 'FOCUS';
  setViewMode: (mode: 'ALL' | 'FOCUS') => void;
  onOpenNewsModal?: () => void;
  onOpenJournalModal?: () => void;
  onOpenTwelveDataModal?: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  currentPrice?: number;
  marketOpen?: boolean;
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'sec-overview',
    label: 'Dashboard Ringkasan',
    category: 'OVERVIEW',
    icon: <LayoutDashboard className="w-4.5 h-4.5 text-[#ffcc00]" />,
    badge: 'LIVE',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  
  {
    id: 'sec-news-feed',
    label: 'Live News Feed (USD)',
    category: 'BERITA EKONOMI',
    icon: <Newspaper className="w-4.5 h-4.5 text-blue-400" />,
    badge: 'HOT',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  {
    id: 'sec-bias-plan',
    label: 'Bias Utama & Plan Trade',
    category: 'STRATEGI ENTRY',
    icon: <Target className="w-4.5 h-4.5 text-emerald-400" />,
    badge: 'ENTRY',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'sec-manual-setup',
    label: 'Modul Manual Setup',
    category: 'JURNAL SETUP',
    icon: <ClipboardList className="w-4.5 h-4.5 text-blue-400" />,
    badge: 'MANUAL',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  {
    id: 'sec-ob-fvg',
    label: 'Order Block & FVG Zone',
    category: 'SMART MONEY FLOW',
    icon: <Layers className="w-4.5 h-4.5 text-purple-400" />,
    badge: 'SMC',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  {
    id: 'sec-sbr-rbs',
    label: 'SBR / RBS & SND Rajah',
    category: 'TEKNIKAL LUKISAN',
    icon: <Ruler className="w-4.5 h-4.5 text-amber-400" />,
    badge: 'DIAGRAM',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  {
    id: 'sec-liquidity-bos',
    label: 'Liquidity & BOS Structure',
    category: 'STRUKTUR PASARAN',
    icon: <Droplets className="w-4.5 h-4.5 text-indigo-400" />,
    badge: 'LIQ',
    badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'sec-signal-history',
    label: 'Rekod Signal Aktif & Lalu',
    category: 'SIGNAL TRACKING',
    icon: <HistoryIcon className="w-4.5 h-4.5 text-green-400" />,
    badge: 'SIGNALS',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  {
    id: 'sec-news-history',
    label: 'Rekod Impak News Past',
    category: 'LOG HISTORIKAL',
    icon: <HistoryIcon className="w-4.5 h-4.5 text-rose-400" />,
    badge: 'LOG',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  },
  {
    id: 'sec-warning',
    label: 'Peringatan & Disclaimer',
    category: 'RISK MANAGEMENT',
    icon: <AlertTriangle className="w-4.5 h-4.5 text-[#ffcc00]" />,
    badge: 'RISK',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeSection,
  setActiveSection,
  viewMode,
  setViewMode,
  onOpenNewsModal,
  onOpenJournalModal,
  onOpenTwelveDataModal,
  isCollapsed,
  setIsCollapsed,
  currentPrice,
  marketOpen = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setViewMode('FOCUS');
    setMobileMenuOpen(false);

    // Scroll to element smoothly
    setTimeout(() => {
      const elem = document.getElementById(sectionId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <>
      {/* Mobile Top Navigation Toggle Button */}
      <div className="lg:hidden w-full bg-[#0a0a0a] border border-[#b49a45]/30 p-2.5 rounded-xl mb-3 flex items-center justify-between shadow-lg gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#ffcc00]/10 border border-[#ffcc00]/40 text-[#ffcc00] hover:bg-[#ffcc00]/20 transition-all shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="truncate">
            <span className="text-[#ffcc00] font-black text-xs tracking-wider block">MENU</span>
            <span className="text-[10px] text-gray-400 truncate block">
              {NAV_SECTIONS.find(s => s.id === activeSection)?.label || 'Dashboard Utama'}
            </span>
          </div>
        </div>

        {/* Live Price Badge Mobile */}
        {currentPrice && (
          <div className="flex items-center gap-1.5 bg-[#141414] border border-[#ffcc00]/40 px-2.5 py-1 rounded-lg shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[10px] text-gray-400 font-bold hidden sm:inline">LIVE XAUUSD:</span>
            <span className="text-xs font-black text-[#ffcc00] font-mono">${currentPrice.toFixed(2)}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setViewMode(viewMode === 'ALL' ? 'FOCUS' : 'ALL')}
            className="px-2.5 py-1 rounded-md text-[10px] font-black bg-black/60 border border-gray-700 text-gray-300 hover:text-white flex items-center gap-1"
          >
            <Sliders className="w-3 h-3 text-[#ffcc00]" />
            {viewMode === 'ALL' ? 'Mod Full' : 'Mod Tab'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container (Desktop Sticky Sidebar + Mobile Drawer) */}
      <aside
        className={`
          fixed lg:static top-0 lg:top-0 left-0 z-50 lg:z-10 h-screen lg:h-auto
          bg-[#080808] border-r lg:border border-[#b49a45]/30 lg:rounded-2xl
          flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.8)]
          transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0 w-80' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72 xl:w-80'}
          shrink-0 overflow-hidden lg:overflow-visible
        `}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-[#b49a45]/30 bg-gradient-to-r from-[#0d0d0d] via-[#14120a] to-[#0d0d0d] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#ffcc00] to-[#b49a45] text-black font-black text-lg shadow-md shrink-0">
              🪙
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <h3 className="text-[#ffcc00] font-black text-sm sm:text-base tracking-wider truncate">
                  XAUUSD HUB
                </h3>
                <p className="text-xs text-gray-300 font-mono font-semibold truncate">
                  GRINGGO SMC ENGINE
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg bg-black/60 border border-gray-800 text-gray-400 hover:text-[#ffcc00] transition-colors"
            title={isCollapsed ? 'Kembangkan Sidebar' : 'Kecilkan Sidebar'}
          >
            <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg bg-black/60 border border-gray-800 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live XAUUSD Price Widget inside Sidebar */}
        <div 
          onClick={onOpenTwelveDataModal}
          className={`mx-2 my-1.5 p-2.5 rounded-xl border bg-gradient-to-r from-[#0e160e] via-[#121c13] to-[#0e160e] border-emerald-500/40 shadow-lg cursor-pointer hover:border-[#ffcc00]/60 transition-all ${isCollapsed ? 'text-center' : ''}`}
          title="Klik untuk tetapan Twelve Data WebSocket"
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mb-1" />
              <span className="text-[10px] font-mono font-black text-[#ffcc00] leading-none">
                {currentPrice ? `$${currentPrice.toFixed(0)}` : 'LIVE'}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">HARGA LIVE XAUUSD</span>
                  <span className="text-base font-black text-[#ffcc00] font-mono tracking-tight block">
                    {currentPrice ? `$${currentPrice.toFixed(2)}` : 'Menghubung...'}
                  </span>
                </div>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${marketOpen ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
                {marketOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          )}
        </div>

        {/* View Mode Switcher Header */}
        {!isCollapsed && (
          <div className="px-3 py-2 mx-2 my-1.5 bg-black/80 border border-gray-800 rounded-xl flex items-center justify-between text-xs shadow-inner">
            <div className="flex items-center gap-1.5 text-gray-200 font-extrabold text-xs">
              <Maximize2 className="w-3.5 h-3.5 text-[#ffcc00]" />
              PAPARAN:
            </div>
            <div className="flex gap-1 bg-gray-900/90 p-1 rounded-lg border border-gray-800">
              <button
                onClick={() => setViewMode('ALL')}
                className={`px-2.5 py-0.5 rounded text-xs font-black transition-all ${
                  viewMode === 'ALL'
                    ? 'bg-[#ffcc00] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                SEMUA
              </button>
              <button
                onClick={() => setViewMode('FOCUS')}
                className={`px-2.5 py-0.5 rounded text-xs font-black transition-all ${
                  viewMode === 'FOCUS'
                    ? 'bg-[#ffcc00] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                FOKUS
              </button>
            </div>
          </div>
        )}

        {/* Navigation Section Links */}
        <div className="flex-1 overflow-y-auto lg:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-2.5 py-1.5 space-y-1::-webkit-scrollbar]:hidden px-2.5 py-1.5 space-y-1">
          {NAV_SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;

            return (
              <button
                key={sec.id}
                onClick={() => handleNavClick(sec.id)}
                className={`
                  w-full text-left py-2 px-2.5 rounded-xl transition-all flex items-center justify-between gap-2 border
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1c1705] via-[#2a2307] to-[#121003] border-[#ffcc00]/80 text-[#ffcc00] shadow-md shadow-[#ffcc00]/15 font-black'
                      : 'bg-black/40 border-transparent text-gray-300 hover:bg-white/5 hover:text-white hover:border-gray-800 font-semibold'
                  }
                `}
                title={sec.label}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className={`p-1.5 rounded-lg border shrink-0 ${isActive ? 'bg-[#ffcc00]/20 border-[#ffcc00]/60' : 'bg-black/60 border-gray-800'}`}>
                    {sec.icon}
                  </div>

                  {!isCollapsed && (
                    <div className="truncate">
                      <span className={`text-[13px] sm:text-sm tracking-wide block truncate leading-snug ${isActive ? 'font-black text-[#ffcc00]' : 'font-bold text-gray-200'}`}>
                        {sec.label}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono font-semibold block truncate">
                        {sec.category}
                      </span>
                    </div>
                  )}
                </div>

                {!isCollapsed && sec.badge && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border uppercase shrink-0 shadow-sm ${sec.badgeColor}`}>
                    {sec.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Action Footer Buttons */}
        <div className="p-2.5 border-t border-gray-800 bg-[#0a0a0a] space-y-1.5">
          {onOpenNewsModal && (
            <button
              onClick={onOpenNewsModal}
              className={`
                w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/60 py-2 rounded-xl font-black text-xs sm:text-sm transition-all shadow-md
                ${isCollapsed ? 'px-0' : 'px-2.5'}
              `}
              title="Analisis & History News"
            >
              <Flame className="w-4 h-4 text-[#ffcc00] shrink-0" />
              {!isCollapsed && <span>ANALISIS NEWS</span>}
            </button>
          )}

          {onOpenJournalModal && (
            <button
              onClick={onOpenJournalModal}
              className={`
                w-full flex items-center justify-center gap-2 bg-[#111] hover:bg-[#b49a45]/20 text-[#ffcc00] border border-[#b49a45]/50 py-2 rounded-xl font-black text-xs sm:text-sm transition-all
                ${isCollapsed ? 'px-0' : 'px-2.5'}
              `}
              title="Buka Jurnal Trade"
            >
              <Sparkles className="w-4 h-4 text-[#ffcc00] shrink-0" />
              {!isCollapsed && <span>JURNAL TRADE</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
