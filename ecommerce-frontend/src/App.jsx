import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Route, Routes } from 'react-router-dom'
import { AUTH_SESSION_EXPIRED_EVENT } from './api/axiosInstance.js'
import SiteLayout from './components/SiteLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RoutePlaceholder from './pages/RoutePlaceholder.jsx'
import AdminBulkProducts from './pages/AdminBulkProducts.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Contact from './pages/Contact.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Orders from './pages/Orders.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Register from './pages/Register.jsx'
import Shop from './pages/Shop.jsx'
import { sessionCleared } from './redux/slices/authSlice.js'
import { loadCurrentUser } from './redux/thunks/authThunks.js'

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    const handleExpiredSession = () => dispatch(sessionCleared())
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpiredSession)
    dispatch(loadCurrentUser())
    return () =>
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleExpiredSession,
      )
  }, [dispatch])

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="products/:productId" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:orderId" element={<Orders />} />
        </Route>
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="admin/products/bulk" element={<AdminBulkProducts />} />
        </Route>
        <Route
          path="about"
          element={
            <RoutePlaceholder
              eyebrow="Our story"
              title="Good things take time."
              description="We are bringing the Knit and Thread story together."
            />
          }
        />
        <Route
          path="*"
          element={
            <RoutePlaceholder
              eyebrow="404"
              title="We couldn't find that page."
              description="The page may have moved or the address may be incorrect."
              linkTo="/"
              linkLabel="Return home"
            />
          }
        />
      </Route>
    </Routes>
  )
}

export default App
