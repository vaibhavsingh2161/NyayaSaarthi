// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn'; 
import CreateProfile from './pages/CreateProfile';
import AdvocateDashboard from './pages/AdvocateDashboard';
import AdvocateProfile from './pages/AdvocateProfile';
import FloatingCase from './pages/FloatingCase';
import LandingPage from './pages/LandingPage'; 
import CreateCase from './pages/CreateCase'; // Import the LandingPage component
import FindALawyer from './pages/FindALawyer';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} /> {/* Set LandingPage as the root route */}
          <Route path="/sign-up" element={<SignUp />} /> {/* Updated SignIn route */}
          <Route path="/sign-in" element={<SignIn />} /> {/* Updated route for SignIn */}
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/create-case" element={<CreateCase />} /> {/* Define Create Case route */}
          <Route path="/dashboard" element={<AdvocateDashboard />} />
          <Route path="/profile" element={<AdvocateProfile />} />
          <Route path="/find-a-lawyer" element={<FindALawyer />} />
          <Route path="/floating-case" element={<FloatingCase />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;