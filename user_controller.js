
const {db}=require("./mySql_db")


const user_fnx=async(req,res,next)=>{
console.log("in user");
console.log(req.params.id);

try {
let [course]=await db.execute(`SELECT 
e.enroll_id,
  e.courses,
 enrollment_date
FROM flyfazaia.users u

 JOIN (
  SELECT 
    user_id,id as enroll_id,
  course_title AS courses,user_contact,enrollment_date
  FROM enrollment

) e ON u.id = e.user_id

WHERE u.id =? ;

  `,[req.params.id]);


let [projects]=await db.execute(`SELECT 
e.project_id,e.title,e.details,e.contact
FROM flyfazaia.users u

 JOIN (
  SELECT 
    user_id,id as project_id,
  title ,contact,details
  FROM projects

) e ON u.id = e.user_id

WHERE u.id =?;
`,[req.params.id])





 
    return res.status(200).json({course:course,projects:projects});

    
} catch (error) {
  console.log(error.message);
  
    return next(error)
}};

module.exports={user_fnx};