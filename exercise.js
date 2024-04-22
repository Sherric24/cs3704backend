// Import mongoose library
const mongoose = require("mongoose");
// Import the database schema
const schemaModule = require("./schemas");
const exerciseLogSchema = schemaModule.exerciseLogSchema;
const userSchema = schemaModule.userSchema;

// Create an exercise for a user.
// The user is found via the object id.
// Exercise log info must be defined in the request body.
// Success: Returns the updated user.
async function CreateUserExerciseLog(req, res) {
    let log = new exerciseLogSchema();
    let copy = req.body;
    log.name = copy.name ? copy.name : "";
    log.type = copy.type ? copy.type : "";
    log.reps = copy.reps ? copy.reps : 0;
    log.weight = copy.weight ? copy.weight : "";
    log.date = copy.date ? copy.date : Date.now();
    log.duration = copy.duration ? copy.duration : 0;
    log.custom = copy.custom ? copy.custom : "";
    let user;
    try {
        user = await userSchema.findById(req.params.userId);
    } catch {
        res.status(404).send("User not found");
        return;
    }
    try {
        let savedLog = await log.save();
        user.exercises.addToSet(savedLog.id);
        let updatedUser = await user.save();
        res.json(updatedUser);
    } catch {
        res.status(400).send("Update not possible");
        return;
    }
}

// Remove all exercises for a user.
// The user is found via object id.
// Success: Returns the updated user.
async function ClearUserExerciseLogs(req, res) {
    let user;
    try {
        user = await userSchema.findById(req.params.userId);
        if (user == null) {
            res.status(404).send("User not found");
            return;
        }
    } catch {
        res.status(404).send("User not found");
        return;
    }
    try {
        for (let i = 0; i < user.exercises.length; i++) {
            let log = await exerciseLogSchema.findById(user.exercises[i]);
            await log.deleteOne();
        }
    } catch {
        res.status(400).send("Update not possible");
        return;
    }
    try {
        user.exercises = [];
        let updatedUser = await user.save();
        res.json(updatedUser);
    } catch {
        res.status(400).send("Update not posssible");
        return;
    }
}

// Removes an exercise log from a user.
// Both objects are found via object ids.
// Returns: The updated user.
async function RemoveUserExerciseLog(req, res) {
    let user;
    let log;
    try {
        user = await userSchema.findById(req.params.userId);
        if (user == null) {
            res.status(404).send("User not found");
            return;
        }
    } catch {
        res.status(404).send("User not found");
        return;
    }
    try {
        log = await exerciseLogSchema.findById(req.params.logId);
        if (log == null) {
            res.status(404).send("Log not found");
            return;
        }
    } catch {
        res.status(404).send("Log not found");
        return;
    }
    let index = 0;
    while (index < user.exercises.length) {
        if (user.exercises[index].id == log.id) {
            break;
        }
        index++;
    }
    if (index == user.exercises.length) {
        res.status(404).send("User does not have that log");
        return;
    }
    user.exercises.splice(index, 1);
    try {
        await log.deleteOne();
        let updatedUser = await user.save();
        res.json(updatedUser);
    } catch {
        res.status(400).send("Update not possible");
    }
}

// Find an exercise info by object id.
// Success: Returns the exercise log.
function GetExerciseLog(req, res) {
    // Find the item in the database with the specific id.
    exerciseLogSchema
        .findById(req.params.id)
        // If that id exists in the database:
        .then((item) => {
            if (item == null) {
                res.status(404).send("Exercise not found");
            } else {
                res.json(item);
            }
        })
        .catch((_) => {
            // Log any errors.
            res.status(404).send("Exercise not found");
        });
}

// Returns the exercise logs for a user.
// Success: Returns an array of the user's exercise logs.
async function GetUserExerciseLogs(req, res) {
    // Find all exercises associated with the user
    let user;
    let fullLogs;
    try {
        user = await userSchema.findById(req.params.userId);
    } catch {
        res.status(404).send("User not found");
        return;
    }
    try {
        fullLogs = [];
        for (let i = 0; i < user.exercises.length; i++) {
            let logObject = await exerciseLogSchema.findById(user.exercises[i]);
            fullLogs.push(logObject);
        }
        res.json(fullLogs);
    } catch {
        res.status(404).send("Log not found");
        return;
    }
}

exports.ClearUserExerciseLogs = ClearUserExerciseLogs;
exports.RemoveUserExerciseLog = RemoveUserExerciseLog;
exports.GetExerciseLog = GetExerciseLog;
exports.GetUserExerciseLogs = GetUserExerciseLogs;
exports.CreateUserExerciseLog = CreateUserExerciseLog;
