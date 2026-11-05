import { Toaster } from "sonner";

import { lazy, Suspense, useLayoutEffect } from "react";
import { Route, Switch, useLocation, useSearch } from "wouter";

import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Home from "@/pages/Home";
import LabReports from "@/pages/LabReports";
import NotFound from "@/pages/NotFound";
import ProductDetail from "@/pages/ProductDetail";
import Products from "@/pages/Products";

/* The panel is its own chunk: visitors never open it, so they shouldn't
   download it with the home page. */
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminLabReports = lazy(() => import("@/pages/admin/AdminLabReports"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminMessages = lazy(() => import("@/pages/admin/AdminMessages"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminVideos = lazy(() => import("@/pages/admin/AdminVideos"));
const AdminSubscribers = lazy(() => import("@/pages/admin/AdminSubscribers"));

/**
 * Browsers default scrollRestoration to "auto" and restore the previous offset
 * after React has mounted, which overwrites anything an effect does on the way
 * in. Switching it to manual and re-asserting the top on route change keeps a
 * product page from opening halfway down.
 */
function ScrollToTop() {
  const [location] = useLocation();
  // Changing line (/products?line=…) is a new page for the visitor too: a
  // footer or menu link to another line must land at the top, not stay down
  // by the footer. Other filters (type, search) keep the scroll.
  const line = new URLSearchParams(useSearch()).get("line") ?? "";

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    // A link straight to a section (#lab-reports) should land on it.
    if (window.location.hash) return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location, line]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            background: "#0e0619",
            border: "2px solid #000",
            color: "#f7f3ff",
          },
        }}
      />
      <Suspense fallback={<div className="min-h-screen bg-[#07030f]" />}>
        <Switch>
          {/* Public */}
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:slug" component={ProductDetail} />
          <Route path="/lab-reports" component={LabReports} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />

          {/* Admin */}
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/lab-reports" component={AdminLabReports} />
          <Route path="/admin/videos" component={AdminVideos} />
          <Route path="/admin/messages" component={AdminMessages} />
          <Route path="/admin/newsletter" component={AdminSubscribers} />
          <Route path="/admin/settings" component={AdminSettings} />
          <Route path="/admin/users" component={AdminUsers} />

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}
