const {db}=require("./mySql_db")
let {v4:uuid}=require("uuid");
const {servcesForm_validate}=require("./joi_validator");
const sanitizeHtml=require("sanitize-html")



const services_fnx=async(req,res,next)=>{

try {
    let [rows]=await db.execute('select * from services');
console.log(rows);
if(!rows){
  let err= new Error();
err.message="Data not found";
err.status=400;
throw err;
}
return res.status(200).json({data:rows})
} catch (error) {
    console.log(error.message);
  return  next(error);
}};

const services_form=async(req,res,next)=>{
console.log(req.body);

try {
    const validate=servcesForm_validate.validate({id:req.body.id,title:req.body.title,contact:req.body.contact,project:req.body.project,contact:req.body.contact});
    console.log(validate.error);
    
  if(validate.error?.details[0]){
    let err=new Error();
    err.message=validate.error.details[0].message
    err.status=400;
    return next(err);
  };
  const clean1 = sanitizeHtml(req.body.title, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      a: ["href", "target"],
      img: ["src", "alt"],
    },
    
  });
  
  const clean2 = sanitizeHtml(req.body.project, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      a: ["href", "target"],
      img: ["src", "alt"],
    },
  });
   let [check]=await db.execute(`select * from flyfazaia.users where id=?`,[req.body.id]);
 if(!check||check.length==0){throw new Error("User not authenticated")};
    const id=uuid();
    let [rows]=await db.execute('insert into projects (id,title,details,user_id,contact) values(?,?,?,?,?)',[id,clean1,clean2,req.body.id,req.body.contact]);
    return res.status(200).json({msg:"Project Posted Successfully,You Will Recieve A Message Soon "});

} catch (error) {
    console.log(error.message);
     let err=new Error();
    err.message=error.message;
    err.status=400
  return  next(err);
}};

const project_detail=async(req,res,next)=>{
  console.log("in proj dets");
  
  try {
    
      let [rows]=await db.execute('select * from projects where id=?',[req.params.project_id]);
console.log(rows);
if(!rows){
  let err= new Error();
err.message="Data not found";
err.status=400;
throw err;
    
  }
return res.status(200).json({data:rows})

} catch (error) {
    console.log(error.message);
    return next(error);
  }
};

module.exports={services_fnx,services_form,project_detail}