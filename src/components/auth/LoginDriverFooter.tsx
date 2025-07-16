
import { Link } from "react-router-dom";

const LoginDriverFooter = () => {
  return (
    <div className="mt-6 text-center text-sm text-gray-400">
      Belum punya akun?{" "}
      <Link
        to="/register-driver"
        className="text-[#07595A] font-medium hover:underline"
      >
        Daftar sebagai Driver
      </Link>
    </div>
  );
};

export default LoginDriverFooter;
