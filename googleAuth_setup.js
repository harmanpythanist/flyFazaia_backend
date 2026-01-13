const passport=require("passport");
const {db}=require("./mySql_db");
const {Strategy}=require("passport-google-oauth2");
require("dotenv").config()


console.log(process.env.NODE_ENV);


passport.use(new Strategy({clientID:process.env.CLIENTID,clientSecret:process.env.CLIENTSECRET,callbackURL:process.env.NODE_ENV=="production"?process.env.GOOGLE_CALLBACK_URL:"http://localhost:4600/api/auth/google/callback"},async(access_token,refresh_token,profile,done)=>{
try {
    console.log(profile,"here in authSetup");
    
    const [rows]=await db.execute(`select * from flyfazaia.users where id=?`,[profile.id]);
if(rows.length<1){
    await db.execute(`insert into flyfazaia.users (id,name,email)values(?,?,?)`,[profile.id,profile.displayName,profile.email]);
   
}
    return done(null,{name:profile.displayName,email:profile.email,id:profile.id});
    
} catch (error) {
    console.log(error.message);
    
    return done(error,null);
}

}));

module.exports=passport