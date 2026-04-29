import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "./pages/auth/Index";
import { IndexPage } from "./pages/index/Index";
import { BookshelfPage } from "./pages/bookshelf/Bookshelf";
import { BookPage } from "./pages/book/BookPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/bookshelf" element={<BookshelfPage />} />

        <Route path="/book" element={<Navigate to="/bookshelf" replace />} />
        <Route path="/book/:bookId" element={<BookPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;