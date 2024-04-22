// Import mongoose library
const mongoose = require("mongoose");
// Import the database schema
const schemaModule = require("./schemas");
const userSchema = schemaModule.userSchema;

// Get all users in the database.
// Success: Returns the all users.
function GetAllUsers(req, res) {
    userSchema
        .find()
        .then((items) => {
            res.json(items);
        })
        .catch((_) => {
            res.status(400).send("Operation not possible");
        });
}
function GetUserById(req, res) {
    userSchema
        .findById(req.params.id)
        .then((items) => {
            if (items == null) {
                res.status(404).send("User not found");
            } else {
                res.json(items);
            }
        })
        .catch((_) => {
            res.status(400).send("Operation not possible");
        });
}
// Get a user with username and password.
// Username and password must be passed in the request body.
// Success: Returns the user.
function GetUserByLogin(req, res) {
    userSchema
        .find()
        .then((items) => {
            let index = 0;
            let user = {};
            while (index < items.length) {
                user = items[index];
                if (
                    user.username == req.body.username &&
                    user.password == req.body.password
                ) {
                    res.json(user);
                    return;
                }
                index++;
            }
            res.status(404).send("User not found");
        })
        .catch((_) => {
            res.status(400).send("Operation not possible");
        });
}

// Updates a user's information.
// User is found via the object id.
// User info must be defined in the request body.
// Success: Returns the updated user.
function UpdateUser(req, res) {
    // Find the item in the database with the specific id.
    userSchema
        .findById(req.params.id)
        // If that id exists in the database:
        .then((user) => {
            // Update the user with the request body.
            let copy = req.body;
            user.username = copy.username;
            user.name = copy.name;
            user.age = copy.age;
            user.password = copy.password;
            user.gender = copy.gender;
            user.height = copy.height;
            user.weight = copy.weight;
            user.streak = copy.streak;
            user.exercises = copy.exercises;
            user.goals = copy.goals;
            user.nutrition = copy.nutrition;
            // Attempt to save the changes to the database.
            user.save()
                .then((success) => {
                    // Respond with a success message.
                    res.json(success);
                })
                .catch((_) => {
                    // Respond with a fail message.
                    res.status(400).send("Update not possible");
                });
        })
        .catch((_) => {
            // Log any errors.
            res.status(404).send("User not found");
        });
}

// Create a user.
// User info must be defined in the request body.
// Success: Returns the created user.
function CreateUser(req, res) {
    let user = new userSchema();
    let copy = req.body;
    user.username = copy.username;
    user.name = copy.name;
    user.age = copy.age;
    user.password = copy.password;
    user.gender = copy.gender;
    user.height = copy.height;
    user.weight = copy.weight;
    user.streak = copy.streak;
    user.exercises = [];
    user.goals = [];
    user.nutrition = [];

    user.save()
        .then((items) => {
            res.json(items);
        })
        .catch((_) => {
            res.status(400).send("Create not possible");
        });
}

exports.CreateUser = CreateUser;
exports.GetAllUsers = GetAllUsers;
exports.GetUserById = GetUserById;
exports.UpdateUser = UpdateUser;
exports.GetUserByLogin = GetUserByLogin;
