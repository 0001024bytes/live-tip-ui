import { Route, Routes } from "react-router-dom";
import Donation from "./donation";
import Home from "./home";


const App = () => {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:nostrID" element={<Donation />} />
    </Routes>
  );
};

export default App;