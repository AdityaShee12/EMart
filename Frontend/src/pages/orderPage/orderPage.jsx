import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { orderAPI } from "../../api/api";
import { useSelector } from "react-redux";
import {
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaChevronRight,
  FaStar,
  FaBoxOpen,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Order Progress Component
const OrderProgress = ({ status }) => {

  const steps = [
    {
      label: "Order Placed",
      status: "pending",
      icon: FaClock
    },
    {
      label: "Order Confirmed",
      status: "confirmed",
      icon: FaCheckCircle
    },
    {
      label: "Processing",
      status: "processing",
      icon: FaBoxOpen
    },
    {
      label: "Shipped",
      status: "shipped",
      icon: FaTruck
    },
    {
      label: "Delivered",
      status: "delivered",
      icon: FaCheckCircle
    }
  ];

  const currentStep = steps.findIndex(
    (step) => step.status === status
  );

  const isCancelled = status === "cancelled";
  const isReturned = status === "returned";

  if (isCancelled || isReturned) {
    return (
      <div className="mt-5 p-4 bg-red-50 rounded-xl">
        <div className="flex items-center gap-3">
          <FaTimesCircle className="text-red-500 text-xl" />

          <div>
            <h3 className="font-semibold text-red-600">
              {isCancelled ? "Order Cancelled" : "Order Returned"}
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              {isCancelled
                ? "This order has been cancelled."
                : "This order has been returned."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 bg-white rounded-xl p-4">
      <h3 className="font-bold text-gray-800 mb-6">
        Order Progress
      </h3>

      <div>
        {steps.map((step, index) => {
          const completed = index < currentStep;
          const active = index === currentStep;

          const StepIcon = step.icon;

          return (
            <div
              key={step.status}
              className="relative flex gap-4 pb-8 last:pb-0"
            >
              {/* Connecting Line */}
              {index !== steps.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-0 w-[3px] bg-gray-200">
                  <div
                    className={`w-full bg-green-500 transition-all duration-500 ${
                      completed ? "h-full" : "h-0"
                    }`}
                  />
                </div>
              )}

              {/* Progress Circle */}
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                  completed
                    ? "bg-green-500 border-green-500 text-white"
                    : active
                    ? "bg-white border-green-500 text-green-500"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {completed ? (
                  <FaCheckCircle size={17} />
                ) : (
                  <StepIcon size={15} />
                )}
              </div>

              {/* Step Details */}
              <div className="pt-1">
                <h4
                  className={`font-medium ${
                    completed || active
                      ? "text-gray-800"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </h4>

                {completed && (
                  <p className="text-xs text-green-600 mt-1">
                    Completed
                  </p>
                )}

                {active && (
                  <p className="text-xs text-blue-600 mt-1">
                    Current Status
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [ratings, setRatings] = useState({});

  const navigate = useNavigate();

  const { user } = useSelector(
    (state) => state.user
  );

  // Fetch Orders
  const fetchOrder = useCallback(async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      setError("");

      const response = await orderAPI.getOrders({
        userId: user._id
      });

      console.log("Orders Response:", response);

      setOrders(response?.data?.orders || []);

    } catch (error) {
      console.error("Fetch Orders Error:", error);

      setError(
        error?.response?.data?.message ||
        "Failed to fetch orders"
      );

    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Date Formatter
  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );
  };

  // Status Configuration
  const getStatusInfo = (status) => {
    const statusConfig = {
      pending: {
        label: "Order Placed",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        icon: FaClock
      },

      confirmed: {
        label: "Confirmed",
        color: "text-blue-600",
        bg: "bg-blue-50",
        icon: FaCheckCircle
      },

      processing: {
        label: "Processing",
        color: "text-blue-600",
        bg: "bg-blue-50",
        icon: FaBoxOpen
      },

      shipped: {
        label: "Shipped",
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        icon: FaTruck
      },

      delivered: {
        label: "Delivered",
        color: "text-green-600",
        bg: "bg-green-50",
        icon: FaCheckCircle
      },

      cancelled: {
        label: "Cancelled",
        color: "text-red-600",
        bg: "bg-red-50",
        icon: FaTimesCircle
      },

      returned: {
        label: "Returned",
        color: "text-orange-600",
        bg: "bg-orange-50",
        icon: FaBoxOpen
      }
    };

    return statusConfig[status] || {
      label: status || "Unknown",
      color: "text-gray-600",
      bg: "bg-gray-100",
      icon: FaBoxOpen
    };
  };

  // Filter Options
  const filters = [
    "All",
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Returned"
  ];

  // Search and Filter Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const productName =
        order?.productId?.name || "";

      const searchMatch =
        productName.toLowerCase().includes(
          search.toLowerCase()
        );

      const statusMatch =
        activeFilter === "All" ||
        order?.status?.toLowerCase() ===
        activeFilter.toLowerCase();

      return searchMatch && statusMatch;
    });
  }, [orders, search, activeFilter]);


  // Rating Handler
  const handleRating = (orderId, rating) => {
    setRatings((prev) => ({
      ...prev,
      [orderId]: rating
    }));
  };

  // Toggle Order Details
  const toggleOrderDetails = (orderId) => {
    setExpandedOrder((prev) =>
      prev === orderId ? null : orderId
    );
  };

  // Delivery Details Navigation
  const deliveryDetails = () => {
    navigate("/deliveryDetails");
  };

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">

          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-gray-500">
            Loading your orders...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-5">
          <div className="flex items-center gap-5">

            <button
              onClick={() => window.history.back()}
              className="text-xl hover:text-blue-600"
            >
              <FaArrowLeft />
            </button>

            <h1 className="text-2xl font-bold text-gray-800">
              My Orders
            </h1>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-4 pt-6">

          {/* Search */}
          <div className="flex items-center gap-3">

            <div className="flex-1 flex items-center border border-gray-300 rounded-xl px-4 py-3">
              <FaSearch className="text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search your orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none px-3 text-gray-700 bg-transparent"
              />
            </div>
            <button
              onClick={() => setActiveFilter("All")}
              className="flex items-center gap-2 text-gray-700 px-2"
            >
              <FaFilter className="text-lg" />
              <span className="font-medium">
                Filters
              </span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 overflow-x-auto py-6 scrollbar-hide">

            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 px-6 py-3 rounded-xl border text-sm sm:text-base transition ${
                  activeFilter === filter
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {filter}
              </button>
            ))}

          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 p-4 bg-red-50 text-red-600 rounded-xl flex justify-between items-center">

            <p>{error}</p>
            <button
              onClick={fetchOrder}
              className="font-semibold underline"
            >
              Retry
            </button>

          </div>
        )}

        {/* Orders List */}
        <div className="mt-2">

          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const product = order?.productId;

              const statusInfo = getStatusInfo(
                order?.status
              );

              const StatusIcon = statusInfo.icon;

              const isExpanded =
                expandedOrder === order._id;

              const isDelivered =
                order?.status === "delivered";


              return (
                <div
                  key={order._id}
                  className="border-b border-gray-200"
                >

                  {/* Order Card */}
                  <div className="px-4 py-6">

                    <div className="flex items-center gap-4">

                      {/* Product Image */}
                      <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 bg-gray-100 rounded-2xl overflow-hidden">

                        {product?.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaBoxOpen className="text-4xl" />
                          </div>
                        )}

                      </div>


                      {/* Product Details */}
                      <div className="flex-1 min-w-0">

                        <div className="flex items-center justify-between gap-2">

                          <div className="min-w-0">

                            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${statusInfo.bg}`}>

                              <StatusIcon
                                className={`text-xs ${statusInfo.color}`}
                              />

                              <span className={`text-xs font-semibold ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>

                            </div>


                            <p className="font-bold text-base sm:text-lg mt-2 text-gray-800">

                              {isDelivered
                                ? `Delivered on ${formatDate(order?.updatedAt)}`
                                : `Order ${formatDate(order?.createdAt)}`
                              }

                            </p>

                          </div>


                          <button
                            onClick={() =>
                              toggleOrderDetails(order._id)
                            }
                            className="text-xl shrink-0"
                          >
                            <FaChevronRight
                              className={`transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </button>

                        </div>


                        <p className="text-gray-500 text-sm sm:text-base mt-2 truncate">
                          {product?.name || "Product unavailable"}
                        </p>


                        <p className="text-gray-700 font-semibold mt-2">

                          ₹{order?.unitPrice?.toLocaleString("en-IN")}

                          <span className="text-gray-500 font-normal text-sm ml-2">
                            Qty: {order?.quantity}
                          </span>

                        </p>

                      </div>
                    </div>


                    {/* Rating Section */}
                    {isDelivered && (
                      <div className="mt-5 bg-gray-50 rounded-xl p-4">

                        <div className="flex flex-wrap items-center justify-between gap-3">

                          <span className="text-gray-700 font-medium">
                            Rate & Review
                          </span>

                          <div className="flex gap-2">

                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() =>
                                  handleRating(order._id, star)
                                }
                                className="text-2xl"
                              >
                                <FaStar
                                  className={
                                    star <= (ratings[order._id] || 0)
                                      ? "text-yellow-400"
                                      : "text-gray-400"
                                  }
                                />
                              </button>
                            ))}

                          </div>
                        </div>


                        {ratings[order._id] && (
                          <p className="text-xs text-green-600 mt-2">
                            You selected {ratings[order._id]} stars.
                          </p>
                        )}

                      </div>
                    )}


                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <div className="mt-5 bg-gray-50 rounded-xl p-4 space-y-4">

                        <h3 className="font-bold text-gray-800">
                          Order Details
                        </h3>


                        {/* Order Progress */}
                        <OrderProgress status={order?.status} />


                        {/* Order ID */}
                        <div className="flex justify-between gap-3">

                          <span className="text-gray-500">
                            Order ID
                          </span>

                          <span className="text-sm font-medium break-all">
                            {order._id}
                          </span>

                        </div>


                        {/* Order Date */}
                        <div className="flex justify-between">

                          <span className="text-gray-500">
                            Order Date
                          </span>

                          <span className="font-medium">
                            {formatDate(order.createdAt)}
                          </span>

                        </div>


                        {/* Quantity */}
                        <div className="flex justify-between">

                          <span className="text-gray-500">
                            Quantity
                          </span>

                          <span className="font-medium">
                            {order.quantity}
                          </span>

                        </div>


                        {/* Unit Price */}
                        <div className="flex justify-between">

                          <span className="text-gray-500">
                            Unit Price
                          </span>

                          <span className="font-medium">
                            ₹{order.unitPrice?.toLocaleString("en-IN")}
                          </span>

                        </div>


                        {/* Delivery Charge */}
                        <div className="flex justify-between">

                          <span className="text-gray-500">
                            Delivery Charge
                          </span>

                          <span className="font-medium">
                            ₹{order.deliveryCharge || 0}
                          </span>

                        </div>


                        {/* Payment Method */}
                        <div className="flex justify-between">

                          <span className="text-gray-500">
                            Payment Method
                          </span>

                          <span className="font-medium uppercase">
                            {order.paymentMethod}
                          </span>

                        </div>


                        {/* Payment Status */}
                        <div className="flex justify-between">

                          <span className="text-gray-500">
                            Payment Status
                          </span>

                          <span className="font-medium capitalize">
                            {order.paymentStatus}
                          </span>

                        </div>


                        {/* Total Amount */}
                        <div className="border-t pt-3 flex justify-between text-lg font-bold">

                          <span>Total Amount</span>

                          <span className="text-blue-600">
                            ₹{order.totalAmount?.toLocaleString("en-IN")}
                          </span>

                        </div>


                        {/* Shipping Address */}
                        <div className="border-t pt-4">

                          <h4 className="font-bold mb-3">
                            Delivery Address
                          </h4>

                          <p className="text-gray-700 font-medium">
                            {order.shippingAddress?.name}
                          </p>

                          <p className="text-gray-500 text-sm mt-1">
                            {order.shippingAddress?.addressLine}
                          </p>

                          <p className="text-gray-500 text-sm">
                            {order.shippingAddress?.city},{" "}
                            {order.shippingAddress?.state} -{" "}
                            {order.shippingAddress?.postalCode}
                          </p>

                          <p className="text-gray-500 text-sm">
                            {order.shippingAddress?.country}
                          </p>

                          <p className="text-gray-500 text-sm mt-2">
                            Phone: {order.shippingAddress?.phone}
                          </p>

                        </div>

                      </div>
                    )}


                    {/* Delivery Details Button */}
                    <button
                      className="w-full mt-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                      onClick={deliveryDetails}
                    >
                      Delivery Details
                    </button>

                  </div>
                </div>
              );
            })

          ) : (
            /* Empty State */
            !error && (
              <div className="flex flex-col items-center justify-center py-20 px-5">

                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
                  <FaBoxOpen className="text-5xl text-blue-500" />
                </div>

                <h2 className="text-xl font-bold mt-5">
                  No Orders Found
                </h2>

                <p className="text-gray-500 text-center mt-2">
                  {search
                    ? "Try searching with a different product name."
                    : "You haven't placed any orders yet."
                  }
                </p>

              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
};

export default OrderPage;