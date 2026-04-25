import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IndexPage } from "./pages/index/Index";
import { BookshelfPage } from "./pages/bookshelf/Bookshelf";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/index" element={<IndexPage />} />
        <Route path="/bookshelf" element={<BookshelfPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
