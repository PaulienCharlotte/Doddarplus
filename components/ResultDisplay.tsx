
import React, { useState } from 'react';
import type { AnalysisResponse, AnalysisContext } from '../types';
import { SummaryIcon } from './icons/SummaryIcon';
import VerduidelijkingsvragenDisplay from './VerduidelijkingsvragenDisplay';
import OnderzoeksDienstenBanner from './ServiceShowcase';
import GedragskenmerkenDisplay from './GedragskenmerkenDisplay';
import { WarningIcon } from './icons/WarningIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import UnauthorizedPathways from './UnauthorizedPathways';
import ImpactOnderbouwingDisplay from './ImpactOnderbouwingDisplay';
import LegalAnalysis from './LegalAnalysis';
import AdviceServicesList from './AdviceServicesList';
import { MessageCircleIcon } from './icons/MessageCircleIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ResultDisplayProps {
  result: AnalysisResponse;
  onReset: () => void;
  onRequestIntake: (context: AnalysisContext | null) => void;
}

type Tab = 'methods' | 'overview' | 'advice';

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset, onRequestIntake }) => {
  const [activeTab, setActiveTab] = useState<Tab>('methods');
  const [shareAnalysis, setShareAnalysis] = useState(true); // Default true for better UX flow
  
  // Safe data access
  const isBevoegd = result?.bevoegdheidscheck?.is_bevoegd ?? false;
  const isMinderjarig = result?.advies?.minderjarig ?? false;
  const samenvatting = result?.samenvatting || "Geen samenvatting beschikbaar.";
  const samengevoegdAdvies = (result?.advies?.veiligheidsadvies || "") + "\n\n" + (result?.advies?.professioneel_advies || "");
  const juridischeOpmerking = result?.advies?.juridische_opmerking || "Geen juridische opmerking beschikbaar.";

  const handleIntakeClick = () => {
      if (shareAnalysis) {
          const context: AnalysisContext = {
              summary: samenvatting,
              advice: samengevoegdAdvies,
              patterns: result.gedragskenmerken || []
          };
          onRequestIntake(context);
      } else {
          onRequestIntake(null);
      }
  };

  const TabButton: React.FC<{ tabId: Tab; label: string }> = ({ tabId, label }) => (
    <button
      role="tab"
      aria-selected={activeTab === tabId}
      aria-controls={`panel-${tabId}`}
      id={`tab-${tabId}`}
      onClick={() => setActiveTab(tabId)}
      className={`px-6 py-4 rounded-t-xl font-semibold text-sm md:text-base transition-colors border-b-2 ${
          activeTab === tabId 
          ? 'bg-white text-[#13261f] border-[#13261f]' 
          : 'bg-transparent text-brand-subtle border-transparent hover:text-brand-secondary hover:bg-brand-surface'
      }`}
    >
      {label}
    </button>
  );
  
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
        {/* Summary Card */}
        <div className="bg-white shadow-lg shadow-brand-accent/20 rounded-2xl p-8 border border-brand-accent space-y-4">
            <div className="flex items-start gap-4">
                <SummaryIcon className="w-8 h-8 text-brand-primary flex-shrink-0 mt-1" />
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-[#13261f]">Samenvatting</h3>
                    <p className="text-brand-text leading-relaxed text-lg max-w-prose">{samenvatting}</p>
                </div>
            </div>
        </div>

        {/* Tabs Container */}
        <div className="bg-white shadow-xl shadow-brand-accent/20 rounded-2xl border border-brand-accent overflow-hidden">
            {/* Tab Header */}
            <div role="tablist" aria-label="Analyse secties" className="bg-[#F9FCFB] border-b border-brand-accent flex gap-2 px-4 pt-4 overflow-x-auto scrollbar-hide">
                <TabButton tabId="methods" label="Onderzoeksmethoden" />
                <TabButton tabId="overview" label="Overzicht & Analyse" />
                <TabButton tabId="advice" label="Advies & Reflectie" />
            </div>

            {/* Methods Panel */}
            <div id="panel-methods" role="tabpanel" aria-labelledby="tab-methods" className={`${activeTab === 'methods' ? 'block' : 'hidden'} p-4 md:p-12`}>
                 {!isBevoegd && (
                    <div className="mb-8">
                        <UnauthorizedPathways />
                    </div>
                  )}
                 <OnderzoeksDienstenBanner recommendations={result.mogelijke_onderzoeksmethoden} />
            </div>
            
            {/* Overview Panel */}
            <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className={`${activeTab === 'overview' ? 'block' : 'hidden'} p-4 md:p-12`}>
                <div className="space-y-10">
                    {isMinderjarig && (
                        <div className="bg-status-danger/5 border-l-4 border-status-danger text-status-danger p-6 rounded-r-xl" role="alert">
                            <div className="flex gap-4">
                                <div className="py-1"><WarningIcon className="h-7 w-7" /></div>
                                <div>
                                    <p className="font-bold text-lg mb-1">Let op: Minderjarige Betrokken</p>
                                    <p className="text-base leading-relaxed">Er is mogelijk een minderjarige bij deze situatie betrokken. Dit vereist extra zorgvuldigheid en kan meldplichten met zich meebrengen.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
                         <div className="space-y-10">
                           <GedragskenmerkenDisplay kenmerken={result.gedragskenmerken} />
                           <ImpactOnderbouwingDisplay onderbouwingen={result.impact_onderbouwing} />
                         </div>
                        <div className="space-y-10">
                           <LegalAnalysis 
                              overtredingen={result.mogelijke_wettelijke_overtredingen} 
                              bevoegdheidscheck={result.bevoegdheidscheck}
                              juridischeOpmerking={juridischeOpmerking} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Advice & Reflection Panel */}
            <div id="panel-advice" role="tabpanel" aria-labelledby="tab-advice" className={`${activeTab === 'advice' ? 'block' : 'hidden'} p-4 md:p-12`}>
                 <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 md:gap-16">
                    <div className="space-y-8">
                        <div className="space-y-5 p-8 bg-[#F9FCFB] rounded-2xl border border-brand-accent shadow-sm">
                            <h3 className="text-xl font-bold text-[#13261f] flex items-center gap-3">
                                <ShieldIcon className="w-6 h-6 text-brand-primary" />
                                Samengevoegd Advies
                            </h3>
                            <div className="text-base text-brand-text whitespace-pre-line leading-loose max-w-prose">
                                {samengevoegdAdvies.trim()}
                            </div>
                        </div>
                        <AdviceServicesList recommendations={result.mogelijke_onderzoeksmethoden} isBevoegd={isBevoegd} />
                    </div>
                    <VerduidelijkingsvragenDisplay vragen={result.aanvullende_vragen} />
                </div>
            </div>
        </div>

      {/* Action Area: Intake vs Reset */}
      <div className="grid md:grid-cols-2 gap-6 mt-8 pb-12">
          {/* Option 1: Intake with conscious choice */}
          <div className="bg-[#E8F5EF] p-8 rounded-2xl border border-[#58B895]/20 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                  <h4 className="font-bold text-[#13261f] text-lg mb-2 flex items-center gap-2">
                      <MessageCircleIcon className="w-5 h-5 text-[#58B895]" />
                      Vervolgstap: Intakegesprek
                  </h4>
                  <p className="text-[#4B5563] text-sm leading-relaxed mb-6">
                      U hoeft uw verhaal niet opnieuw te doen. Kies hieronder hoe u de intake wilt starten:
                  </p>
                  
                  {/* Keuzekaarten */}
                  <div className="grid grid-cols-1 gap-3 mb-6">
                      {/* Keuze A: Met Data */}
                      <div 
                          onClick={() => setShareAnalysis(true)}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative group ${shareAnalysis ? 'bg-white border-[#58B895] shadow-sm' : 'bg-white/40 border-transparent hover:bg-white/60'}`}
                      >
                          <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${shareAnalysis ? 'border-[#58B895] bg-[#58B895] text-white' : 'border-gray-400 bg-transparent'}`}>
                                  {shareAnalysis && <CheckIcon className="w-3 h-3" />}
                              </div>
                              <div>
                                  <span className={`block text-sm font-bold ${shareAnalysis ? 'text-[#13261f]' : 'text-gray-600'}`}>Deel deze analyse</span>
                                  <span className="block text-xs text-[#6B7280]">Efficiënte start, adviseur leest direct mee.</span>
                              </div>
                          </div>
                      </div>

                      {/* Keuze B: Zonder Data */}
                      <div 
                          onClick={() => setShareAnalysis(false)}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative group ${!shareAnalysis ? 'bg-white border-[#58B895] shadow-sm' : 'bg-white/40 border-transparent hover:bg-white/60'}`}
                      >
                          <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!shareAnalysis ? 'border-[#58B895] bg-[#58B895] text-white' : 'border-gray-400 bg-transparent'}`}>
                                  {!shareAnalysis && <CheckIcon className="w-3 h-3" />}
                              </div>
                              <div>
                                  <span className={`block text-sm font-bold ${!shareAnalysis ? 'text-[#13261f]' : 'text-gray-600'}`}>Start blanco</span>
                                  <span className="block text-xs text-[#6B7280]">Geen data delen, verhaal opnieuw doen.</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              <button
                  onClick={handleIntakeClick}
                  className="w-full py-3 bg-[#13261f] hover:bg-[#58B895] text-white font-bold rounded-xl shadow-sm transition-all text-sm flex items-center justify-center gap-2"
              >
                  {shareAnalysis ? 'Plan Intake (met analyse) →' : 'Plan Intake (zonder data) →'}
              </button>
          </div>

          {/* Option 2: Reset */}
          <div className="bg-white p-8 rounded-2xl border border-brand-accent flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                  <h4 className="font-bold text-[#13261f] text-lg mb-2">Nieuwe Analyse</h4>
                  <p className="text-[#4B5563] text-sm leading-relaxed mb-6">
                      Wilt u een andere situatie toetsen? Begin opnieuw met een schone lei. Alle huidige gegevens worden gewist.
                  </p>
              </div>
              <button
                  onClick={onReset}
                  className="w-full py-3 bg-white border border-[#D1D5DB] text-[#13261f] hover:bg-gray-50 font-bold rounded-xl transition-all text-sm"
              >
                  Start Nieuwe Analyse
              </button>
          </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
