import { useState, useContext } from "react";
import { useRouter } from "next/router";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShoppingCart, SquareAsterisk } from "lucide-react";
import { userContext } from "./_app";
import { Api } from "@/services/service";
import axios from "axios";
import { IPInfoContext } from "ip-info-react";


export default function Login(props) {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDetail, setUserDetail] = useState({
    username: "",
    password: "",
  });
  const [user, setUser] = useContext(userContext);
  const [token, setToken] = useState('');
  const [otp, setOtp] = useState('');
  const userInfo = useContext(IPInfoContext);


  const sendOtp = async () => {
    setSubmitted(true);

    if (!userDetail.username || !userDetail.password) {
      props.toaster({ type: "error", message: "Missing credentials" });
      return;
    }

    try {
      setLoading(true);
      props.loader(true);
      const res = await Api("post", "loginwithOtp", { ...userDetail, ipConfing: userInfo, action: 'sendOtpForLogin' }, router);
      props.loader(false);
      setLoading(false)
      if (res?.status) {
        setToken(res?.data?.token);
        props.toaster({ type: "success", message: res?.data?.message });
      } else {

        props.toaster({ type: "error", message: res?.message || "Login failed" });
      }
    } catch (err) {
      props.loader(false);
      setLoading(false);
      console.error(err);
      props.toaster({ type: "error", message: err?.message || "Something went wrong" });
    }
  };

  const submit = async () => {
    setSubmitted(true);

    if (!otp) {
      props.toaster({ type: "error", message: "OTP is required" });
      return;
    }

    try {
      setLoading(true);
      props.loader(true);

      const res = await Api("post", "verifyOTPForLogin", { token, otp, ipConfing: userInfo, action: 'verifyOTPForLogin' }, router);

      props.loader(false);
      setLoading(false);
      if (res?.status) {
        if (res.data.type === "ADMIN" || res.data.type === "EMPLOYEE") {
          localStorage.setItem("userDetail", JSON.stringify(res.data));
          localStorage.setItem("token", res.data.token);

          setUser(res.data);
          setUserDetail({ username: "", password: "" });

          props.toaster({ type: "success", message: "Login Successful" });

          if (res.data.type === "ADMIN") {
            router.push("/");
          } else {
            router.push("/inventory");
          }

        } else {
          props.toaster({ type: "error", message: "You are not authorized" });
        }
      } else {
        props.toaster({ type: "error", message: res?.message || "Login failed" });
      }
    } catch (err) {
      props.loader(false);
      setLoading(false);
      console.error(err);
      props.toaster({ type: "error", message: err?.message || "Something went wrong" });
    }
  };

  return (
    <div className="min-h-screen bg-[#fff0dc] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0  bg-opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Login Card */}
        <div className="bg-white backdrop-blur-sm shadow-2xl rounded-3xl p-8 transform hover:scale-[1.02] transition-all duration-300">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-2 rounded-xl">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <img src="/newwlogo.png" className="h-20 w-full" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
            <p className="text-gray-600 text-sm">Sign in to access your dashboard</p>
          </div>

          {/* Form */}
          {!token && <div className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className={`w-full pl-10 pr-4 py-3 border text-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 ${submitted && !userDetail.username
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 focus:bg-white"
                    }`}
                  value={userDetail.username}
                  onChange={(e) => setUserDetail({ ...userDetail, username: e.target.value })}
                />
              </div>
              {submitted && !userDetail.username && (
                <p className="text-red-500 text-xs font-medium flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  Username is required
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`w-full pl-10 text-neutral-700 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 ${submitted && !userDetail.password
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 focus:bg-white"
                    }`}
                  value={userDetail.password}
                  onChange={(e) => setUserDetail({ ...userDetail, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              {submitted && !userDetail.password && (
                <p className="text-red-500 text-xs font-medium flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  Password is required
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-orange-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Send OTP
                  <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              )}
            </button>
          </div>
          }
          {token && <div>

            <>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">OTP</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SquareAsterisk className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter OTP here"
                    className={`w-full pl-10 pr-4 py-3 border text-neutral-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 ${submitted && !userDetail.username
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 focus:bg-white"
                      }`}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

              </div>

              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="w-full bg-gradient-to-r mt-5 from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-orange-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying ...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Verify
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                )}
              </button>
            </>

          </div>}

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">© 2025 Bach Hoa Houston. All rights reserved.</p>
          </div>
        </div>

        <div className="absolute -top-14 -left-10 w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-md opacity-20 animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div
          className="absolute -bottom-8 -right-10 w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-md opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
    </div>
  );
}
