import { Route, Routes } from 'react-router-dom'
import SiteLayout from './components/SiteLayout.jsx'
import RoutePlaceholder from './pages/RoutePlaceholder.jsx'

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route
          index
          element={
            <RoutePlaceholder
              eyebrow="Knit and Thread"
              title="Everyday warmth, thoughtfully knit."
              description="A considered collection of soft layers and timeless essentials is coming together."
              linkTo="/shop"
              linkLabel="Explore the collection"
            />
          }
        />
        <Route
          path="shop"
          element={
            <RoutePlaceholder
              eyebrow="The collection"
              title="Made for the moments in between."
              description="Our clothing collection is being prepared. Check back soon to explore the pieces."
            />
          }
        />
        <Route
          path="products/:productId"
          element={
            <RoutePlaceholder
              eyebrow="Product"
              title="A closer look."
              description="Product details will appear here once the catalog is connected."
              linkTo="/shop"
              linkLabel="Back to the collection"
            />
          }
        />
        <Route
          path="cart"
          element={
            <RoutePlaceholder
              eyebrow="Your selection"
              title="Your bag is ready for something special."
              description="Your selected pieces will appear here."
              linkTo="/shop"
              linkLabel="Continue shopping"
            />
          }
        />
        <Route
          path="orders"
          element={
            <RoutePlaceholder
              eyebrow="Your account"
              title="Order history"
              description="Sign in to see your past and current orders."
              linkTo="/login"
              linkLabel="Sign in"
            />
          }
        />
        <Route
          path="contact"
          element={
            <RoutePlaceholder
              eyebrow="We are here to help"
              title="Get in touch."
              description="Our contact page is coming soon."
            />
          }
        />
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
          path="login"
          element={
            <RoutePlaceholder
              eyebrow="Welcome back"
              title="Sign in"
              description="Customer sign-in is coming soon."
            />
          }
        />
        <Route
          path="register"
          element={
            <RoutePlaceholder
              eyebrow="Join the community"
              title="Create an account"
              description="Account registration is coming soon."
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
