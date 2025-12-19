
const {app,status,state}=require("./app");
require("dotenv").config();
require("./routes");
require("./redis_conect")
let {pool}=require("./mySql_db");
const { redis } = require("./redis_conect");


const server=app.listen(process.env.PORT||4600,()=>{console.log(`server running on port ${process.env.PORT||4600}`);
});

server.on("error",(err)=>{console.log(err.message);
    status(false,false);
});


const shutdown=async(signal)=>{
console.log(signal);

status(false,true);
await new Promise(resolve=>setTimeout(() => {
    return resolve();
}, 5000));

server.close(async()=>{
console.log("closing server");

const waitTime=25000;
const currTime=Date.now();

while(state.activeReq>0&&(Date.now()-currTime)<waitTime){
await new Promise(resolve=>{setTimeout(() => {
    resolve()
}, 100);});
}
//
try {

    if(pool){
   await pool.end()
};
if(redis&&redis.isOpen){
await redis.quit();
};
process.exit(0);
} catch (error) {
    console.log(error.message,"forcing shutdown");
    process.exit(1);
}});

setTimeout(() => {
    console.log("forcing shutdown after 30 secs");
    
    process.exit(1);
}, 30000)

};

process.on("SIGINT",()=>{shutdown("SIGINT")});
process.on("SIGTERM",()=>{shutdown("SIGTERM")});
process.on("uncaughtException",(error)=>{console.log(error);
shutdown("uncaughtException")});