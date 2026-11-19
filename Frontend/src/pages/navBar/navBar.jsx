import { useState, useEffect } from "react";
import { FaBars, FaUser } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";


const NavBar = () => {

    const [search, setSearch] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useSelector(
        (state) => state.user,
    );

    const handleNavigation = (route) => {
        if (!user._id) {
            navigate("/signin", {
                state: {
                    from: location
                }
            });
        } else { navigate(route) }
    };

    return (
        <div>
            <header className="w-full bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">

                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <h1 className="text-2xl font-bold text-gray-900">
                            EMart
                        </h1>
                    </div>

                    {/* Search */}
                    <div className="flex-1 max-w-2xl mx-auto">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-full h-11 pl-4 pr-12 border border-gray-300 rounded-lg outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300 text-sm"
                            />

                            <button
                                type="button"
                                className="absolute right-0 top-0 h-11 w-12 flex items-center justify-center text-gray-600 hover:text-gray-900"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Cart */}
                    <button
                        type="button"
                        onClick={() => {
                            handleNavigation("/cart")
                        }}
                        className="relative flex-shrink-0 p-2 text-gray-700 hover:text-gray-900"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                                d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 7H6"
                            />
                            <circle cx="10" cy="20" r="1" />
                            <circle cx="18" cy="20" r="1" />
                        </svg>

                        {/* Cart Count */}
                        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-gray-900 text-white text-[10px] font-semibold">
                            0
                        </span>
                    </button>

                    {/* User Details */}
                    <button onClick={() => handleNavigation("/user")}>
                        <FaUser size={20} />
                    </button>

                    {/* Three Line Menu */}
                    <div className="relative flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 text-gray-700 hover:text-gray-900"
                        >
                            <FaBars size={24} />
                        </button>

                        {/* Context Menu */}
                        {showMenu && (
                            <div className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">

                                {/* Sign In */}
                                <button
                                    type="button"
                                    onClick={() => navigate("/signin")}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Sign In
                                </button>

                                {/* Sign Up */}
                                <button
                                    type="button"
                                    onClick={() => navigate("/signup")}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Sign Up
                                </button>

                                {/* Want to Become a Seller */}
                                <button
                                    type="button"
                                    onClick={() => navigate("/seller")}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Want to Become a Seller
                                </button>

                                <div className="my-2 border-t border-gray-100"></div>

                                {/* Home */}
                                <button
                                    type="button"
                                    onClick={() => navigate("/")}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Home
                                </button>

                                {/* Categories */}
                                <button
                                    type="button"
                                    onClick={() => navigate("/categories")}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Categories
                                </button>

                                {/* Products */}
                                <button
                                    type="button"
                                    onClick={() => navigate("/products")}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Products
                                </button>

                                {/* My Account */}
                                <button
                                    type="button"
                                    onClick={() => navigate("/my-account")}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    My Account
                                </button>

                            </div>
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
}

export default NavBar;