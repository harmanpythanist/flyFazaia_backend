
const {router}=require("./app")
const {courses_db,courses_cache, syllabus,syllabus_cache}=require("./courses_controllers");
const { enroll } = require("./enroll_controllers");
const { google_callback, access_check, refresh_check } = require("./sign_controllers");
const passport =require("./googleAuth_setup");
const { services_fnx, services_form, project_detail } = require("./service_controller");
const { user_fnx } = require("./user_controller");


// 🧠 Courses
router.route("/courses").get(courses_db); // ?type=full or ?type=list

// 🧾 Syllabus
router.route("/syllabus").get(syllabus); // ?id=xyz

// 💼 Services
router.route("/services").get(services_fnx); // get all services
router.route("/service/form").post(services_form); // service form submit

// 👤 User
router.route("/user/:id").get(user_fnx); // user details by ID

// 🧩 Project Details
router.route("/project_dets/:project_id").get(project_detail); // project details by ID

// 📝 Enrollment
router.route("/enroll").post(enroll); // enroll form submit
//google callback for OAuth2
router.route( "/auth/google").get(passport.authenticate("google", { scope: ["profile", "email"] })
);

router.route("/auth/google/callback").get(passport.authenticate("google",{session:false}),google_callback);
//access fnx from middleware
router.route("/access_check").post(access_check);
//refresh fnx from middleware
router.route("/refresh_check").post(refresh_check);




module.exports={router};