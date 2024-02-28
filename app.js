// // app.js

// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const passport = require('passport');
// const jwtStrategy = require('passport-jwt').Strategy;
// const ExtractJwt = require('passport-jwt').ExtractJwt;
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const session = require('express-session');
// const cookieParser = require('cookie-parser');

// const app = express();

// // Body parser middleware
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(cookieParser());

// // session config
// // app.use (session({
// //     secret:"jhfbkusrehfbgjerhb",
// //     cookie:{maxAge:360036},
// //     resave:true,
// //     saveUninitialized:true,
    
// // }))


// // MongoDB URI
// const dbURI = 'mongodb://localhost:27017/passport_auth';

// // Connect to MongoDB
// mongoose
//   .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

// // User model
// const User = require('./models/user');

// // Passport middleware
// app.use(passport.initialize());
// // app.use(passport.session());

// // JWT Strategy
// const opts = {};
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = 'secret';

// passport.use(
//   new jwtStrategy(opts, (jwt_payload, done) => {
//     User.findById(jwt_payload.id)
//       .then(user => {
//         if (user) {
//           return done(null, user);
//         }
//         return done(null, false);
//       })
//       .catch(err => console.log(err));
//   })
// );

// // Routes
// app.post('/register', (req, res) => {
//   const { name, email, password } = req.body;

//   User.findOne({ email }).then(user => {
//     if (user) {
//       return res.status(400).json({ message: 'Email already exists' });
//     } else {
//       const newUser = new User({
//         name,
//         email,
//         password
//       });

//       // Hash password before saving in database
//       bcrypt.genSalt(10, (err, salt) => {
//         bcrypt.hash(newUser.password, salt, (err, hash) => {
//           if (err) throw err;
//           newUser.password = hash;
//           newUser
//             .save()
//             .then(user => res.json(user))
//             .catch(err => console.log(err));
//         });
//       });
//     }
//   });
// });

// app.post('/login', (req, res) => {
//   const { email, password } = req.body;

//   User.findOne({ email }).then(user => {
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     bcrypt.compare(password, user.password).then(isMatch => {
//       if (isMatch) {
//         const payload = { id: user.id, name: user.name };

//         jwt.sign(payload, 'secret', { expiresIn: 3600 }, (err, token) => {
//           res.json({
//             success: true,
//             token: 'Bearer ' + token
//           });
//         });
//       } else {
//         return res.status(400).json({ message: 'Password incorrect' });
//       }
//     });
//   });
// });

// app.get(
//   '/profile',
//   passport.authenticate('jwt', { session: false }),
//   (req, res) => {
//     res.json({
//       id: req.user.id,
//       name: req.user.name,
//       email: req.user.email
//     });
//   }
// );

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
