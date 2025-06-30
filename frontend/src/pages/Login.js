import React, { useState } from 'react'
import { Link,  useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import {toast} from 'react-toastify';

const Login = () => {
  const [email, setEmail]=useState("");
  const [password, setPassword]=useState("");
  const {login} = useAuth();
  const [loading, setLoading]=useState(false);
  const navigate=useNavigate();


    const handleSubmit=async (e)=>{
      e.preventDefault();
      //handle backend api logic

      if(!email || !password){
        toast.error('Email and password are required!');
        return;
      }
      setLoading(true);
      try{
        const response=await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify({email,password}),
        credentials:'include',
       });

        const data=await response.json();
        //data looks something like this:
        // data = {
        //   message: "Logged in successfully",
        //   data: {
        //      user: {
        //          // user fields like:
        //         _id: "abc123",
        //          name: "John Doe",
        //          email: "john@example.com",
        //           // ...
        //        },
        //      authToken: "your-jwt-auth-token",
        //      refreshToken: "your-jwt-refresh-token"
        //   },
        //   ok: true
        //  }

        if(response.ok){
          toast.success('Logged in successfully');
          login(data.data);  //this function stores the data in local storage
          navigate('/');
        }
        else{
        toast.error(data.message || 'Login failed');
        }
      }
      catch(error){
        toast.error('An error occured during login');
      }
      finally{
        setLoading(false);
      }
    }

  return (
    <div className="login-page"
    style={{
    backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/bg3.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
    >
      <h1>Login</h1>
      
      <form onSubmit={handleSubmit}>
        {/* <div className="input-icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="input-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>

        <input
           type="email"
           placeholder='Email'
           value={email}
           onChange={(e)=>{setEmail(e.target.value)}}
           required
        />
        </div> */}
        <div className="input-icon-container">
  <div className="input-wrapper">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="input-icon"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
  </div>
</div>


        {/* <input
           type="password"
           placeholder='Password'
           value={password}
           onChange={(e)=>{setPassword(e.target.value)}}
           required
        /> */}
        <div className="input-icon-container">
  <div className="input-wrapper">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="input-icon">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
  </div>
</div>
        <button type="submit">Login</button>
      </form>
      <div className='signup-link'>
        <p>Don't have an account? <Link to='/signup'>Sign up</Link></p>
      </div>
    </div>



//   <div className="login-page" style={{
//   backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('/bg3.jpg')`,
//   backgroundSize: 'cover',
//   backgroundPosition: 'center',
//   backgroundRepeat: 'no-repeat',
// }}>
//   <div className="form-card">
//     <h2>Welcome Back</h2>
//     <form onSubmit={handleSubmit}>
//       <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
//       <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//       <button type="submit">Sign In</button>
//     </form>
//     <p className="bottom-link">Don't have an account? <Link to="/signup">Sign up</Link></p>
//   </div>
// </div>


  )
}

export default Login
