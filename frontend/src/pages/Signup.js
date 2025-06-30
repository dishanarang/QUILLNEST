import React, { useState } from 'react'
import { Link,  useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Signup.css';
import {toast} from 'react-toastify';

const Signup = () => {
  const [name, setName]=useState('');
  const [email, setEmail]=useState('');
  const [password, setPassword]=useState('');
  const [otp, setOtp]=useState('');
  const [role, setRole]=useState('student');
  const [loading, setLoading]=useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [description, setDescription] = useState('');


  const {login}=useAuth();
  const navigate=useNavigate();

  const handleSubmit=async (e)=>{
    e.preventDefault();
    //handle backend api logic here
    if(!name || !email || !password || !otp){
      toast.error('All fields are required');
      return;
    }
    try{
      setLoading(true);

      const formData=new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('otp', otp);
      formData.append('role', role);
      formData.append('description', description);

      if (profilePic) {
        formData.append('profilePic', profilePic); // ✅ file goes here
      }
      const response=await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/register`,{
        method:'POST',
        body:formData,
        credentials:'include',
      });

      const data=await response.json();

      if(response.ok){
        toast.success('Registration successful');
        //login after registration
        login({email, role});
        navigate('/') //navigate to home page
      }
      else{
        toast.error(data.message || 'Registration failed');
      }
    }
    catch(error){
      console.log(error);
      toast.error('Error duringregistration');
    }
    finally{
      setLoading(false);
    }
  }

  const handleSendOtp=async ()=>{
    if(!email){
      toast.error('Please enter your email');
      return;
    }
    try{
      setLoading(true); //show loading state
      const response= await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/sendotp`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body: JSON.stringify({email}),  //send email as the body(req.body has email)
        credentials:'include', //include cookies
      })

      const data=await response.json();
      if(response.ok){
        toast.success('OTP sent successfully');
      }
      else{
        toast.error(data.message || 'Failed to send OTP');
      }

    }
    catch(err){
      toast.error('Error sending otp');
      console.log(err);
    }
    finally{
      setLoading(false);
    }
  }

  return (
    <div className="signup-page"
    style={{
    backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('/bg3.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}>
    <h1>Signup</h1>
    <form onSubmit={handleSubmit}>
      <input
         type='text'
         placeholder='Name'
         value={name}
         onChange={(e)=>{setName(e.target.value)}}
         required
      />
      <div className='email-otp-container'>
       <input
         type='email'
         placeholder='Email'
         value={email}
         onChange={(e)=>{setEmail(e.target.value)}}
         required
        />
        <button type='button' onClick={handleSendOtp} className="send-otp-btn">
          {loading? 'wait...': 'Send OTP'}
        </button>
      </div>
      <input
        type='text'
        placeholder='Enter OTP'
        value={otp}
        onChange={(e)=>{
          setOtp(e.target.value)
        }}
        required
      />
      <input
         type='password'
         placeholder='Password'
         value={password}
         onChange={(e)=>{setPassword(e.target.value)}}
         required
      />
<div className="file-upload-container">
  <label className="file-label">Upload Profile Pic</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => setProfilePic(e.target.files[0])}
  />
</div>

      <textarea
        
        placeholder='Description (For Teachers)'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="signup-textarea"
      />

     
     <select value={role} onChange={(e)=>{setRole(e.target.value)}}>
      <option value="teacher">Teacher</option>
      <option value="student">Student</option>
     </select>
     <button type="submit">Signup</button>
    </form>
     <div className='login-link'>
      <p>Already have an account? <Link to ="/login">Login here</Link></p>
     </div>
    </div>
  )
}

export default Signup
