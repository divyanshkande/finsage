import React, { useRef, lazy, Suspense } from 'react';
import FadeInText from '../components/FadeInText';

const LoginRegisterSection = lazy(() => import('../components/LoginRegisterSection'));

export default function LandingPage() {
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const loginRef = useRef(null);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="font-sans">
      {/* Preload background images */}
      <img src="/home-bg.jpg" loading="lazy" className="hidden" alt="Preload Home Background" />
      <img src="/about-bg.jpg" loading="lazy" className="hidden" alt="Preload About Background" />

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white shadow z-50 px-8 py-4 flex justify-between items-center">
        <div className="text-2xl font-extrabold text-blue-700 tracking-tight">Finsage</div>
        <div className="space-x-6 text-sm font-medium">
          <button onClick={() => scrollTo(homeRef)} className="text-gray-700 hover:text-blue-600 transition">Home</button>
          <button onClick={() => scrollTo(aboutRef)} className="text-gray-700 hover:text-blue-600 transition">About</button>
          <button onClick={() => scrollTo(loginRef)} className="text-gray-700 hover:text-blue-600 transition">Login/Register</button>
        </div>
      </nav>

      {/* HOME SECTION */}
      <div
        ref={homeRef}
        className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url('/home-bg.jpg')` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
        <div className="z-10 text-white text-center px-4">
          <FadeInText delay={0.2} className="text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to Finsage
          </FadeInText>
          <FadeInText delay={0.4} className="mt-4 text-lg md:text-xl text-gray-200 font-medium">
            Track. Budget. Grow. Your personal finance assistant.
          </FadeInText>
        </div>
      </div>
{/* ABOUT SECTION - High Visibility Text over Wooden Background */}
<div
  ref={aboutRef}
  className="relative min-h-screen bg-cover bg-center py-20 px-6 overflow-hidden"
  style={{ backgroundImage: `url('/about-bg.jpg')` }} // Your wooden table + charts image
>
  {/* Slightly stronger warm overlay for better contrast */}
  <div className="absolute inset-0 bg-amber-900/15" aria-hidden="true" />

  <div className="relative z-10 max-w-5xl mx-auto">
    <div className="text-center mb-16">
      <FadeInText delay={0.2} className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 drop-shadow-xl">
        About Finsage
      </FadeInText>
      <FadeInText delay={0.3} className="text-lg md:text-xl text-gray-900 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium">
        Finsage is your smart personal finance companion, helping you manage money easily. Whether you're saving for goals, tracking expenses, or staying on budget — we bring simplicity and intelligence together.
      </FadeInText>
    </div>

    <div className="grid md:grid-cols-2 gap-8">
      {/* Why Finsage */}
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

      {/* Our Vision */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-200">
        <FadeInText delay={0.5} className="text-2xl font-bold text-blue-800 mb-6 flex items-center justify-center gap-2 drop-shadow-md">
          <span className="text-3xl">🌍</span> Our Vision
        </FadeInText>
        <p className="text-gray-800 text-base md:text-lg leading-relaxed font-medium">
          At Finsage, we believe financial wellness should be accessible to everyone. We're building a future where managing money feels empowering — turning numbers into confidence, security, and real progress.
        </p>
      </div>
    </div>
  </div>
</div>

      {/* LOGIN SECTION */}
      <div ref={loginRef}>
        <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
          <LoginRegisterSection />
        </Suspense>
      </div>
    </div>
  );
}
