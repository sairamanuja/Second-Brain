import './App.css'
import {BrowserRouter,Route,Routes} from "react-router-dom"
import { DashBoard } from './pages/DashBoard'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'

function App() {

  return (
    <>
    <BrowserRouter>
    <Routes>
    <Route path="/signup" element={<Signup />} /> {/* Route for signup page */}
        <Route path="/dashboard" element={<DashBoard />} /> 
        <Route path="/signin" element={<Signin />} /> {/* Route for signup page */}

    </Routes>
    </BrowserRouter>
      
      </>
  )
}

export default App
