import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { cartAPI } from "../../api/api";

const CartPage = () => {
  const { user } = useSelector((state) => state.user);

  const userId = user?._id;

  const [cart, setCart] = useState(null);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // GET CART
  const fetchCart = useCallback(async () => {

    if (!userId) return; console.log("Uid", userId);

    try {
      setLoading(true);
      setError("");

      const response = await cartAPI.getCart(userId);

      setCart(response?.data?.items || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch cart"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    console.log("cart", cart);
  }, cart);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // REMOVE ONE PRODUCT
  const handleRemoveItem = async (item) => {
    console.log("Itrm", item);
    try {
      setError("");
      setMessage("");

      const response = await cartAPI.removeCartItem({ userId, productId: item?.productId?._id });
      console.log("RemoveCart", response);

      setCart(response.data.data);
      setMessage(response.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to remove product"
      );
    }
  };

  // DELETE ENTIRE CART
  const handleDeleteCart = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your entire cart?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await cartAPI.deleteCart(userId);

      setCart({ userId, items: [] });
      setMessage("Entire cart deleted successfully");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete cart"
      );
    }
  };

  if (!userId) {
    return (
      <div className="p-6 text-center">
        Please log in to view your cart.
      </div>
    );
  }

  const items = cart?.items || [];

  const total = items.reduce((sum, item) => {
    return sum + item.priceAtAdded * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-[#f1f3f6] py-6">
      <div className="mx-auto max-w-6xl px-3 sm:px-6">

        {/* Header */}
        <div className="mb-5 rounded-sm bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                My Cart
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Hello, {user?.name || "Customer"}
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {cart?.length} {cart?.length === 1 ? "Product" : "Products"}
            </span>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-4 rounded-sm border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Main Cart Layout */}
        {loading ? (
          <div className="rounded-sm bg-white py-20 text-center shadow-sm">
            <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-gray-500">Loading your cart...</p>
          </div>
        ) : cart?.length === 0 ? (
          <div className="rounded-sm bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-12 w-12 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l2.4 11.2a2 2 0 002 1.6h8.8a2 2 0 002-1.6L22 7H6M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-800">
              Your cart is empty!
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Looks like you haven't added anything to your cart yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

            {/* Cart Products */}
            <div className="overflow-hidden rounded-sm bg-white shadow-sm">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="font-semibold text-gray-800">
                  Cart Items ({cart?.length})
                </h2>

                <button
                  type="button"
                  onClick={handleDeleteCart}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Delete Entire Cart
                </button>
              </div>

              <div className="divide-y divide-gray-200">
                {cart?.map((item) => {
                  const product =
                    item?.productId &&
                      typeof item.productId === "object"
                      ? item.productId
                      : null;

                  const image =
                    item.image?.[0] || product?.images?.[0];

                  const price = Number(
                    item.priceAtAdded ?? product?.price ?? 0
                  );

                  const itemQuantity = Number(item.quantity || 0);

                  return (
                    <div
                      key={item._id || product?._id || String(item.productId)}
                      className="p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row">

                        {/* Product Image */}
                        <div className="flex h-36 w-full shrink-0 items-center justify-center rounded-sm bg-white sm:h-32 sm:w-32">
                          {image ? (
                            <img
                              src={image}
                              alt={product?.name || "Product"}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                              No image
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-base font-medium text-gray-800 sm:text-lg">
                            {product?.name || "Product details unavailable"}
                          </h3>

                          {product?.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                              {product.description}
                            </p>
                          )}

                          <p className="mt-2 text-xs text-gray-400">
                            Product ID: {product?._id || item.productId}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                            <p className="text-xl font-bold text-gray-900">
                              ₹{price.toLocaleString("en-IN")}
                            </p>

                            <p className="text-sm text-gray-500">
                              Qty:{" "}
                              <span className="font-semibold text-gray-800">
                                {itemQuantity}
                              </span>
                            </p>
                          </div>

                          <p className="mt-2 text-sm text-gray-600">
                            Subtotal:{" "}
                            <span className="font-semibold text-gray-800">
                              ₹{(price * itemQuantity).toLocaleString("en-IN")}
                            </span>
                          </p>

                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveItem(item)
                              }
                              className="text-sm font-semibold uppercase tracking-wide text-gray-600 transition hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action */}
              <div className="flex justify-end border-t p-4 sm:p-5">
                <button
                  type="button"
                  className="w-full rounded-sm bg-orange-500 px-8 py-3 font-semibold uppercase text-white transition hover:bg-orange-600 sm:w-auto"
                  onClick={() => {
                    // Add your checkout navigation or handler here.
                  }}
                >
                  Continue Shopping / Checkout
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <aside className="rounded-sm bg-white shadow-sm lg:sticky lg:top-5">
              <div className="border-b px-5 py-4">
                <h2 className="font-semibold uppercase tracking-wide text-gray-500">
                  Price Details
                </h2>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-600">
                    Price ({items?.length} products)
                  </span>

                  <span className="font-medium text-gray-800">
                    ₹
                    {items?.reduce(
                      (sum, item) =>
                        sum +
                        Number(item?.priceAtAdded ?? item?.productId?.price ?? 0) *
                        Number(item?.quantity || 0),
                      0
                    )
                      .toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-600">Total items</span>

                  <span className="font-medium text-gray-800">
                    {items?.reduce(
                      (sum, item) => sum + Number(item?.quantity || 0),
                      0
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>

                <div className="border-t border-dashed pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-lg font-bold text-gray-900">
                      Total Amount
                    </span>

                    <span className="text-xl font-bold text-gray-900">
                      ₹
                      {items?.reduce(
                        (sum, item) =>
                          sum +
                          Number(item?.priceAtAdded ?? item?.productId?.price ?? 0) *
                          Number(item?.quantity || 0),
                        0
                      )
                        .toLocaleString("en-IN")}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-green-600">
                    You are viewing your cart total.
                  </p>
                </div>

                <p className="border-t pt-4 text-xs leading-5 text-gray-400">
                  Final delivery charges, discounts and taxes, if applicable,
                  will be calculated during checkout.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;