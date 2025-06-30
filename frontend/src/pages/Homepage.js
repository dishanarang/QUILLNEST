import React, { useEffect, useState } from 'react';
import './Homepage.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';


const Homepage = () => {
  const navigate=useNavigate();
  const [teachers, setTeachers] = useState([]);

  const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6
    }
  })
};

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/allteachers`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setTeachers(data.data);
        } else {
          toast.error(data.message || 'Could not fetch teachers');
        }
      } catch (err) {
        toast.error('Network error while fetching teachers');
      }
    };

    fetchTeachers();
  }, []);

  return (


    <div className="homepage">
       <div className="hero">
            <div>
              
              <motion.h1
               initial="hidden"
               animate="visible"
               variants={fadeInUp}
               >
              Welcome to QuillNest!
              </motion.h1>
              <motion.p
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeInUp}
              >
        QuillNest is your digital hub for smart Learning.
      </motion.p>
            </div>
          </div>

          <motion.h2
              className="explore-heading"
                   initial="hidden"
                   animate="visible"
                   variants={fadeInUp}
                   >
                 Explore Educators
                  </motion.h2>

    <motion.div className="teacher-grid">
      {teachers.map((teacher, index) => (
        <div className="teacher-card" key={index} onClick={() => navigate(`/teacher/${teacher._id}`)}>
          <img
            src={teacher.profilePic || '/user_icon.png'}
            alt={teacher.name}
            className="teacher-image"
            onError={(e) => {
             e.target.onerror = null;
            e.target.src = '/user_icon.png';
  }}
/>

          <h3>{teacher.name}</h3>
          <p>{teacher.email}</p>
        </div>
      ))}
    </motion.div>


    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
        <h2 id="about" className="features-heading">Why Choose <span className="brand-color">QuillNest</span>?</h2>
    <p className="features-subheading">Empowering educators and students through seamless digital learning.</p>
    
    <div className="features-grid">
      <div className="feature-card">
        <div className="feature-icon">🧑‍🏫</div>
        <h4>Explore New Educators</h4>
        <p>Discover passionate educators across disciplines, making learning diverse and engaging.</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">👥</div>
        <h4>Student & Teacher Profiles</h4>
        <p>Personalized profiles that showcase skills, subjects, and classroom participation.</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">📂</div>
        <h4>Resource Sharing</h4>
        <p>Upload and access notes, assignments, and PDFs in a central learning space.</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">🤖</div>
        <h4>Smart Learning</h4>
        <p>Leverage AI chat assistance and classroom tools to boost productivity and clarity.</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">🔒</div>
        <h4>Secure & Protected Classrooms</h4>
        <p>Built with privacy and access control to ensure safe collaborative spaces.</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">🌱</div>
        <h4>Collaboration & Growth</h4>
        <p>Encourage open discussions, real-time chats, and mutual growth among learners.</p>
      </div>
    </div>
    </motion.div>
    <div className="how-it-works">
      <h2 className="how-heading">How <span className="brand-color">QuillNest</span> Works?</h2>
      <p className="how-subheading">Join your ideal learning environment in four simple steps.</p>
    
      <div className="how-steps">
        <div className="step">
          <div className="step-badge">1</div>
          <div className="step-icon">🔍</div>
          <div>
            <h4>Browse Educators</h4>
            <p>Explore various educator profiles and find one that fits your interests and goals.</p>
          </div>
        </div>
        <div className="step">
          <div className="step-badge">2</div>
          <div className="step-icon">📚</div>
          <div>
            <h4>View Classrooms</h4>
            <p>Look for available classrooms under each educator and see their description and content.</p>
          </div>
        </div>
        <div className="step">
          <div className="step-badge">3</div>
          <div className="step-icon">🔑</div>
          <div>
            <h4>Join with OTP</h4>
            <p>Securely join classrooms using one-time passwords shared by the teacher.</p>
          </div>
        </div>
        <div className="step">
          <div className="step-badge">4</div>
          <div className="step-icon">💬</div>
          <div>
            <h4>Start Learning</h4>
            <p>Engage in collaborative learning with real-time chat, shared resources, and interactive tools.</p>
          </div>
        </div>
      </div>
    </div>




     {/* Footer here */}
    <footer className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="quill-logo-with-name"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
  style={{ cursor: 'pointer' }}
          >
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
</svg>

        <span className="quill-text">QuillNest</span>
       </div>
       
          <p>
            QuillNest is committed to transforming digital education with collaborative classrooms,
            smart AI tools, and seamless learning experiences.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Information</h4>
            <ul>
              <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>Home</li>
              <li  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ cursor: 'pointer' }}>About Us</li>
            </ul>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li>Classroom Management</li>
              <li>AI Assistant</li>
              <li>Live Chat</li>
            </ul>
          </div>
          <div>
            <h4>Support</h4>
            <ul>
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
      </div>
      <hr />
      <div className="footer-bottom">
        © {new Date().getFullYear()} QuillNest. All Rights Reserved.
      </div>
    </footer>
    
    </div>
  );
};

export default Homepage;
