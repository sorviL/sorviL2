import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/auth.context";
import { AuthPage } from "./pages/auth/Index";
import { IndexPage } from "./pages/index/Index";
import { BookshelfPage } from "./pages/bookshelf/Bookshelf";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Footer } from "./components/footer/Footer";

function AppShell() {
    const location = useLocation();
    const isAuthPage = location.pathname === "/auth";

    return (
        <div className="app-wrapper">
            <main className="app-main">
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<IndexPage />} />
                        <Route path="/index" element={<IndexPage />} />
                        <Route path="/bookshelf" element={<BookshelfPage />} />
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
            <BrowserRouter>
                <AppShell />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
