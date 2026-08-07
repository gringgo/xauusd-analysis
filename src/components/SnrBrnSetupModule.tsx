import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, CheckCircle2, Save, FileText } from 'lucide-react';

interface SetupRecord {
  id: string;
  date: string;
  pair: string;
  sopType: 'SOP1' | 'SOP2';
  
  // Shared fields
  sl: string;
  tp1: string;
  tp2: string;
  tp3: string;
  tp4: string;
  tp5: string;

  // SOP 1 Fields
  htfTrend?: string;
  htfSnrBrn?: string;
  htfFvgImb?: string;
  crsHtf?: string;
  ltfStructure?: string;
  ltfMss?: string;
  fiboPo?: string;

  // SOP 2 Fields
  majorZone?: string;
  confirmationCrs?: string;
}

export const SnrBrnSetupModule = ({ sbrRbsData, currentPrice }: { sbrRbsData?: any, currentPrice?: number }) => {
  const [records, setRecords] = useState<SetupRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [detectedZones, setDetectedZones] = useState<{name: string, price: string, desc: string}[]>([]);

  // Form states
  const [sopType, setSopType] = useState<'SOP1' | 'SOP2'>('SOP1');
  const [pair, setPair] = useState('XAUUSD');
  
  // SOP 1 States
  const [htfTrend, setHtfTrend] = useState('Uptrend');
  const [htfSnrBrn, setHtfSnrBrn] = useState('Support');
  const [htfFvgImb, setHtfFvgImb] = useState('Ada FVG');
  const [crsHtf, setCrsHtf] = useState('Bullish Engulfing');
  const [ltfStructure, setLtfStructure] = useState('RBR (Rally Base Rally)');
  const [ltfMss, setLtfMss] = useState('Valid MSS (Breakout)');
  const [fiboPo, setFiboPo] = useState('PO1 (0.618 - 0.786)');

  // SOP 2 States
  const [majorZone, setMajorZone] = useState('Major SNR (RBS/SBR)');
  const [confirmationCrs, setConfirmationCrs] = useState('Engulfing');
  
  // Fixed values based on user request
  const sl = 'Tetap 50 pip';
  const tp1 = '50 pips';
  const tp2 = '70 pips';
  const tp3 = '90 pips';
  const tp4 = '110 pips';
  const tp5 = '130 pips';

  useEffect(() => {
    const zones: {name: string, price: string, desc: string}[] = [];
    if (sbrRbsData) {
      ['h8', 'h4', 'h1'].forEach(tf => {
        if (sbrRbsData[tf]) {
          if (sbrRbsData[tf].sbr) {
            zones.push({
              name: `${tf.toUpperCase()} SBR`,
              price: sbrRbsData[tf].sbr.price,
              desc: sbrRbsData[tf].sbr.description || 'Zon SBR (Support → Resistance) untuk Sell'
            });
          }
          if (sbrRbsData[tf].rbs) {
            zones.push({
              name: `${tf.toUpperCase()} RBS`,
              price: sbrRbsData[tf].rbs.price,
              desc: sbrRbsData[tf].rbs.description || 'Zon RBS (Resistance → Support) untuk Buy'
            });
          }
        }
      });
    }

    if (currentPrice && currentPrice > 0) {
      const p = Number(currentPrice);
      const lowerBRN = Math.floor(p / 10) * 10;
      const upperBRN = Math.ceil(p / 10) * 10;
      const majorLower = Math.floor(p / 50) * 50;
      const majorUpper = Math.ceil(p / 50) * 50;

      if (upperBRN !== lowerBRN) {
        zones.push({
          name: `BRN Upper (Resistance)`,
          price: upperBRN.toFixed(2),
          desc: `Angka bulat terdekat di atas harga (${p.toFixed(2)})`
        });
        zones.push({
          name: `BRN Lower (Support)`,
          price: lowerBRN.toFixed(2),
          desc: `Angka bulat terdekat di bawah harga (${p.toFixed(2)})`
        });
      }

      if (majorUpper !== upperBRN) {
        zones.push({
          name: `BIG BRN ${majorUpper} (Major Resistance)`,
          price: majorUpper.toFixed(2),
          desc: `Big Round Number utama $50`
        });
      }
      if (majorLower !== lowerBRN) {
        zones.push({
          name: `BIG BRN ${majorLower} (Major Support)`,
          price: majorLower.toFixed(2),
          desc: `Big Round Number utama $50`
        });
      }
    }

    setDetectedZones(zones);

    if (zones.length > 0) {
      const topZoneStr = `${zones[0].name} @ ${zones[0].price}`;
      setMajorZone(topZoneStr);
      setHtfSnrBrn(topZoneStr);
    }
  }, [sbrRbsData, currentPrice]);

  useEffect(() => {
    const saved = localStorage.getItem('gringgo_snr_brn_setups_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecords(parsed);
      } catch (e) {}
    }
  }, []);

  const generateSingleSetupForZone = (z: {name: string, price: string, desc: string}, type: 'SOP1' | 'SOP2' = 'SOP1'): SetupRecord => {
    const isSell = z.name.includes('SBR') || z.name.includes('Resistance');
    const isBuy = !isSell;

    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: new Date().toLocaleString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }),
      pair: 'XAUUSD',
      sopType: type,
      sl: 'Tetap 50 pip',
      tp1: '50 pips',
      tp2: '70 pips',
      tp3: '90 pips',
      tp4: '110 pips',
      tp5: '130 pips',
      ...(type === 'SOP1' ? {
        htfTrend: isBuy ? 'Uptrend / Support Rejection' : 'Downtrend / Resistance Rejection',
        htfSnrBrn: `${z.name} @ ${z.price}`,
        htfFvgImb: 'Ada FVG + Imbalance',
        crsHtf: isBuy ? 'Bullish Engulfing' : 'Bearish Engulfing',
        ltfStructure: isBuy ? 'RBR (Rally Base Rally)' : 'DBD (Drop Base Drop)',
        ltfMss: 'Valid MSS (Breakout)',
        fiboPo: 'PO1 (0.618 - 0.786)'
      } : {
        majorZone: `${z.name} @ ${z.price}`,
        confirmationCrs: isBuy ? 'Bullish Engulfing Rejection' : 'Bearish Engulfing Rejection'
      })
    };
  };

  const autoGenerateAllSetups = () => {
    if (detectedZones.length === 0) return;
    const newGenerated: SetupRecord[] = [];
    
    detectedZones.forEach(z => {
      newGenerated.push(generateSingleSetupForZone(z, 'SOP1'));
      newGenerated.push(generateSingleSetupForZone(z, 'SOP2'));
    });

    const updated = [...newGenerated, ...records];
    setRecords(updated);
    localStorage.setItem('gringgo_snr_brn_setups_v2', JSON.stringify(updated));
  };

  // Auto-generate setups automatically if no records exist yet
  useEffect(() => {
    if (detectedZones.length > 0 && records.length === 0) {
      const autoSetups: SetupRecord[] = [];
      detectedZones.slice(0, 4).forEach(z => {
        autoSetups.push(generateSingleSetupForZone(z, 'SOP1'));
        autoSetups.push(generateSingleSetupForZone(z, 'SOP2'));
      });
      setRecords(autoSetups);
      localStorage.setItem('gringgo_snr_brn_setups_v2', JSON.stringify(autoSetups));
    }
  }, [detectedZones]);

  const saveRecord = () => {
    const newRecord: SetupRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }),
      pair,
      sopType,
      sl,
      tp1,
      tp2,
      tp3,
      tp4,
      tp5,
      ...(sopType === 'SOP1' ? {
        htfTrend,
        htfSnrBrn,
        htfFvgImb,
        crsHtf,
        ltfStructure,
        ltfMss,
        fiboPo
      } : {
        majorZone,
        confirmationCrs
      })
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem('gringgo_snr_brn_setups_v2', JSON.stringify(updated));
    setShowForm(false);
  };

  const deleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    localStorage.setItem('gringgo_snr_brn_setups_v2', JSON.stringify(updated));
  };

  return (
    <div className="bg-[#0a0a0a] rounded-2xl border border-orange-500/30 overflow-hidden shadow-2xl flex flex-col h-full max-h-[85vh]">
      <div className="bg-gradient-to-r from-orange-950 via-black to-orange-950 px-4 py-3 border-b border-orange-500/30 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-orange-400" />
          <h2 className="text-sm font-black text-white tracking-wide">MODUL JURNAL SETUP</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={autoGenerateAllSetups}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-black transition-all shadow-md shadow-emerald-950/50"
            title="Auto-jana setup trade untuk semua zon SNR & BRN yang aktif secara automatik"
          >
            ⚡ Auto-Jana Setup Trade
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-orange-900/50"
          >
            {showForm ? 'Kembali' : <><Plus className="w-4 h-4" /> Setup Manual</>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {/* Panel Zon Auto-Dikesan (H8, H4, H1 & BRN) - Sentiasa Kelihatan */}
        <div className="bg-gradient-to-br from-orange-950/40 via-black to-orange-950/20 p-4 rounded-xl border border-orange-500/40 shadow-lg">
          <div className="flex items-center justify-between mb-3 border-b border-orange-500/20 pb-2">
            <h4 className="text-sm font-black text-orange-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ZON AUTOMATIK HTF (H8, H4, H1 & BRN)
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={autoGenerateAllSetups}
                className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold transition-all flex items-center gap-1"
              >
                ⚡ Jana Semua ({detectedZones.length})
              </button>
            </div>
          </div>

          {detectedZones.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {detectedZones.map((z, idx) => {
                const zoneVal = `${z.name} @ ${z.price}`;
                const isSelected = majorZone === zoneVal || htfSnrBrn === zoneVal;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-orange-600/30 border-orange-400 shadow-md shadow-orange-950/50' 
                        : 'bg-black/60 border-orange-500/20 hover:border-orange-500/60'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] text-orange-300 font-bold truncate">{z.name}</span>
                        {isSelected && <span className="text-[8px] bg-orange-500 text-black px-1 py-0.2 rounded font-black shrink-0">DIPILIH</span>}
                      </div>
                      <div className="text-base sm:text-lg font-black text-white font-mono tracking-tight">{z.price}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5 line-clamp-1">{z.desc}</div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const s1 = generateSingleSetupForZone(z, 'SOP1');
                        const s2 = generateSingleSetupForZone(z, 'SOP2');
                        const updated = [s1, s2, ...records];
                        setRecords(updated);
                        localStorage.setItem('gringgo_snr_brn_setups_v2', JSON.stringify(updated));
                      }}
                      className="mt-2 text-[10px] bg-orange-500/20 hover:bg-orange-500/40 text-orange-300 border border-orange-500/30 font-bold py-1 px-2 rounded text-center transition-all flex items-center justify-center gap-1"
                    >
                      ⚡ Auto-Jana Setup
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-gray-400 bg-black/50 p-3 rounded border border-gray-800 text-center">
              Sedang mengira zon HTF (H8, H4, H1 & BRN)...
            </div>
          )}
          <div className="text-[10px] text-gray-400 flex items-center justify-between mt-2.5 pt-2 border-t border-gray-800/80">
            <span>* Dikemaskini secara automatik mengikut carta masa nyata.</span>
            <span className="text-emerald-400 font-semibold">Klik "⚡ Auto-Jana Setup" untuk buat setup automatik tanpa manual</span>
          </div>
        </div>

        {showForm ? (
          <div className="max-w-2xl mx-auto space-y-6 bg-[#111] p-5 sm:p-6 rounded-xl border border-gray-800">
            <div className="border-b border-gray-800 pb-3 mb-4">
              <h3 className="text-orange-400 font-bold text-lg flex items-center gap-2"><FileText className="w-5 h-5"/> Dokumentasi Setup Baru</h3>
              <p className="text-gray-400 text-xs mt-1">Pilih jenis SOP dan isi butiran setup.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Pair</label>
                  <input type="text" value={pair} onChange={e => setPair(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Pilih SOP</label>
                  <select value={sopType} onChange={e => setSopType(e.target.value as any)} className="w-full bg-black border border-orange-500/50 rounded-lg px-3 py-2 text-orange-400 font-bold text-sm focus:border-orange-500 outline-none">
                    <option value="SOP1">SOP 1: Standard (MSS + Fibo)</option>
                    <option value="SOP2">SOP 2: AFA CRS (2nd Movement)</option>
                  </select>
                </div>
              </div>

              {sopType === 'SOP1' && (
                <>
                  <div className="bg-black/50 p-4 rounded-lg border border-gray-800 space-y-4">
                    <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> 1. HTF (High Timeframe)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Trend</label>
                        <select value={htfTrend} onChange={e => setHtfTrend(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none">
                          <option>Uptrend</option>
                          <option>Downtrend</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">SNR / BRN (Auto)</label>
                        <select value={htfSnrBrn} onChange={e => setHtfSnrBrn(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none">
                          {detectedZones.length > 0 && (
                            <optgroup label="📍 Zon Auto-Dikesan">
                              {detectedZones.map((z, i) => (
                                <option key={i} value={`${z.name} @ ${z.price}`}>{z.name} @ {z.price}</option>
                              ))}
                            </optgroup>
                          )}
                          <optgroup label="Pilihan Manual">
                            <option value="Support">Support</option>
                            <option value="Resistance">Resistance</option>
                            <option value="BRN (Bulat)">BRN (Bulat)</option>
                          </optgroup>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">FVG / IMB</label>
                        <select value={htfFvgImb} onChange={e => setHtfFvgImb(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none">
                          <option>Ada FVG</option>
                          <option>Tiada FVG</option>
                          <option>Imbalance Besar</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/50 p-4 rounded-lg border border-gray-800 space-y-4">
                    <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> 2. CRS HTF (Candlestick Reversal Signal)</h4>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">Jenis Reversal</label>
                      <select value={crsHtf} onChange={e => setCrsHtf(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none">
                        <option>Bullish Engulfing</option>
                        <option>Bearish Engulfing</option>
                        <option>Morning Star</option>
                        <option>Evening Star</option>
                        <option>Pin Bar / Hammer</option>
                        <option>Shooting Star</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-black/50 p-4 rounded-lg border border-gray-800 space-y-4">
                    <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> 3. LTF (Low Timeframe)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Struktur</label>
                        <select value={ltfStructure} onChange={e => setLtfStructure(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none">
                          <option>RBR (Rally Base Rally)</option>
                          <option>DBD (Drop Base Drop)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">Pecahan Struktur (MSS)</label>
                        <select value={ltfMss} onChange={e => setLtfMss(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none">
                          <option>Valid MSS (Breakout)</option>
                          <option>CHoCH Valid</option>
                          <option>Belum Break</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/50 p-4 rounded-lg border border-gray-800 space-y-4">
                    <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> 4. Fibo</h4>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">Fibo Level</label>
                      <select value={fiboPo} onChange={e => setFiboPo(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none">
                        <option>PO1 (0.618 - 0.786)</option>
                        <option>PO2 (0.5 - 0.618)</option>
                        <option>PO3 (0.382 - 0.5)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {sopType === 'SOP2' && (
                <>
                  <div className="bg-black/50 p-4 rounded-lg border border-gray-800 space-y-4">
                    <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500"/> 1. Tentukan Kawasan Utama (Auto-Masuk Zon)</h4>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">Zon SNR / BRN / FVG Utama</label>
                      <select value={majorZone} onChange={e => setMajorZone(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none">
                        {detectedZones.length > 0 && (
                          <optgroup label="📍 Zon Auto-Dikesan (SBR / RBS / BRN)">
                            {detectedZones.map((z, i) => (
                              <option key={i} value={`${z.name} @ ${z.price}`}>{z.name} @ {z.price}</option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="Pilihan Kategori Umum">
                          <option value="Major SNR (RBS/SBR)">Major SNR (RBS/SBR)</option>
                          <option value="Big Round Number (BRN)">Big Round Number (BRN)</option>
                          <option value="FVG + IMB">FVG + IMB</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="bg-black/50 p-4 rounded-lg border border-gray-800 space-y-4">
                    <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500"/> 2. Confirmation Pertama (Tunggu CRS Rejection)</h4>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1">CRS Rejection (Kalau tiada CRS = tiada signal)</label>
                      <select value={confirmationCrs} onChange={e => setConfirmationCrs(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none">
                        <option>Engulfing</option>
                        <option>Morning Star</option>
                        <option>Evening Star</option>
                        <option>Hammer</option>
                        <option>Shooting Star</option>
                        <option>Tiada CRS (Batal)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-black/50 p-4 rounded-lg border border-gray-800 space-y-4">
                <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-red-500"/> Target (Sama setiap trade)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Stop Loss (SL)</label>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm font-mono">{sl}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Take Profit 1 (TP1)</label>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm font-mono">{tp1}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Take Profit 2 (TP2)</label>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm font-mono">{tp2}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Take Profit 3 (TP3)</label>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm font-mono">{tp3}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Take Profit 4 (TP4)</label>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm font-mono">{tp4}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Take Profit 5 (TP5)</label>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm font-mono">{tp5}</div>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={saveRecord} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-6">
              <Save className="w-5 h-5" /> Simpan Jurnal Setup
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {records.length === 0 ? (
              <div className="text-center py-16 bg-[#111] rounded-xl border border-gray-800">
                <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <h3 className="text-gray-400 font-bold text-lg">Tiada Rekod Jurnal</h3>
                <p className="text-gray-500 text-sm mt-1">Sila tambah setup baru untuk mula mendokumentasi trade anda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {records.map(r => (
                  <div key={r.id} className="bg-[#111] border border-gray-800 hover:border-orange-500/50 rounded-xl p-4 transition-all group relative">
                    <button 
                      onClick={() => deleteRecord(r.id)}
                      className="absolute top-3 right-3 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex justify-between items-start mb-3 border-b border-gray-800 pb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-orange-500/20 text-orange-400 text-[10px] font-black px-2 py-0.5 rounded uppercase border border-orange-500/30">
                            {r.pair}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${r.sopType === 'SOP1' ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/50' : 'bg-blue-900/40 text-blue-400 border-blue-500/50'}`}>
                            {r.sopType === 'SOP1' ? 'SOP 1 (STANDARD)' : 'SOP 2 (AFA CRS)'}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-1">{r.date}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      {r.sopType === 'SOP1' ? (
                        <>
                          <div className="flex justify-between items-center border-b border-gray-800 pb-1">
                            <span className="text-gray-500">✅ HTF:</span>
                            <span className="text-gray-300 font-bold truncate max-w-[150px] text-right">{r.htfTrend} • {r.htfSnrBrn} • {r.htfFvgImb}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-gray-800 pb-1">
                            <span className="text-gray-500">✅ CRS HTF:</span>
                            <span className="text-gray-300 font-bold">{r.crsHtf}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-gray-800 pb-1">
                            <span className="text-gray-500">✅ LTF:</span>
                            <span className="text-gray-300 font-bold truncate max-w-[150px] text-right">{r.ltfStructure} • {r.ltfMss}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-gray-800 pb-1">
                            <span className="text-gray-500">✅ Fibo:</span>
                            <span className="text-orange-400 font-bold">{r.fiboPo}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center border-b border-gray-800 pb-1">
                            <span className="text-gray-500">1. Kawasan:</span>
                            <span className="text-gray-300 font-bold truncate max-w-[150px] text-right">{r.majorZone}</span>
                          </div>
                          <div className="flex justify-between items-center border-b border-gray-800 pb-1">
                            <span className="text-gray-500">2. CRS Conf:</span>
                            <span className="text-blue-400 font-bold">{r.confirmationCrs}</span>
                          </div>
                        </>
                      )}
                      
                      <div className="grid grid-cols-3 gap-1 pt-2">
                        <div className="bg-black border border-gray-800 p-1.5 rounded text-center">
                          <div className="text-[9px] text-gray-500">SL</div>
                          <div className="text-[10px] text-red-400 font-bold whitespace-nowrap overflow-hidden text-ellipsis px-1">{r.sl}</div>
                        </div>
                        <div className="bg-black border border-gray-800 p-1.5 rounded text-center">
                          <div className="text-[9px] text-gray-500">TP1</div>
                          <div className="text-[10px] text-emerald-400 font-bold">{r.tp1}</div>
                        </div>
                        <div className="bg-black border border-gray-800 p-1.5 rounded text-center">
                          <div className="text-[9px] text-gray-500">TP2</div>
                          <div className="text-[10px] text-emerald-400 font-bold">{r.tp2}</div>
                        </div>
                        <div className="bg-black border border-gray-800 p-1.5 rounded text-center">
                          <div className="text-[9px] text-gray-500">TP3</div>
                          <div className="text-[10px] text-emerald-400 font-bold">{r.tp3}</div>
                        </div>
                        <div className="bg-black border border-gray-800 p-1.5 rounded text-center">
                          <div className="text-[9px] text-gray-500">TP4</div>
                          <div className="text-[10px] text-emerald-400 font-bold">{r.tp4}</div>
                        </div>
                        <div className="bg-black border border-gray-800 p-1.5 rounded text-center">
                          <div className="text-[9px] text-gray-500">TP5</div>
                          <div className="text-[10px] text-emerald-400 font-bold">{r.tp5}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
