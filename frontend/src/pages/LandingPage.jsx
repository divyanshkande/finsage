import React, { useRef, lazy, Suspense } from 'react';
import FadeInText from '../components/FadeInText';

const LoginRegisterSection = lazy(() => import('../components/LoginRegisterSection'));

// Loading fallback component
const SectionLoader = () => (
  <div className="text-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
);

export default function LandingPage() {
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const loginRef = useRef(null);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="font-sans">
      {/* Preload critical images only */}
      <link rel="preload" as="image" href="/home-bg.jpg" />

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-md z-50 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-extrabold text-blue-700 tracking-tight flex items-center gap-2">
            <span className="text-3xl">💰</span>
            Finsage
          </div>
          <div className="space-x-6 text-sm font-semibold">
            <button onClick={() => scrollTo(homeRef)} className="text-gray-700 hover:text-blue-600 transition-colors">Home</button>
            <button onClick={() => scrollTo(aboutRef)} className="text-gray-700 hover:text-blue-600 transition-colors">About</button>
            <button onClick={() => scrollTo(loginRef)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md">Get Started</button>
          </div>
        </div>
      </nav>

      {/* HOME SECTION */}
      <div
        ref={homeRef}
        className="relative w-full min-h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url('/home-bg.jpg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 z-0" />
        
        <div className="z-10 text-white text-center px-4 max-w-5xl mx-auto">
          <FadeInText delay={0.2} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Welcome to <span className="text-blue-400">Finsage</span>
          </FadeInText>
          
          <FadeInText delay={0.4} className="mt-6 text-xl md:text-2xl text-gray-200 font-medium leading-relaxed max-w-3xl mx-auto">
            Your intelligent personal finance companion that helps you
            <span className="text-blue-300 font-bold"> track expenses</span>,
            <span className="text-green-300 font-bold"> achieve savings goals</span>, and
            <span className="text-yellow-300 font-bold"> build financial confidence</span>.
          </FadeInText>

          <FadeInText delay={0.6} className="mt-8 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Take control of your financial future with smart budgeting tools, AI-powered insights, and real-time tracking.
          </FadeInText>

          <FadeInText delay={0.8} className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => scrollTo(loginRef)}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all"
            >
              Start Your Journey 🚀
            </button>
            <button 
              onClick={() => scrollTo(aboutRef)}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold text-lg rounded-xl border-2 border-white/30 shadow-2xl transform hover:scale-105 transition-all"
            >
              Learn More
            </button>
          </FadeInText>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="text-white text-4xl">↓</div>
        </div>
      </div>

      {/* ABOUT SECTION - Enhanced with Features */}
      <div
        ref={aboutRef}
        className="relative min-h-screen bg-cover bg-center py-20 px-6 overflow-hidden"
        style={{ backgroundImage: `url('/about-bg.jpg')` }}
      >
        <div className="absolute inset-0 bg-amber-900/15" aria-hidden="true" />

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* About Header */}
          <div className="text-center mb-16">
            <FadeInText delay={0.2} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 drop-shadow-xl">
              About Finsage
            </FadeInText>
            <FadeInText delay={0.3} className="text-lg md:text-xl text-gray-900 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium">
              Finsage is your smart personal finance companion, helping you manage money easily. Whether you're saving for goals, tracking expenses, or staying on budget — we bring simplicity and intelligence together.
            </FadeInText>
          </div>

          {/* Why Finsage & Our Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200">
              <FadeInText delay={0.4} className="text-2xl font-bold text-blue-800 mb-6 flex items-center justify-center gap-2 drop-shadow-md">
                <span className="text-3xl">💡</span> Why Finsage?
              </FadeInText>
              <ul className="space-y-3 text-gray-800 text-base md:text-lg font-medium">
                <li className="flex gap-3"><span className="text-xl">📊</span> Real-time dashboard with clear visualizations</li>
                <li className="flex gap-3"><span className="text-xl">🎯</span> Personalized goal tracking</li>
                <li className="flex gap-3"><span className="text-xl">📅</span> Smart auto-categorized transactions</li>
                <li className="flex gap-3"><span className="text-xl">🔐</span> Secure token-based authentication</li>
                <li className="flex gap-3"><span className="text-xl">📈</span> AI savings plans + OCR bill extraction</li>
              </ul>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200">
              <FadeInText delay={0.5} className="text-2xl font-bold text-blue-800 mb-6 flex items-center justify-center gap-2 drop-shadow-md">
                <span className="text-3xl">🌍</span> Our Vision
              </FadeInText>
              <p className="text-gray-800 text-base md:text-lg leading-relaxed font-medium mb-6">
                At Finsage, we believe financial wellness should be accessible to everyone. We're building a future where managing money feels empowering — turning numbers into confidence, security, and real progress.
              </p>
              
              {/* Core Values inline */}
              <div className="space-y-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🎯</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Simplicity</h4>
                    <p className="text-gray-700 text-sm">Making finance management intuitive and effortless</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🔒</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Security</h4>
                    <p className="text-gray-700 text-sm">Protecting your data with industry-leading standards</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">💪</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Empowerment</h4>
                    <p className="text-gray-700 text-sm">Giving you control and confidence over your finances</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features Cards */}
          <div className="mb-12">
            <FadeInText delay={0.6} className="text-3xl font-bold text-gray-900 text-center mb-8 drop-shadow-md">
              ✨ Key Features
            </FadeInText>
            
            <div className="grid md:grid-cols-3 gap-6">
              <FadeInText delay={0.7}>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-200">
                  <div className="text-5xl mb-4 text-center">📊</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Real-Time Dashboard</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Visualize your spending patterns with beautiful charts and get instant insights into where your money goes.
                  </p>
                </div>
              </FadeInText>

              <FadeInText delay={0.8}>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-200">
                  <div className="text-5xl mb-4 text-center">🎯</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Goal Tracking</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Set savings goals and watch your progress with our intelligent system that keeps you on track.
                  </p>
                </div>
              </FadeInText>

              <FadeInText delay={0.9}>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-200">
                  <div className="text-5xl mb-4 text-center">🤖</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">AI-Powered Insights</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Get smart suggestions based on your spending habits to make better financial decisions.
                  </p>
                </div>
              </FadeInText>

              <FadeInText delay={1.0}>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-200">
                  <div className="text-5xl mb-4 text-center">📱</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">OCR Bill Scanning</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Simply snap photos of bills and receipts - our OCR automatically extracts and categorizes expenses.
                  </p>
                </div>
              </FadeInText>

              <FadeInText delay={1.1}>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-200">
                  <div className="text-5xl mb-4 text-center">🔐</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Bank-Level Security</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Your financial data is protected with enterprise-grade encryption and secure authentication.
                  </p>
                </div>
              </FadeInText>

              <FadeInText delay={1.2}>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-200">
                  <div className="text-5xl mb-4 text-center">📅</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Event Planning</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Plan for future expenses with our event budgeting tool - never be caught off guard by upcoming costs.
                  </p>
                </div>
              </FadeInText>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200">
            <FadeInText delay={1.3} className="text-3xl font-bold text-blue-800 mb-8 text-center drop-shadow-md">
              🚀 How It Works
            </FadeInText>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FadeInText delay={1.4}>
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Up</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Create your free account in seconds. No credit card required to get started.
                  </p>
                </div>
              </FadeInText>

              <FadeInText delay={1.5}>
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Track Expenses</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Add your income and expenses. Use OCR to scan bills or enter manually.
                  </p>
                </div>
              </FadeInText>

              <FadeInText delay={1.6}>
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Achieve Goals</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Watch your savings grow and reach your financial goals with AI-powered guidance.
                  </p>
                </div>
              </FadeInText>
            </div>
          </div>
        </div>
      </div>

      {/* LOGIN SECTION */}
      <div ref={loginRef}>
        <Suspense fallback={<SectionLoader />}>
          <LoginRegisterSection />
        </Suspense>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">💰</span> Finsage
              </h3>
              <p className="text-sm">Your intelligent personal finance companion for a better financial future.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollTo(homeRef)} className="hover:text-white">Home</button></li>
                <li><button onClick={() => scrollTo(aboutRef)} className="hover:text-white">About Us</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>© 2025 Finsage. All rights reserved. Made with ❤️ for better financial health.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}