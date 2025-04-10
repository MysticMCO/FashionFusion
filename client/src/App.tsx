import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import ProductsPage from "@/pages/products-page";
import ProductDetailsPage from "@/pages/product-details-page";
import CartPage from "@/pages/cart-page";
import CheckoutPage from "@/pages/checkout-page";
import AuthPage from "@/pages/auth-page";
import Layout from "@/components/layout/layout";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";

// Admin pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminAddProduct from "@/pages/admin/add-product";
import AdminEditProduct from "@/pages/admin/edit-product";
import AdminCategories from "@/pages/admin/categories";
import AdminOrders from "@/pages/admin/orders";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/category/:slug" component={ProductsPage} />
      <Route path="/product/:slug" component={ProductDetailsPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/auth" component={AuthPage} />

      {/* Protected routes */}
      <ProtectedRoute path="/checkout" component={CheckoutPage} />

      {/* Admin routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/products" component={AdminProducts} adminOnly />
      <ProtectedRoute path="/admin/products/add" component={AdminAddProduct} adminOnly />
      <ProtectedRoute path="/admin/products/edit/:id" component={AdminEditProduct} adminOnly />
      <ProtectedRoute path="/admin/categories" component={AdminCategories} adminOnly />
      <ProtectedRoute path="/admin/orders" component={AdminOrders} adminOnly />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
