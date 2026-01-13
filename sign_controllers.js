const { sign_validate } = require("./joi_validator");
const {db}=require("./mySql_db");
const jwt=require("jsonwebtoken");
require("dotenv").config();



const access_generate=(x)=>{return jwt.sign(x,process.env.TokenSecret,{expiresIn:"24h"})};
const generate_refresh=(x)=>{return jwt.sign(x,process.env.TokenSecret,{expiresIn:"72h"})};

const google_callback = async (req, res, next) => {
  console.log("here in google cb sign controller");
  
  try {
    const access = access_generate(req.user);
    const refresh = generate_refresh(req.user);
// console.log("err here");

    await db.execute(
      "UPDATE flyfazaia.users x SET refreshToken=? WHERE x.id=?",
      [refresh, req.user.id]
    );

    return res.send(`
      <html>
      
        <body>
          <script>
            // Send data to the opener (Next frontend)
            window.opener.postMessage(
              {
                type: "OAUTH_SUCCESS",
                accessToken: ${JSON.stringify(access)},
                refreshToken: ${JSON.stringify(refresh)},
                user: ${JSON.stringify(req.user)}
              },
             "*"
            );
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error.message);
    const err = new Error(error.message);
    err.status = 500;
    return next(err);
  }
};


const access_check=async(req,res,next)=>{
console.log("here");

const access=req.headers["authorization"];
console.log(access);

try {
  let verify=jwt.verify(access,process.env.TokenSecret);
  console.log("here 2");
  console.log(verify);
  
  if(verify){return res.status(200).json({msg:"access verified",user:{name:verify.name,email:verify.email,id:verify.id}})}
} catch (error) {
  console.log(error.message);
  let err=new Error;
  err.message=error.message;
  err.status=400;
  return next(err);
}};


const refresh_check=async(req,res)=>{
console.log("in refresh");

const refresh=req.headers['authorization'];
console.log(refresh);
try {
  const verify=jwt.verify(refresh,process.env.TokenSecret);
if(verify){
  let access=access_generate({name:verify.name,email:verify.email,id:verify.id});
  let refresh=generate_refresh({name:verify.name,email:verify.email,id:verify.id});
  res.header("access",`${access}`);
  res.header("refresh",`${refresh}`);
  return res.status(200).json({msg:"Successfuly refreshed",user:{name:verify.name,email:verify.email,id:verify.id},accessToken:access,refreshToken:refresh});
}
} catch (error) {
  console.log(error.message);
  throw error;
  
}


}




module.exports={google_callback,access_check,refresh_check}