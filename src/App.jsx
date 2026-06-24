import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SoularLanding from './components/SoularLanding'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SoularLanding />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
