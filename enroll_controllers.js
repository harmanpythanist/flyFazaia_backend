const {db}=require("./mySql_db");
const {v4:uuid}=require("uuid");
const {sign_validate}=require("./joi_validator");


const enroll=async(req,res,next)=>{

console.log(req.body.id);
let {id,contact,course}=req.body;
try {
 let valid=sign_validate.validate({id:id,contact:contact,course:course});
  if(valid.error?.details[0]){
    let err=new Error();
    err.message="Invalid input format."
    err.status=400;
    return next(err);
  }
  
   let [check]=await db.execute(`select * from flyfazaia.users where id=?`,[id]);
 if(!check||check.length==0){throw new Error("User not authenticated")};
let uid=uuid()
 await db.execute(`insert into enrollment (id,course_title,user_id,enrollment_date,user_contact) values(?,?,?,now(),?)`,
    [uid,course,id,contact])
   
    return res.status(200).json({msg:"Enrolled Successfully "})
} catch (error) {
    console.log(error.message);
    let err=new Error();
    err.message=error.message;
    err.status=400
  return  next(err);
}};

module.exports={enroll}