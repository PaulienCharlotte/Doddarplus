import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { AnalysisResponse, InitialAnalysisResponse, AnalysisContext } from './types';
import { getInitialAnalysis, getDetailedAnalysis, getRewriteSuggestion } from './services/geminiService';
import { detectPersona } from './utils/persona';
import { PROFILE_DEFAULT_MINOR } from './data/ageProfiles';
import type { AgeProfile } from './data/ageProfiles';
import InputSection from './components/InputSection';
import QuickResult from './components/QuickResult';
import QuestionForm from './components/QuestionForm';
import ResultDisplay from './components/ResultDisplay';
import RecentCasesBanner from './components/RecentCasesBanner';
import MinorModal from './components/MinorModal';
import OverOns from './components/OverOns';
import Contact from './components/Contact';
import Home from './components/Home';
import Diensten from './components/Diensten';
import Klachtenregeling from './components/Klachtenregeling';
import Privacyverklaring from './components/Privacyverklaring';
import AlgemeneVoorwaarden from './components/AlgemeneVoorwaarden';
import Kennisbank from './components/Kennisbank';
import Disclaimer from './components/Disclaimer';
import Footer from './components/Footer';
import Tooltip from './components/Tooltip';
import { InfoIcon } from './components/icons/InfoIcon';
import { WarningIcon } from './components/icons/WarningIcon';
import { CheckIcon } from './components/icons/CheckIcon';
import { MenuIcon } from './components/icons/MenuIcon';
import { XIcon } from './components/icons/XIcon';

type AppStep = 'start' | 'services' | 'questions' | 'result' | 'about' | 'contact' | 'complaints' | 'privacy' | 'terms' | 'knowledge' | 'disclaimer';

interface CaseData {
  description: string;
}

const BevoegdheidscheckModal: React.FC<{
  onClose: () => void;
  onConfirm: () => void;
  onRedirect: () => void;
}> = ({ onClose, onConfirm, onRedirect }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      if (dialogRef.current?.open) dialogRef.current.close();
    };
  }, []);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.currentTarget === event.target) onClose();
  };

  return (
    <dialog ref={dialogRef} className="auth-modal" onClose={onClose} onClick={handleBackdropClick}>
      <div className="auth-modal-content">
        <h2>Zakelijke Context & Mandaat</h2>
        <p>Wij detecteren zakelijke terminologie in uw casus. Voor een formeel bedrijfsrechercheonderzoek is een <strong>mandaat</strong> (bevoegdheid) vereist.</p>
        <p className="auth-modal-info">
          Heeft u geen mandaat (bijv. omdat u een bezorgde collega of privépersoon bent)? Dan herschrijven wij de analyse naar een <strong>persoonlijk veiligheidsperspectief</strong>.
        </p>
        <div className="auth-modal-info flex items-center gap-3">
          <Tooltip content="Een formeel mandaat betekent dat u door uw organisatie bent aangewezen of gemachtigd bent om (juridische of interne) onderzoeken te initiëren. Dit voorkomt schending van privacywetgeving. Binnen bedrijven zijn bevoegd: directieleden, HR-managers, juridisch adviseurs, of compliance officers.">
             <InfoIcon className="w-6 h-6 text-brand-secondary flex-shrink-0" />
          </Tooltip>
          <span>Wat houdt een mandaat in?</span>
        </div>
      </div>
      <div className="auth-modal-footer flex-col sm:flex-row">
        <button className="btn-outline text-sm" onClick={onRedirect}>❌ Nee, dit is privé (Herschrijven)</button>
        <button className="btn-primary text-sm" onClick={onConfirm}>✅ Ja, ik heb mandaat</button>
      </div>
    </dialog>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('start');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  const [caseText, setCaseText] = useState<string>('');
  const [quickResult, setQuickResult] = useState<InitialAnalysisResponse | null>(null);
  const [finalResult, setFinalResult] = useState<AnalysisResponse | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [showMinorModal, setShowMinorModal] = useState<AgeProfile | null>(null);

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [caseForAnalysis, setCaseForAnalysis] = useState<CaseData | null>(null);
  
  // State for rewrite suggestion feature
  const [rewriteSuggestion, setRewriteSuggestion] = useState<string | null>(null);
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [personaOverride, setPersonaOverride] = useState<'private' | null>(null);
  
  // State for question form answers
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, any>>({});

  // State for Kennisbank routing
  const [kennisCategory, setKennisCategory] = useState<string | undefined>(undefined);

  // State for transferring analysis data to contact form
  const [analysisContext, setAnalysisContext] = useState<AnalysisContext | null>(null);

  // NEW: State for auto-scrolling to input tool
  const [autoScrollToInput, setAutoScrollToInput] = useState<boolean>(false);
  // NEW: State for auto-scrolling to services on services page
  const [serviceScrollId, setServiceScrollId] = useState<string | undefined>(undefined);

  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  useEffect(() => {
    const evaluateAuthority = () => {
      const isBusiness = (window as any).doddar_is_business === true;
      const role = ((window as any).doddar_role || '').toLowerCase();
      const mandate = (window as any).doddar_mandate_confirmed === true;
      const authorized = isBusiness && ['owner','director','hr'].includes(role) && mandate;
      setIsAuthorized(authorized);
    };
    
    evaluateAuthority();
    window.addEventListener('doddar:authority:update', evaluateAuthority);
    
    return () => {
      window.removeEventListener('doddar:authority:update', evaluateAuthority);
    };
  }, []);

  const handleNavClick = (targetStep: AppStep, category?: string) => {
    setIsMobileMenuOpen(false); // Close menu on click
    if (targetStep === 'knowledge' && category) {
        setKennisCategory(category);
    } else {
        setKennisCategory(undefined);
    }

    if (targetStep === 'services' && category) {
        setServiceScrollId(category);
    } else {
        setServiceScrollId(undefined);
    }
    
    // Clear analysis context if navigating away unless specifically preserving it (handled separately)
    if (targetStep !== 'contact') {
        setAnalysisContext(null);
    }
    
    setStep(targetStep);
  };

  const handleRequestIntakeWithAnalysis = (context: AnalysisContext) => {
      setAnalysisContext(context);
      setStep('contact');
  };

  const startAnalysis = useCallback(async (description: string, persona: 'business' | 'private') => {
    setIsLoading(true);
    try {
      const result = await getInitialAnalysis(description, persona);
      setQuickResult(result);
      setQuestionAnswers({}); // Reset answers for new questions
      setStep('questions');
    } catch (e) {
      console.error(e);
      setError("Er is een fout opgetreden bij de eerste analyse. Probeer het opnieuw of start een nieuwe analyse.");
      setStep('start');
    } finally {
      setIsLoading(false);
    }
  }, []);


  const handleInitialSubmit = useCallback(async (description: string) => {
    setError(null);
    setCaseText(description);
    setQuickResult(null);
    setRewriteSuggestion(null);

    const persona = personaOverride || detectPersona(description);

    if (persona === 'business') {
      setCaseForAnalysis({ description });
      setShowAuthModal(true);
    } else {
      if (personaOverride) {
        setPersonaOverride(null);
      }
      await startAnalysis(description, 'private');
    }
  }, [startAnalysis, personaOverride]);

  const handleMinorHelpClick = () => {
    setShowMinorModal(PROFILE_DEFAULT_MINOR);
  };

  const handleAuthConfirm = useCallback(() => {
    setShowAuthModal(false);
    if (caseForAnalysis) {
      startAnalysis(caseForAnalysis.description, 'business');
    }
    setCaseForAnalysis(null);
  }, [caseForAnalysis, startAnalysis]);
  
  const handleAuthRedirect = useCallback(async () => {
    if (!caseForAnalysis) return;

    setPersonaOverride('private');
    setShowAuthModal(false);
    setIsRewriting(true);
    setCaseText(caseForAnalysis.description); // Keep original text
    setError(null);

    try {
        const suggestion = await getRewriteSuggestion(caseForAnalysis.description);
        setRewriteSuggestion(suggestion);
    } catch (e) {
        console.error("Rewrite failed", e);
        setError("Kon de tekst niet herschrijven. U kunt de oorspronkelijke tekst zelf aanpassen.");
        setRewriteSuggestion(null);
    } finally {
        setIsRewriting(false);
        setCaseForAnalysis(null);
    }
  }, [caseForAnalysis]);

  const handleAcceptSuggestion = () => {
    if (rewriteSuggestion) {
      setCaseText(rewriteSuggestion);
      setRewriteSuggestion(null);
    }
  };

  const handleDismissSuggestion = () => {
    setRewriteSuggestion(null);
  };

  const handleQuestionSubmit = useCallback(async (answers: Record<string, string>) => {
    setIsLoading(true);
    setError(null);
    setFinalResult(null);

    try {
      const result = await getDetailedAnalysis(caseText, answers);
      setFinalResult(result);
      setStep('result');
    } catch (e) {
      console.error(e);
      const specificError = e instanceof Error ? e.message : 'Controleer de console voor details.';
      setError(`De analyse kon niet worden voltooid. ${specificError} Pas eventueel uw antwoorden aan en probeer het opnieuw.`);
      setStep('questions');
    } finally {
      setIsLoading(false);
    }
  }, [caseText]);
  
  const handleReset = () => {
    setStep('start');
    setQuickResult(null);
    setFinalResult(null);
    setCaseText('');
    setError(null);
    setRewriteSuggestion(null);
    setIsRewriting(false);
    setPersonaOverride(null);
    setQuestionAnswers({});
    setIsMobileMenuOpen(false);
    setAnalysisContext(null);
  };

  const handleStartNewAnalysis = () => {
      handleReset();
      // Enable scroll trigger for Home component
      setAutoScrollToInput(true);
  };
  
  const renderContent = () => {
    if (isLoading && step !== 'start') { 
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-md border border-brand-accent min-h-[50vh] flex-grow mt-8 mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          <p className="mt-4 text-brand-subtle">Analyse wordt uitgevoerd...</p>
        </div>
      );
    }

    switch(step) {
      case 'start':
        return (
            <Home 
              onAnalyze={handleInitialSubmit} 
              onMinorHelp={handleMinorHelpClick}
              isLoading={isLoading && !isRewriting}
              text={caseText}
              onTextChange={setCaseText}
              isRewriting={isRewriting}
              rewriteSuggestion={rewriteSuggestion}
              onAcceptSuggestion={handleAcceptSuggestion}
              onDismissSuggestion={handleDismissSuggestion}
              onOpenComplaints={() => handleNavClick('complaints')}
              onOpenPrivacy={() => handleNavClick('privacy')}
              onOpenTerms={() => handleNavClick('terms')}
              onOpenKnowledge={(cat) => handleNavClick('knowledge', cat)}
              onOpenDisclaimer={() => handleNavClick('disclaimer')}
              onOpenContact={() => handleNavClick('contact')}
              onOpenService={(id) => handleNavClick('services', id)}
              scrollToInput={autoScrollToInput}
              onScrollComplete={() => setAutoScrollToInput(false)}
            />
        );
      case 'services':
        return (
            <Diensten 
                onStartAnalysis={handleStartNewAnalysis}
                onContact={() => handleNavClick('contact')}
                scrollToId={serviceScrollId}
            />
        );
      case 'questions':
        if (quickResult) {
           const vragen = quickResult.verduidelijkingsvragen || [];
           const bevoegdheid = quickResult.bevoegdheid || { is_bevoegd: false, reden: '', advies: '' };
           const isBevoegd = bevoegdheid.is_bevoegd;

           return (
             <div className="space-y-6 w-full max-w-4xl mx-auto px-4 py-10 flex-grow">
                {error && (
                    <div className="p-4 bg-status-danger/10 border-l-4 border-status-danger text-status-danger rounded-r-lg" role="alert">
                        <p className="font-bold">Er is een fout opgetreden</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
               <QuickResult patterns={quickResult.gedragspatronen} />
               
               <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 border border-brand-accent">
                 <div className={`p-4 rounded-lg flex items-start gap-4 ${isBevoegd ? 'bg-status-safe/10 border border-status-safe/30' : 'bg-status-danger/10 border border-status-danger/30'}`}>
                   <div>
                     {isBevoegd ? (
                       <CheckIcon className="w-8 h-8 text-status-safe flex-shrink-0" />
                     ) : (
                       <WarningIcon className="w-8 h-8 text-status-danger flex-shrink-0" />
                     )}
                   </div>
                   <div className="flex-grow">
                     <h4 className={`font-bold ${isBevoegd ? 'text-status-safe' : 'text-status-danger'}`}>
                        {isBevoegd ? 'Bevoegdheid: Waarschijnlijk' : 'Bevoegdheid: Let op'}
                     </h4>
                     <p className="text-sm mt-1">{bevoegdheid.reden}</p>
                     <p className="text-xs mt-2 italic text-brand-text">{bevoegdheid.advies}</p>
                   </div>
                 </div>
               </div>
               
               <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 border border-brand-accent qa-scope">
                 <div className="mb-6">
                    <h2 className="qa-title">Verfijn uw Analyse</h2>
                    <p className="qa-sub">
                        Beantwoord alstublieft minimaal 3 van de onderstaande vragen voor een nauwkeuriger analyse.
                    </p>
                 </div>
                 <div className="qa-grid">
                     <QuestionForm 
                        vragen={vragen} 
                        minAnswersRequired={3} 
                        onSubmit={handleQuestionSubmit}
                        answers={questionAnswers}
                        onAnswersChange={setQuestionAnswers}
                     />
                 </div>
               </div>
             </div>
           );
        }
        return null;
      case 'result':
        return finalResult ? (
            <div className="w-full px-4 py-10 flex-grow">
                <ResultDisplay 
                    result={finalResult} 
                    onReset={handleStartNewAnalysis} 
                    onRequestIntake={handleRequestIntakeWithAnalysis}
                />
            </div>
        ) : null;
      case 'about':
        return <OverOns 
            onStartAnalysis={handleStartNewAnalysis}
        />;
      case 'contact':
        return <Contact 
            initialContext={analysisContext}
            onOpenComplaints={() => handleNavClick('complaints')} 
            onOpenPrivacy={() => handleNavClick('privacy')}
            onOpenTerms={() => handleNavClick('terms')}
            onOpenKnowledge={(cat) => handleNavClick('knowledge', cat)}
            onOpenDisclaimer={() => handleNavClick('disclaimer')}
        />;
      case 'complaints':
        return <Klachtenregeling onBack={() => handleNavClick('start')} />;
      case 'privacy':
        return <Privacyverklaring onBack={() => handleNavClick('start')} />;
      case 'terms':
        return <AlgemeneVoorwaarden onBack={() => handleNavClick('start')} />;
      case 'knowledge':
        return <Kennisbank initialCategory={kennisCategory} />;
      case 'disclaimer':
        return <Disclaimer onBack={() => handleNavClick('start')} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-page-bg flex flex-col font-sans">
      <nav className="sticky top-4 z-50 mx-4 max-w-7xl xl:mx-auto w-[calc(100%-2rem)] bg-black/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
        <div className="px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer" onClick={() => handleNavClick('start')}>
               <img 
                  src="https://raw.githubusercontent.com/PaulienCharlotte/Doddar/refs/heads/main/images/logo%20klein%20donker.svg" 
                  alt="Doddar" 
                  className="h-10 w-auto" 
               />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <button 
                onClick={() => handleNavClick('services')}
                className={`text-sm font-medium transition-colors ${step === 'services' ? 'text-brand-primary' : 'text-gray-300 hover:text-white'}`}
              >
                Diensten
              </button>
              <button 
                onClick={() => handleNavClick('about')}
                className={`text-sm font-medium transition-colors ${step === 'about' ? 'text-brand-primary' : 'text-gray-300 hover:text-white'}`}
              >
                Over Ons
              </button>
              <button 
                onClick={() => handleNavClick('knowledge')}
                className={`text-sm font-medium transition-colors ${step === 'knowledge' ? 'text-brand-primary' : 'text-gray-300 hover:text-white'}`}
              >
                Kennisbank
              </button>
              <button 
                onClick={() => handleNavClick('contact')}
                className={`text-sm font-medium transition-colors ${step === 'contact' ? 'text-brand-primary' : 'text-gray-300 hover:text-white'}`}
              >
                Contact
              </button>
              
              {!isLoading && (
                  <button 
                    onClick={handleStartNewAnalysis}
                    className="ml-4 px-5 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all text-sm"
                  >
                    Nieuwe Analyse
                  </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2 rounded-md hover:bg-white/10 focus:outline-none"
                aria-label="Menu openen"
              >
                {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full mt-2 bg-black border border-white/10 rounded-2xl shadow-xl animate-fade-in overflow-hidden">
            <div className="px-4 pt-2 pb-4 space-y-1">
              <button 
                onClick={() => handleNavClick('services')}
                className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium ${step === 'services' ? 'text-brand-primary bg-white/5' : 'text-gray-300 hover:bg-white/5'}`}
              >
                Diensten
              </button>
              <button 
                onClick={() => handleNavClick('about')}
                className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium ${step === 'about' ? 'text-brand-primary bg-white/5' : 'text-gray-300 hover:bg-white/5'}`}
              >
                Over Ons
              </button>
              <button 
                onClick={() => handleNavClick('knowledge')}
                className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium ${step === 'knowledge' ? 'text-brand-primary bg-white/5' : 'text-gray-300 hover:bg-white/5'}`}
              >
                Kennisbank
              </button>
              <button 
                onClick={() => handleNavClick('contact')}
                className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium ${step === 'contact' ? 'text-brand-primary bg-white/5' : 'text-gray-300 hover:bg-white/5'}`}
              >
                Contact
              </button>
              <button 
                 onClick={handleStartNewAnalysis}
                className="block w-full text-left px-4 py-3 rounded-xl text-base font-bold text-black bg-white hover:bg-gray-200 mt-2"
              >
                Nieuwe Analyse
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow flex flex-col">
        {renderContent()}
      </main>

      <Footer 
        onNavigate={handleNavClick}
        onOpenComplaints={() => handleNavClick('complaints')} 
        onOpenPrivacy={() => handleNavClick('privacy')}
        onOpenTerms={() => handleNavClick('terms')}
        onOpenKnowledge={(cat) => handleNavClick('knowledge', cat)}
        onOpenDisclaimer={() => handleNavClick('disclaimer')}
      />

      {showMinorModal && (
        <MinorModal 
          uiPayload={showMinorModal} 
          onClose={() => setShowMinorModal(null)} 
          onWithAdult={() => setShowMinorModal(null)}
        />
      )}

      {showAuthModal && (
        <BevoegdheidscheckModal
           onClose={() => { setShowAuthModal(false); setCaseForAnalysis(null); }}
           onConfirm={handleAuthConfirm}
           onRedirect={handleAuthRedirect}
        />
      )}
    </div>
  );
};

export default App;