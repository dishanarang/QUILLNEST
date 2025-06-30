const mongoose=require('mongoose');

const ClassroomSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        tirm:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    description:{
        type:String,
        trim:true
    },
    //array of students who have joined the particular classroom
    //students: [String],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  


    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
    }]

},{timestamps:true});

const Classroom=mongoose.model('Classroom',ClassroomSchema);

module.exports=Classroom;