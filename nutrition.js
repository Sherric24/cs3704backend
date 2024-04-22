// Import mongoose library
const mongoose = require("mongoose");
// Import the database schema
const schemaModule = require("./schemas");
const nutritionLogSchema = schemaModule.nutritionLogSchema;
const userSchema = schemaModule.userSchema;

// Create a nutrition log for a user.
// The user is found via the object id.
// Nutrition info must be defined in the request body.
// Success: Returns the created nutrition log.
async function CreateNutritionLog(req, res) {
    let log = new nutritionLogSchema();
    let copy = req.body;
    log.name = copy.name;
    log.date = copy.date;
    log.notes = copy.notes;
    log.quantity = copy.quantity;
    log.calories = copy.calories;
    log.carbs = copy.carbs;
    log.protein = copy.protein;
    log.fat = copy.fat;
    let user;
    try {
        user = await userSchema.findById(req.params.userId);
        if (user == null) {
            throw "no user";
        }
    } catch {
        res.status(404).send("User not found");
        return;
    }
    let savedLog;
    try {
        savedLog = await log.save();
        user.nutrition.addToSet(savedLog.id);
        await user.save();
        res.json(savedLog);
    } catch {
        res.status(400).send("Update not possible");
        return;
    }
}

// Returns the nutrition logs for a user.
// Success: Returns an array of the user's nutrition logs.
async function GetUserNutritionLogs(req, res) {
    let user;
    let fullLogs;
    try {
        user = await userSchema.findById(req.params.userId);
        if (user == null) {
            throw "no user";
        }
    } catch {
        res.status(404).send("User not found");
        return;
    }
    try {
        fullLogs = [];
        for (let i = 0; i < user.nutrition.length; i++) {
            let log = await nutritionLogSchema.findById(user.nutrition[i]);
            fullLogs.push(log);
        }
        res.json(fullLogs);
    } catch {
        res.status(404).send("Goal not found");
        return;
    }
}

// Remove all nutrition logs for a user.
// The user is found via object id.
// Success: Returns the updated user.
async function ClearUserNutritionLogs(req, res) {
    let user;
    try {
        user = await userSchema.findById(req.params.userId);
        if (user == null) {
            throw "no user";
        }
    } catch {
        res.status(404).send("User not found");
        return;
    }
    try {
        for (let i = 0; i < user.nutrition.length; i++) {
            let log = await nutritionLogSchema.findById(user.nutrition[i]);
            await log.deleteOne();
        }
    } catch {
        res.status(400).send("Update not possible");
        return;
    }
    try {
        user.nutrition = [];
        let updatedUser = await user.save();
        res.json(updatedUser);
    } catch {
        res.status(400).send("Update not posssible");
        return;
    }
}

// Removes a nutrition logs from a user.
// Both objects are found via object ids.
// Returns: The updated user.
async function RemoveUserNutritionLog(req, res) {
    let user;
    let log;
    try {
        user = await userSchema.findById(req.params.userId);
        if (user == null) {
            throw "no user";
        }
    } catch {
        res.status(404).send("User not found");
        return;
    }
    try {
        log = await nutritionLogSchema.findById(req.params.logId);
        if (log == null) {
            throw "no log";
        }
    } catch {
        res.status(404).send("Log not found");
        return;
    }
    let index = 0;
    while (index < user.nutrition.length) {
        if (user.nutrition[index].id == log.id) {
            break;
        }
        index++;
    }
    if (index == user.nutrition.length) {
        res.status(404).send("User does not have that log");
        return;
    }
    user.nutrition.splice(index, 1);
    try {
        await log.deleteOne();
        let updatedUser = await user.save();
        res.json(updatedUser);
    } catch {
        res.status(400).send("Update not possible");
    }
}

exports.CreateNutritionLog = CreateNutritionLog;
exports.GetUserNutritionLogs = GetUserNutritionLogs;
exports.RemoveUserNutritionLog = RemoveUserNutritionLog;
exports.ClearUserNutritionLogs = ClearUserNutritionLogs;
