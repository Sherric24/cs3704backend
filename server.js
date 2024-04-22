// Import modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const port = 3000;

const username = "student";
const password = "failFlyFish";

const uri =
    "mongodb+srv://" +
    username +
    ":" +
    password +
    "@cs3704.7s6bkbo.mongodb.net/database?retryWrites=true&w=majority";

mongoose.Promise = global.Promise;
mongoose.connect(uri, {});
mongoose.connection.once("open", function () {
    console.log("Connection with MongoDB was successful");
});

// Set the web server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.get(
    "/",
    (req, res) => res.send("<h1>Back-End Server</h1>") // Home web page
);
const server = app;
if (process.env.NODE_ENV !== "test") {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
}
// Get data schemas
const schemaModule = require("./schemas");
const userSchema = schemaModule.userSchema;
const exerciseLogSchema = schemaModule.exerciseLogSchema;
const goalSchema = schemaModule.goalSchema;

// Get database functions
const userFunctions = require("./user");
const nutritionFunctions = require("./nutrition");
const exerciseFunctions = require("./exercise");
const streakFunctions = require("./streak");
const goalFunctions = require("./goal");

// Create server routes
const router = express.Router();
app.use("/db", router);

router.route("/user/find").get(userFunctions.GetAllUsers);
router.route("/user/find/:id").get(userFunctions.GetUserById);
router.route("/user/login").get(userFunctions.GetUserByLogin);
router.route("/user/update/:id").post(userFunctions.UpdateUser);
router.route("/user/create").put(userFunctions.CreateUser);

router.route("/food/create/:userId").put(nutritionFunctions.CreateNutritionLog);
router
    .route("/food/findByUserId/:userId")
    .get(nutritionFunctions.GetUserNutritionLogs);
router
    .route("/food/clear/:userId")
    .delete(nutritionFunctions.ClearUserNutritionLogs);
router
    .route("/food/remove/:userId/:logId")
    .delete(nutritionFunctions.RemoveUserNutritionLog);

router
    .route("/exercise/create/:userId")
    .put(exerciseFunctions.CreateUserExerciseLog);
router
    .route("/exercise/findByUserId/:userId")
    .get(exerciseFunctions.GetUserExerciseLogs);
router.route("/exercise/find/:id").get(exerciseFunctions.GetExerciseLog);
router
    .route("/exercise/clear/:userId")
    .delete(exerciseFunctions.ClearUserExerciseLogs);
router
    .route("/exercise/remove/:userId/:logId")
    .delete(exerciseFunctions.RemoveUserExerciseLog);


router.route("/streak/:userId").get(streakFunctions.CalculateUserStreak);

router.route("/goal/create/:userId").put(goalFunctions.CreateUserGoal);
router.route("/goal/findByUserId/:userId").get(goalFunctions.GetUserGoals);
router.route("/goal/clear/:userId").delete(goalFunctions.ClearUserGoals);
router
    .route("/goal/remove/:userId/:goalId")
    .delete(goalFunctions.RemoveUserGoal);

module.exports.server = server;
