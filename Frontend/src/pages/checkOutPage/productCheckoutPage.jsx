import { useState } from "react";
import { useSelector } from "react-redux";
import { orderAPI } from "../../api/api";

const ProductCheckoutPage = () => {

  const product = useSelector((state) => state.product.products);

  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [selectedImage, setSelectedImage] = useState(0);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    house: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
  });
  const { user } = useSelector(
    (state) => state.user,
  );
  const [errors, setErrors] = useState({});

  if (!product?._id) {
    return (
      <div className="flex min-h-64 items-center justify-center bg-gray-50 px-4 text-center text-gray-600">
        Product not found. Please select a product first.
      </div>
    );
  }

  const images = product.images || [];
  const price = Number(product.price) || 0;
  const stock = Number(product.quantity) || 0;
  const deliveryCharge = 0;
  const totalPrice = price * quantity + deliveryCharge;

  // Handle address input
  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setNotice("");
    setOrderSuccess(false);
  };

  // Validate address
  const validateAddress = () => {
    const newErrors = {};

    if (!address.fullName.trim()) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (!/^[6-9]\d{9}$/.test(address.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!address.house.trim()) {
      newErrors.house = "House number / building is required.";
    }

    if (!address.street.trim()) {
      newErrors.street = "Street / area is required.";
    }

    if (!address.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!address.state.trim()) {
      newErrors.state = "State is required.";
    }

    if (!/^\d{6}$/.test(address.pinCode.trim())) {
      newErrors.pinCode = "Enter a valid 6-digit PIN code.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Place order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (loading) return;

    setNotice("");
    setOrderSuccess(false);

    // Product validation
    if (product.status !== "approved") {
      setNotice("This product is not currently available for purchase.");
      return;
    }

    // Stock validation
    if (stock < 1 || quantity > stock) {
      setNotice("The selected quantity is not available in stock.");
      return;
    }

    // Address validation
    if (!validateAddress()) {
      setNotice("Please correct the delivery address details.");
      return;
    }

    // COD only
    if (paymentMethod !== "cod") {
      setNotice(
        "Online payment gateway integration is required."
      );
      return;
    }

    try {
      setLoading(true);

      // Data according to backend controller
      const orderDetails = {
        buyerId: user?._id,
        productId: product._id,
        quantity: quantity,

        shippingAddress: {
          fullName: address.fullName.trim(),
          phone: address.phone.trim(),
          house: address.house.trim(),
          street: address.street.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          pinCode: address.pinCode.trim(),
        },

        paymentMethod: "cod",
      };

      // Call backend API
      const response = await orderAPI.createOrder(orderDetails);

      console.log("Order Response:", response);

      // Handle API response
      const result = response;

      if (result?.success) {
        setOrderSuccess(true);

        setOrderId(
          result?.data?.order?._id ||
          result?.data?.orderId ||
          ""
        );

        setNotice(
          result?.message || "Order placed successfully!"
        );
      } else {
        setNotice(
          result?.message || "Unable to place order."
        );
      }

    } catch (error) {
      console.error(
        "Create Order Error:",
        error.response?.data || error
      );

      setNotice(
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while placing your order."
      );

    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `mt-1 w-full rounded-lg border bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  const paymentOptions = [
    {
      id: "upi",
      title: "UPI",
      description: "Pay using a UPI app",
      icon: "📱",
    },
    {
      id: "debit",
      title: "Debit Card",
      description: "Pay securely using your debit card",
      icon: "💳",
    },
    {
      id: "credit",
      title: "Credit Card",
      description: "Pay securely using your credit card",
      icon: "💳",
    },
    {
      id: "cod",
      title: "Cash on Delivery",
      description: "Pay when your order arrives",
      icon: "💵",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-100 px-3 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review your product, enter delivery details and choose a payment
            method.
          </p>
        </div>

        {/* Order Success */}
        {orderSuccess && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">
            <h2 className="text-lg font-bold text-green-800">
              Order Placed Successfully!
            </h2>

            <p className="mt-2 text-sm text-green-700">
              Your Cash on Delivery order has been received successfully.
            </p>

            {orderId && (
              <p className="mt-2 text-sm font-semibold text-green-800">
                Order ID: {orderId}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">

            {/* Left column */}
            <div className="space-y-6 lg:col-span-2">

              {/* Product Details */}
              <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">

                <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    1. Product Details
                  </h2>

                  <span className="text-sm text-gray-500">
                    ID: {product._id}
                  </span>
                </div>

                <div className="flex flex-col gap-5 sm:flex-row">

                  {/* Image Gallery */}
                  <div className="w-full sm:w-44">

                    <div className="flex h-52 items-center justify-center rounded-lg bg-gray-50 p-3">
                      {images.length > 0 ? (
                        <img
                          src={images[selectedImage] || images[0]}
                          alt={product.name}
                          className="max-h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-sm text-gray-400">
                          No image available
                        </span>
                      )}
                    </div>

                    {images.length > 1 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {images.map((image, index) => (
                          <button
                            type="button"
                            key={`${image}-${index}`}
                            onClick={() => setSelectedImage(index)}
                            className={`h-12 w-12 rounded-md border p-1 ${selectedImage === index
                              ? "border-blue-600"
                              : "border-gray-200"
                              }`}
                          >
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="h-full w-full object-contain"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Information */}
                  <div className="min-w-0 flex-1">

                    <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold capitalize text-green-700">
                      {product.status}
                    </span>

                    <h3 className="mt-3 break-words text-xl font-semibold text-gray-900">
                      {product.name}
                    </h3>

                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                      {product.description || "No description available."}
                    </p>

                    <p className="mt-4 text-2xl font-bold text-gray-900">
                      ₹{price.toLocaleString("en-IN")}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Seller ID: {product.sellerId}
                    </p>

                    <p
                      className={`mt-2 text-sm font-medium ${stock > 0 ? "text-green-700" : "text-red-600"
                        }`}
                    >
                      {stock > 0
                        ? `${stock} units available`
                        : "Out of stock"}
                    </p>

                    {/* Quantity */}
                    <div className="mt-5 flex items-center gap-3">

                      <label
                        htmlFor="quantity"
                        className="text-sm font-medium text-gray-700"
                      >
                        Quantity
                      </label>

                      <div className="flex items-center rounded-lg border border-gray-300">

                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((q) => Math.max(1, q - 1))
                          }
                          disabled={quantity <= 1 || loading}
                          className="h-9 w-9 text-lg hover:bg-gray-100 disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>

                        <span
                          id="quantity"
                          className="min-w-10 text-center text-sm font-semibold"
                        >
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((q) => Math.min(stock, q + 1))
                          }
                          disabled={quantity >= stock || loading}
                          className="h-9 w-9 text-lg hover:bg-gray-100 disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>

                      </div>
                    </div>

                  </div>
                </div>
              </section>

              {/* Delivery Address */}
              <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">

                <h2 className="border-b border-gray-100 pb-4 text-lg font-bold text-gray-900">
                  2. Delivery Address
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Full Name *
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      value={address.fullName}
                      onChange={handleAddressChange}
                      autoComplete="name"
                      placeholder="Enter your full name"
                      className={inputClass("fullName")}
                    />

                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Mobile Number *
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={address.phone}
                      onChange={handleAddressChange}
                      autoComplete="tel-national"
                      placeholder="10-digit mobile number"
                      className={inputClass("phone")}
                    />

                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* House */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="house"
                      className="text-sm font-medium text-gray-700"
                    >
                      House No. / Building *
                    </label>

                    <input
                      id="house"
                      name="house"
                      value={address.house}
                      onChange={handleAddressChange}
                      autoComplete="address-line1"
                      placeholder="Flat, house number, building"
                      className={inputClass("house")}
                    />

                    {errors.house && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.house}
                      </p>
                    )}
                  </div>

                  {/* Street */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="street"
                      className="text-sm font-medium text-gray-700"
                    >
                      Street / Area / Landmark *
                    </label>

                    <input
                      id="street"
                      name="street"
                      value={address.street}
                      onChange={handleAddressChange}
                      autoComplete="address-line2"
                      placeholder="Enter street, area or landmark"
                      className={inputClass("street")}
                    />

                    {errors.street && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.street}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label
                      htmlFor="city"
                      className="text-sm font-medium text-gray-700"
                    >
                      City *
                    </label>

                    <input
                      id="city"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      autoComplete="address-level2"
                      placeholder="Enter city"
                      className={inputClass("city")}
                    />

                    {errors.city && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label
                      htmlFor="state"
                      className="text-sm font-medium text-gray-700"
                    >
                      State *
                    </label>

                    <input
                      id="state"
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      autoComplete="address-level1"
                      placeholder="Enter state"
                      className={inputClass("state")}
                    />

                    {errors.state && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label
                      htmlFor="pinCode"
                      className="text-sm font-medium text-gray-700"
                    >
                      PIN Code *
                    </label>

                    <input
                      id="pinCode"
                      name="pinCode"
                      inputMode="numeric"
                      maxLength={6}
                      value={address.pinCode}
                      onChange={handleAddressChange}
                      autoComplete="postal-code"
                      placeholder="6-digit PIN code"
                      className={inputClass("pinCode")}
                    />

                    {errors.pinCode && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.pinCode}
                      </p>
                    )}
                  </div>

                </div>
              </section>

              {/* Payment Methods */}
              <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">

                <h2 className="border-b border-gray-100 pb-4 text-lg font-bold text-gray-900">
                  3. Payment Method
                </h2>

                <div className="mt-5 space-y-3">

                  {paymentOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${paymentMethod === option.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-400"
                        }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.id}
                        checked={paymentMethod === option.id}
                        disabled={loading || orderSuccess}
                        onChange={(e) => {
                          setPaymentMethod(e.target.value);
                          setNotice("");
                        }}
                        className="mt-1 h-4 w-4 accent-blue-600"
                      />

                      <span className="text-2xl" aria-hidden="true">
                        {option.icon}
                      </span>

                      <span className="flex-1">

                        <span className="block font-semibold text-gray-900">
                          {option.title}
                        </span>

                        <span className="mt-1 block text-sm text-gray-500">
                          {option.description}
                        </span>

                      </span>
                    </label>
                  ))}

                </div>

                <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-600">

                  {paymentMethod === "upi" &&
                    "UPI selected. You will need to connect a payment gateway to complete the UPI payment securely."}

                  {(paymentMethod === "debit" ||
                    paymentMethod === "credit") &&
                    "Card payment selected. Card details should be entered through your payment gateway's secure checkout, not stored in your application."}

                  {paymentMethod === "cod" &&
                    "Cash on Delivery selected. Payment will be collected at delivery, subject to your store's COD policy."}

                </div>
              </section>

            </div>

            {/* Right Column: Order Summary */}
            <aside className="lg:sticky lg:top-6">

              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                <h2 className="border-b border-gray-100 pb-4 text-lg font-bold text-gray-900">
                  Order Summary
                </h2>

                <div className="mt-5 space-y-4 text-sm">

                  <div className="flex items-start justify-between gap-3">
                    <span className="text-gray-600">
                      Product price × {quantity}
                    </span>

                    <span className="font-medium text-gray-900">
                      ₹{(price * quantity).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-gray-600">
                      Delivery charge
                    </span>

                    <span className="font-medium text-green-700">
                      {deliveryCharge === 0
                        ? "Free"
                        : `₹${deliveryCharge.toLocaleString("en-IN")}`}
                    </span>
                  </div>

                  <div className="border-t border-dashed border-gray-300 pt-4">

                    <div className="flex justify-between gap-3">

                      <span className="font-bold text-gray-900">
                        Total Amount
                      </span>

                      <span className="text-xl font-bold text-gray-900">
                        ₹{totalPrice.toLocaleString("en-IN")}
                      </span>

                    </div>

                  </div>

                </div>

                <div className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-800">

                  Payment:{" "}

                  <span className="font-semibold">
                    {paymentOptions.find(
                      (option) => option.id === paymentMethod
                    )?.title}
                  </span>

                </div>

                {/* Notice */}
                {notice && (
                  <div
                    role="status"
                    className={`mt-4 rounded-lg border p-3 text-sm leading-6 ${orderSuccess
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-700"
                      }`}
                  >
                    {notice}
                  </div>
                )}

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    orderSuccess ||
                    stock < 1 ||
                    quantity > stock ||
                    product.status !== "approved"
                  }
                  className="mt-5 w-full rounded-lg bg-orange-600 px-4 py-3.5 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Placing Order..."
                    : orderSuccess
                      ? "Order Placed"
                      : paymentMethod === "cod"
                        ? "Place COD Order"
                        : "Continue to Payment"}
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                  Your order will be processed after server-side validation
                  and payment confirmation.
                </p>

              </section>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ProductCheckoutPage;
