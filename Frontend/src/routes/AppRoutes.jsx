import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Signup from "../pages/auth/Sign_up.jsx";
import Signin from "../pages/auth/Sign_in.jsx";
import UserPage from "../pages/userPage/userPage.jsx";
import BuyerPage from "../pages/buyerPage/buyerPage.jsx";
import SellerProductUpload from "../pages/sellerPage/SellerProductUpload.jsx";
import SellerRequest from "../pages/sellerRequestPage.jsx";
import SuperAdminPage from "../pages/admin/SuperAdminPage.jsx";
import CartPage from "../pages/cart/CartPage.jsx";
import ProductBuyPage from "../pages/buyPage/productBuyPage.jsx";
import ProductCheckoutPage from "../pages/checkOutPage/productCheckoutPage.jsx";
import OrderPage from "../pages/orderPage/orderPage.jsx";
import DeliveryPage from "../pages/deliveryPage/deliveryPage.jsx";
import Dashboard from "../pages/dashboard.jsx";

const App = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<BuyerPage/>} />
      <Route path="/seller" element={<SellerProductUpload />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/user" element={<UserPage />} />
      <Route path="/buyer/seller-request" element={<SellerRequest />} />
      <Route path="/superadmin" element={<SuperAdminPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/deliveryDetails" element={<DeliveryPage />} />
      <Route path="/orders" element={<OrderPage />} />
      <Route path="/productBuyPage" element={<ProductBuyPage />} />
      <Route path="/productCheckoutPage" element={<ProductCheckoutPage />} />
    </>,
  ),
);

export default App;
