
const {db}=require("./mySql_db");
const {redis}=require("./redis_conect");


const courses_cache=async(req,res,next)=>{
console.log("in courses cache");

try {
    if(!redis.isReady){return next()}
    let get=await redis.get(`courses-${req.query.type}`);
   
    
    if(get){const parsed=JSON.parse(get);
        console.log("Sending courses from cache");
        
        return res.status(200).json({msg:"Success",data:parsed}) 
    }else{
       return next();
    }



} catch (error) {
    console.log(error.message);
return next();
    let err=new Error(error.message);
    err.status=error.status;
return next(err);    
    
}

};




const courses_db =async(req,res,next)=>{
    console.log("in courses real",req.query.type);
    
try {
   let [rows]=await(  req.query.type.toUpperCase()=="FULL" ? db.execute(`select * from flyfazaia.courses x 
join(select course_id as id,group_concat(highlight) as list   
from course_highlights a group by course_id) y on x.id=y.id`):db.execute(`select id,title from courses`));

if(!rows||rows.length<1){let err=new Error();err.message="Data not found";err.status=404;return next( err)};
data=[rows];

  
   
    if(redis.isReady){
    await redis.set(`courses-${req.query.type}`,JSON.stringify(rows))}
    return res.status(200).json({msg:"Success",data:rows});

} catch (error) {
    
    console.log(error.message);
    
  return next(error)
};


};


const syllabus=async(req,res,next)=>{
    console.log(req.query.id);
    
    try {
        let [rows]=await db.execute(`select * from syllabus where course_id=?`,[req.query.id]);
        console.log(rows);
       if(!rows||rows.length<1){let err=new Error("Data not found");err.status=404;return next(err)};
    // await redis.set(`syllabus-${req.query.id}`,JSON.stringify(rows));
        return res.status(200).json({msg:"Success",data:rows});
    } catch (error) {
        console.log(error.message);
        throw error;
    }
};


const syllabus_cache=async(req,res,next)=>{

try {
    let get=await redis.get(`syllabus-${req.query.id}`);
    if(get){const parsed=JSON.parse(get);
        console.log(parsed);
        
        console.log("Sending courses from cache");
        
        return res.status(200).json({msg:"Success",data:parsed}) 
    }else{
       return next();
    }



} catch (error) {
    console.log(error.message);
return next();
    let err=new Error(error.message);
    err.status=error.status;
return next(err);    
    
}

};










module.exports={courses_db,courses_cache,syllabus_cache,syllabus}