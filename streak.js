// Import mongoose library
const mongoose = require("mongoose");
// Import the database schema
const schemaModule = require("./schemas");
const exerciseLogSchema = schemaModule.exerciseLogSchema;
const userSchema = schemaModule.userSchema;

// Calculate streak of logged workouts for the user.
// Returns: The user's streak as a number.
async function CalculateUserStreak(req, res) {
    // Find all exercises associated with the user
    let user;
    let fullLogs;
    let updatedUser;
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
        for (let i = 0; i < user.exercises.length; i++) {
            let logObject = await exerciseLogSchema.findById(user.exercises[i]);
            fullLogs.push(logObject);
        }
    } catch {
        res.status(404).send("Log not found");
        return;
    }
    try {
        // Calculate streak

        fullLogs.sort((a, b) => a.date - b.date);

        let streak = 0;
        let previousDate = null;
        for (let log of fullLogs) {
            if (previousDate == null) {
                streak = 1;
            } else if (isSameDay(log.date, previousDate)) {
                // It's the same day, pass.
            } else if (!isConsecutiveDays(log.date, previousDate)) {
                streak = 1; // Reset streak if not consecutive
            } else {
                streak++; // Increment streak if consecutive
            }
            previousDate = log.date;
        }
        user.streak = streak;
        updatedUser = await user.save();
        res.json(updatedUser.streak);
    } catch {
        res.status(400).send("Update not possible");
    }
}

// Helper function to check if two dates are consecutive days
function isConsecutiveDays(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
    return diffDays === 1;
}

// Helper function to check if two dates are consecutive days
function isSameDay(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
    return diffDays === 0;
}

exports.CalculateUserStreak = CalculateUserStreak;
