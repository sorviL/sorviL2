import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/auth.context";
import { AlertProvider } from "./components/alert/Alert";
import { AuthPage } from "./pages/auth/Index";
import { IndexPage } from "./pages/index/Index";
import { BookshelfPage } from "./pages/bookshelf/Bookshelf";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Navbar } from "./components/navbar/Index";
import { Footer } from "./components/footer/Footer";
import { BookPage } from "./pages/book/BookPage";
import { ReviewsMockPage } from "./pages/reviewsMock/ReviewsMock";

function AppShell() {
    const location = useLocation();
    const isAuthPage = location.pathname === "/auth";

    return (
        <div className="app-wrapper">
            {!isAuthPage && <Navbar />}
            <main className="app-main">
                <Routes>
                    <Route path="/mock-reviews" element={<ReviewsMockPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<IndexPage />} />
                        <Route path="/index" element={<IndexPage />} />
                        <Route path="/bookshelf" element={<BookshelfPage />} />
                        <Route path="/book/:id" element={<BookPage />} />
                        
                    </Route>
                </Routes>
            </main>
            {!isAuthPage && <Footer />}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AlertProvider>
                <BrowserRouter>
                    <AppShell />
                </BrowserRouter>
            </AlertProvider>
        </AuthProvider>
    );
}

export default App;
