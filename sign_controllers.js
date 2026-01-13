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

    await db.execute(
      "UPDATE flyfazaia.users x SET refreshToken=? WHERE x.id=?",
      [refresh, req.user.id]
    );

    // Build HTML string to send to browser
    const html = `<!DOCTYPE html>
<html>
<head><title>OAuth Success</title></head>
<body>
  <script>
    (function() {
      const data = {
        type: "OAUTH_SUCCESS",
        accessToken: ${JSON.stringify(access)},
        refreshToken: ${JSON.stringify(refresh)},
        user: ${JSON.stringify(req.user)}
      };

      const targetOrigin = "${process.env.FRONTEND_URL}";
      
      if (window.opener && !window.opener.closed) {
        try {
          console.log("Sending message to:", targetOrigin);
          window.opener.postMessage(data, targetOrigin);
          setTimeout(function() { window.close(); }, 100);
        } catch (err) {
          console.error("postMessage failed:", err);
          document.body.innerHTML = "<h3>Login successful! Please close this window.</h3>";
        }
      } else {
        document.body.innerHTML = "<h3>Login successful! Please close this window and return to the app.</h3>";
      }
    })();
  </script>
</body>
</html>`;

    console.log("sending auth resp back to frontend");
    res.send(html);
    
  } catch (error) {
    console.error("Error in google_callback:", error.message);
    if (!res.headersSent) {
      return next(error);
    }
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