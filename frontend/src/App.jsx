import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SelfieAttendance from './SelfieAttendance';
import EvaluationForm from './EvaluationForm';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
          <div className="max-w-4xl w-full mb-8 text-center">
             <h1 className="text-4xl font-extrabold text-blue-600 mb-2 tracking-tight">Shadow Partner System</h1>
             <p className="text-gray-500 font-medium text-lg">Manito Peer-Assessment Training Module</p>
             <div className="flex justify-center gap-4 mt-6">
                 <Link to="/attendance" className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-2 px-6 rounded-full transition-colors">Go to Selfie Attendance</Link>
                 <Link to="/evaluation" className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-6 border border-gray-300 rounded-full transition-colors">Go to Evaluation Form</Link>
             </div>
          </div>
          <Routes>
              <Route path="/attendance" element={<SelfieAttendance />} />
              <Route path="/evaluation" element={<EvaluationForm targetName="John Doe" />} />
              <Route path="/" element={<div className="mt-10 text-gray-400">Select a module above.</div>} />
          </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;
