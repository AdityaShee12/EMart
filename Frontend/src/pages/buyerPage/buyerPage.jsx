import { useState, useEffect } from "react"
import { FaBars } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { buyerAPI, cartAPI, superAdminAPI } from "../../api/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { useDispatch, useSelector } from "react-redux";
import { setProduct } from "../../features/productSlice";
import NavBar from "../navBar/navBar";

const BuyerPage = () => {

  const [search, setSearch] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const [advertisement, setAdvertisement] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector(
    (state) => state.user,
  );

  // Destructure user details 
  useEffect(() => {
    console.log("User", user);
  }, [user]);

  // Fetch Products
  useEffect(() => {

    const fetchProducts = async () => {
      const response = await buyerAPI.getProducts();
      console.log(response);

      setProducts(response?.data?.products);
    }

    fetchProducts();
  }, []);

  // Fetch Advertisements
  useEffect(() => {

    const fetchAdvertisement = async () => {
      const response = await superAdminAPI.getAllAdvertisements();
      console.log("Response", response);
      setAdvertisement(response?.data?.advertisements);
    }

    fetchAdvertisement();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showMenu
      ) {
        setShowMenu(!showMenu);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleBuy = async (product) => {
    console.log("Product", product);
    dispatch(setProduct(product));
    navigate("/productBuyPage")
  }

  const handleAddToCart = async (product) => {
    console.log("Product", product, user?._id);

    if (user?._id) {

      if (!product._id.trim()) {
        setError("Product can't be save in cart for some unknown error");
        return;
      }

      try {
        const response = await cartAPI.createCart({
          userId: user?._id,
          productDetails: {
            productId: product?._id,
            productImages: product?.images,
            quantity: product?.quantity,
            price: product?.price
          },
        });

        setCart(response.data.data);
        setProductId("");
        setQuantity(1);
        setMessage(response.data.message);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to add product"
        );
      } finally {
        setAdding(false);
      }
    }
    else {
      navigate("/signin")
    }
  }

  return (
    <div>
      <header className="w-full bg-white border-b border-gray-200">
        <NavBar />
      </header>

      <main>
        <div>
          <Swiper
            modules={[Autoplay]}
            slidesPerView={1}
            spaceBetween={20}
            loop={advertisement?.length > 1}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
            }}
            speed={800}
          >
            {advertisement?.map((ad) => (
              <SwiperSlide key={ad._id}>
                <div className="relative overflow-hidden rounded-xl">

                  <img
                    src={ad.images?.[0] || ad.mobileImage}
                    alt={ad.title || "Advertisement"}
                    className="w-74 h-74 object-cover rounded-xl"
                  />

                  <div className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-black/70 to-transparent text-white">

                    {ad.offerText && (
                      <p className="text-sm font-medium">
                        {ad.offerText}
                      </p>
                    )}

                    {ad.title && (
                      <h2 className="text-xl font-bold">
                        {ad.title}
                      </h2>
                    )}

                    {ad.subtitle && (
                      <p className="text-sm">
                        {ad.subtitle}
                      </p>
                    )}

                    {ad.buttonText && ad.buttonLink && (
                      <a
                        href={ad.buttonLink}
                        className="mt-3 inline-block w-fit px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition"
                      >
                        {ad.buttonText}
                      </a>
                    )}

                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div>
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Featured Products
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Discover products you'll love
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/products")}
                className="text-sm font-semibold text-gray-700 hover:text-black"
              >
                View All →
              </button>

            </div>

            {/* Product Grid */}
            {products.length > 0 ? (

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {products.map((product) => (

                  <div
                    key={product._id}
                    className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                  >

                    {/* Product Image */}
                    <div className="relative bg-gray-100 aspect-square overflow-hidden">

                      <img
                        src={
                          product.images?.[0] ||
                          product.image ||
                          product.thumbnail
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Wishlist */}
                      <button
                        type="button"
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
                      >
                        ♡
                      </button>
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                      {/* Product Name */}
                      <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
                        {product.name}
                      </h3>
                      {/* Description */}
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">
                        {product.description}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-3">
                        <div className="text-yellow-500 text-sm">
                          ★★★★★
                        </div>
                        <span className="text-xs text-gray-500">
                          (4.5)
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <span className="text-xl font-bold text-gray-900">
                            ₹{Number(product.price || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Buy Now */}
                      <button
                        type="button"
                        className="w-full mt-4 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition"
                        onClick={() => handleBuy(product)}
                      >
                        Buy Now
                      </button>

                      {/* Add to Cart */}
                      <button
                        type="button"
                        className="w-full mt-2 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-gray-500">
                  No products available.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default BuyerPage;