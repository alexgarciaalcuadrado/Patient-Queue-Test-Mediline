import React from 'react'
import {
  BrowserRouter as Router,
  Routes ,
  Route
} from "react-router-dom";
import MC from './components/messagesconsole'
import PatientVirtualGuard from './components/patient'
import DoctorVirtualGuard from './components/doctor'

const App = () => {
  return (
    <Router>
      <Routes >
          <Route path="/paciente" exact element={<PatientVirtualGuard />} />
          <Route path="/doctor" exact element={<DoctorVirtualGuard />} />
          <Route path="/ejemplo" exact element={<MC />}/>
        </Routes >
    </Router>
  )
}

export default App;

