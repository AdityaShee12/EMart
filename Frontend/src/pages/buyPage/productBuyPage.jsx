import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProductBuyPage = () => {

    const product = useSelector((state) => state.product.products);

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(5);
    const [reviews, setReviews] = useState([]);

    if (!product?._id) {

        return (
            <div className="flex min-h-64 items-center justify-center px-4 text-center text-gray-500">
                Product not found. Please select a product first.
            </div>
        );
    }

    const images = product.images || [];
    const maxQuantity = Number(product.quantity) || 0;
    const price = Number(product.price) || 0;
    const navigate = useNavigate();

    const { user } = useSelector(
        (state) => state.user,
    );

    const averageRating = reviews.length > 0 ? (
        reviews.reduce((sum, item) => sum + item.rating, 0) /
        reviews.length
    ).toFixed(1)
        : null;

    const handleReviewSubmit = (e) => {
        e.preventDefault();

        if (!review.trim()) return;

        setReviews((prev) => [
            {
                id: Date.now(),
                text: review.trim(),
                rating,
                date: new Date().toLocaleDateString(),
            },
            ...prev,
        ]);

        setReview("");
        setRating(5);
    };

    const handleAddToCart = () => {

        console.log("Add to cart:", {
            productId: product._id,
            quantity,
            price,
        });
    };

    const handleBuyNow = () => {

        if (user._id) {
            navigate("/productCheckoutPage");
        } else {
            navigate("/signin");
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 px-3 py-5 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">
                {/* Breadcrumb */}
                <div className="mb-5 text-sm text-gray-500">
                    Home <span className="mx-2">/</span>
                    Products <span className="mx-2">/</span>
                    <span className="text-gray-800">{product.name}</span>
                </div>

                {/* Product overview */}
                <section className="grid grid-cols-1 gap-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 md:p-7">
                    {/* Image gallery */}
                    <div className="flex flex-col-reverse gap-4 sm:flex-row">
                        {images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-x-visible">
                                {images.map((image, index) => (
                                    <button
                                        key={`${image}-${index}`}
                                        type="button"
                                        onClick={() => setSelectedImage(index)}
                                        className={`h-16 w-16 shrink-0 rounded-lg border-2 p-1 transition ${selectedImage === index
                                            ? "border-blue-600"
                                            : "border-gray-200 hover:border-gray-400"
                                            }`}
                                        aria-label={`View image ${index + 1}`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} thumbnail ${index + 1}`}
                                            className="h-full w-full object-contain"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex min-h-72 flex-1 items-center justify-center rounded-lg bg-white p-3 sm:min-h-96">
                            {images.length > 0 ? (
                                <img
                                    src={images[selectedImage] || images[0]}
                                    alt={product.name}
                                    className="max-h-[420px] w-full object-contain"
                                />
                            ) : (
                                <div className="text-gray-400">No image available</div>
                            )}
                        </div>
                    </div>

                    {/* Product information */}
                    <div className="flex flex-col">
                        <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold capitalize text-green-700">
                            {product.status}
                        </span>

                        <h1 className="mt-3 break-words text-2xl font-semibold leading-snug text-gray-900 sm:text-3xl">
                            {product.name}
                        </h1>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                            <span className="rounded bg-green-700 px-2 py-1 font-semibold text-white">
                                {averageRating ? `${averageRating} ★` : "New"}
                            </span>
                            <span className="text-gray-500">
                                {reviews.length} reviews
                            </span>
                        </div>

                        <p className="mt-5 whitespace-pre-wrap break-words leading-7 text-gray-600">
                            {product.description || "No description available."}
                        </p>

                        <div className="mt-6 border-t border-gray-100 pt-5">
                            <p className="text-3xl font-bold text-gray-900">
                                ₹{price.toLocaleString("en-IN")}
                            </p>

                            <p className="mt-2 text-sm text-green-700">
                                {maxQuantity > 0
                                    ? `${maxQuantity} units available`
                                    : "Out of stock"}
                            </p>
                        </div>

                        {/* Quantity selector */}
                        <div className="mt-6 flex items-center gap-4">
                            <span className="font-medium text-gray-700">Quantity</span>

                            <div className="flex items-center rounded-lg border border-gray-300">
                                <button
                                    type="button"
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                    className="h-10 w-10 text-xl hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>

                                <span className="min-w-10 text-center font-semibold">
                                    {quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantity((q) => Math.min(maxQuantity, q + 1))
                                    }
                                    disabled={quantity >= maxQuantity}
                                    className="h-10 w-10 text-xl hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between rounded-lg bg-gray-50 p-4">
                            <span className="font-medium text-gray-600">Total price</span>
                            <span className="text-xl font-bold text-gray-900">
                                ₹{(price * quantity).toLocaleString("en-IN")}
                            </span>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={maxQuantity === 0 || product.status !== "approved"}
                                className="rounded-lg bg-amber-400 px-5 py-3 font-semibold text-gray-900 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Add to Cart
                            </button>

                            <button
                                type="button"
                                onClick={handleBuyNow}
                                disabled={maxQuantity === 0 || product.status !== "approved"}
                                className="rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </section>

                {/* Specifications */}
                <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                    <h2 className="border-b border-gray-200 pb-4 text-xl font-bold text-gray-900 sm:text-2xl">
                        Product Specifications
                    </h2>

                    <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
                        {[
                            ["Product Name", product.name],
                            ["Product ID", product._id],
                            ["Price", `₹${price.toLocaleString("en-IN")}`],
                            ["Available Quantity", maxQuantity],
                            ["Seller ID", product.sellerId],
                            ["Product Status", product.status],
                            [
                                "Created At",
                                product.createdAt
                                    ? new Date(product.createdAt).toLocaleDateString()
                                    : "N/A",
                            ],
                            [
                                "Last Updated",
                                product.updatedAt
                                    ? new Date(product.updatedAt).toLocaleDateString()
                                    : "N/A",
                            ],
                        ].map(([label, value], index) => (
                            <div
                                key={label}
                                className={`grid grid-cols-1 gap-1 p-4 sm:grid-cols-3 sm:gap-5 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                    }`}
                            >
                                <span className="text-sm font-medium text-gray-500">
                                    {label}
                                </span>
                                <span className="break-all text-sm text-gray-900 sm:col-span-2">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Reviews */}
                <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                    <h2 className="border-b border-gray-200 pb-4 text-xl font-bold text-gray-900 sm:text-2xl">
                        Ratings & Reviews
                    </h2>

                    <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Review form */}
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Write a Review
                            </h3>

                            <div>
                                <label
                                    htmlFor="review-rating"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Your Rating
                                </label>

                                <select
                                    id="review-rating"
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value={5}>★★★★★ - Excellent</option>
                                    <option value={4}>★★★★ - Good</option>
                                    <option value={3}>★★★ - Average</option>
                                    <option value={2}>★★ - Poor</option>
                                    <option value={1}>★ - Very Poor</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="review-text"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Your Review
                                </label>

                                <textarea
                                    id="review-text"
                                    rows={5}
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    placeholder="Share your experience with this product..."
                                    required
                                    className="w-full resize-y rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                            >
                                Submit Review
                            </button>
                        </form>

                        {/* Review list */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Customer Reviews ({reviews.length})
                            </h3>

                            {reviews.length === 0 ? (
                                <div className="mt-4 rounded-lg bg-gray-50 p-6 text-center">
                                    <p className="text-gray-500">
                                        No reviews yet. Be the first to review this product!
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-4 divide-y divide-gray-200">
                                    {reviews.map((item) => (
                                        <article key={item.id} className="py-5">
                                            <div
                                                className="text-lg text-amber-500"
                                                aria-label={`${item.rating} out of 5 stars`}
                                            >
                                                {"★".repeat(item.rating)}
                                                {"☆".repeat(5 - item.rating)}
                                            </div>

                                            <p className="mt-2 whitespace-pre-wrap break-words leading-6 text-gray-700">
                                                {item.text}
                                            </p>

                                            <p className="mt-2 text-xs text-gray-400">
                                                {item.date}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ProductBuyPage;
