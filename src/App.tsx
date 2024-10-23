import { Route, Routes } from "react-router-dom";
import Donation from "./donation";


const App = () => {
  return (
    <Routes>
        <Route path="/:nostrID" element={<Donation />} />
    </Routes>
  );
};

export default App;