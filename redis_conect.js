const { createClient } = require("redis");

const redis = createClient({
  username: "default",
  password: "VYuMKiEz46cPbGwZVN8rn5ieTP2asW7y",
  socket: {
    host: "redis-15607.c1.us-central1-2.gce.redns.redis-cloud.com",
    port: 15607,
  }
});
// Redis error handler — single error log only
let redisErrorLogged = false;
redis.on("error", (err) => {
  if (!redisErrorLogged) {
    console.error("❌ Redis Error:", err.message);
    redisErrorLogged = true;
  }
});

// Redis Retry Logic
async function connectRedisWithRetry(retries = 5, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await redis.connect();
      console.log("✅ Redis Connected Successfully!");
      redisConnected = true;
      return;
    } catch (err) {
      console.error(`❌ Redis connection failed (attempt ${i}):`, err.message);
      if (i < retries) {
        console.log(`🔁 Retrying Redis in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error("💥 Redis: Max retry attempts reached. Exiting.");
        process.exit(1);
      }
    }
  }
}


(async () => {
  console.log("started");
  await 
   
    connectRedisWithRetry()
 
})();

module.exports = { redis };


