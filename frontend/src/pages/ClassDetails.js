import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './ClassDetails.css';
import ClassroomChat from '../components/ClassroomChat';


const ClassDetails = () => {
    const {classid}=useParams();
    const [classroom, setClassroom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postDescription, setPostDescription] = useState('');

    const [showJoinPopup, setShowJoinPopup] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOtpPopup, setShowOtpPopup] = useState(false);
    const [otpError, setOtpError] = useState('');

    const [editingPost, setEditingPost] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPopupVisible, setEditPopupVisible] = useState(false);

    const [postFiles, setPostFiles] = useState([]);

    const navigate=useNavigate();

    const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/getclassbyid/${classid}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setClassroom(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch class details');
      }
    } catch (error) {
      toast.error('Error fetching class details');
    } finally {
      setLoading(false);
    }

  }

  useEffect(() => {
    fetchClassDetails();
  }, [classid]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/getuser`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          setUser(data.data);
        } else {
          toast.error(data.message || 'Failed to fetch user data');
        }
      } catch (error) {
        toast.error('An error occurred while fetching user data');
      }
    };

    fetchUser();
  }, []);

  const handleAddPost = () => {
    setShowPopup(true);  

  }

  // const handleSubmitPost = async () => {
  //   try {
  //     const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/addpost`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         title: postTitle,
  //         description: postDescription,
  //         classId: classid
  //       }),
  //       credentials: 'include',
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       toast.success('Post created successfully');
  //       setPostTitle('');  // Clear the input fields
  //       setPostDescription('');
  //       setShowPopup(false);  // Close the popup
  //       fetchClassDetails(); // Optionally refresh posts here
  //     } else {
  //       toast.error(data.message || 'Failed to create post');
  //     }
  //   }
  //   catch (error) {
  //     toast.error('An error occurred while creating the post');
  //   }
  // }
  
const handleSubmitPost = async () => {
  try {
    const formData = new FormData();
    formData.append('title', postTitle);
    formData.append('description', postDescription);
    formData.append('classId', classid);
    console.log('Files uploading:', postFiles);
    //postFiles.forEach(file => formData.append('files', file));
    for (let i = 0; i < postFiles.length; i++) {
       formData.append('files', postFiles[i]);
    }


    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/addpost`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      toast.success('Post created successfully');
      setPostTitle('');
      setPostDescription('');
      setPostFiles([]);
      setShowPopup(false);
      fetchClassDetails();
    } else {
      
      toast.error( 'Failed to create post');
    }
  } catch (error) {
    console.log('Error while uploading post:',error);
    toast.error('An error occurred while creating the post');
  }
};


  
  const handleClosePopup = () => {
    setShowPopup(false);  

  }

  const handleJoinRequest = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/request-to-join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classroomId: classid,
          studentEmail: user?.email,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setShowJoinPopup(false);
        setShowOtpPopup(true);
        toast.success('OTP sent to the class owner');
      } else {
        toast.error(data.message || 'Failed to send join request');
      }
    }
    catch (error) {
      toast.error('An error occurred while sending join request');
    }
  }

   const handleSubmitOtp = async () => {

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classroomId: classid,
          studentEmail: user?.email,
          otp
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setOtp('');
        setShowOtpPopup(false);
        setOtpError('');
        toast.success('Successfully joined the class');
        fetchClassDetails(); // Refresh the classroom details
      } else {
        setOtpError(data.message || 'Failed to verify OTP');
      }
    } catch (error) {
      console.log(error)
      toast.error('An error occurred while verifying OTP');
    }
  }

  const handleCloseOtpPopup = async() => {
    setShowOtpPopup(false);
    setOtpError('');
    setOtp('');
    
    try{
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/cancel-join-request`, {
        method:'DELETE',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify({
          classroomId:classid,
          studentEmail:user?.email,
        }),
        credentials:'include',
      });

      const data=await response.json();
      if(response.ok){
        toast.success('Canceled request to join');
      }
      else{
        toast.error(data.message || 'Failed to cancel join request');
      }
    }
    catch(error){
      toast.error('An error occured while canceling the join-request');
    }
  }

 const openEditPopup = (post) => {
  setEditingPost({ ...post, filesToDelete: [] }); // ✅ initialize filesToDelete
  setEditTitle(post.title);
  setEditDescription(post.description);
  setEditPopupVisible(true);
  setPostFiles([]);
};


const handleUpdatePost = async () => {
  try {
    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('description', editDescription);

    formData.append('filesToDelete', JSON.stringify(editingPost.filesToDelete || []));

    postFiles.forEach(file => formData.append('newFiles', file));

    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/editpost/${editingPost._id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      toast.success('Post updated successfully');
      fetchClassDetails();
      setEditPopupVisible(false);
    } else {
      toast.error(data.message || 'Failed to update post');
    }
  } catch (error) {
    toast.error('Error updating post');
  }
};

const handleDeletePost = async (postId) => {
  if (!window.confirm('Are you sure you want to delete this post?')) return;

  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/deletepost/${postId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();
    if (response.ok) {
      toast.success('Post deleted successfully');
      fetchClassDetails(); // Refresh UI
    } else {
      toast.error(data.message || 'Failed to delete post');
    }
  } catch (error) {
    toast.error('Error deleting post');
  }
};

const handleRemoveStudent = async (studentId) => {
  if (!window.confirm('Are you sure you want to remove this student from the class?')) return;

  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/remove-student`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        classroomId: classid,
        studentId
      })
    });

    const data = await response.json();

    if (response.ok) {
      toast.success('Student removed successfully');
      fetchClassDetails(); // Refresh classroom data
    } else {
      toast.error(data.message || 'Failed to remove student');
    }
  } catch (err) {
    toast.error('Error removing student');
  }
};

  if (loading || !user || !classroom) {
  return <div className="loading">Loading...</div>;
}

  //const isStudent=classroom?.students?.includes(user?.email);
  const isStudent = classroom?.students?.some(student =>
  String(student._id) === String(user?._id)
);
  const isOwner = String(classroom?.owner) === String(user?._id);

  const isTeacher = user?.role === 'teacher';
  console.log(isStudent)
  console.log(isOwner)
  console.log(isTeacher)
  
  
  return (
     <div className="class-details">
      <div className="section1">
        <img
          src="/classroompic.jpg"  // Dummy image
          alt="Classroom"
          className="class-image"
        />
        <h1 className="class-name">{classroom?.name}</h1>
        <p className="class-description">{classroom?.description}</p>

        {/* only the class owner can add posts */}
        {isOwner && (
          <button className="add-post-btn" onClick={handleAddPost}>
            Add Post
          </button>
        )}

        {/* only a student not a part of the class gets to see the JOIN CLASS button */}
        {!isStudent && !isOwner && !isTeacher && (
          <button className="add-post-btn" onClick={() => setShowJoinPopup(true)}>
            Join Class
          </button>
        )}
        </div>

        {/* only an existing student/owner can see posts */}
         {/* <div className='post-grid'>
          {
          (isStudent || isOwner) && classroom?.posts?.length > 0 ? (
            classroom.posts.map((post, index) => (
              <div key={index} className="post-card">
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                {post.files?.map((file, i) => (
                  <a key={i} href={file.url} target="_blank" rel="noopener noreferrer">
                   PDF {i + 1}
                  </a>
                ))}
                <small>{new Date(post.createdAt).toLocaleDateString()}</small>
                {isOwner && (
                  <>
              <button onClick={() => openEditPopup(post)} className="edit-btn">Edit</button>
              <button onClick={() => handleDeletePost(post._id)} className="delete-btn">Delete</button>
              </>
              )}
              </div>

            ))
          ) : (
            <p>No posts available</p>
          )

        }
         </div> */}
         <div className='post-grid'>
  {(isStudent || isOwner) ? (
    classroom?.posts?.length > 0 ? (
      classroom.posts.map((post, index) => (
        // <div key={index} className="post-card">
        //   <h3>{post.title}</h3>
        //   <p>{post.description}</p>
        //   {post.files?.map((file, i) => (
        //     <a key={i} href={file.url} target="_blank" rel="noopener noreferrer">
        //       PDF {i + 1}
        //     </a>
        //   ))}
        //   <small>{new Date(post.createdAt).toLocaleDateString()}</small>
        //   {isOwner && (
        //     <>
        //       <button onClick={() => openEditPopup(post)} className="edit-btn">Edit</button>
        //       <button onClick={() => handleDeletePost(post._id)} className="delete-btn">Delete</button>
        //     </>
        //   )}
        // </div>
        <div key={index} className="post-card">
  <h3 className="post-title">{post.title}</h3>
  <p className="post-desc">{post.description}</p>

  <div className="post-files">
    {post.files?.map((file, i) => (
      <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="pdf-link">
        📄 PDF {i + 1}
      </a>
    ))}
  </div>

  {isOwner && (
    <div className="post-actions">
      <button className="edit-btn" onClick={() => openEditPopup(post)}>Edit</button>
      <button className="delete-btn" onClick={() => handleDeletePost(post._id)}>Delete</button>
    </div>
  )}

  <div className="post-footer">
    {new Date(post.createdAt).toLocaleDateString()}
  </div>
</div>

      ))
    ) : (
      <p>No posts available</p>
    )
  ) : null}
</div>



         {/* chat feature available to owners and students part of classroom */}
         {(isStudent || isOwner) && (
         <ClassroomChat classroomId={classid} classroomOwnerId={classroom?.owner}  />
          )}


          {isOwner && (
  <div className="student-list">
    <h3>Students in this class:</h3>
    {classroom.students.length > 0 ? (
      <ul>
        {classroom.students.map((student, index) => (
          <li key={index} className="student-item">
            <span className="student-name">{student.name}</span>
            <span className="student-email">{student.email}</span>
            <button
              className="delete-btn"
              onClick={() => handleRemoveStudent(student._id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p>No students have joined yet.</p>
    )}
  </div>
)}






        {/* owner gets to add post */}
        {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Add Post</h3>
            <input
              type="text"
              placeholder="Title"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
            />
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => setPostFiles(Array.from(e.target.files))}
            />

            <div className="popup-buttons">
              <button onClick={handleSubmitPost}>Submit</button>
              <button onClick={handleClosePopup}>Close</button>
            </div>
          </div>
        </div>
      )}
      

 {/* Add popup for editing post */}
{/* {editPopupVisible && (
  <div className="popup-overlay">
    <div className="popup-content">
      <h3>Edit Post</h3>
      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
      />
      <textarea
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
      />
      <div className="popup-buttons">
        <button onClick={handleUpdatePost}>Update</button>
        <button onClick={() => setEditPopupVisible(false)}>Cancel</button>
      </div>
    </div>
  </div>
)} */}

{editPopupVisible && (
  <div className="popup-overlay">
    <div className="popup-content">
      <h3>Edit Post</h3>
      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
      <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />

      <h4>Existing PDFs:</h4>
      {editingPost.files?.map((file, i) => (
        <div key={i}>
          <a href={file.url} target="_blank" rel="noopener noreferrer">PDF {i + 1}</a>
          <label>
            <input
              type="checkbox"
              onChange={(e) => {
                const checked = e.target.checked;
                setEditingPost(prev => ({
                  ...prev,
                  filesToDelete: checked
                    ? [...(prev.filesToDelete || []), file.public_id]
                    : prev.filesToDelete?.filter(id => id !== file.public_id) || []
                }));
              }}
            />
            Remove
          </label>
        </div>
      ))}

      <h4>Upload new PDFs:</h4>
      <input type="file" accept="application/pdf" multiple onChange={(e) => setPostFiles(Array.from(e.target.files))} />

      <div className="popup-buttons">
        <button onClick={handleUpdatePost}>Update</button>
        <button onClick={() => setEditPopupVisible(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}




      {/* outsider students get to join the class */}
      {showJoinPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Join Request</h3>
            <p>Do you want to join this class? An OTP will be sent to the class owner for approval.</p>

            <div className="popup-buttons">

              <button onClick={handleJoinRequest}>Send Join Request</button>
              <button onClick={() => setShowJoinPopup(false)}>Close</button>
            </div>
          </div>

        </div>

      )}
      
      {/* outsider students get to insert the otp */}
      {showOtpPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Enter OTP</h3>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {otpError && <p className="otp-error">{otpError}</p>}

            <div className="popup-buttons">
              <button onClick={handleSubmitOtp}>Submit</button>
              <button onClick={handleCloseOtpPopup}>Close</button>
            </div>
          </div></div>
      )}



      </div>
     
  )
}



export default ClassDetails;
