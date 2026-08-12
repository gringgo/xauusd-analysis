import React from 'react';
import { QuickCopyBtn } from './QuickCopyBtn';

export const StructureDataGrid = ({ sbrRbsData, filterType = 'ALL' }: { sbrRbsData: any, filterType?: 'ALL' | 'SNR' | 'SND' }) => {
  if (!sbrRbsData) return null;

  const renderCard = (setup: any, type: string, label: string, isSell: boolean, description: string) => {
    if (!setup) return null;
    
    // Filter by type
    if (filterType === 'SNR' && type !== 'SBR' && type !== 'RBS') return null;
    if (filterType === 'SND' && type !== 'DBD' && type !== 'RBR') return null;

    const bgGradient = isSell 
      ? 'from-red-950/40 via-black to-[#0a0a0a] border-red-900/50' 
      : 'from-emerald-950/40 via-black to-[#0a0a0a] border-emerald-900/50';
    
    const badgeBg = isSell ? 'bg-red-600' : 'bg-emerald-600';
    const textCol = isSell ? 'text-red-300' : 'text-emerald-300';
    const borderCol = isSell ? 'border-red-900/60' : 'border-emerald-900/60';
    
    return (
      <div className={`bg-gradient-to-r ${bgGradient} border rounded-lg p-2.5 space-y-1.5 shadow-sm`}>
        <div className="flex justify-between items-center flex-wrap gap-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-black ${badgeBg} text-white px-2 py-0.5 rounded shadow`}>
              {isSell ? 'SELL' : 'BUY'}
            </span>
            <span className={`text-xs font-bold ${textCol}`}>
              {label}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded">
            WinRate: {setup.winRate || 85}%
          </span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-[11px] text-gray-400">Paras Entry {type}:</span>
          <div className="flex items-center gap-1.5">
            <span className={`font-mono font-extrabold text-sm text-white bg-black px-2 py-0.5 rounded border ${borderCol}`}>
              {setup.price}
            </span>
            <QuickCopyBtn text={setup.price} />
          </div>
        </div>
        <p className="text-[10px] text-gray-400 italic">
          {setup.description || description}
        </p>
      </div>
    );
  };

  const renderTimeframe = (tfLabel: string, dataTf: any, tfKey: string) => {
    if (!dataTf) return null;
    
    const hasSNR = !!dataTf.sbr || !!dataTf.rbs;
    const hasSND = !!dataTf.dbd || !!dataTf.rbr;
    
    if (filterType === 'SNR' && !hasSNR) return null;
    if (filterType === 'SND' && !hasSND) return null;
    if (filterType === 'ALL' && !hasSNR && !hasSND) return null;

    return (
      <div className="bg-[#0e0e0e] border border-gray-800/80 rounded-xl p-3.5 space-y-3">
        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
          <span className="text-[#ffcc00] font-black text-xs tracking-wider flex items-center gap-1.5">
            📊 TIMEFRAME {tfLabel}
          </span>
          <span className="text-[10px] text-gray-400 bg-black px-2 py-0.5 rounded border border-gray-800 font-mono">
            {filterType === 'SNR' ? 'Major SNR' : filterType === 'SND' ? 'SND Struct' : 'Structure'}
          </span>
        </div>
        
        {renderCard(dataTf.sbr, 'SBR', `SBR (${tfLabel})`, true, `Support ${tfLabel} tembus → bertukar jadi Resistance. Cari Rejection Sell.`)}
        {renderCard(dataTf.rbs, 'RBS', `RBS (${tfLabel})`, false, `Resistance ${tfLabel} tembus → bertukar jadi Support. Cari Rejection Buy.`)}
        {renderCard(dataTf.dbd, 'DBD', `DBD (${tfLabel})`, true, `Momentum kejatuhan berehat (Base) sebelum menyambung Drop. Rejection Sell.`)}
        {renderCard(dataTf.rbr, 'RBR', `RBR (${tfLabel})`, false, `Momentum kenaikan berehat (Base) sebelum menyambung Rally. Rejection Buy.`)}
      </div>
    );
  };

  const hasH8 = sbrRbsData.h8 && ((filterType === 'SNR' && (sbrRbsData.h8.sbr || sbrRbsData.h8.rbs)) || (filterType === 'SND' && (sbrRbsData.h8.dbd || sbrRbsData.h8.rbr)) || filterType === 'ALL');
  const hasH4 = sbrRbsData.h4 && ((filterType === 'SNR' && (sbrRbsData.h4.sbr || sbrRbsData.h4.rbs)) || (filterType === 'SND' && (sbrRbsData.h4.dbd || sbrRbsData.h4.rbr)) || filterType === 'ALL');
  const hasH1 = sbrRbsData.h1 && ((filterType === 'SNR' && (sbrRbsData.h1.sbr || sbrRbsData.h1.rbs)) || (filterType === 'SND' && (sbrRbsData.h1.dbd || sbrRbsData.h1.rbr)) || filterType === 'ALL');

  if (!hasH8 && !hasH4 && !hasH1) {
    return (
      <div className="p-4 text-center border-t border-gray-800/80">
        <div className="text-gray-400 text-sm italic py-4 bg-black/40 rounded-lg border border-gray-800/50">
          Tiada struktur {filterType} dikesan buat masa ini.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#111]">
      {renderTimeframe('H8', sbrRbsData.h8, 'h8')}
      {renderTimeframe('H4', sbrRbsData.h4, 'h4')}
      {renderTimeframe('H1', sbrRbsData.h1, 'h1')}
    </div>
  );
};
