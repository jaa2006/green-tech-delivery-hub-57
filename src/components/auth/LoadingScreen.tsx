
const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="text-white mt-4 text-center">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
