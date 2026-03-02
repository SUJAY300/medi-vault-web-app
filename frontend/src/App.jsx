import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DoctorLayout from "./layouts/DoctorLayout";
import PatientLayout from "./layouts/PatientLayout";
import DoctorDashboardHome from "./pages/doctor/DoctorDashboardHome";
import MyPatients from "./pages/doctor/MyPatients";
import UploadFiles from "./pages/doctor/UploadFiles";
import MyFiles from "./pages/doctor/MyFiles";
import Chatbot from "./pages/doctor/Chatbot";
import PatientDashboardHome from "./pages/patient/PatientDashboardHome";
import PatientMyFiles from "./pages/patient/PatientMyFiles";
import PatientDoctor from "./pages/patient/PatientDoctor";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard/doctor" element={<DoctorLayout />}>
        <Route index element={<DoctorDashboardHome />} />
        <Route path="patients" element={<MyPatients />} />
        <Route path="upload" element={<UploadFiles />} />
        <Route path="files" element={<MyFiles />} />
        <Route path="chatbot" element={<Chatbot />} />
      </Route>
      <Route path="/dashboard/patient" element={<PatientLayout />}>
        <Route index element={<PatientDashboardHome />} />
        <Route path="files" element={<PatientMyFiles />} />
        <Route path="doctor" element={<PatientDoctor />} />
      </Route>
      <Route path="/dashboard/:role" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
