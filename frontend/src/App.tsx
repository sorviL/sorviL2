import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IndexPage } from "./pages/index/Index";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/index" element={<IndexPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
