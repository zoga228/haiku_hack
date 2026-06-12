import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Friends from "./pages/Friends";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import Catalog from "./pages/Catalog";
import Swipeee from "./pages/Swipeee";
import CoinAI from "./pages/CoinAI";
import Cart from "./pages/Cart";
import Coins from "./pages/Coins";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/friends">
        <Friends />
      </Route>
      <Route path="/register" component={Register} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/swipe" component={Swipeee} />
      <Route path="/coin-ai" component={CoinAI} />
      <Route path="/cart" component={Cart} />
      <Route path="/coins" component={Coins} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
