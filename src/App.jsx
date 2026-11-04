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
import Subject from "./pages/subject";
import ContentPDF from "./pages/contentPDF";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Login />} />
        <Route path="/sigin" element={<Sigin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/explorar" element={<Explore />} />
        <Route path="/disciplina/:tag" element={<Subject />} />
        <Route path="/conteudo/:id" element={<ContentPDF />} />
        <Route path="/conteudo" element={<ContentPDF />} />
        <Route path="/anotacoes" element={<ContentPDF />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
