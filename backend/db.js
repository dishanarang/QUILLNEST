const mongoose=require('mongoose');
const dotenv=require('dotenv')
dotenv.config();

const MONGODB_URL=process.env.MONGODB_URL
const DB_NAME=process.env.DB_NAME



mongoose.connect(MONGODB_URL,{
    dbName:DB_NAME
})
.then(()=>{
    console.log('DB connected sucessfully!!')
})
.catch((err)=>{
    console.log('error connecting to DB',err)
})

