import { useState } from "react";
import axios from "axios";
import { sellerAPI } from "../api/api";
import { useDispatch, useSelector } from "react-redux";

const SellerRequest = () => {

    const [formData, setFormData] = useState({
        storeName: "",
        storeDescription: "",
        storeLogo: "",
        phone: "",
        businessAddress: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India"
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { user } = useSelector(
        (state) => state.user,
    );

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!user?._id) {
            setError("User not found.");
            return;
        }

        if (!formData.storeName.trim()) {
            setError("Store name is required.");
            return;
        }

        if (!formData.storeDescription.trim()) {
            setError("Store description is required.");
            return;
        }

        if (!formData.phone.trim()) {
            setError("Phone number is required.");
            return;
        }

        if (!formData.businessAddress.trim()) {
            setError("Business address is required.");
            return;
        }

        if (!formData.city.trim()) {
            setError("City is required.");
            return;
        }

        if (!formData.state.trim()) {
            setError("State is required.");
            return;
        }

        if (!formData.postalCode.trim()) {
            setError("Postal code is required.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                id: user._id,
                ...formData
            };

            console.log("Seller Request Body:", payload);

            const { data } = await sellerAPI.sellerRequest(payload);

            setSuccess(
                data?.message ||
                "Seller request submitted successfully."
            );

            setFormData({
                storeName: "",
                storeDescription: "",
                storeLogo: "",
                phone: "",
                businessAddress: "",
                city: "",
                state: "",
                postalCode: "",
                country: "India"
            });

        } catch (error) {
            setError(
                error?.response?.data?.message ||
                "Failed to submit seller request."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="mx-auto max-w-3xl">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Become a Seller
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        Fill in the information below to submit
                        your seller request. Your request will be
                        reviewed by our admin team.
                    </p>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

                    {/* Error */}
                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-7"
                    >

                        {/* ========================= */}
                        {/* STORE INFORMATION */}
                        {/* ========================= */}

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Store Information
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Information about your online store.
                            </p>
                        </div>

                        {/* Store Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Store Name
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="text"
                                name="storeName"
                                value={formData.storeName}
                                onChange={handleChange}
                                placeholder="Enter your store name"
                                maxLength={150}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        {/* Store Description */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Store Description
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <textarea
                                name="storeDescription"
                                value={formData.storeDescription}
                                onChange={handleChange}
                                rows={5}
                                maxLength={1000}
                                placeholder="Describe what your store sells..."
                                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />

                            <p className="mt-1 text-right text-xs text-gray-400">
                                {formData.storeDescription.length}/1000
                            </p>
                        </div>

                        {/* Store Logo */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Store Logo URL
                            </label>

                            <input
                                type="url"
                                name="storeLogo"
                                value={formData.storeLogo}
                                onChange={handleChange}
                                placeholder="https://example.com/logo.png"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />

                            <p className="mt-1 text-xs text-gray-400">
                                You can replace this later with Cloudinary
                                image upload.
                            </p>
                        </div>

                        {/* ========================= */}
                        {/* CONTACT INFORMATION */}
                        {/* ========================= */}

                        <div className="border-t border-gray-100 pt-7">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Contact Information
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Contact details for your seller account.
                            </p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Phone Number
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+91 9876543210"
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        {/* ========================= */}
                        {/* BUSINESS ADDRESS */}
                        {/* ========================= */}

                        <div className="border-t border-gray-100 pt-7">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Business Address
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Address associated with your business.
                            </p>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Address
                                <span className="ml-1 text-red-500">
                                    *
                                </span>
                            </label>

                            <textarea
                                name="businessAddress"
                                value={formData.businessAddress}
                                onChange={handleChange}
                                rows={3}
                                placeholder="House/Building, Street, Area"
                                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        {/* City + State */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    City
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Kolkata"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    State
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="West Bengal"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                        </div>

                        {/* Postal + Country */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Postal Code
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    placeholder="700001"
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Country
                                </label>

                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    disabled
                                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* ========================= */}
                        {/* INFORMATION */}
                        {/* ========================= */}

                        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                            <p className="text-sm leading-6 text-indigo-700">
                                After submitting your request, our
                                admin team will review your information.
                                You will be notified once your seller
                                request is approved or rejected.
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Submitting Request..."
                                : "Submit Seller Request"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default SellerRequest;