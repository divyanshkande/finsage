// src/pages/Home.jsx
import BlurText from "../components/BlurText"; // adjust path if needed

const Home = () => {
  const handleAnimationComplete = () => {
    console.log("Animation completed!");
  };

  return (
    <section
      className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url('/home-bg.jpg')`,
      }}
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />

      {/* Text Content */}
      <div className="z-10 text-white text-center px-4">
        <BlurText
          text="Welcome to Finsage"
          delay={150}
          animateBy="words"
          direction="top"
          onAnimationComplete={handleAnimationComplete}
          className="text-4xl md:text-6xl font-bold"
        />
        <p className="mt-4 text-lg md:text-xl text-gray-200">
          Track. Budget. Grow. Your personal finance assistant.
        </p>
      </div>
    </section>
  );
};

export default Home;
