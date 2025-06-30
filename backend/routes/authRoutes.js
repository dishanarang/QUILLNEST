const express=require('express');
const User = require('../models/userModel');
const Classroom =require('../models/classroomModel')
const Verification = require('../models/verificationModel');
const responseFunction = require('../utils/responseFunction');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authTokenHandler = require('../middlewares/checkAuthToken');
const crypto = require('crypto');
const { imageUpload } = require('../utils/cloudinary');


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

//just for testing out
router.get('/hello',(req,res)=>{
    res.json({
        message: 'Auth route home'
    })
})


router.post('/sendotp', async(req,res,next)=>{
    const {email}=req.body;
    if(!email){
        return responseFunction(res, 400, "Email is required", null, false)
    }
    try{
        await Verification.deleteMany({email:email}); //this delets all exisiting otp/verifcation entries in your verification collection that match the given email
        
        const code = generateSecureOTP();
        const isSent=await mailer(email,code); //->will send mail to the given email extracted from frontend via req.body

        //now let us store in the database.
        const newVerification= new Verification({
            email:email,
            code:code
        })
        //before saving the code(otp) will get hashed(see the verification model) and saved into the database
        await newVerification.save();

        if(!isSent){
            return responseFunction(res, 500, "Internal server error, couldnt sent otp to the mail", null, false);
        }

        return responseFunction(res,200,"OTP sent successfully", null, true)
    }
    
    catch(err){
        //console.log("ERROR", err)
        return responseFunction(res,500,"Internal server error",err, false )
    }

})


router.post('/register',imageUpload.single('profilePic'), async(req,res)=>{
    const {name, email, password, otp, role, description} =req.body;
    let profilePicUrl = req.file ? req.file.path : '';  // get Cloudinary URL

    if(!name || !email || !password || !otp || !role){
        return responseFunction(res,400,"All fields are required", null, false);
    }

    if(password.length < 6){
        return responseFunction(res,400,"Password should be at least 6 characters long", null, false)
    }

    try{
        let user=await User.findOne({email});
        let verificationQueue= await Verification.findOne({email});
        if (user){
            return responseFunction(res, 400, 'User already exists', null, false);
        }

        if(!verificationQueue){
            return responseFunction(res, 400, "Please send otp first", null, false);
        }
        
        const isMatch=await bcrypt.compare(otp, verificationQueue.code);
        if(!isMatch){
            return responseFunction(res, 400, 'Invalid OTP', null, false);
        }
        //if otp is correct then make a user in the database
        user = new User({
            name, 
            email,
            password,
            role,
            profilePic:profilePicUrl,
            description

        });
        await user.save();
        await Verification.deleteOne({ email }); //delete otp from database

        //generate auth and refresh tokens
        const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '10d' });

        //set these tokens in cookies
        res.cookie('authToken', authToken, { httpOnly: true, secure: true, sameSite: 'none' });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none' });

        user.password=undefined;
        return responseFunction(res, 200, 'Registered user successfully', { user, authToken, refreshToken } , true);
    }
    catch(err){
        return responseFunction(res,500,'Internal server error', err, false)
    }
})

router.post('/login',async(req,res,next)=>{
    try{
        const {email, password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return responseFunction(res,400,'Invalid credentials', null, false);
        }
        const isMatch=await bcrypt.compare(password, user.password);
        if(!isMatch){
            return responseFunction(res,400,'Incorrect password', null, false);
        }
        //password correct, so now generate tokens and save them to cookies
        const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '10d' })

        user.password = undefined;

        res.cookie('authToken', authToken, { httpOnly: true, secure: true, sameSite: 'none' })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none' })

        return responseFunction(res, 200, 'Logged in successfully', { user, authToken, refreshToken }, true);
    }
    catch(err){
         return responseFunction(res,500,'Internal server error', err, false);
    }
})

//authTokenHandler checks the tokens
router.get('/checklogin', authTokenHandler, async (req, res, next) => {
    console.log('check login');

    res.json({
        ok: req.ok,
        message: req.message,
        userId: req.userId
    })
})

router.get('/getuser', authTokenHandler, async (req, res, next) => {
    try{
        const user = await User.findById(req.userId).select('-password');

        if (!user){
            return responseFunction(res, 400, 'User not found', null, false);
        }
        return responseFunction(res, 200, 'User found', user, true);
    }
    catch (err){
        return responseFunction(res, 500, 'Internal server error', err, false);
    }
})

router.get('/logout', async (req, res) => {
    res.clearCookie('authToken', {
      sameSite: 'none',
      httpOnly: true,
      secure: true
    });
    res.clearCookie('refreshToken', {
     sameSite: 'none',
     httpOnly: true,
     secure: true
    });

    res.json({
        ok: true,
        message: 'Logged out successfully'
    })
})

router.get('/allteachers', authTokenHandler, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('name email profilePic');
    return responseFunction(res, 200, 'Teachers fetched', teachers, true);
  } catch (err) {
    return responseFunction(res, 500, 'Failed to fetch teachers', err, false);
  }
});

// GET teacher profile and classrooms
router.get('/teacher/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const teacher = await User.findById(id).select('-password'); // exclude password
    if (!teacher || teacher.role !== 'teacher') {
      return responseFunction(res, 404, 'Teacher not found', null, false);
    }

    const classrooms = await Classroom.find({ owner: id });

    return responseFunction(res, 200, 'Teacher profile fetched', {
      teacher,
      classrooms
    }, true);
  } catch (err) {
    return responseFunction(res, 500, 'Server error', err, false);
  }
});


module.exports=router;