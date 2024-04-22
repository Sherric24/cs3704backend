// Import mongoose library
const mongoose = require('mongoose');

const exerciseLogSchema = new mongoose.Schema({
    name: String,
    type: String, // Duration or Reps
    reps: Number,
    weight: String,
    duration: Number,
    custom: String,
    date: Date,
});
const goalSchema = new mongoose.Schema({
    type: String,
    name: String,
    value: Number,
    unit: String,
});

const nutritionLogSchema = new mongoose.Schema({
    date: Date,
    name: String,
    notes: String,
    quantity: Number,
    calories: Number,
    carbs: Number,
    protein: Number,
    fat: Number,
});

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    password: String,
    gender: String,
    age: Number,
    height: String,
    weight: String,
    streak: Number, 
    exercises: [exerciseLogSchema],
    goals: [goalSchema],
    nutrition: [nutritionLogSchema],
});


// Export schema
exports.userSchema = mongoose.model('user', userSchema);
exports.exerciseLogSchema = mongoose.model('exerciseLog', exerciseLogSchema);
exports.nutritionLogSchema = mongoose.model('nutritionLog', nutritionLogSchema);
exports.goalSchema = mongoose.model('goal', goalSchema);

