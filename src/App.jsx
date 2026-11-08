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
import ContentLink from "./pages/contentLink";
import ContentActivity from "./pages/contentActivity";
import MyContents from "./pages/myContents";
import ContentForm from "./pages/contentForm";
import Annotations from "./pages/annotations";
import AnnotationDetails from "./pages/annotationDetails";

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
        <Route path="/conteudo-link/:id" element={<ContentLink />} />
        <Route path="/conteudo-link" element={<ContentLink />} />
        <Route path="/conteudo-atividade/:id" element={<ContentActivity />} />
        <Route path="/conteudo-atividade" element={<ContentActivity />} />
        <Route path="/atividades" element={<ContentActivity />} />
        <Route path="/conteudos" element={<MyContents />} />
        <Route path="/conteudos/novo" element={<ContentForm />} />
        <Route path="/conteudos/editar/:id" element={<ContentForm />} />
        <Route path="/anotacoes" element={<Annotations />} />
        <Route path="/anotacoes/:id" element={<AnnotationDetails />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
