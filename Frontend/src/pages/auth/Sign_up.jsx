import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../../api/api.js";
import { registerUser } from "../../services/auth.service.jsx";
import { useDispatch } from "react-redux";

const Signup = () => {
    const navigate = useNavigate();

    // =========================
    // Signup states
    // =========================
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpId, setOtpId] = useState("");

    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "buyer",
    });

    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();

    // =========================
    // Handle input change
    // =========================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // Send OTP
    // =========================
    const sendOtp = async () => {
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        try {
            setLoading(true);

            const response = await authAPI.sendOTP({
                email,
            });

            console.log("OTP Response:", response);

            if (response?.data?.id) {
                setOtpId(response.data.id);

                setFormData((prev) => ({
                    ...prev,
                    email: email,
                }));

                setOtpSent(true);

                toast.success(
                    response?.data?.message || "OTP sent successfully"
                );
            } else {
                toast.error("OTP could not be sent");
            }
        } catch (error) {
            console.log("Send OTP Error:", error);

            const message =
                error?.response?.data?.message ||
                "An error occurred while sending OTP";

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // Verify OTP
    // =========================
    const verifyOtp = async () => {
        if (!otp) {
            toast.error("Please enter OTP");
            return;
        }

        if (!otpId) {
            toast.error("OTP session expired. Please send OTP again");
            return;
        }

        try {
            setLoading(true);

            await authAPI.verifyOTP({
                id: otpId,
                otp,
            });

            setOtpVerified(true);

            toast.success("OTP verified successfully");
        } catch (error) {
            console.log("Verify OTP Error:", error);

            toast.error(
                error?.response?.data?.message ||
                "Given OTP is incorrect"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // Create Account
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otpVerified) {
            toast.error("Please verify your email first");
            return;
        }

        if (
            !formData.name ||
            !formData.email ||
            !formData.password
        ) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            // =========================
            // Send user data to backend
            // =========================
            const response = await registerUser(formData, dispatch);

            console.log("Signup Response:", response);

            toast.success(
                response?.data?.message ||
                "Account created successfully"
            );

            navigate("/");
        } catch (error) {
            console.log("Signup Error:", error);

            toast.error(
                error?.response?.data?.message ||
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // Back to email step
    // =========================
    const changeEmail = () => {
        setOtpSent(false);
        setOtpVerified(false);
        setOtp("");
        setOtpId("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                {/* =========================
                    Header
                ========================= */}
                <h1 className="text-3xl font-bold text-center text-gray-800">
                    Create Account
                </h1>

                <p className="text-center text-gray-500 mt-2 mb-8">
                    Sign up to start shopping
                </p>


                {/* =====================================================
                    STEP 1 - EMAIL
                ====================================================== */}
                {!otpSent && !otpVerified && (
                    <div className="space-y-5">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="Enter your email"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={sendOtp}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
                        >
                            {loading
                                ? "Sending OTP..."
                                : "Send OTP"}
                        </button>
                    </div>
                )}


                {/* =====================================================
                    STEP 2 - OTP
                ====================================================== */}
                {otpSent && !otpVerified && (
                    <div className="space-y-5">

                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-500">
                                OTP has been sent to
                            </p>

                            <p className="font-semibold text-gray-800">
                                {email}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Enter OTP
                            </label>

                            <input
                                type="number"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(e.target.value)
                                }
                                placeholder="Enter your OTP"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 text-center tracking-[0.4em]"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={verifyOtp}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
                        >
                            {loading
                                ? "Verifying..."
                                : "Verify OTP"}
                        </button>

                        <button
                            type="button"
                            onClick={changeEmail}
                            className="w-full text-sm text-blue-600 font-semibold hover:underline"
                        >
                            Change Email
                        </button>
                    </div>
                )}


                {/* =====================================================
                    STEP 3 - USER DATA
                ====================================================== */}
                {otpVerified && (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Verified Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>

                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full border border-gray-200 bg-gray-100 rounded-lg px-4 py-3 outline-none text-gray-500"
                            />
                        </div>


                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                            />
                        </div>


                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                            />
                        </div>


                        {/* Role */}
                        <input
                            type="hidden"
                            name="role"
                            value="buyer"
                        />


                        {/* Create Account */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>

                    </form>
                )}


                {/* =========================
                    Sign In
                ========================= */}
                <p className="text-center text-gray-600 mt-6">

                    Already have an account?{" "}

                    <Link
                        to="/signin"
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Sign In
                    </Link>

                </p>

            </div>
        </div>
    );
};

export default Signup;