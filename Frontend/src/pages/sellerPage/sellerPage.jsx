import React, { useEffect, useState } from "react";

const SellerPage = () => {

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    images: [],
  });

  // -----------------------------
  // Get Seller Profile
  // -----------------------------
  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const res = await fetch("/api/seller/profile", {
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setStore(data.sellerProfile);
        }
      } catch (error) {
        console.error("Seller profile error:", error);
      }
    };

    fetchSellerProfile();
  }, []);

  // -----------------------------
  // Get Seller Products
  // -----------------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products/my-products", {
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Products error:", error);
      }
    };

    fetchProducts();
  }, []);

  // -----------------------------
  // Input Change
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -----------------------------
  // Image Change
  // -----------------------------
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setForm((prev) => ({
      ...prev,
      images: files,
    }));

    const previews = files.map((file) => URL.createObjectURL(file));

    setPreviewImages(previews);
  };

  // -----------------------------
  // Submit Product
  // -----------------------------
  const handleSubmit = async (e, status = "pending") => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Product name is required");
      return;
    }

    if (!form.price) {
      alert("Product price is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("status", status);

      form.images.forEach((image) => {
        formData.append("images", image);
      });

      const res = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Product upload failed");
        return;
      }

      alert(
        status === "draft"
          ? "Product saved as draft"
          : "Product submitted successfully"
      );

      setForm({
        name: "",
        description: "",
        price: "",
        images: [],
      });

      setPreviewImages([]);

      // Add newly created product
      if (data.product) {
        setProducts((prev) => [data.product, ...prev]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Status Badge
  // -----------------------------
  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "draft":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =================================
          HEADER
      ================================= */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Seller Dashboard
            </h1>

            <p className="text-sm text-gray-500">
              Manage your products and store
            </p>
          </div>

          {store && (
            <div className="flex items-center gap-3">

              {store.storeLogo ? (
                <img
                  src={store.storeLogo}
                  alt={store.storeName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {store.storeName?.charAt(0)}
                </div>
              )}

              <div>
                <p className="font-semibold text-gray-800">
                  {store.storeName}
                </p>

                <p
                  className={`text-xs font-medium capitalize ${store.verificationStatus === "approved"
                    ? "text-green-600"
                    : store.verificationStatus === "rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                    }`}
                >
                  {store.verificationStatus}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* =================================
          MAIN
      ================================= */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* =================================
              LEFT - PRODUCT FORM
          ================================= */}
          <div className="lg:col-span-2">

            <div className="bg-white rounded-2xl shadow-sm border p-6">

              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Add New Product
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Add your product information and submit it for approval.
                </p>
              </div>

              <form onSubmit={handleSubmit}>

                {/* Product Name */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Describe your product..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Price */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      ₹
                    </span>

                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      min="0"
                      placeholder="0.00"
                      className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />

                  </div>
                </div>

                {/* Images */}
                <div className="mb-6">

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>

                  <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition">

                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                      <svg
                        className="w-6 h-6 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>

                    <p className="text-sm font-medium text-gray-700">
                      Click to upload images
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG or WEBP
                    </p>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                  </label>

                </div>

                {/* Image Preview */}
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">

                    {previewImages.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-xl overflow-hidden border"
                      >
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}

                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">

                  <button
                    type="button"
                    disabled={loading}
                    onClick={(e) => handleSubmit(e, "draft")}
                    className="flex-1 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Save as Draft
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {loading ? "Uploading..." : "Submit for Approval"}
                  </button>

                </div>

              </form>

            </div>
          </div>

          {/* =================================
              RIGHT - STORE INFO
          ================================= */}
          <div className="space-y-6">

            {/* Store Card */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">

              <h3 className="font-bold text-gray-900 mb-5">
                Your Store
              </h3>

              {store ? (
                <div>

                  <div className="flex items-center gap-4">

                    {store.storeLogo ? (
                      <img
                        src={store.storeLogo}
                        alt={store.storeName}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                        {store.storeName?.charAt(0)}
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-gray-900">
                        {store.storeName}
                      </h4>

                      <span
                        className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyle(
                          store.verificationStatus
                        )}`}
                      >
                        {store.verificationStatus}
                      </span>
                    </div>

                  </div>

                  {store.storeDescription && (
                    <p className="text-sm text-gray-500 mt-5 leading-6">
                      {store.storeDescription}
                    </p>
                  )}

                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Loading store information...
                </p>
              )}

            </div>

            {/* Product Stats */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">

              <h3 className="font-bold text-gray-900 mb-5">
                Product Overview
              </h3>

              <div className="grid grid-cols-2 gap-3">

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {products.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Total Products
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-yellow-700">
                    {
                      products.filter(
                        (product) => product.status === "pending"
                      ).length
                    }
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Pending
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-green-700">
                    {
                      products.filter(
                        (product) => product.status === "approved"
                      ).length
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Approved
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-red-700">
                    {
                      products.filter(
                        (product) => product.status === "rejected"
                      ).length
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Rejected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================
            PRODUCT LIST
        ================================= */}
        <section className="mt-10">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                My Products
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Products uploaded by your store
              </p>
            </div>
          </div>

          {products.length === 0 ? (

            <div className="bg-white border rounded-2xl p-12 text-center">

              <div className="text-4xl mb-3">
                📦
              </div>

              <h3 className="font-semibold text-gray-800">
                No products yet
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Add your first product using the form above.
              </p>
            </div>
          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {products.map((product) => (

                <div
                  key={product._id}
                  className="bg-white border rounded-2xl overflow-hidden hover:shadow-md transition"
                >

                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100">

                    {product.images?.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}

                  </div>

                  <div className="p-4">

                    <div className="flex items-start justify-between gap-2">

                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {product.name}
                      </h3>

                      <span
                        className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-semibold capitalize ${getStatusStyle(
                          product.status
                        )}`}
                      >
                        {product.status}
                      </span>

                    </div>

                    <p className="text-lg font-bold text-indigo-600 mt-2">
                      ₹{product.price}
                    </p>

                    {product.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Rejection Reason */}
                    {product.status === "rejected" && product.rejectionReason && (
                      <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3">

                        <p className="text-xs font-semibold text-red-700">
                          Rejection reason
                        </p>

                        <p className="text-xs text-red-600 mt-1">
                          {product.rejectionReason}
                        </p>

                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SellerPage;