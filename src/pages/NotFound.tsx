
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <h1 className="text-6xl font-bold mb-4 text-white">404</h1>
          <p className="text-xl text-gray-300 mb-2">Oops! Page not found</p>
          <p className="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
          
          <div className="space-y-3">
            <Link 
              to="/user-dashboard" 
              className="flex items-center justify-center gap-2 bg-[#07595A] text-white px-6 py-3 rounded-lg hover:bg-[#065658] transition-colors w-full"
            >
              <Home className="h-5 w-5" />
              Go to Dashboard
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors w-full"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
