
import LoginDriverHeader from "@/components/auth/LoginDriverHeader";
import LoginDriverForm from "@/components/auth/LoginDriverForm";
import GoogleLoginSection from "@/components/auth/GoogleLoginSection";
import LoginDriverFooter from "@/components/auth/LoginDriverFooter";
import { NavigationProvider } from "@/contexts/NavigationContext";

const LoginDriver = () => {
  return (
    <NavigationProvider>
      <div className="min-h-screen bg-gradient-to-b from-[#07595A] to-black flex flex-col">
        <LoginDriverHeader />

        {/* Login container */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full">
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 border border-gray-700">
              <LoginDriverForm />
              <GoogleLoginSection />
              <LoginDriverFooter />
            </div>
          </div>
        </div>
      </div>
    </NavigationProvider>
  );
};

export default LoginDriver;
