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
import CreateCase from './pages/CreateCase';
import FindALawyer from './pages/FindALawyer';
import BhartiyaNyayaSanhita from './pages/BhartiyaNyayaSanhita';
import UserDashboard from './pages/UserDashboard';
import CaseDetail from './pages/CaseDetail';
import EditProfile from './pages/EditProfile';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/create-case" element={<CreateCase />} />
          
          {/* User Dashboard */}
          <Route path="/dashboard" element={<UserDashboard />} />
          
          {/* Case Detail Routes with tabs */}
          <Route path="/case/:caseId" element={<CaseDetail />} />
          <Route path="/case/:caseId/:tab" element={<CaseDetail />} />
          
          {/* Advocate Routes */}
          <Route path="/advocate-dashboard" element={<AdvocateDashboard />} />
          <Route path="/profile" element={<AdvocateProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          
          {/* Other Routes */}
          <Route path="/find-a-lawyer/:caseId?" element={<FindALawyer />} />
          <Route path="/floating-case" element={<FloatingCase />} />
          <Route path="/nyaya-sanhita" element={<BhartiyaNyayaSanhita />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;