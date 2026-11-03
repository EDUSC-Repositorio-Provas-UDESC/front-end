//style
import "./App.css";
//react
import React from "react";
import { Routes, BrowserRouter, Route } from "react-router-dom";

//pages
import Login from "./pages/login";
import Sigin from "./pages/sigin";
import Home from "./pages/home";
import Explore from "./pages/explore";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Login />} />
        <Route path="/sigin" element={<Sigin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/explorar" element={<Explore />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
