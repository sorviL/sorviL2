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
import { ChatPage } from "./pages/chat/Index";

const CHROMELESS_ROUTES = ["/auth"];

function AppShell() {
    const location = useLocation();
    const hideChrome = CHROMELESS_ROUTES.includes(location.pathname);

    return (
        <div className="app-wrapper">
            {!hideChrome && <Navbar />}
            <main className="app-main">
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<IndexPage />} />
                        <Route path="/index" element={<IndexPage />} />
                        <Route path="/bookshelf" element={<BookshelfPage />} />
                        <Route path="/book/:id" element={<BookPage />} />
                        <Route path="/chat" element={<ChatPage />} />
                    </Route>
                </Routes>
            </main>
            {!hideChrome && <Footer />}
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
