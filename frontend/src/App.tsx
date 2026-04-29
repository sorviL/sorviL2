import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthPage } from "./pages/auth/Index";
import { IndexPage } from "./pages/index/Index";
import { BookshelfPage } from "./pages/bookshelf/Bookshelf";
import { Footer } from "./components/footer/Footer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/bookshelf" element={<BookshelfPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
