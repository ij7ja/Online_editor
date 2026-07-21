import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom'
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Editor from "./pages/CodeEditor";
import { getAuthToken } from "./auth";
import './App.css';

function ProtectedRoute({ children }) {
  return getAuthToken() ? children : <Navigate to="/login" replace />;
}

function App() {
  
  return (
    <Router>
      <Routes>        
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )}  




export default App;
