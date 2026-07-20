import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom'
import Home from "./pages/Home";
import LoginForm from "./pages/LoginForm";
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
        <Route path="/login" element={<LoginForm />} />
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
