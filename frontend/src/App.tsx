import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth.context";
import { AuthPage } from "./pages/auth/Index";
import { IndexPage } from "./pages/index/Index";
import { BookshelfPage } from "./pages/bookshelf/Bookshelf";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<IndexPage />} />
            <Route path="/index" element={<IndexPage />} />
            <Route path="/bookshelf" element={<BookshelfPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
