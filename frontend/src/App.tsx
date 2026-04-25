import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthPage } from "./pages/auth/Index";
import { IndexPage } from "./pages/index/Index";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/index" element={<IndexPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
