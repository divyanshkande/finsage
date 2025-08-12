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

      {/* ABOUT SECTION */}
      <div
        ref={aboutRef}
        className="relative w-full min-h-screen bg-cover bg-center py-20 px-4"
        style={{ backgroundImage: `url('/about-bg.jpg')` }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-90 z-0" />
        <div className="z-10 relative max-w-6xl mx-auto text-center">
          <FadeInText delay={0.2} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            About Finsage
          </FadeInText>

          <FadeInText delay={0.3} className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
            Finsage is your smart personal finance companion, helping you manage money easily. Whether you're saving for goals, tracking expenses, or just trying to stay on budget — Finsage brings simplicity and intelligence together.
          </FadeInText>

          <div className="grid md:grid-cols-2 gap-12 text-left mt-6">
            <div>
              <FadeInText delay={0.4} className="text-2xl font-semibold text-blue-700 mb-4">
                💡 Why Finsage?
              </FadeInText>
              <ul className="space-y-3 text-gray-700 text-base leading-relaxed list-disc list-inside">
                <li>📊 Real-time dashboard with income and expense visualization.</li>
                <li>🎯 Goal tracking for personalized targets.</li>
                <li>📅 Smart auto-categorized transactions.</li>
                <li>🔐 Secure, token-based login and sessions.</li>
                <li>📈 AI-generated reports and monthly insights.</li>
              </ul>
            </div>

            <div>
              <FadeInText delay={0.5} className="text-2xl font-semibold text-blue-700 mb-4">
                🌍 Our Vision
              </FadeInText>
              <p className="text-gray-700 text-base leading-relaxed">
                At Finsage, we believe financial wellness should be accessible to everyone. We're building a future where managing money feels less like a chore — and more like a path to success, security, and confidence.
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
