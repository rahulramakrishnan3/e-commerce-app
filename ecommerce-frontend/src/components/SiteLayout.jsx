import { Outlet } from 'react-router-dom'
import Footer from './site/Footer.jsx'
import Navbar from './site/Navbar.jsx'

function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default SiteLayout
