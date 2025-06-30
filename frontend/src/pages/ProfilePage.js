import React,{useEffect, useState} from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './ProfilePage.css';
import {useNavigate } from 'react-router-dom';

const ProfilePage = () =>{

    const navigate=useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [classroomName, setClassroomName] = useState('');
    const [description, setDescription] = useState('');
    const [classroomsCreatedByMe, setClassroomsCreatedByMe] = useState([]);
    const [classroomsJoinedByMe, setClassroomsJoinedByMe] = useState([]);
    const [editPopup, setEditPopup] = useState(false);
    const [selectedClassroomId, setSelectedClassroomId] = useState(null);


    useEffect(()=>{
        const fetchUser=async()=>{
            try{
                const response=await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/getuser`,{
                    method:'GET',
                    credentials:'include',
                });
                const data=await response.json();
                console.log(data);
                if(response.ok){
                    setUser(data.data);
                }
                else{
                    toast.error(data.message || 'Failed to fetch user data')
                }

            }
            catch(error){
                toast.error('An error occured while fetching user data')
            }
            finally{
                setLoading(false);
            }
        }
        fetchUser();
    },[])

    const fetchClassrooms=async()=>{
        try{
            const response=await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/classroomscreatedbyme`,{
                method:'GET',
                credentials:'include',
            });
            const data=await response.json();

            if(response.ok){
                setClassroomsCreatedByMe(data.data);
                //toast.success('classrooms fetched successfully')
            }
            else{
                toast.error(data.message || 'Failed to fetch classrooms');
            }
        }
        catch(error){
            toast.error('An error occured while fetching classrooms');
        }
    }

    const fetchClassroomsJoinedByMe=async()=>{
        try{
            const response=await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/classroomsforstudent`,{
                method:'GET',
                credentials:'include',
            });
            const data=await response.json();
            console.log(data);
            if(response.ok){
                //setClassroomsJoinedByMe(data.data);
                setClassroomsJoinedByMe([...data.data]);

            }
        }
        catch(error){
            toast.error('An error occured while fetching joined classrooms');
        }
    }

    useEffect(()=>{
        if(user){
            fetchClassrooms();
            fetchClassroomsJoinedByMe();
        }
    },[user]);


    const handleRowClick=(classroomId)=>{
        navigate(`/classes/${classroomId}`);
    };


    const handleCreateClassroom=async()=>{
        try{
            const response=await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/create`,{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body: JSON.stringify({
                    name:classroomName,
                    description,
                }),
                credentials:'include',
            });

            const data=await response.json();

            if(response.ok){
                toast.success('Classroom created successfully');
                setClassroomName('');  //clean the form fields 
                setDescription('');
                setShowPopup(false);
                fetchClassrooms(); //refresh the classrooms, so the newly created also appears
            }
            else{
                toast.error(data.message || 'Failed to create classroom');
            }
        }
        catch(error){
            toast.error('An error occured while creating a classroom');
        }
    }

    const handleEditClassroom = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/edit/${selectedClassroomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        name: classroomName,
        description
      })
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Classroom updated");
      setEditPopup(false);
      setSelectedClassroomId(null);
      setClassroomName('');
      setDescription('');
      fetchClassrooms();
    } else {
      toast.error(data.message || "Failed to update");
    }
  } catch (err) {
    toast.error("Server error during update");
  }
};


const handleDeleteClassroom = async (id) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/delete/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await response.json();
    if (response.ok) {
      toast.success('Classroom deleted');
      fetchClassrooms(); // Refresh UI
    } else {
      toast.error(data.message || 'Delete failed');
    }
  } catch (err) {
    toast.error('Server error during delete');
  }
};

const handleExitClassroom = async (classroomId) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/class/exit-classroom`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ classroomId })
    });

    const data = await response.json();
    if (response.ok) {
      toast.success('You have exited the classroom');
      //fetchClassroomsJoinedByMe(); // refresh UI
      setClassroomsJoinedByMe(prev =>
        prev.filter(classroom => classroom._id !== classroomId)
      );
    } else {
      toast.error(data.message || 'Failed to exit classroom');
    }
  } catch (err) {
    toast.error('Server error while exiting classroom');
  }
};


 const colorPalette = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#f472b6', '#facc15'];

  return (
    <div className="profile-page">
      {loading?(
        <div className="loading">Loading...</div>
      ):
        user?(
            <>
           
            <div
                className="profile-header"
                 style={{ backgroundImage: "url('/background2.png')" }}
            >
                <div className='profile-picture-wrapper'>
                <img
                  src={user.profilePic ? user.profilePic : '/user_icon.png'}
                   alt="Profile"
                 className="profile-picture"
                 style={{ backgroundColor: '#fff' }}
                />
                </div>
                </div>
             <div className='profile-info'>
                <div className="profile-details">
                    <h2>{user.name}</h2>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p> 
                    {user.role === 'teacher' && (
                        <button className="create-classroom-btn" onClick={() => setShowPopup(true)}>
                            Create Classroom
                        </button>
                    )}
                </div>
            </div>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Create Classroom</h3>

                        <input
                           type="text"
                           placeholder="Classroom Name"
                           value={classroomName}
                           onChange={(e)=> setClassroomName(e.target.value)}
                        />

                        <textarea
                          placeholder='Description'
                          value={description}
                          onChange={(e)=>setDescription(e.target.value)}
                        />

                        <div className='popup-buttons'>
                            <button onClick={handleCreateClassroom}>Submit</button>
                            <button onClick={()=>{
                                setClassroomName('');
                                setDescription('');
                                setShowPopup(false);
                                }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}


            {editPopup && (
  <div className="popup-overlay">
    <div className="popup-content">
      <h3>Edit Classroom</h3>

      <input
        type="text"
        placeholder="Classroom Name"
        value={classroomName}
        onChange={(e) => setClassroomName(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className='popup-buttons'>
        <button onClick={handleEditClassroom}>Submit</button>
        <button onClick={() => {
          setEditPopup(false);
          setClassroomName('');
          setDescription('');
          setSelectedClassroomId(null);
        }}>Cancel</button>
      </div>
    </div>
  </div>
)}

            {/* {
                user.role=='teacher' &&
                <div className='classroom-list'>
                    <h3>Classrooms created by me</h3>
                    <table>
                        
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {classroomsCreatedByMe.map((classroom)=>
                                <tr key={classroom._id} onClick={()=>handleRowClick(classroom._id)} >
                                    <td>{classroom.name}</td>
                                    <td>{classroom.description}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div> 
            } */}

{user.role === 'teacher' && (
  <div className="classroom-list">
    <h3>Classrooms created by me:</h3>
    {classroomsCreatedByMe.map((classroom, index) => (
      <div
        key={classroom._id}
        className="classroom-card"
        style={{ position: 'relative' }}
      >
        <div
          onClick={() => handleRowClick(classroom._id)}
          style={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }}
        >
          <div
            className="classroom-number"
            style={{ backgroundColor: colorPalette[index % colorPalette.length] }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
          <div className="classroom-content">
            <div className="name">{classroom.name}</div>
            <div className="description">{classroom.description}</div>
          </div>
          <div className="classroom-arrow">›</div>
        </div>

        {/* Edit button shown only if user is the owner */}
        {user && user._id === classroom.owner && (
  <>
  <div className="card-action-buttons">
    <button
      className="edit-btn"
      onClick={(e) => {
        e.stopPropagation();
        setClassroomName(classroom.name);
        setDescription(classroom.description);
        setSelectedClassroomId(classroom._id);
        setEditPopup(true);
      }}
      
    >
      ✎
    </button>

    <button
      className="delete-btn"
      onClick={(e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this classroom?')) {
          handleDeleteClassroom(classroom._id);
        }
      }}
      
    >
      🗑
    </button>
    </div>
  </>
)}

      </div>
    ))}
  </div>
)}

            

            {/* {user.role === 'student' &&
  <div className="classroom-list">
    <h3>Classrooms joined by me:</h3>
    {classroomsJoinedByMe.map((classroom, index) => (
      <div
        key={classroom._id}
        className="classroom-card"
        onClick={() => handleRowClick(classroom._id)}
        style={{ cursor: 'pointer' }}
      >
        <div className="classroom-number"
        style={{ backgroundColor: colorPalette[index % colorPalette.length] }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
        <div className="classroom-content">
          <div className="name">{classroom.name}</div>
          <div className="description">{classroom.description}</div>
        </div>
        <div className="classroom-arrow">›</div>
      </div>
    ))}
  </div>
} */}
{user.role === 'student' &&
  <div className="classroom-list">
    <h3>Classrooms joined by me:</h3>
    {classroomsJoinedByMe.map((classroom, index) => (
      <div
        key={classroom._id}
        className="classroom-card"
        style={{ position: 'relative' }}
      >
        <div
          onClick={() => handleRowClick(classroom._id)}
          style={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }}
        >
          <div className="classroom-number"
            style={{ backgroundColor: colorPalette[index % colorPalette.length] }}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
          <div className="classroom-content">
            <div className="name">{classroom.name}</div>
            <div className="description">{classroom.description}</div>
          </div>
         
        </div>

        {/* Exit Button */}
        <button
          className="exit-btn"
          
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Are you sure you want to leave this classroom?')) {
              handleExitClassroom(classroom._id);
            }
          }}
        >
          Exit
        </button>
      </div>
    ))}
  </div>
}


            </>
        ):(
            <p>No user data found.</p>
        )
      }
    </div>
  )
}

export default ProfilePage
 