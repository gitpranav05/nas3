import { BrowserRouter, Routes, Route } from "react-router-dom";
import Explorer from "./pages/explorer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Explorer />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
