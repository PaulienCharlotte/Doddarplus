import React, { useState, useMemo, useEffect } from 'react';
import { kennisArticles, KennisArticle } from '../data/kennisArticles';
import { BookIcon } from './icons/BookIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { XIcon } from './icons/XIcon';
import Tag from './Tag';

const ITEMS_PER_PAGE = 9;

// Helper to parse bolding (**text**) inside a string
const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-[#13261f]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// Helper to parse markdown-like structures (paragraphs, bullet lists, bold)
const renderFormattedText = (text: string) => {
  if (!text) return null;

  // Split text into lines to detect lists and paragraphs
  const lines = text.split('\n');

  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) return <br key={index} className="hidden md:block" />; // Skip empty lines visually but keep spacing logic

        // Handle Bullet Points (* or -)
        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
           const content = trimmedLine.substring(2);
           return (
             <div key={index} className="flex items-start gap-3 pl-2 md:pl-4">
               <span className="text-[#58B895] mt-1.5 text-lg leading-none">•</span>
               <span className="text-[#374151] leading-relaxed">{parseBold(content)}</span>
             </div>
           );
        }

        // Handle Numbered Lists (1. )
        if (/^\d+\.\s/.test(trimmedLine)) {
            const [number, ...rest] = trimmedLine.split('.');
            const content = rest.join('.').trim();
            return (
                <div key={index} className="flex items-start gap-3 pl-2 md:pl-4">
                    <span className="font-bold text-[#58B895] mt-0.5 min-w-[1.5rem]">{number}.</span>
                    <span className="text-[#374151] leading-relaxed">{parseBold(content)}</span>
                </div>
            );
        }

        // Standard Paragraph
        return <p key={index} className="text-[#374151] leading-loose">{parseBold(line)}</p>;
      })}
    </div>
  );
};

const ArticleModal: React.FC<{ article: KennisArticle; onClose: () => void }> = ({ article, onClose }) => {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#13261f]/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
                
                {/* Modal Header */}
                <div className="p-8 md:p-10 border-b border-[#E5E7EB] bg-[#F9FCFA] flex justify-between items-start gap-6 sticky top-0 z-10">
                    <div className="pr-12">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="inline-block px-3 py-1 rounded-full bg-[#E8F5EF] text-[#13261f] text-xs font-bold uppercase tracking-wider border border-[#58B895]/20">
                                {article.category}
                            </span>
                            <span className="text-xs font-medium italic text-[#6B7280]">
                                {article.source.year}
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold text-[#13261f] leading-tight">
                            {article.title}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="absolute right-6 top-6 p-2 bg-white hover:bg-[#F2F9F6] rounded-full transition-colors border border-[#E5E7EB] shadow-sm group"
                    >
                        <XIcon className="w-6 h-6 text-[#9CA3AF] group-hover:text-[#58B895]" />
                    </button>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="overflow-y-auto p-8 md:p-12 space-y-8 bg-white">
                    
                    {/* Intro - Lead Paragraph */}
                    <div className="max-w-3xl mx-auto">
                        <div className="text-lg md:text-xl leading-relaxed text-[#4B5563] border-l-4 border-[#58B895] pl-6 italic mb-8">
                            {renderFormattedText(article.content.intro)}
                        </div>

                        {/* Main Analysis - Full Width Reading Experience */}
                        <div className="prose prose-lg prose-stone max-w-none text-[#374151]">
                            {renderFormattedText(article.content.analysis)}
                        </div>
                    </div>

                    {/* Key Points - Subtle Footer Style */}
                    <div className="max-w-3xl mx-auto pt-8 border-t border-[#E5E7EB] mt-8">
                        <h4 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-4">Kerninzichten</h4>
                        <div className="flex flex-wrap gap-3">
                            {article.keyPoints.map((point, idx) => (
                                <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] text-[#4B5563] text-sm font-medium">
                                    <span className="text-[#58B895] mr-2">•</span>
                                    {point}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-[#E5E7EB] bg-[#F9FCFA] flex flex-wrap justify-between items-center gap-4 text-sm">
                    <div className="text-[#6B7280]">
                        <span className="font-bold text-[#13261f] uppercase tracking-wide text-xs">Bron:</span> 
                        <span className="ml-2 font-medium">{article.source.author}</span>
                        {article.source.journal && <span className="italic text-[#9CA3AF]"> — {article.source.journal}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Kennisbank: React.FC<{ initialCategory?: string }> = ({ initialCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alles');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<KennisArticle | null>(null);

  useEffect(() => {
      if (initialCategory) {
          setSelectedCategory(initialCategory);
      }
  }, [initialCategory]);

  const categories = useMemo(() => {
      const cats = new Set(kennisArticles.map(a => a.category));
      return ['Alles', ...Array.from(cats).sort()];
  }, []);

  const filteredArticles = useMemo(() => {
    return kennisArticles.filter(article => {
      const searchLower = searchTerm.toLowerCase();
      const categoryLower = selectedCategory.toLowerCase();
      
      const matchesSearch = 
        article.title.toLowerCase().includes(searchLower) ||
        article.summary.toLowerCase().includes(searchLower) ||
        article.content.intro.toLowerCase().includes(searchLower);
      
      const matchesCategory = 
        selectedCategory === 'Alles' || 
        article.category.toLowerCase() === categoryLower;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F9FCFA] text-brand-text animate-fade-in pb-24">
      
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-[#F2F9F6] to-[#F9FCFA] -z-10"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#E8F5EF]/50 to-transparent -z-10 rounded-bl-[10rem]"></div>

      {/* Hero Header */}
      <section className="relative pt-16 pb-12 md:pt-24 md:pb-20 max-w-5xl mx-auto px-6 text-center">
          <span className="inline-block py-1 px-4 rounded-full bg-[#E8F5EF] border border-[#58B895]/20 text-[#58B895] text-xs font-bold uppercase tracking-widest mb-8">
              Kenniscentrum
          </span>
          <div className="relative max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl lg:text-6xl text-[#13261f] font-medium leading-tight md:leading-snug italic">
                  <span className="text-[#58B895] block text-6xl md:text-8xl absolute -top-8 -left-4 md:-left-12 opacity-20 font-serif">“</span>
                  Onderbouwing is de brug tussen vermoeden en zekerheid.
                  <span className="text-[#58B895] block text-6xl md:text-8xl absolute -bottom-12 -right-4 md:-right-12 opacity-20 font-serif transform rotate-180">“</span>
              </h1>
          </div>
      </section>

      {/* Intro & Search Block - STRUCTURED LAYOUT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 mb-24">
        <section className="relative bg-white rounded-[2rem] md:rounded-[3rem] border border-[#E5E7EB] shadow-xl overflow-hidden group">
            
            <div className="relative z-10 p-6 md:p-14 grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                
                {/* Linkerkolom: Tekst & Zoeken */}
                <div className="space-y-8 w-full min-w-0 relative z-20">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#13261f] mb-4">Wetenschap & Praktijk</h2>
                        <p className="text-lg text-[#4B5563] leading-loose font-light max-w-lg">
                            Doddar baseert haar methodiek op gevalideerde wetenschappelijke inzichten. In deze bibliotheek vindt u achtergrondartikelen over gedragsanalyse, fraude-indicatoren en juridische kaders.
                        </p>
                    </div>

                    {/* Search & Filter Controls */}
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-[#E5E7EB] p-2 shadow-sm w-full">
                        <div className="relative w-full mb-3">
                            <input 
                            type="text" 
                            placeholder="Zoek op trefwoord..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#F9FAFB] border-transparent focus:bg-white focus:border-[#58B895] focus:ring-4 focus:ring-[#58B895]/10 outline-none transition-all placeholder:text-gray-400 text-[#13261f] font-medium text-base"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-4 top-1/2 -translate-y-1/2 text-[#58B895]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        
                        <div className="flex gap-2 overflow-x-auto pb-2 px-1 w-full scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                                        selectedCategory.toLowerCase() === cat.toLowerCase()
                                        ? 'bg-[#13261f] text-white border-[#13261f] shadow-md' 
                                        : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#58B895] hover:text-[#58B895]'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Rechterkolom: Visuals Area (Dedicated Space) */}
                <div className="hidden lg:block relative h-full min-h-[300px]">
                    {/* 1. EARTH - Background / Context */}
                    <img 
                        src="https://raw.githubusercontent.com/PaulienCharlotte/Doddar/refs/heads/main/images/kennis%20earth%20trans.svg" 
                        alt="" 
                        className="absolute top-0 right-0 w-48 h-auto object-contain opacity-20 pointer-events-none" 
                    />
                    
                    {/* 2. DNA - Connection */}
                    <img 
                        src="https://raw.githubusercontent.com/PaulienCharlotte/Doddar/refs/heads/main/images/kennis%20DNA%20trans.svg" 
                        alt="" 
                        className="absolute top-10 left-10 w-32 h-auto object-contain opacity-60 pointer-events-none transform -rotate-12" 
                    />

                    {/* 3. BRAIN - Focus Point */}
                    <img 
                        src="https://raw.githubusercontent.com/PaulienCharlotte/Doddar/refs/heads/main/images/kennis%20brein.svg" 
                        alt="" 
                        className="absolute bottom-0 right-10 w-64 h-auto object-contain drop-shadow-lg hover:scale-105 transition-transform duration-700 pointer-events-none" 
                    />
                </div>
            </div>
        </section>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Results Grid */}
        {paginatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {paginatedArticles.map((article) => (
                <div 
                    key={article.id} 
                    onClick={() => setSelectedArticle(article)}
                    className="group bg-white rounded-[2rem] border border-[#E5E7EB] shadow-sm hover:shadow-xl hover:shadow-[#58B895]/10 transition-all duration-300 flex flex-col cursor-pointer h-full hover:-translate-y-1 overflow-hidden"
                >
                    <div className="p-8 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <span className="inline-block px-3 py-1 rounded-md bg-[#F2F9F6] text-[#13261f] text-xs font-bold uppercase tracking-wider truncate max-w-[180px]">
                                {article.category}
                            </span>
                        </div>

                        <h3 className="font-bold text-2xl text-[#13261f] mb-4 leading-tight group-hover:text-[#58B895] transition-colors line-clamp-3">
                            {article.title}
                        </h3>

                        <p className="text-[#6B7280] text-base leading-relaxed mb-8 line-clamp-4 flex-grow font-light">
                            {article.summary}
                        </p>

                        <div className="pt-6 border-t border-[#F3F4F6] flex justify-between items-center mt-auto">
                            <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest group-hover:text-[#58B895] transition-colors">Lees Analyse</span>
                            <div className="w-10 h-10 rounded-full bg-[#F9FAFB] flex items-center justify-center border border-[#E5E7EB] group-hover:bg-[#58B895] group-hover:border-[#58B895] group-hover:text-white transition-all">
                                <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-[#E5E7EB]">
                <div className="inline-flex p-6 rounded-full bg-[#F9FAFB] mb-6">
                    <BookIcon className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-[#13261f] mb-2">Geen resultaten</h3>
                <p className="text-[#6B7280]">We konden geen artikelen vinden voor "{searchTerm}".</p>
                <button 
                    onClick={() => {setSearchTerm(''); setSelectedCategory('Alles');}} 
                    className="mt-6 text-[#58B895] font-bold hover:text-[#13261f] transition-colors underline decoration-2 underline-offset-4"
                >
                    Reset filters
                </button>
            </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
            <div className="mt-20 flex justify-center items-center gap-6">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-4 rounded-2xl bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm text-[#13261f]"
                >
                    <ChevronDownIcon className="w-5 h-5 rotate-90" />
                </button>
                
                <span className="text-sm font-medium text-[#6B7280] italic">
                    Pagina <span className="font-bold text-[#13261f] not-italic font-sans text-lg mx-1">{currentPage}</span> van {totalPages}
                </span>

                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-4 rounded-2xl bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm text-[#13261f]"
                >
                    <ChevronDownIcon className="w-5 h-5 -rotate-90" />
                </button>
            </div>
        )}
      </div>

      {selectedArticle && (
          <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}

    </div>
  );
};

export default Kennisbank;