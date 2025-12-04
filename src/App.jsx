import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SoularLanding from './components/SoularLanding'
import SoularLandingGreen from './components/SoularLandingGreen'
import SoularLandingBlue from './components/SoularLandingBlue'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SoularLanding />} />
        <Route path="/green/*" element={<SoularLandingGreen />} />
        <Route path="/blue/*" element={<SoularLandingBlue />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
