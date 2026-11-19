import { useState } from "react";
import {
    FaBoxOpen,
    FaHeart,
    FaRupeeSign,
    FaCreditCard,
    FaBell,
    FaUser,
    FaMapMarkerAlt,
    FaLanguage,
    FaTv,
    FaGift,
    FaWallet,
    FaQuestionCircle,
    FaFileAlt,
    FaComments,
    FaInstagram,
    FaYoutube,
    FaLinkedin,
    FaHome,
    FaPlayCircle,
    FaThLarge,
    FaShoppingCart,
    FaHeadset,
    FaChevronRight,
    FaStar,
    FaSignOutAlt,
    FaCoins,
    FaArrowRight
} from "react-icons/fa";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const UserPage = () => {

    const navigate = useNavigate();

    const { user } = useSelector(
        (state) => state.user,
    );

    // Navigation handler
    const handleNavigate = (route) => {
        if (user._id) {
            navigate(route);
        }
    };

    // Account menu data
    const profileSettings = [
        {
            title: "Edit profile",
            icon: FaUser,
            path: "/profile/edit"
        },
        {
            title: "Saved addresses",
            icon: FaMapMarkerAlt,
            path: "/profile/addresses"
        },
        {
            title: "Change language",
            icon: FaLanguage,
            path: "/profile/language",
            rightText: "English"
        },
        {
            title: "Notification settings",
            icon: FaBell,
            path: "/profile/notifications"
        },
        {
            title: "My subscriptions",
            icon: FaTv,
            path: "/profile/subscriptions"
        }
    ];

    const paymentOptions = [
        {
            title: "Gift card",
            icon: FaGift,
            path: "/gift-card",
            rightText: "Add gift card"
        },
        {
            title: "Saved payment methods",
            icon: FaCreditCard,
            path: "/payment-methods"
        },
        {
            title: "SuperCoin",
            icon: FaCoins,
            path: "/supercoin"
        }
    ];

    const faqOptions = [
        {
            title: "FAQs",
            icon: FaQuestionCircle,
            path: "/faqs"
        },
        {
            title: "Terms, Policies & Licences",
            icon: FaFileAlt,
            path: "/terms"
        }
    ];

    const activityOptions = [
        {
            title: "Questions & Answers",
            icon: FaComments,
            path: "/questions"
        }
    ];

    // Reusable section
    const Section = ({ title, children }) => (
        <section className="mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5">
                {title}
            </h2>

            <div className="space-y-1">
                {children}
            </div>
        </section>
    );

    // Reusable menu row
    const MenuItem = ({ item }) => {
        const Icon = item.icon;

        return (
            <button
                onClick={() => handleNavigate(item.path)}
                className="w-full flex items-center gap-4 py-3.5 
                text-left hover:bg-gray-50 transition rounded-lg px-1"
            >
                <div className="w-11 h-11 shrink-0 rounded-full 
                bg-blue-50 flex items-center justify-center">

                    <Icon className="text-blue-600 text-xl" />

                </div>

                <span className="flex-1 text-base sm:text-lg text-gray-700">
                    {item.title}
                </span>

                {item.rightText && (
                    <span className="text-blue-600 bg-blue-50 
                    px-3 py-1.5 rounded-md text-sm">
                        {item.rightText}
                    </span>
                )}

                <FaChevronRight className="text-gray-500 text-sm shrink-0" />
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-white text-gray-800 pb-28">

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="flex items-center justify-between pt-8 pb-6">

                    <div>
                        <p className="text-2xl sm:text-3xl font-bold">
                            {/* Hey, {userName?.split(" ")[0]} */}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Welcome to your account
                        </p>
                    </div>

                    <button
                        onClick={() => handleNavigate("/help")}
                        className="flex items-center gap-2 border border-gray-300 
                        rounded-xl px-4 py-3 hover:bg-gray-50 transition"
                    >
                        <FaHeadset className="text-xl" />
                        <span className="font-semibold">Help</span>
                    </button>

                </div>

                {/* SuperCoin Card */}
                <div className="rounded-2xl overflow-hidden border border-blue-100">

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 
                    flex justify-between items-center px-5 py-5">

                        <h3 className="font-bold text-lg">
                            Your SuperCoin balance
                        </h3>

                        <div className="flex items-center gap-2 bg-white 
                        border border-gray-300 rounded-full px-4 py-2">

                            <FaCoins className="text-yellow-500 text-xl" />

                            <span className="font-bold">
                                {user?.superCoins ?? 0}
                            </span>

                        </div>
                    </div>

                    <button
                        onClick={() => handleNavigate("/supercoin")}
                        className="w-full px-5 py-4 flex items-center 
                        justify-between text-gray-600 hover:bg-gray-50"
                    >
                        <span>
                            Earn more SuperCoins and enjoy rewards
                        </span>

                        <FaArrowRight />
                    </button>

                </div>

                {/* Orders & Wishlist */}
                <div className="grid grid-cols-2 gap-4 mt-8">

                    <button
                        onClick={() => handleNavigate("/orders")}
                        className="border border-gray-300 rounded-xl 
                        flex items-center justify-center gap-3 p-5 
                        hover:bg-blue-50 transition"
                    >
                        <FaBoxOpen className="text-3xl text-blue-600" />

                        <span className="font-bold text-base sm:text-lg" onClick={handleNavigate}>
                            Orders
                        </span>
                    </button>

                    <button
                        onClick={() => handleNavigate("/wishlist")}
                        className="border border-gray-300 rounded-xl 
                        flex items-center justify-center gap-3 p-5 
                        hover:bg-blue-50 transition"
                    >
                        <FaHeart className="text-3xl text-blue-600" />

                        <span className="font-bold text-base sm:text-lg">
                            Wishlist
                        </span>
                    </button>

                </div>

                {/* Finance Options */}
                <Section title="Finance Options">

                    {[
                        {
                            title: "Personal Loan",
                            description: "Check your pre-approved loan offers",
                            icon: FaRupeeSign,
                            path: "/finance/loan"
                        },
                        {
                            title: "Credit Card",
                            description: "Explore credit card offers and benefits",
                            icon: FaCreditCard,
                            path: "/finance/credit-card"
                        },
                        {
                            title: "EMI",
                            description: "Explore easy EMI payment options",
                            icon: MdOutlineAccountBalanceWallet,
                            path: "/finance/emi"
                        }
                    ].map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={index}
                                onClick={() => handleNavigate(item.path)}
                                className="w-full flex items-center gap-5 
                                py-5 hover:bg-gray-50 rounded-xl px-2 text-left"
                            >
                                <div className="w-12 h-12 flex items-center 
                                justify-center bg-blue-50 rounded-xl shrink-0">

                                    <Icon className="text-2xl text-blue-600" />

                                </div>

                                <div className="flex-1 min-w-0">

                                    <h3 className="font-bold text-base sm:text-lg">
                                        {item.title}
                                    </h3>

                                    <p className="text-sm sm:text-base text-gray-500 mt-1">
                                        {item.description}
                                    </p>

                                </div>

                                <FaChevronRight className="text-gray-500" />

                            </button>
                        );
                    })}

                </Section>

                {/* Recently Viewed Stores */}
                {/* {recentlyViewed.length > 0 && (
                    <Section title="Recently Viewed Stores">

                        <div className="flex gap-4 overflow-x-auto pb-3 
                        scrollbar-hide">

                            {recentlyViewed.map((product, index) => (
                                <button
                                    key={product._id || index}
                                    onClick={() => handleNavigate(
                                        `/product/${product._id}`
                                    )}
                                    className="min-w-[125px] max-w-[125px] 
                                    text-left"
                                >
                                    <div className="h-32 w-full bg-gray-100 
                                    rounded-xl overflow-hidden">

                                        <img
                                            src={product.images?.[0] || product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />

                                    </div>

                                    <p className="mt-2 text-sm text-gray-700 
                                    truncate">
                                        {product.name}
                                    </p>

                                </button>
                            ))}

                        </div>

                    </Section>
                )} */}

                {/* Ratings & Reviews */}
                <Section title="Ratings & Reviews">

                    <div className="flex items-center justify-between mb-4">

                        <p className="text-sm text-gray-500">
                            Your recent product reviews
                        </p>

                        <button
                            onClick={() => handleNavigate("/my-reviews")}
                            className="text-blue-600 font-semibold"
                        >
                            View all
                        </button>

                    </div>

                    {/* {reviews.length > 0 ? (

                        reviews.slice(0, 2).map((review, index) => (

                            <div
                                key={review._id || index}
                                className="border border-gray-200 rounded-2xl 
                                p-4 mb-4"
                            >

                                <div className="flex items-center gap-4">

                                    <img
                                        src={review.productImage}
                                        alt=""
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />

                                    <div className="flex-1 min-w-0">

                                        <h3 className="font-semibold truncate">
                                            {review.productName}
                                        </h3>

                                        <p className="text-sm text-gray-500 mt-1">
                                            {review.date || "Recently purchased"}
                                        </p>

                                    </div>

                                </div>

                                <div className="flex items-center justify-between 
                                bg-gray-50 p-3 mt-4 rounded-lg">

                                    <span className="text-sm">
                                        Your rating
                                    </span>

                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                className={
                                                    star <= (review.rating || 0)
                                                        ? "text-yellow-400"
                                                        : "text-gray-300"
                                                }
                                            />
                                        ))}
                                    </div>

                                </div>

                            </div>

                        ))

                    ) : (

                        <div className="border border-gray-200 rounded-xl p-5 
                        text-center text-gray-500">
                            No ratings or reviews yet.
                        </div>

                    )} */}

                </Section>

                {/* Profile Settings */}
                <Section title="Profile Settings">

                    {profileSettings.map((item, index) => (
                        <MenuItem key={index} item={item} />
                    ))}

                </Section>

                <hr className="border-gray-200 mt-6" />

                {/* Payments & Wallets */}
                <Section title="Payments & Wallets">

                    {paymentOptions.map((item, index) => (
                        <MenuItem key={index} item={item} />
                    ))}

                </Section>

                <hr className="border-gray-200 mt-6" />

                {/* FAQ & Terms */}
                <Section title="FAQ & Terms">

                    {faqOptions.map((item, index) => (
                        <MenuItem key={index} item={item} />
                    ))}

                </Section>

                <hr className="border-gray-200 mt-6" />

                {/* My Activity */}
                <Section title="My Activity">

                    {activityOptions.map((item, index) => (
                        <MenuItem key={index} item={item} />
                    ))}

                </Section>

                <hr className="border-gray-200 mt-6" />

                {/* Social Media */}
                <Section title="Follow Us On">

                    <div className="grid grid-cols-3 gap-2">

                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noreferrer"
                            className="bg-gray-100 rounded-xl py-4 
                            flex flex-col sm:flex-row items-center 
                            justify-center gap-2 hover:bg-gray-200"
                        >
                            <FaInstagram className="text-2xl" />
                            <span className="text-sm">Instagram</span>
                        </a>

                        <a
                            href="https://youtube.com"
                            target="_blank"
                            rel="noreferrer"
                            className="bg-gray-100 rounded-xl py-4 
                            flex flex-col sm:flex-row items-center 
                            justify-center gap-2 hover:bg-gray-200"
                        >
                            <FaYoutube className="text-2xl" />
                            <span className="text-sm">YouTube</span>
                        </a>

                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noreferrer"
                            className="bg-gray-100 rounded-xl py-4 
                            flex flex-col sm:flex-row items-center 
                            justify-center gap-2 hover:bg-gray-200"
                        >
                            <FaLinkedin className="text-2xl" />
                            <span className="text-sm">LinkedIn</span>
                        </a>

                    </div>

                </Section>

                {/* Logout */}
                <div className="mt-12 mb-8">

                    {/* <button
                        onClick={onLogout}
                        className="w-full border border-blue-500 
                        text-blue-600 font-bold text-lg py-4 rounded-xl 
                        hover:bg-blue-50 transition flex items-center 
                        justify-center gap-2"
                    >
                        <FaSignOutAlt />
                        Log out
                    </button> */}

                    <p className="text-center text-gray-500 mt-4 text-sm">
                        {user?.version || "My Store v1.0.0"}
                    </p>

                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            {/* <div className="fixed bottom-0 left-0 right-0 z-50 
            bg-white border border-gray-200 rounded-t-3xl 
            shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">

                <div className="max-w-5xl mx-auto grid grid-cols-5 
                items-center px-2 py-2">

                    {[
                        {
                            title: "Home",
                            icon: FaHome,
                            path: "/"
                        },
                        {
                            title: "Play",
                            icon: FaPlayCircle,
                            path: "/play"
                        },
                        {
                            title: "Categories",
                            icon: FaThLarge,
                            path: "/categories"
                        },
                        {
                            title: "Account",
                            icon: FaUser,
                            path: "/account"
                        },
                        {
                            title: "Cart",
                            icon: FaShoppingCart,
                            path: "/cart"
                        }
                    ].map((item) => {

                        const Icon = item.icon;
                        const active = activeTab === item.title;

                        return (
                            <button
                                key={item.title}
                                onClick={() => {
                                    setActiveTab(item.title);
                                    handleNavigate(item.path);
                                }}
                                className={`flex flex-col items-center 
                                justify-center gap-1 py-2 rounded-full 
                                transition ${
                                    active
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >

                                <Icon className="text-2xl" />

                                <span className={`text-xs sm:text-sm ${
                                    active ? "font-bold" : ""
                                }`}>
                                    {item.title}
                                </span>

                            </button>
                        );
                    })}

                </div>

            </div> */}
        </div>
    );
};

export default UserPage;
