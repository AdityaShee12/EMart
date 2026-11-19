import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../../api/api";
import { loginUser } from "../../services/auth.service";
import { useDispatch } from "react-redux";

const Signin = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            const response = await loginUser(formData, dispatch);

            console.log("Login Response:", response?.user);

            // ==========================================
            // Backend response data
            // ==========================================
            const data = response?.user;

            const user = data?.user;
            const role = data?.role;
            const token = data?.token;

            console.log("Logged User:", user);
            console.log("Role:", role);

            // ==========================================
            // Save user
            // ==========================================
            // if (user) {
            //     localStorage.setItem(
            //         "user",
            //         JSON.stringify(user)
            //     );
            // }

            // ==========================================
            // Save token
            // ==========================================
            // if (token) {
            //     localStorage.setItem(
            //         "token",
            //         token
            //     );
            // }

            // toast.success(
            //     response.data.message ||
            //     "Login successful"
            // );

            // ==========================================
            // Role based routing
            // ==========================================
            if (role === "superadmin") {
                navigate("/superadmin");
            } else if (role === "admin") {
                navigate("/admin");
            } else if (role === "seller") {
                navigate("/seller");
            } else {
                const redirectTo =
                    location.state?.from?.pathname || "/";

                navigate(redirectTo, {
                    replace: true
                });
            }

            toast.success(
                response.data.message || "Login successful"
            );
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Invalid email or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                <h1 className="text-3xl font-bold text-center text-gray-800">
                    Welcome Back
                </h1>

                <p className="text-center text-gray-500 mt-2 mb-8">
                    Sign in to your account
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
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
                            placeholder="Enter your password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Don't have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-blue-600 font-semibold hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signin;