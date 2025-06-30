const express=require('express');
const Classroom = require('../models/classroomModel');
const User = require('../models/userModel');
const Post=require('../models/postModel');
const ClassroomJoin=require('../models/classroomJoinModel');
const responseFunction = require('../utils/responseFunction');
const authTokenHandler = require('../middlewares/checkAuthToken');
const router=express.Router();
const nodemailer=require('nodemailer');
const mongoose = require('mongoose'); 
const { imageUpload, pdfUpload,cloudinary } = require('../utils/cloudinary');

function generateSecureOTP() {
    return Math.floor(100000 + Math.random() * 900000); // generates a 6-digit number
}



const mailer=async(receivermail, code)=>{
    let transporter=nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, //disabling SSL
        requireTLS: true, //using TLS instead of SSL
        auth: {
            user: process.env.COMPANY_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    })
    let info=await transporter.sendMail({
        from:"TEAM QUILLNEST",
        to: receivermail,
        subject:"OTP for QuillNest",
        text:"Your OTP is "+ code,
        html: "<b>Your OTP is " + code + "</b>",
    })

    console.log("Message send: %s", info.messageId);
    if(info.messageId){
        return true;
    }
    return false;
}

// route to create a classroom
router.post('/create',authTokenHandler, async(req,res)=>{
    const {name,description}=req.body;
    if(!name){
        return responseFunction(res,400, 'Classroom name is required', null, false);
    }
    try{
        const newClassroom= new Classroom({
            name, 
            description,
            owner: req.userId, //the current user becomes the owner, we got this from authTokenHandler
        });
        await newClassroom.save();
        return responseFunction(res,200,'Classroom created successfully',newClassroom, true);
    }
    catch(err){
        return responseFunction(res, 500, 'Internal server error (in creating class)', err, false);
    }
})

//route to fetch owner classrooms
router.get('/classroomscreatedbyme', authTokenHandler, async(req,res)=>{
    try{
        const classrooms= await Classroom.find({owner: req.userId});
        return responseFunction(res,200,'Classrooms fetched sucessfully',classrooms,true);
    }
    catch(err){
        return responseFunction(res, 500, 'Internal server error (in fetching classrooms)', err, false);
    }
    
})

//route to fetch a class by id
router.get('/getclassbyid/:classid', authTokenHandler, async(req, res)=>{
    const { classid } = req.params;
    try {
        // TODO : add one more condition   -> if (classroom.owner == req.userid || classroom.students.includes(req.userid)){ populate posts } 
        const classroom=await Classroom.findById(classid)
        .populate('posts')
        .populate('students','name email');
        if (!classroom){
            return responseFunction(res, 404, 'Classroom not found', null, false);
        }
        return responseFunction(res, 200, 'Classroom fetched successfully', classroom, true);
    }
    catch (err){
        return responseFunction(res, 500, 'Internal server error', err, false);
    }
})

//route to add post
router.post('/addpost', authTokenHandler, pdfUpload.array('files'), async (req, res) => {
    console.log('Received files:', req.files); 
//     console.log('--- POST /addpost Called ---');
//   console.log('Headers:', req.headers['content-type']);
// console.log('Body:', req.body);
// console.log('Files:', JSON.stringify(req.files, null, 2));

    const { title, description, classId } = req.body;
    try {
        const classroom = await Classroom.findById(classId);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

       
        if (String(classroom.owner) !== String(req.userId)){
          return res.status(403).json({ message: 'You are not allowed to post in this classroom' });
        }

        const uploadedFiles = req.files?.map(file => ({
           url: file.path,
           public_id: file.filename
        })) || [];

        const newPost = new Post({
            title,
            description,
            classId,
            createdBy: req.userId,  // req.user comes from requireAuth middleware
            files: uploadedFiles
        });

        await newPost.save();

        // Add post to the classroom's posts array
        classroom.posts.push(newPost._id);
        await classroom.save();


        res.status(201).json({ message: 'Post created successfully', post: newPost });


    }
//    catch (error) {
//     console.log('Error',error)
//   console.error('Post creation failed:', error.message);
//   console.error('Full error:', error); // shows stack trace
//   res.status(500).json({ message: 'Server error', error: error.message });
// }
catch (error) {
  console.error('Post creation failed');
  console.error('Error message:', error.message);
  console.error('Stack trace:', error.stack); // helpful for debugging

  // Optional: log full object nicely
  console.error('Full error (JSON):', JSON.stringify(error, Object.getOwnPropertyNames(error)));

  res.status(500).json({
    message: 'Server error',
    error: error.message || 'Unknown error'
  });
}


})

router.get('/classrooms/search', async (req, res) => {
    try {
        const term = req.query.term;
        if (!term) {
            return responseFunction(res, 400, 'Search term is required', null, false);
        }
        const results = await Classroom.find({
            name: { $regex: new RegExp(term, 'i') }
        })

        if (results.length === 0) {
            return responseFunction(res, 404, 'Classroom not found', null, false);
        }
        responseFunction(res, 200, 'Search results', results, true);

    }
    catch (error) {
        console.error(error);
        responseFunction(res, 500, 'Internal server error', error, false);
    }

})

router.post('/request-to-join', async (req, res) => {
    const { classroomId, studentEmail } = req.body;

    if (!classroomId || !studentEmail) {
        return responseFunction(res, 400, 'Classroom ID and student email are required', null, false);
    }

    try {
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return responseFunction(res, 404, 'Classroom not found', null, false);
        }
        const classOwnerId = classroom.owner;

        const classOwner = await User.findById(classOwnerId);
        if (!classOwner) {
            return responseFunction(res, 404, 'Class owner not found', null, false);
        }

        const classOwnerEmail = classOwner.email;
        const code = generateSecureOTP();
        const isSent = await mailer(classOwnerEmail, code);
        if (!isSent) {
            return responseFunction(res, 500, 'Failed to send OTP', null, false);
        }
        const newClassroomJoin = new ClassroomJoin({
            classroomId,  // Reference to the classroom
            studentEmail,  // Student email
            code,  // OTP code
            classOwnerEmail  // Email of the class owner
        });
        await newClassroomJoin.save();
        return responseFunction(res, 200, 'OTP sent to the class owner', null, true);


    }
    catch (err) {
        console.log(err)
        return responseFunction(res, 500, 'Internal server error', err, false);
    }
})

//otp is sent to classroom owner, and saved to database collection called 'studentjoin'

router.post('/verify-otp', authTokenHandler, async (req, res) => {
    const { classroomId, studentEmail, otp } = req.body;
    console.log('verify otp')
    if (!classroomId || !studentEmail || !otp) {
        return responseFunction(res, 400, 'Classroom ID, student email, and OTP are required', null, false);
    }
    try {
        const joinRequest = await ClassroomJoin.findOne({
            classroomId,
            studentEmail,
            code: otp
        });
        if (!joinRequest) {
            return responseFunction(res, 400, 'Invalid OTP or join request not found', null, false);
        }
        const classroom = await Classroom.findById(classroomId);
        if (!classroom) {
            return responseFunction(res, 404, 'Classroom not found', null, false);
        }
        // console.log(classroom.students)
        // if (!classroom.students.includes(studentEmail)) {
        //     classroom.students.push(studentEmail);
        //     await classroom.save();
        // }
        const student = await User.findOne({ email: studentEmail });
        if (!student) {
        return responseFunction(res, 404, 'Student not found', null, false);
        }

        if (!classroom.students.includes(student._id)) {
            classroom.students.push(student._id);
            await classroom.save();
        }

        await ClassroomJoin.deleteOne({ _id: joinRequest._id });

        return responseFunction(res, 200, 'Successfully joined the class', null, true);
    }
    catch (err) {
        console.log(err)
        return responseFunction(res, 500, 'Internal server error', err, false);
    }
})

router.delete('/cancel-join-request', async (req, res) => {
    const { classroomId, studentEmail } = req.body;

    if (!classroomId || !studentEmail) {
        return responseFunction(res, 400, 'Missing classroomId or studentEmail', null, false);
    }

    try {
        const deleted = await ClassroomJoin.findOneAndDelete({
            classroomId: new mongoose.Types.ObjectId(classroomId),
            studentEmail
        });

        if (!deleted) {
            return responseFunction(res, 404, 'Join request not found or already deleted', null, false);
        }

        return responseFunction(res, 200, 'Join request cancelled successfully', null, true);
    } catch (err) {
        console.error(err);
        return responseFunction(res, 500, 'Server error while cancelling join request', err, false);
    }
});

// router.put('/editpost/:postid', authTokenHandler, async (req, res) => {
//   const { postid } = req.params;
//   const { title, description } = req.body;

//   try {
//     const post = await Post.findById(postid);
//     if (!post) {
//       return res.status(404).json({ message: 'Post not found' });
//     }

//     // Only allow owner to edit post
//     const classroom = await Classroom.findById(post.classId);
//     if (!classroom || String(classroom.owner) !== String(req.userId)) {
//       return res.status(403).json({ message: 'Unauthorized to edit this post' });
//     }

//     post.title = title;
//     post.description = description;
//     await post.save();

//     res.status(200).json({ message: 'Post updated successfully', post });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// });

router.put('/editpost/:postid', authTokenHandler, pdfUpload.array('newFiles'), async (req, res) => {
  const { postid } = req.params;

  const title = req.body.title;
  const description = req.body.description;

  let filesToDelete = [];
try {
  if (typeof req.body.filesToDelete === 'string') {
    filesToDelete = JSON.parse(req.body.filesToDelete);
  }
} catch (e) {
  console.error('Failed to parse filesToDelete', e);
}


  try {
    const post = await Post.findById(postid);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const classroom = await Classroom.findById(post.classId);
    if (!classroom || String(classroom.owner) !== String(req.userId)) {
      return res.status(403).json({ message: 'Unauthorized to edit this post' });
    }

    // Delete selected old PDFs from Cloudinary
    post.files = post.files.filter(file => {
      if (filesToDelete.includes(file.public_id)) {
        cloudinary.uploader.destroy(file.public_id, { resource_type: 'raw' }).catch(console.error);
        return false;
      }
      return true;
    });

    // Add newly uploaded files
    if (req.files?.length) {
      const newFiles = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));
      post.files.push(...newFiles);
    }

    post.title = title;
    post.description = description;
    console.log('Final post object before save:', post);

    await post.save();

    res.status(200).json({ message: 'Post updated successfully', post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.delete('/deletepost/:postId', authTokenHandler, async (req, res) => {
  try {
    const postId = req.params.postId;
    
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const classroom = await Classroom.findById(post.classId);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    if (String(classroom.owner) !== String(req.userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    console.log('Deleting files:', post.files);

    // Delete PDFs from Cloudinary
    for (const file of post.files) {
      if (file.public_id) {
        try {
          await cloudinary.uploader.destroy(file.public_id, { resource_type: 'raw' });
        } catch (cloudErr) {
          console.error(`Error deleting file ${file.public_id}:`, cloudErr.message);
        }
      }
    }

    // Remove post from classroom
    classroom.posts = classroom.posts.filter(p => String(p) !== String(postId));
    await classroom.save();

    // Delete post from DB
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Server error during post delete:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/classroomsforstudent', authTokenHandler, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return responseFunction(res, 404, 'User not found', null, false);
        }
        //const studentEmail = user.email;
        const classrooms = await Classroom.find({ students: req.userId });
        if (classrooms.length === 0) {
            return responseFunction(res, 404, 'No classrooms found for this student', null, false);
        }

        return responseFunction(res, 200, 'Classrooms fetched successfully', classrooms, true);

    }
    catch (err) {
        console.log(err)
        return responseFunction(res, 500, 'Internal server error', err, false);
    }
})


router.put('/remove-student', authTokenHandler, async (req, res) => {
  const { classroomId, studentId } = req.body;

  if (!classroomId || !studentId) {
    return responseFunction(res, 400, 'Missing classroomId or studentId', null, false);
  }

  try {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return responseFunction(res, 404, 'Classroom not found', null, false);
    }

    if (String(classroom.owner) !== String(req.userId)) {
      return responseFunction(res, 403, 'Only the owner can remove students', null, false);
    }

    classroom.students = classroom.students.filter(id => String(id) !== String(studentId));
    await classroom.save();

    return responseFunction(res, 200, 'Student removed successfully', classroom, true);
  } catch (err) {
    console.error(err);
    return responseFunction(res, 500, 'Server error while removing student', err, false);
  }
});


// Edit classroom name or description
router.put('/edit/:id', authTokenHandler, async (req, res) => {
  const { name, description } = req.body;
  const classroomId = req.params.id;

  try {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return responseFunction(res, 404, 'Classroom not found', null, false);
    }

    if (String(classroom.owner) !== String(req.userId)) {
      return responseFunction(res, 403, 'Unauthorized to edit classroom', null, false);
    }

    if (name !== undefined) classroom.name = name;
    if (description !== undefined) classroom.description = description;

    await classroom.save();
    return responseFunction(res, 200, 'Classroom updated successfully', classroom, true);
  } catch (err) {
    return responseFunction(res, 500, 'Server error during classroom edit', err, false);
  }
});


// Route to delete classroom
router.delete('/delete/:id', authTokenHandler, async (req, res) => {
  const classroomId = req.params.id;
  try {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) return responseFunction(res, 404, 'Classroom not found', null, false);

    if (String(classroom.owner) !== String(req.userId)) {
      return responseFunction(res, 403, 'Unauthorized to delete classroom', null, false);
    }

    // Delete all chat messages
    await require('../models/chatMessageModel').deleteMany({ classroomId });

    // Delete all associated posts and files
    const posts = await Post.find({ classId: classroomId });
    for (let post of posts) {
      for (let file of post.files) {
        try {
          await cloudinary.uploader.destroy(file.public_id, { resource_type: 'raw' });
        } catch (err) {
          console.error('Failed to delete file from Cloudinary:', err);
        }
      }
    }
    await Post.deleteMany({ classId: classroomId });

    // Finally delete classroom
    await Classroom.findByIdAndDelete(classroomId);

    return responseFunction(res, 200, 'Classroom deleted successfully', null, true);
  } catch (err) {
    return responseFunction(res, 500, 'Error deleting classroom', err, false);
  }
});


//Route to exit classroom
router.put('/exit-classroom', authTokenHandler, async (req, res) => {
  const { classroomId } = req.body;
  if (!classroomId) {
    return responseFunction(res, 400, 'Classroom ID is required', null, false);
  }

  try {
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return responseFunction(res, 404, 'Classroom not found', null, false);
    }

    // Remove the student from classroom's students array
    classroom.students = classroom.students.filter(
      (id) => String(id) !== String(req.userId)
    );
    await classroom.save();

    return responseFunction(res, 200, 'Exited classroom successfully', null, true);
  } catch (err) {
    console.error(err);
    return responseFunction(res, 500, 'Server error while exiting classroom', err, false);
  }
});


module.exports=router;

