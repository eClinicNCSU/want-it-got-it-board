import { Routes, Route } from 'react-router-dom'
import BoardPage from './pages/BoardPage.jsx'
import SubmitPage from './pages/SubmitPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import RevealPage from './pages/RevealPage.jsx'
import ManagePage from './pages/ManagePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BoardPage />} />
      <Route path="/submit" element={<SubmitPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/c/:id" element={<RevealPage />} />
      <Route path="/m/:token" element={<ManagePage />} />
    </Routes>
  )
}
