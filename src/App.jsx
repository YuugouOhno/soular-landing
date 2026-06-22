import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SoularLanding from './components/SoularLanding'
import SoularNew from './components/SoularNew'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SoularLanding />} />
        <Route path="/new" element={<SoularNew />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
