import { useEffect, useMemo, useState } from "react";
import { superAdminAPI } from "../../api/api.js";
import { useDispatch, useSelector } from "react-redux";

const SuperAdminPage = () => {
    // =========================================================
    // STATES
    // =========================================================
    const [activeTab, setActiveTab] = useState("dashboard");
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [sellerRequests, setSellerRequests] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [products, setProducts] = useState([]);
    const [advertisements, setAdvertisements] = useState([]);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedAdvertisement, setSelectedAdvertisement] = useState(null);

    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showAdvertisementModal, setShowAdvertisementModal] = useState(false);

    const [rejectionReason, setRejectionReason] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const { user } = useSelector(
        (state) => state.user,
    );

    const [message, setMessage] = useState({
        type: "",
        text: ""
    });

    // Advertisement form
    const [advertisementForm, setAdvertisementForm] = useState({
        title: "",
        subtitle: "",
        description: "",
        buttonText: "Shop Now",
        buttonLink: "/products",
        offerText: "",
        position: "homepage",
        status: "draft",
        startDate: "",
        endDate: "",
        priority: 0,
        images: [],
        mobileImage: null
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [mobileImagePreview, setMobileImagePreview] = useState("");

    // =========================================================
    // MESSAGE
    // =========================================================
    const showMessage = (type, text) => {
        setMessage({ type, text });

        window.setTimeout(() => {
            setMessage({
                type: "",
                text: ""
            });
        }, 4000);
    };

    // =========================================================
    // FETCH DATA
    // =========================================================
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [sellerRequestResponse, sellerResponse, productResponse] = await Promise.all([
                superAdminAPI.getSellerRequests(),
                superAdminAPI.getSeller(),
                superAdminAPI.getProducts()
            ]);

            setSellerRequests(
                sellerRequestResponse?.data?.sellerRequests || []
            );

            setSellers(sellerResponse?.data?.sellers || []);
            setProducts(productResponse?.data?.products || []);

            // This endpoint is optional until you add it to api.js/backend.
            if (superAdminAPI.getAdvertisements) {
                const advertisementResponse =
                    await superAdminAPI.getAdvertisements();

                setAdvertisements(
                    advertisementResponse?.data?.advertisements || []
                );
            }
        } catch (error) {
            console.error("Fetch dashboard data error:", error);

            showMessage(
                "error",
                error.response?.data?.message ||
                "Failed to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // ADVERTISEMENT FORM
    // =========================================================
    const resetAdvertisementForm = () => {
        setAdvertisementForm({
            title: "",
            subtitle: "",
            description: "",
            buttonText: "Shop Now",
            buttonLink: "/products",
            offerText: "",
            position: "homepage",
            status: "draft",
            startDate: "",
            endDate: "",
            priority: 0,
            images: [],
            mobileImage: null
        });

        setImagePreviews([]);
        setMobileImagePreview("");
        setSelectedAdvertisement(null);
    };

    const openCreateAdvertisement = () => {
        resetAdvertisementForm();
        setShowAdvertisementModal(true);
    };

    const closeAdvertisementModal = () => {
        if (actionLoading) return;

        setShowAdvertisementModal(false);
        resetAdvertisementForm();
    };

    const handleAdvertisementInput = (event) => {
        const { name, value } = event.target;

        setAdvertisementForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleAdvertisementImages = (event) => {
        const files = Array.from(event.target.files || []);

        if (files.length < 1) {
            return;
        }

        if (files.length > 5) {
            showMessage(
                "error",
                "You can upload maximum 5 advertisement images."
            );
            event.target.value = "";
            return;
        }

        const invalidFile = files.find(
            (file) => !file.type.startsWith("image/")
        );

        if (invalidFile) {
            showMessage("error", "Only image files are allowed.");
            event.target.value = "";
            return;
        }

        setAdvertisementForm((previous) => ({
            ...previous,
            images: files
        }));

        setImagePreviews(
            files.map((file) => ({
                name: file.name,
                url: URL.createObjectURL(file)
            }))
        );
    };

    const handleMobileImage = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            showMessage("error", "Mobile image must be an image file.");
            event.target.value = "";
            return;
        }

        setAdvertisementForm((previous) => ({
            ...previous,
            mobileImage: file
        }));

        setMobileImagePreview(URL.createObjectURL(file));
    };

    const handleUploadAdvertisement = async (event) => {
        event.preventDefault();

        if (!advertisementForm.title.trim()) {
            showMessage("error", "Advertisement title is required.");
            return;
        }

        if (advertisementForm.images.length < 1) {
            showMessage(
                "error",
                "At least 1 advertisement image is required."
            );
            return;
        }

        if (advertisementForm.images.length > 5) {
            showMessage(
                "error",
                "Advertisement can contain maximum 5 images."
            );
            return;
        }

        if (!advertisementForm.startDate) {
            showMessage("error", "Start date is required.");
            return;
        }

        if (!advertisementForm.endDate) {
            showMessage("error", "End date is required.");
            return;
        }

        if (new Date(advertisementForm.endDate) < new Date(advertisementForm.startDate)) {
            showMessage(
                "error",
                "End date cannot be before start date."
            );
            return;
        }

        try {
            setActionLoading(true);

            /*
             * Backend should receive:
             * images -> multiple image files
             * mobileImage -> optional mobile image
             * other fields -> normal text/form-data fields
             */
            const formData = new FormData();

            formData.append(
                "superAdminId",
                user._id
            );

            formData.append(
                "title",
                advertisementForm.title.trim()
            );

            formData.append(
                "subtitle",
                advertisementForm.subtitle.trim()
            );

            formData.append(
                "description",
                advertisementForm.description.trim()
            );

            formData.append(
                "buttonText",
                advertisementForm.buttonText.trim()
            );

            formData.append(
                "buttonLink",
                advertisementForm.buttonLink.trim()
            );

            formData.append(
                "offerText",
                advertisementForm.offerText.trim()
            );

            formData.append(
                "position",
                advertisementForm.position
            );

            formData.append(
                "status",
                advertisementForm.status
            );

            formData.append(
                "startDate",
                advertisementForm.startDate
            );

            formData.append(
                "endDate",
                advertisementForm.endDate
            );

            formData.append(
                "priority",
                String(Number(advertisementForm.priority) || 0)
            );

            advertisementForm.images.forEach((file) => {
                formData.append("images", file);
            });

            if (advertisementForm.mobileImage) {
                formData.append(
                    "mobileImage",
                    advertisementForm.mobileImage
                );
            }

            if (!superAdminAPI.uploadAdvertisement) {
                throw new Error(
                    "uploadAdvertisement API is not configured in api.js"
                );
            }
            console.log("Formdata logs");

            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }
            const response = await superAdminAPI.uploadAdvertisement(formData);

            showMessage(
                "success",
                response?.data?.message ||
                "Advertisement uploaded successfully."
            );

            closeAdvertisementModal();
            await fetchDashboardData();
        } catch (error) {
            console.error(
                "Upload advertisement error:",
                error
            );

            showMessage(
                "error",
                error.response?.data?.message ||
                error.message ||
                "Failed to upload advertisement."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const filteredAdvertisements = useMemo(() => {
        const text = search.trim().toLowerCase();

        return advertisements.filter((ad) => {
            const title =
                ad.title?.toLowerCase() || "";

            const position =
                ad.position?.toLowerCase() || "";

            const matchesSearch =
                !text ||
                title.includes(text) ||
                position.includes(text);

            const matchesStatus =
                statusFilter === "all" ||
                ad.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        advertisements,
        search,
        statusFilter
    ]);

    useEffect(() => {

        const getAdvertisement = async () => {
            console.log("Si", user._id);

            const advertisementResponse = await superAdminAPI.getAdvertisements(user._id);
            console.log("Adres", advertisementResponse);

            setAdvertisements(advertisementResponse?.data?.advertisements);
        }

        getAdvertisement();
    }, []);

    // =========================================================
    // SELLER REQUEST
    // =========================================================
    const handleViewRequest = async (request) => {
        try {
            setActionLoading(true);

            if (superAdminAPI.getSellerRequestById) {
                const response =
                    await superAdminAPI.getSellerRequestById(
                        request._id
                    );

                setSelectedRequest(
                    response?.data?.data?.request ||
                    response?.data?.request ||
                    request
                );
            } else {
                setSelectedRequest(request);
            }

            setShowRequestModal(true);
        } catch (error) {
            console.error(
                "Get seller request details error:",
                error
            );

            showMessage(
                "error",
                error.response?.data?.message ||
                "Failed to load seller request details."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const closeRequestModal = () => {
        setSelectedRequest(null);
        setShowRequestModal(false);
    };

    const handleSellerRequest = async (
        request,
        requestReply,
        reason = ""
    ) => {
        try {
            setActionLoading(true);

            const buyerId =
                typeof request.userId === "object"
                    ? request.userId?._id
                    : request.userId;

            if (!buyerId) {
                showMessage(
                    "error",
                    "Buyer ID not found."
                );
                return;
            }

            const response =
                await superAdminAPI.sellerRequestReply(
                    buyerId,
                    requestReply,
                    reason
                );

            showMessage(
                "success",
                response?.data?.message ||
                (requestReply === 1
                    ? "Seller approved successfully."
                    : "Seller request rejected successfully.")
            );

            closeRequestModal();
            setShowRejectModal(false);
            setRejectionReason("");

            await fetchDashboardData();
        } catch (error) {
            console.error(
                "Seller request action error:",
                error
            );

            showMessage(
                "error",
                error.response?.data?.message ||
                "Failed to update seller request."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleApproveSeller = (request) => {
        handleSellerRequest(request, 1, "");
    };

    const handleOpenRejectModal = (request) => {
        setSelectedRequest(request);
        setRejectionReason("");
        setShowRejectModal(true);
    };

    const closeRejectModal = () => {
        if (actionLoading) return;

        setShowRejectModal(false);
        setRejectionReason("");
    };

    const handleRejectSeller = async (event) => {
        event.preventDefault();

        if (!rejectionReason.trim()) {
            showMessage(
                "error",
                "Rejection reason is required."
            );
            return;
        }

        await handleSellerRequest(
            selectedRequest,
            0,
            rejectionReason.trim()
        );
    };

    // =========================================================
    // PRODUCT STATUS
    // =========================================================
    const productStatus = async (
        productId,
        status,
        reason = ""
    ) => {
        try {
            setActionLoading(true);

            const response =
                await superAdminAPI.updateProductStatus(
                    productId,
                    status,
                    reason
                );

            showMessage(
                "success",
                response?.data?.message ||
                (status === 1
                    ? "Product approved successfully."
                    : "Product rejected successfully.")
            );

            await fetchDashboardData();
        } catch (error) {
            console.error(
                "Product status update error:",
                error
            );

            showMessage(
                "error",
                error.response?.data?.message ||
                "Failed to update product status."
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectProduct = (product) => {
        const reason = window.prompt(
            "Enter rejection reason:"
        );

        if (!reason?.trim()) {
            return;
        }

        productStatus(
            product._id,
            0,
            reason.trim()
        );
    };

    // =========================================================
    // FILTERS
    // =========================================================
    const filteredSellerRequests = useMemo(() => {
        const text = search.trim().toLowerCase();

        return sellerRequests.filter((request) => {
            const name =
                request.userId?.name?.toLowerCase() || "";

            const email =
                request.userId?.email?.toLowerCase() || "";

            const store =
                request.storeName?.toLowerCase() || "";

            const matchesSearch =
                !text ||
                name.includes(text) ||
                email.includes(text) ||
                store.includes(text);

            const matchesStatus =
                statusFilter === "all" ||
                request.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        sellerRequests,
        search,
        statusFilter
    ]);

    // =========================================================
    // COUNTS
    // =========================================================
    const pendingSellerRequests = sellerRequests.filter(
        (request) =>
            request.status === "pending"
    ).length;

    const pendingProducts = products.filter(
        (product) =>
            product.status === "pending"
    ).length;

    const activeAdvertisements = advertisements.filter(
        (ad) =>
            ad.status === "active"
    ).length;

    // =========================================================
    // STATUS CLASS
    // =========================================================
    const getStatusClass = (status) => {
        if (
            status === "active" ||
            status === "approved"
        ) {
            return "bg-green-100 text-green-700";
        }

        if (status === "pending") {
            return "bg-yellow-100 text-yellow-700";
        }

        if (status === "draft") {
            return "bg-gray-100 text-gray-700";
        }

        if (
            status === "rejected" ||
            status === "expired"
        ) {
            return "bg-red-100 text-red-700";
        }

        if (status === "inactive") {
            return "bg-orange-100 text-orange-700";
        }

        return "bg-gray-100 text-gray-600";
    };

    // =========================================================
    // RETURN
    // =========================================================
    return (
        <div className="min-h-screen bg-gray-50">
            {/* =====================================================
                SIDEBAR
            ===================================================== */}
            <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40">
                <div className="h-full flex flex-col">
                    <div className="h-16 px-6 flex items-center border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">
                            Super Admin
                        </h1>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        <nav className="space-y-1">
                            {[
                                ["dashboard", "Dashboard"],
                                ["sellerRequests", "Seller Requests"],
                                ["sellers", "Sellers"],
                                ["products", "Products"],
                                ["advertisements", "Advertisements"],
                                ["admins", "Admins"],
                                ["buyers", "Buyers"],
                                ["orders", "Orders"],
                                ["settings", "Settings"]
                            ].map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(key);
                                        setSearch("");
                                        setStatusFilter("all");
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === key
                                        ? "bg-black text-white"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <span>{label}</span>

                                    {key === "sellerRequests" &&
                                        pendingSellerRequests > 0 && (
                                            <span
                                                className={`min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-xs ${activeTab === key
                                                    ? "bg-white text-black"
                                                    : "bg-red-500 text-white"
                                                    }`}
                                            >
                                                {pendingSellerRequests}
                                            </span>
                                        )}

                                    {key === "products" &&
                                        pendingProducts > 0 && (
                                            <span
                                                className={`min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full text-xs ${activeTab === key
                                                    ? "bg-white text-black"
                                                    : "bg-yellow-500 text-white"
                                                    }`}
                                            >
                                                {pendingProducts}
                                            </span>
                                        )}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
            </aside>

            {/* =====================================================
                MAIN
            ===================================================== */}
            <main className="ml-64 min-h-screen">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {activeTab === "sellerRequests"
                                ? "Seller Requests"
                                : activeTab === "advertisements"
                                    ? "Advertisements"
                                    : activeTab === "sellers"
                                        ? "Sellers"
                                        : activeTab === "products"
                                            ? "Products"
                                            : activeTab === "admins"
                                                ? "Administrators"
                                                : activeTab === "buyers"
                                                    ? "Buyers"
                                                    : activeTab === "orders"
                                                        ? "Orders"
                                                        : activeTab === "settings"
                                                            ? "Settings"
                                                            : "Dashboard"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                        Logout
                    </button>
                </header>

                <div className="p-6">
                    {/* MESSAGE */}
                    {message.text && (
                        <div
                            className={`mb-5 px-4 py-3 rounded-lg text-sm ${message.type === "success"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {loading && (
                        <div className="mb-5 bg-white border rounded-xl p-4 text-sm text-gray-500">
                            Loading dashboard data...
                        </div>
                    )}

                    {/* =================================================
                        DASHBOARD
                    ================================================= */}
                    {activeTab === "dashboard" && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Dashboard
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage your E-Mart marketplace.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                                <div className="bg-white border rounded-xl p-5">
                                    <p className="text-sm text-gray-500">
                                        Seller Requests
                                    </p>
                                    <p className="text-3xl font-bold mt-2">
                                        {sellerRequests.length}
                                    </p>
                                </div>

                                <div className="bg-white border rounded-xl p-5">
                                    <p className="text-sm text-gray-500">
                                        Pending Products
                                    </p>
                                    <p className="text-3xl font-bold mt-2">
                                        {pendingProducts}
                                    </p>
                                </div>

                                <div className="bg-white border rounded-xl p-5">
                                    <p className="text-sm text-gray-500">
                                        Sellers
                                    </p>
                                    <p className="text-3xl font-bold mt-2">
                                        {sellers.length}
                                    </p>
                                </div>

                                <div className="bg-white border rounded-xl p-5">
                                    <p className="text-sm text-gray-500">
                                        Active Advertisements
                                    </p>
                                    <p className="text-3xl font-bold mt-2">
                                        {activeAdvertisements}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* =================================================
                        ADVERTISEMENTS
                    ================================================= */}
                    {activeTab === "advertisements" && (
                        <div>
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        Advertisements
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Create and manage homepage and promotional advertisements.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={openCreateAdvertisement}
                                    className="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                                >
                                    + Create Advertisement
                                </button>
                            </div>

                            <div className="bg-white border rounded-xl p-4 mb-5">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search advertisement..."
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black/10"
                                    />

                                    <select
                                        value={statusFilter}
                                        onChange={(event) =>
                                            setStatusFilter(event.target.value)
                                        }
                                        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                            </div>

                            {filteredAdvertisements.length === 0 ? (
                                <div className="bg-white border rounded-xl p-12 text-center">
                                    <h3 className="font-semibold text-gray-700">
                                        No Advertisements Found
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Create your first advertisement.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {filteredAdvertisements.map((ad) => (
                                        <div
                                            key={ad._id}
                                            className="bg-white border rounded-2xl overflow-hidden"
                                        >
                                            <div className="relative h-52 bg-gray-100">
                                                <img
                                                    src={
                                                        ad.images?.[0] ||
                                                        "/default-ad.png"
                                                    }
                                                    alt={ad.title}
                                                    className="w-full h-full object-cover"
                                                />

                                                <span
                                                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                                                        ad.status
                                                    )}`}
                                                >
                                                    {ad.status}
                                                </span>
                                            </div>

                                            <div className="p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">
                                                            {ad.title}
                                                        </h3>

                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {ad.subtitle || "No subtitle"}
                                                        </p>
                                                    </div>

                                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {ad.position}
                                                    </span>
                                                </div>

                                                {ad.offerText && (
                                                    <p className="text-sm font-semibold mt-4">
                                                        {ad.offerText}
                                                    </p>
                                                )}

                                                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-xs text-gray-500">
                                                            Priority
                                                        </p>
                                                        <p className="font-medium mt-1">
                                                            {ad.priority ?? 0}
                                                        </p>
                                                    </div>

                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-xs text-gray-500">
                                                            Images
                                                        </p>
                                                        <p className="font-medium mt-1">
                                                            {ad.images?.length || 0}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 text-xs text-gray-500">
                                                    {ad.startDate
                                                        ? new Date(
                                                            ad.startDate
                                                        ).toLocaleDateString("en-IN")
                                                        : "-"}{" "}
                                                    →{" "}
                                                    {ad.endDate
                                                        ? new Date(
                                                            ad.endDate
                                                        ).toLocaleDateString("en-IN")
                                                        : "-"}
                                                </div>

                                                <div className="mt-5 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedAdvertisement(
                                                                ad
                                                            )
                                                        }
                                                        className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-700"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* =================================================
                        SELLER REQUESTS
                    ================================================= */}
                    {activeTab === "sellerRequests" && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-gray-900">
                                    Seller Requests
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage seller registration requests submitted by buyers.
                                </p>
                            </div>

                            <div className="bg-white border rounded-xl p-4 mb-5">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search store, buyer or email..."
                                        className="flex-1 border rounded-lg px-4 py-2.5 text-sm"
                                    />

                                    <select
                                        value={statusFilter}
                                        onChange={(event) =>
                                            setStatusFilter(event.target.value)
                                        }
                                        className="border rounded-lg px-4 py-2.5 text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            {filteredSellerRequests.length === 0 ? (
                                <div className="bg-white border rounded-xl p-10 text-center text-sm text-gray-500">
                                    No seller requests found.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                    {filteredSellerRequests.map((request) => (
                                        <div
                                            key={request._id}
                                            className="bg-white border rounded-2xl overflow-hidden"
                                        >
                                            <div className="px-5 py-4 border-b flex justify-between gap-3">
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Seller Request
                                                    </p>
                                                    <h3 className="text-lg font-semibold">
                                                        {request.storeName}
                                                    </h3>
                                                </div>

                                                <span
                                                    className={`h-fit px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                                        request.status
                                                    )}`}
                                                >
                                                    {request.status}
                                                </span>
                                            </div>

                                            <div className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={
                                                            request.storeLogo ||
                                                            "/default-store.png"
                                                        }
                                                        alt={request.storeName}
                                                        className="w-16 h-16 rounded-xl object-cover border"
                                                    />

                                                    <div>
                                                        <p className="font-semibold">
                                                            {request.userId?.name ||
                                                                "Unknown Buyer"}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {request.userId?.email ||
                                                                "-"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-600 mt-4 line-clamp-3">
                                                    {request.storeDescription ||
                                                        "-"}
                                                </p>

                                                <div className="grid grid-cols-2 gap-3 mt-5">
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-xs text-gray-500">
                                                            City
                                                        </p>
                                                        <p className="text-sm font-medium mt-1">
                                                            {request.city || "-"}
                                                        </p>
                                                    </div>

                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-xs text-gray-500">
                                                            Country
                                                        </p>
                                                        <p className="text-sm font-medium mt-1">
                                                            {request.country || "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-5 py-4 bg-gray-50 border-t flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewRequest(request)
                                                    }
                                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm"
                                                >
                                                    View
                                                </button>

                                                {request.status === "pending" && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            disabled={actionLoading}
                                                            onClick={() =>
                                                                handleApproveSeller(
                                                                    request
                                                                )
                                                            }
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={actionLoading}
                                                            onClick={() =>
                                                                handleOpenRejectModal(
                                                                    request
                                                                )
                                                            }
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* =================================================
                        SELLERS
                    ================================================= */}
                    {activeTab === "sellers" && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold">
                                    Sellers
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage approved seller accounts.
                                </p>
                            </div>

                            {sellers.length === 0 ? (
                                <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
                                    No sellers found.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {sellers.map((seller) => (
                                        <div
                                            key={seller._id}
                                            className="bg-white border rounded-2xl p-5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border">
                                                    {seller.storeLogo ? (
                                                        <img
                                                            src={seller.storeLogo}
                                                            alt={seller.storeName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center font-bold">
                                                            {seller.storeName
                                                                ?.charAt(0)
                                                                ?.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="font-semibold truncate">
                                                        {seller.storeName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {seller.userId?.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-5 space-y-3 text-sm">
                                                <div className="flex justify-between gap-3">
                                                    <span className="text-gray-500">
                                                        Email
                                                    </span>
                                                    <span className="font-medium truncate">
                                                        {seller.userId?.email || "-"}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">
                                                        Role
                                                    </span>
                                                    <span>
                                                        {seller.userId?.role ||
                                                            "seller"}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">
                                                        Status
                                                    </span>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs ${getStatusClass(
                                                            seller.verificationStatus
                                                        )}`}
                                                    >
                                                        {seller.verificationStatus ||
                                                            "approved"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* =================================================
                        PRODUCTS
                    ================================================= */}
                    {activeTab === "products" && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold">
                                    Products
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Approve or reject products submitted by sellers.
                                </p>
                            </div>

                            {products.length === 0 ? (
                                <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
                                    No products found.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {products.map((product) => (
                                        <div
                                            key={product._id}
                                            className="bg-white border rounded-2xl overflow-hidden"
                                        >
                                            <div className="relative h-52 bg-gray-100">
                                                <img
                                                    src={
                                                        product.images?.[0] ||
                                                        "/default-product.png"
                                                    }
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />

                                                <span
                                                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                                                        product.status
                                                    )}`}
                                                >
                                                    {product.status}
                                                </span>
                                            </div>

                                            <div className="p-5">
                                                <div className="flex justify-between gap-3">
                                                    <h3 className="font-semibold">
                                                        {product.name}
                                                    </h3>

                                                    <span className="font-bold">
                                                        ₹
                                                        {Number(
                                                            product.price || 0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-500 mt-3 line-clamp-3">
                                                    {product.description ||
                                                        "No description."}
                                                </p>
                                            </div>

                                            {product.status === "pending" && (
                                                <div className="px-5 py-4 bg-gray-50 border-t flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={actionLoading}
                                                        onClick={() =>
                                                            productStatus(
                                                                product._id,
                                                                1,
                                                                ""
                                                            )
                                                        }
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={actionLoading}
                                                        onClick={() =>
                                                            handleRejectProduct(
                                                                product
                                                            )
                                                        }
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* =================================================
                        PLACEHOLDER TABS
                    ================================================= */}
                    {["admins", "buyers", "orders", "settings"].includes(
                        activeTab
                    ) && (
                            <div className="bg-white border rounded-xl p-8">
                                <h2 className="text-xl font-semibold capitalize">
                                    {activeTab}
                                </h2>
                                <p className="text-sm text-gray-500 mt-2">
                                    This section is ready for your existing admin,
                                    buyer, order and settings UI.
                                </p>
                            </div>
                        )}
                </div>
            </main>

            {/* =====================================================
                CREATE ADVERTISEMENT MODAL
            ===================================================== */}
            {showAdvertisementModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={closeAdvertisementModal}
                >
                    <div
                        className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Create Advertisement
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Maximum 5 desktop/banner images + optional mobile image.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeAdvertisementModal}
                                className="w-9 h-9 rounded-lg hover:bg-gray-100 text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleUploadAdvertisement}
                            className="p-6"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {/* TITLE */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium mb-2">
                                        Title *
                                    </label>

                                    <input
                                        name="title"
                                        value={advertisementForm.title}
                                        onChange={handleAdvertisementInput}
                                        maxLength={150}
                                        required
                                        placeholder="Mega Shopping Days"
                                        className="w-full border rounded-lg px-4 py-2.5 text-sm"
                                    />
                                </div>

                                {/* SUBTITLE */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Subtitle
                                    </label>

                                    <input
                                        name="subtitle"
                                        value={advertisementForm.subtitle}
                                        onChange={handleAdvertisementInput}
                                        maxLength={300}
                                        placeholder="Big savings on electronics..."
                                        className="w-full border rounded-lg px-4 py-2.5 text-sm"
                                    />
                                </div>

                                {/* OFFER */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Offer Text
                                    </label>

                                    <input
                                        name="offerText"
                                        value={advertisementForm.offerText}
                                        onChange={handleAdvertisementInput}
                                        placeholder="UP TO 70% OFF"
                                        className="w-full border rounded-lg px-4 py-2.5 text-sm"
                                    />
                                </div>

                                {/* DESCRIPTION */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium mb-2">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={advertisementForm.description}
                                        onChange={handleAdvertisementInput}
                                        maxLength={1000}
                                        rows={4}
                                        placeholder="Advertisement description..."
                                        className="w-full border rounded-lg px-4 py-2.5 text-sm resize-none"
                                    />
                                </div>

                                {/* BUTTON TEXT */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Button Text
                                    </label>

                                    <input
                                        name="buttonText"
                                        value={advertisementForm.buttonText}
                                        onChange={handleAdvertisementInput}
                                        className="w-full border rounded-lg px-4 py-2.5 text-sm"
                                    />
                                </div>

                                {/* BUTTON LINK */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Button Link
                                    </label>

                                    <input
                                        name="buttonLink"
                                        value={advertisementForm.buttonLink}
                                        onChange={handleAdvertisementInput}
                                        placeholder="/products"
                                        className="w-full border rounded-lg px-4 py-2.5 text-sm"
                                    />
                                </div>

                                {/* POSITION */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Position
                                    </label>

                                    <select
                                        name="position"
                                        value={advertisementForm.position}
                                        onChange={handleAdvertisementInput}
                                        className="w-full border rounded-lg px-4 py-2.5 text-sm"
                                    >
                                        <option value="homepage">
                                            Homepage
                                        </option>
                                        <option value="category">
                                            Category
                                        </option>
                                        <option value="products">
                                            Products
                                        </option>
                                    </select>
                                </div>

                                {/* STATUS */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={advertisementForm.status}
                                        onChange={handleAdvertisementInput}
                                        className="w-full border rounded-lg px-4 py-2.5 text-sm"
                                    >
                                        <option value="draft">
                                            Draft
                                        </option>
                                        <option value="active">
                                            Active
                                        </option>
                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </div>

                                {/* START DATE */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Start Date *
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        value={advertisementForm.startDate}
                                        onChange={handleAdvertisementInput}
                                        required
                                        className="w-full border rounded-lg px-4 py-2.5 text-sm"
                                    />
                                </div>

                                {/* END DATE */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        End Date *
                                    </label>

                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        value={advertisementForm.endDate}
                                        onChange={handleAdvertisementInput}
                                        required
                                        className="w-full border rounded-lg px-4 py-2.5 text-sm"
                                    />
                                </div>

                                {/* PRIORITY */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Priority
                                    </label>

                                    <input
                                        type="number"
                                        name="priority"
                                        min="0"
                                        value={advertisementForm.priority}
                                        onChange={handleAdvertisementInput}
                                        className="w-full border rounded-lg px-4 py-2.5 text-sm"
                                    />
                                </div>

                                {/* DESKTOP IMAGES */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium mb-2">
                                        Advertisement Images *{" "}
                                        <span className="text-gray-400">
                                            (1–5)
                                        </span>
                                    </label>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleAdvertisementImages}
                                        className="w-full border rounded-lg px-4 py-2.5 text-sm"
                                    />

                                    <p className="text-xs text-gray-500 mt-1">
                                        Select minimum 1 and maximum 5 images.
                                    </p>

                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                                            {imagePreviews.map(
                                                (preview, index) => (
                                                    <div
                                                        key={`${preview.name}-${index}`}
                                                        className="border rounded-lg overflow-hidden"
                                                    >
                                                        <img
                                                            src={preview.url}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-24 object-cover"
                                                        />
                                                        <p className="text-[10px] p-2 truncate">
                                                            {preview.name}
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* MOBILE IMAGE */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium mb-2">
                                        Mobile Image
                                    </label>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMobileImage}
                                        className="w-full border rounded-lg px-4 py-2.5 text-sm"
                                    />

                                    {mobileImagePreview && (
                                        <div className="mt-4 w-full max-w-sm border rounded-lg overflow-hidden">
                                            <img
                                                src={mobileImagePreview}
                                                alt="Mobile advertisement preview"
                                                className="w-full h-40 object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-7 pt-5 border-t">
                                <button
                                    type="button"
                                    onClick={closeAdvertisementModal}
                                    disabled={actionLoading}
                                    className="px-5 py-2.5 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-5 py-2.5 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {actionLoading
                                        ? "Uploading..."
                                        : "Upload Advertisement"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =====================================================
                SELLER REQUEST MODAL
            ===================================================== */}
            {showRequestModal && selectedRequest && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={closeRequestModal}
                >
                    <div
                        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="px-6 py-4 border-b flex justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Seller Request Details
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedRequest.storeName}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeRequestModal}
                                className="text-xl text-gray-500"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="border rounded-xl p-4">
                                <h3 className="font-semibold mb-4">
                                    Applicant Account
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">
                                            Name
                                        </p>
                                        <p className="font-medium mt-1">
                                            {selectedRequest.userId?.name ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">
                                            Email
                                        </p>
                                        <p className="font-medium mt-1 break-all">
                                            {selectedRequest.userId?.email ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">
                                            User ID
                                        </p>
                                        <p className="font-medium mt-1 break-all">
                                            {selectedRequest.userId?._id ||
                                                selectedRequest.userId ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500">
                                            Role
                                        </p>
                                        <p className="font-medium mt-1">
                                            {selectedRequest.userId?.role ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-xl divide-y">
                                <div className="p-4">
                                    <p className="text-xs text-gray-500">
                                        Store Name
                                    </p>
                                    <p className="font-medium mt-1">
                                        {selectedRequest.storeName || "-"}
                                    </p>
                                </div>

                                <div className="p-4">
                                    <p className="text-xs text-gray-500">
                                        Description
                                    </p>
                                    <p className="text-sm mt-1">
                                        {selectedRequest.storeDescription ||
                                            "-"}
                                    </p>
                                </div>

                                <div className="p-4">
                                    <p className="text-xs text-gray-500">
                                        Business Address
                                    </p>
                                    <p className="text-sm mt-1">
                                        {selectedRequest.businessAddress ||
                                            "-"}
                                    </p>
                                </div>

                                <div className="p-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Phone
                                        </p>
                                        <p className="font-medium mt-1">
                                            {selectedRequest.phone || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">
                                            City
                                        </p>
                                        <p className="font-medium mt-1">
                                            {selectedRequest.city || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">
                                            State
                                        </p>
                                        <p className="font-medium mt-1">
                                            {selectedRequest.state || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Country
                                        </p>
                                        <p className="font-medium mt-1">
                                            {selectedRequest.country || "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 flex justify-between">
                                    <span className="text-sm text-gray-500">
                                        Status
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs ${getStatusClass(
                                            selectedRequest.status
                                        )}`}
                                    >
                                        {selectedRequest.status}
                                    </span>
                                </div>
                            </div>

                            {selectedRequest.rejectionReason && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="font-semibold text-red-700">
                                        Rejection Reason
                                    </p>
                                    <p className="text-sm text-red-600 mt-1">
                                        {selectedRequest.rejectionReason}
                                    </p>
                                </div>
                            )}

                            {selectedRequest.status === "pending" && (
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() =>
                                            handleApproveSeller(
                                                selectedRequest
                                            )
                                        }
                                        className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
                                    >
                                        Approve
                                    </button>

                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => {
                                            closeRequestModal();
                                            handleOpenRejectModal(
                                                selectedRequest
                                            );
                                        }}
                                        className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================
                REJECT SELLER MODAL
            ===================================================== */}
            {showRejectModal && selectedRequest && (
                <div
                    className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
                    onClick={closeRejectModal}
                >
                    <div
                        className="bg-white w-full max-w-lg rounded-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="px-6 py-4 border-b flex justify-between">
                            <div>
                                <h2 className="font-semibold">
                                    Reject Seller Request
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedRequest.storeName}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeRejectModal}
                                className="text-xl text-gray-500"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleRejectSeller}
                            className="p-6"
                        >
                            <label className="block text-sm font-medium mb-2">
                                Rejection Reason *
                            </label>

                            <textarea
                                value={rejectionReason}
                                onChange={(event) =>
                                    setRejectionReason(
                                        event.target.value
                                    )
                                }
                                maxLength={500}
                                rows={5}
                                className="w-full border rounded-xl p-3 resize-none"
                                placeholder="Explain why this request is being rejected..."
                            />

                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-400">
                                    Required
                                </span>
                                <span className="text-xs text-gray-400">
                                    {rejectionReason.length}/500
                                </span>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeRejectModal}
                                    disabled={actionLoading}
                                    className="px-5 py-2.5 border rounded-lg text-sm"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        actionLoading ||
                                        !rejectionReason.trim()
                                    }
                                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50"
                                >
                                    {actionLoading
                                        ? "Rejecting..."
                                        : "Reject Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =====================================================
                ADVERTISEMENT VIEW MODAL
            ===================================================== */}
            {selectedAdvertisement && (
                <div
                    className="fixed inset-0 z-[55] bg-black/50 flex items-center justify-center p-4"
                    onClick={() =>
                        setSelectedAdvertisement(null)
                    }
                >
                    <div
                        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="px-6 py-4 border-b flex justify-between">
                            <div>
                                <h2 className="font-semibold">
                                    Advertisement Details
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    {selectedAdvertisement.title}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedAdvertisement(null)
                                }
                                className="text-xl text-gray-500"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {(selectedAdvertisement.images || []).map(
                                    (image, index) => (
                                        <img
                                            key={`${image}-${index}`}
                                            src={image}
                                            alt={`${selectedAdvertisement.title} ${index + 1
                                                }`}
                                            className="w-full h-36 object-cover rounded-xl border"
                                        />
                                    )
                                )}
                            </div>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        {selectedAdvertisement.title}
                                    </h3>
                                    <p className="text-gray-500 mt-1">
                                        {selectedAdvertisement.subtitle}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">
                                            Status
                                        </p>
                                        <p className="font-medium mt-1">
                                            {selectedAdvertisement.status}
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500">
                                            Position
                                        </p>
                                        <p className="font-medium mt-1">
                                            {selectedAdvertisement.position}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700">
                                    {selectedAdvertisement.description ||
                                        "No description."}
                                </p>

                                {selectedAdvertisement.offerText && (
                                    <p className="font-semibold">
                                        {selectedAdvertisement.offerText}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminPage;