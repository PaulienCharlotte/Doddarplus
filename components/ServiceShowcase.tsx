
import React from 'react';
import { OsintIcon } from './icons/OsintIcon';
import { ObservationIcon } from './icons/ObservationIcon';
import { InterviewIcon } from './icons/InterviewIcon';
import type { AanbevolenOnderzoeksmethode } from '../types';
import { CheckIcon } from './icons/CheckIcon';

const services = [
  {
    id: "OSINT",
    icon: <OsintIcon className="w-8 h-8 text-[#58B895]" />,
    name: "OSINT Achtergrondonderzoek",
    defaultDesc: "Digitaal onderzoek in openbare bronnen naar achtergronden, netwerken en online voetafdrukken.",
    price: "Vanaf €145",
  },
  {
    id: "Observatie",
    icon: <ObservationIcon className="w-8 h-8 text-[#58B895]" />,
    name: "Observatieonderzoek",
    defaultDesc: "Discreet en feitelijk vastleggen van gedragingen en interacties in de fysieke ruimte.",
    price: "Vanaf €95 / uur",
  },
  {
    id: "Interview",
    icon: <InterviewIcon className="w-8 h-8 text-[#58B895]" />,
    name: "Interviewtechnieken",
    defaultDesc: "Gestructureerde interviews met betrokkenen om waarheid en leugens te onderscheiden.",
    price: "Vanaf €158",
  }
];

interface OnderzoeksDienstenBannerProps {
  recommendations?: AanbevolenOnderzoeksmethode[] | null;
}

const OnderzoeksDienstenBanner: React.FC<OnderzoeksDienstenBannerProps> = ({ recommendations }) => {
  const safeRecommendations = (recommendations || []).filter(Boolean);
  
  const recommendationMap = safeRecommendations.reduce((acc, rec) => {
    if (rec && rec.id) {
      acc[rec.id] = rec;
    }
    return acc;
  }, {} as Record<string, AanbevolenOnderzoeksmethode>);

  const hasRecommendations = safeRecommendations.length > 0;

  return (
    <div className="w-full animate-fade-in">
      <div className="text-center mb-14">
        <h2 className="text-2xl md:text-3xl font-bold text-[#13261f]">
            {hasRecommendations ? "Aanbevolen Onderzoeksmethoden" : "Beschikbare Onderzoeksmethoden"}
        </h2>
        <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto text-base leading-relaxed">
            {hasRecommendations 
                ? "Op basis van de gedragsanalyse en risico-indicatoren sluiten deze methoden het beste aan bij uw situatie."
                : "Bekijk onze gespecialiseerde diensten voor waarheidsvinding."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {services.map((service) => {
          const recommendation = recommendationMap[service.id];
          const isRecommended = !!recommendation;
          const isDimmed = hasRecommendations && !isRecommended;

          return (
            <div 
                key={service.id} 
                className={`
                    relative flex flex-col rounded-3xl transition-all duration-300 h-full group
                    ${isRecommended 
                        ? 'bg-white border-[2px] border-[#58B895] shadow-xl shadow-[#58B895]/10 scale-[1.01] z-10' 
                        : 'bg-[#F9FCFA] border border-[#E5E7EB] shadow-sm hover:shadow-md'
                    }
                    ${isDimmed ? 'opacity-60 grayscale-[0.3] hover:opacity-100 hover:grayscale-0' : ''}
                `}
            >
              {isRecommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#58B895] text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md flex items-center gap-2 whitespace-nowrap z-20">
                      <CheckIcon className="w-3.5 h-3.5" /> Aanbevolen
                  </div>
              )}

              <div className="p-6 md:p-8 flex flex-col h-full">
                  {isRecommended ? (
                      /* AANBEVOLEN LAYOUT: Alles in één blok */
                      <div className="flex-grow bg-[#F2F9F6] p-5 rounded-2xl border border-[#B8E2D1]/40 mb-6 flex flex-col items-center text-center relative">
                          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-[#58B895] shadow-sm mb-4 border border-[#E5E7EB]">
                              {service.icon}
                          </div>
                          
                          <h3 className="font-bold text-[#13261f] text-lg mb-3 leading-tight break-words hyphens-auto w-full">
                              {service.name}
                          </h3>
                          
                          <div className="w-12 h-0.5 bg-[#B8E2D1] rounded-full mb-3"></div>

                          <p className="text-[10px] font-bold text-[#6A9489] mb-1 uppercase tracking-wider">Toepassing</p>
                          <p className="text-sm text-[#374151] leading-relaxed">
                              {recommendation.omschrijving}
                          </p>
                      </div>
                  ) : (
                      /* STANDAARD LAYOUT */
                      <>
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-white border border-[#E5E7EB] rounded-2xl flex items-center justify-center group-hover:border-[#B8E2D1] transition-colors duration-300">
                                {service.icon}
                            </div>
                        </div>

                        <h3 className="font-bold text-[#13261f] text-lg mb-4 text-center leading-tight break-words hyphens-auto px-2">
                            {service.name}
                        </h3>
                        
                        <div className="flex-grow mb-6">
                            <p className="text-sm text-[#6B7280] leading-relaxed text-center px-2">
                                {service.defaultDesc}
                            </p>
                        </div>
                      </>
                  )}

                  {/* Footer (Price only) */}
                  <div className="pt-5 border-t border-[#E5E7EB] mt-auto">
                      <div className="flex items-center justify-end">
                          <div className="flex flex-col items-end">
                              <span className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider">Indicatie</span>
                              <span className="font-bold text-[#13261f] text-lg">{service.price}</span>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-16 text-center">
          <p className="mt-4 text-sm text-[#9CA3AF]">
              Een intake is noodzakelijk om de juridische haalbaarheid en strategie te bepalen.
          </p>
      </div>
    </div>
  );
};

export default OnderzoeksDienstenBanner;
