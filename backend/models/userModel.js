const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: 
    { 
        required: true, 
        type: String 
    },
    email: 
    { 
        required: true, 
        type: String, 
        unique: true 
    },
    password: 
    {
         required: true,
          type: String 
    },
    role: 
    { 
        type: String, 
        enum: ['teacher', 'student'], 
        required: true 
    },
    description:{
        type:String,
        default:'',
    },
    profilePic:
    {
        type: String, // this will store the Cloudinary URL
        default: '',  // empty string if not provided
    }

}, { timestamps: true }
)


//This is a pre-save hook in Mongoose.

//"save" means it will run before .save() is called on a document.

//It’s used here to hash the password before saving the user.

userSchema.pre('save', async function(next){
    const user=this;
    if(this.isModified('password')){ //trying to change password or set password for the first time
        user.password=await bcrypt.hash(user.password,10)
    }
    next();
})

module.exports = mongoose.model('User', userSchema);