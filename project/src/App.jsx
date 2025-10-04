import Maps from "./Pages/Maps/Maps"
import Home from "./Pages/Home/Home"
import Login from "./Pages/Login/Login"

import Navbar from "./Components/Navbar/Navbar"

import { Routes, Route } from "react-router-dom"

const App =() => {
 return(
  <div className="open-sans-font">
    <Navbar/>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/maps" element={<Maps />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  </div>
 )
}

export default App
