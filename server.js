// Merge of server.js and app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();

// MongoDB URI
const uri="use ur own"// Connect to MongoDB
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User model
const User = require('./models/user');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Passport middleware
app.use(passport.initialize());

const generateSocketId = () => {
  return uuid.v4(); 
}
// JWT Strategy
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';

passport.use(
  new jwtStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload.id)
      .then(user => {
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      })
      .catch(err => console.log(err));
  })
);

app.get('/', (req, res) => {
  // Redirect to the registration page
  res.redirect('/register');
});

// Route for registration page
app.get('/register', (req, res) => {
  // Render registration page
  res.sendFile(path.join(__dirname, 'models', 'register.html'));
});

// Route for registration form submission
// Update the registration endpoint (/register) to save user data along with socket ID
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // Generate a unique socket ID for the user
  const socketId = generateSocketId(); // You need to implement this function

  User.findOne({ email }).then(user => {
    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    } else {
      const newUser = new User({
        name,
        email,
        password,
        socketId  // Save the socket ID along with user data
      });

      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => {
              // Generate token for the new user
              const payload = { id: user.id, name: user.name };
              res.redirect('/socket')
              jwt.sign(
                payload,
                'secret',
                { expiresIn: 3600 },
                (err, token) => {
                  res.json({
                    success: true,
                    token: 'Bearer ' + token
                  });
                }
              );
            })
            .catch(err => console.log(err));
        });
      });
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        const payload = { id: user.id, name: user.name };

        jwt.sign(payload, 'secret', { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: 'Bearer ' + token
          });
        });
      } else {
        return res.status(400).json({ message: 'Password incorrect' });
      }
    });
  });
});

app.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

// Set up static directory
app.use(express.static(path.join(__dirname, 'public')));

// Create http server
const server = http.createServer(app);

// Create socket.io instance
const io = socketio(server);

// Socket.io logic
let socketsConnected = new Set();

io.on('connection', socket => {
  console.log('Socket connected', socket.id);
  socketsConnected.add(socket.id);
  io.emit('clients-total', socketsConnected.size);

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id);
    socketsConnected.delete(socket.id);
    io.emit('clients-total', socketsConnected.size);
  });

  socket.on('message', data => {
    // console.log(data)
    socket.broadcast.emit('chat-message', data);
  });

  socket.on('feedback', data => {
    socket.broadcast.emit('feedback', data);
  });
});

// Route for registration page

// Route for Socket.io page
app.get('/socket', (req, res) => {
  // Render Socket.io page
  res.sendFile(path.join(__dirname, 'models', 'index.html'));
});

const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
