const passport = require("passport")
const User = require('../models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config()
const envAccesslink = process.env.ENV_ACCESS_LINK;

exports.showRegistrationForm = (req, res) => {
  res.render('register');
  
  // Create a registration form in a new HTML file
};

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, accesslink } = req.body;

    // Compare the accessLink provided
    if (!accesslink || accesslink != envAccesslink){
      return res.status(400).json({ message: 'Invalid access link.' })
    }
    // Otherwise create the user
    const user = new User({ username, email, password, confirmPassword });
    await user.save();
    passport.authenticate('local')(req, res, () => {
      res.status(201).json(user)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred during registration.')
  }
};

exports.LoginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    // find user by username
    const user = await User.findOne({ username });

    if (!user){
      return res.status(400).send('User not found');
    }

    // Othewise, Compare the password the user sent
    // with the one a user matches on database.
    const passwordMatch = await bcrypt.compare(password, user.password);

    // If the password Matches then Authanticate user.
    if (passwordMatch){
      user.status = 'online';
      await user.save();
      res.status(200).json({ message: 'Authentication successful' });

    }
    else{
      res.status(401).json({ message: 'Authentication failed' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({message:'An error occurred during login.'});
  }
}