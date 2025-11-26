//input 
const express = require('express');
const router = express.Router();


//insert Model
const User = require('../Model/UserModel');
//insert User Controller
const UserController = require('../Controlers/UserControllers');

//create route path
router.get("/", UserController.getAllUsers);
router.post("/register", UserController.addUsers);
router.post("/login", UserController.loginUser);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);
//export
module.exports = router;