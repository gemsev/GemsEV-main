import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Owners from "@/pages/owners";
import OwnerProfile from "@/pages/owner-profile";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import BlogNew from "@/pages/blog-new";
import Range from "@/pages/range";
import Cpo from "@/pages/cpo";
import Accessories from "@/pages/accessories";
import Gallery from "@/pages/gallery";
import Faq from "@/pages/faq";
import Admin from "@/pages/admin";
import Profile from "@/pages/profile";
import ChangePassword from "@/pages/change-password";
import NotFound from "@/pages/not-found";
import About from "@/pages/about";
import Contact from "@/pages/contact";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/owners" component={Owners} />
        <Route path="/owners/:id" component={OwnerProfile} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/new" component={BlogNew} />
        <Route path="/blog/:id" component={BlogPost} />
        <Route path="/range" component={Range} />
        <Route path="/cpo" component={Cpo} />
        <Route path="/accessories" component={Accessories} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/faq" component={Faq} />
        <Route path="/admin" component={Admin} />
        <Route path="/profile" component={Profile} />
        <Route path="/change-password" component={ChangePassword} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
