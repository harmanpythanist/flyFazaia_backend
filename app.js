const express=require("express");
require("dotenv").config();
const app=express();
const cors=require("cors");
const router=express.Router();
const passport=require("./googleAuth_setup");
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000', 'http://localhost:4600'];
app.set('trust proxy', 1);
 
let state={
 activeReq:0,
 isHealthy:true,
 isShuttingDown:false
}
app.use((req,res,next)=>{console.log("req recieved");
if(state.isShuttingDown||!state.isHealthy){
  res.header("Connection","close");
  return res.status(503).json({msg:"Shutting Down"})
}

state.activeReq++;
res.on("finish",()=>{state.activeReq--})

 return next()});



app.use((req,res,next)=>{
  
res.header('X-Content-Type-Options','no-sniff');
res.header('X-Frame-Options','Deny');
res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
res.header('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
return next();
});

app.use(passport.initialize());
app.use(cors({origin:allowedOrigins,methods:["POST","PUT","GET","DELETE"],allowedHeaders:["authorization","content-type"]}));
app.use(express.json());
app.use("/api",router);
app.use((req, res) => {
  return res.status(404).json({ error: 'Not found' });
  
})
app.use((error,req,res,next)=>{console.log("got universal error",error.message);
    return res.status(error.status||500).json(error.message);
});

function status (health,shut){
  state.isHealthy=health;
  state.isShuttingDown=shut;
};

module.exports={router,app,state,status}