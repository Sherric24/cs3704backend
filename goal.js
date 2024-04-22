// Import mongoose library
const mongoose = require("mongoose");
// Import the database schema
const schemaModule = require("./schemas");
const goalSchema = schemaModule.goalSchema;
const userSchema = schemaModule.userSchema;

// Create a goal for a user.
// The user is found via the object id.
// Goal info must be defined in the request body.
// Success: Returns the created goal.
function CreateUserGoal(req, res) {
    let goal = new goalSchema();
    let copy = req.body;
    goal.name = copy.name;
    goal.type = copy.type;
    goal.value = copy.value;
    goal.unit = copy.unit;
    userSchema
        .findById(req.params.userId)
        .then((user) => {
            if (user == null) {
                res.status(404).send("User not found");
                return;
            }
            goal.save()
                .then((savedGoal) => {
                    user.goals.addToSet(savedGoal.id);
                    user.save()
                        .then((_) => {
                            res.json(savedGoal);
                        })
                        .catch((_) => {
                            res.status(400).send("Update not possible");
                        });
                })
                .catch((_) => {
                    res.status(400).send("Update not possible");
                });
        })
        .catch((_) => {
            res.status(404).send("User not found");
        });
}

// Returns the goals for a user.
// Success: Returns an array of the user's goals.
async function GetUserGoals(req, res) {
    let user;
    let fullGoals;
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
        fullGoals = [];
        for (let i = 0; i < user.goals.length; i++) {
            let goalObject = await goalSchema.findById(user.goals[i]);
            fullGoals.push(goalObject);
        }
        res.json(fullGoals);
    } catch {
        res.status(404).send("Goal not found");
        return;
    }
}

// Remove all goals for a user.
// The user is found via object id.
// Success: Returns the updated user.
async function ClearUserGoals(req, res) {
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
        for (let i = 0; i < user.goals.length; i++) {
            let goal = await goalSchema.findById(user.goals[i]);
            await goal.deleteOne();
        }
    } catch {
        res.status(400).send("Update not possible");
        return;
    }
    try {
        user.goals = [];
        let updatedUser = await user.save();
        res.json(updatedUser);
    } catch {
        res.status(400).send("Update not posssible");
        return;
    }
}

// Removes a goal from a user.
// Both objects are found via object ids.
// Returns: The updated user.
async function RemoveUserGoal(req, res) {
    let user;
    let goal;
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
        goal = await goalSchema.findById(req.params.goalId);
        if (goal == null) {
            throw "no goal";
        }
    } catch {
        res.status(404).send("Goal not found");
        return;
    }
    let index = 0;
    while (index < user.goals.length) {
        if (user.goals[index].id == goal.id) {
            break;
        }
        index++;
    }
    if (index == user.goals.length) {
        res.status(404).send("User does not have that goal");
        return;
    }
    user.goals.splice(index, 1);
    try {
        await goal.deleteOne();
        let updatedUser = await user.save();
        res.json(updatedUser);
    } catch {
        res.status(400).send("Update not possible");
    }
}

exports.CreateUserGoal = CreateUserGoal;
exports.GetUserGoals = GetUserGoals;
exports.ClearUserGoals = ClearUserGoals;
exports.RemoveUserGoal = RemoveUserGoal;
