import React from 'react';

interface HomePageProps {
  onSignIn: () => void;
  onStartAnalysis: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSignIn, onStartAnalysis }) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xl font-bold">
                <span className="text-white">Forensi</span>
                <span className="text-cyan-400">AI</span>
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-slate-300 hover:text-cyan-400 transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-slate-300 hover:text-cyan-400 transition-colors">
                How It Works
              </button>
              <button onClick={() => scrollToSection('supported-files')} className="text-slate-300 hover:text-cyan-400 transition-colors">
                Supported Files
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button 
                onClick={onSignIn}
                className="text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={onStartAnalysis}
                className="bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-lg shadow-cyan-500/20"
              >
                Start Analysis
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-6">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-cyan-400 text-sm font-medium">AI-Powered Digital Forensics</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-white">Transform UFDR Reports</span>
            <br />
            <span className="text-cyan-400">Into Actionable</span>
            <br />
            <span className="text-cyan-400">Intelligence</span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            ForensiAI automatically extracts, analyzes, and summarizes key insights from forensic data. Find evidence faster. Investigate smarter.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStartAnalysis}
              className="bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload UFDR File
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="bg-slate-900 border border-slate-700 hover:border-cyan-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">100x</div>
              <div className="text-slate-400 text-sm">Faster Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">50K+</div>
              <div className="text-slate-400 text-sm">Cases Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">99.9%</div>
              <div className="text-slate-400 text-sm">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-white">Powerful </span>
              <span className="text-cyan-400">AI</span>
              <span className="text-white"> Analysis</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              ForensiAI examines extracted data and provides actionable insights for faster and smarter investigations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Instant UFDR Parsing</h3>
              <p className="text-slate-400">
                Automatically extract chats, calls, contacts, browser data, app activity, and more from UFDR files.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Conversation Summaries</h3>
              <p className="text-slate-400">
                AI-powered analysis provides meaningful summaries without reading thousands of messages.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Unified Timeline</h3>
              <p className="text-slate-400">
                See all events — chats, calls, media, app activity — in one chronological timeline.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Relationship Graph</h3>
              <p className="text-slate-400">
                Visualize communication patterns, group dynamics, and suspicious connections.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Automated Red Flags</h3>
              <p className="text-slate-400">
                Highlight threatening messages, fraud indicators, and unusual behavior automatically.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Activity Patterns</h3>
              <p className="text-slate-400">
                Detect behavioral patterns and AI risk scoring to focus on what truly matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-white">How It </span>
              <span className="text-cyan-400">Works</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From raw forensic data to actionable intelligence in four simple steps.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-cyan-500/30" style={{ top: '6rem' }}></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 border-2 border-dashed border-cyan-500 rounded-full w-24 h-24"></div>
                    <div className="relative w-20 h-20 bg-slate-800 rounded-full flex flex-col items-center justify-center border-2 border-slate-700">
                      <svg className="w-8 h-8 text-cyan-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-xs text-slate-300 font-mono">01</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Upload UFDR</h3>
                  <p className="text-slate-400">
                    Simply drag and drop your UFDR file or forensic extraction data.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 border-2 border-dashed border-cyan-500 rounded-full w-24 h-24"></div>
                    <div className="relative w-20 h-20 bg-slate-800 rounded-full flex flex-col items-center justify-center border-2 border-slate-700">
                      <svg className="w-8 h-8 text-cyan-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m-2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                      <span className="text-xs text-slate-300 font-mono">02</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">AI Processing</h3>
                  <p className="text-slate-400">
                    Our AI engine parses and analyzes all data types automatically.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 border-2 border-dashed border-cyan-500 rounded-full w-24 h-24"></div>
                    <div className="relative w-20 h-20 bg-slate-800 rounded-full flex flex-col items-center justify-center border-2 border-slate-700">
                      <svg className="w-8 h-8 text-cyan-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-xs text-slate-300 font-mono">03</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Review Insights</h3>
                  <p className="text-slate-400">
                    Explore timelines, relationship graphs, and flagged items.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 border-2 border-dashed border-cyan-500 rounded-full w-24 h-24"></div>
                    <div className="relative w-20 h-20 bg-slate-800 rounded-full flex flex-col items-center justify-center border-2 border-slate-700">
                      <svg className="w-8 h-8 text-cyan-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-slate-300 font-mono">04</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Export Report</h3>
                  <p className="text-slate-400">
                    Generate comprehensive reports ready for court or investigation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Files Section */}
      <section id="supported-files" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-white">Supported </span>
              <span className="text-cyan-400">File Types</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              ForensiAI works with all major forensic tools and extraction formats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* File Formats */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-bold text-white">File Formats</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-slate-300">UFDR Reports</span>
                  </div>
                  <span className="text-xs text-slate-500">.ufdr</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span className="text-sm text-slate-300">JSON/XML</span>
                  </div>
                  <span className="text-xs text-slate-500">.json, .xml</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    <span className="text-sm text-slate-300">CSV Data</span>
                  </div>
                  <span className="text-xs text-slate-500">.csv</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-slate-300">Images</span>
                  </div>
                  <span className="text-xs text-slate-500">.jpg, .png</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-slate-300">Videos</span>
                  </div>
                  <span className="text-xs text-slate-500">.mp4, .mov</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span className="text-sm text-slate-300">Audio</span>
                  </div>
                  <span className="text-xs text-slate-500">.mp3, .wav</span>
                </div>
              </div>
            </div>

            {/* Messaging Apps */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-xl font-bold text-white">Messaging Apps</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded text-sm font-medium transition-colors">WhatsApp</button>
                <button className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-2 rounded text-sm font-medium transition-colors">Telegram</button>
                <button className="bg-pink-600 hover:bg-pink-500 text-white px-3 py-2 rounded text-sm font-medium transition-colors">Instagram</button>
                <button className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors">Messenger</button>
                <button className="bg-green-700 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors">Signal</button>
                <button className="bg-pink-500 hover:bg-pink-400 text-white px-3 py-2 rounded text-sm font-medium transition-colors">iMessage</button>
              </div>
              <p className="text-xs text-slate-500">+ Many more messaging and social apps supported</p>
            </div>

            {/* Forensic Tools */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-xl font-bold text-white">Forensic Tools</h3>
              </div>
              <div className="space-y-2">
                {['Cellebrite UFED', 'MSAB XRY', 'Oxygen Forensic', 'Magnet AXIOM', 'Elcomsoft'].map((tool) => (
                  <div key={tool} className="bg-slate-900/50 border border-slate-700 rounded p-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <svg className="w-64 h-64 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 relative z-10">
              <span className="text-white">Ready to Transform Your</span>
              <br />
              <span className="text-cyan-400">Investigation?</span>
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto relative z-10">
              Upload a UFDR file and let ForensiAI instantly start analyzing it. Turn raw forensic data into intelligence — in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 relative z-10">
              <button 
                onClick={onStartAnalysis}
                className="bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Start Free Analysis
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className="bg-slate-900 border-2 border-cyan-500 hover:border-cyan-400 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all">
                Contact Sales
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>CJIS Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>SOC 2 Certified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-lg font-bold">
                <span className="text-white">Forensi</span>
                <span className="text-cyan-400">AI</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Security</a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-slate-500">
            ©2024 ForensiAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
