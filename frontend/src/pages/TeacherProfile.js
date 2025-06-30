import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './TeacherProfile.css';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
const TeacherProfile = () => {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/teacher/${id}`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
          setTeacher(data.data.teacher);
          setClassrooms(data.data.classrooms);
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error('Failed to load teacher profile');
      }
    };
    fetchTeacher();
  }, [id]);

  if (!teacher) return <div>Loading...</div>;

  const colorPalette = ['#A7FFEB', '#FFE57F', '#FF9E80', '#B388FF'];

  return (
    <div className="teacher-profile-container">
      <div className="profile-section">
        <img src={teacher.profilePic || '/user_icon.png'} alt={teacher.name} className="profile-image" />
        <h2>{teacher.name}</h2>
        <p><b>Email:</b> {teacher.email}</p>
        <p><b>Role:</b> {teacher.role}</p>
        {teacher.description && <p><b>Description:</b> {teacher.description}</p>}
      </div>

      <div className="classroom-list">
        <h3>Classrooms created by {teacher.name}:</h3>
        {classrooms.map((classroom, index) => (
          <Link
             to={`/classes/${classroom._id}`}
              key={classroom._id}
              className="classroom-card-link"
          >
          <div className="classroom-card" style={{ cursor: 'pointer' }}>
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
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TeacherProfile;
