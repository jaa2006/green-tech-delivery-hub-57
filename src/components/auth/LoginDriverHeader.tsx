
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LoginDriverHeader = () => {
  return (
    <div className="bg-[#07595A] rounded-b-3xl h-24 flex items-center justify-center relative mb-8">
      <Link to="/" className="absolute left-6 top-1/2 -translate-y-1/2">
        <ArrowLeft className="h-6 w-6 text-white" />
      </Link>
      <h1 className="text-white text-2xl font-bold">Login Driver</h1>
    </div>
  );
};

export default LoginDriverHeader;
