import React, {useState, useEffect} from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfilePage from './pages/ProfilePage';
import ClassDetails from './pages/ClassDetails';
import Homepage from './pages/Homepage';
import { AuthProvider, useAuth } from './context/AuthContext';
import PublicHomepage from './pages/PublicHomepage';
import Chatbot from './components/Chatbot';
import TeacherProfile from './pages/TeacherProfile';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




const ProtectedRoute=({children})=>{
  const {auth,login}=useAuth();
  const [loading,setLoading]=useState(true);
  const navigate=useNavigate();

  useEffect(()=>{
    const checkLoginStatus=async()=>{
      try{
        const response=await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/checklogin`,{
          method:'GET',
          credentials:'include',
        });
        const data=await response.json();

        
        if(response.ok && data.ok){
          login({userId: data.userId});
          setLoading(false);
        }
        else{
          toast.error(data.message || 'Session expired. Please log in again');
          navigate('/login');
        }
      }
      catch(error){
        toast.error('Error checking login staus');
        navigate('/login');
      }
      finally{
        setLoading(false);
      }
    }
    checkLoginStatus();
  },[navigate])

  if(loading){
    return <div>Loading...</div>;
  }
  return auth.user? children: <Navigate to='/login'/>
}


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar/>
        <Chatbot/>
        <Routes>
          <Route path='/discover' element={<PublicHomepage/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/signup' element={<Signup/>}/>
          {/* <Route path='/' 
            element={
              <ProtectedRoute>
                <Homepage/>
              </ProtectedRoute>
            }/>  */}
            <Route path='/' element={<PublicHomepage />} />
              <Route path='/home'
                element={
              <ProtectedRoute>
              <Homepage/>
              </ProtectedRoute>
              }/>

            <Route
              path="/teacher/:id"
              element={
              <ProtectedRoute>
                <TeacherProfile />
              </ProtectedRoute>
            }/>
            <Route path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage/>
                </ProtectedRoute>
              }/>
              <Route path="/classes/:classid"
              element={
                <ProtectedRoute>
                  <ClassDetails/>
                </ProtectedRoute>
              }/>
        </Routes>
        <ToastContainer />
      </Router>
    </AuthProvider>
  )
}

export default App
