var mongoose = require('mongoose'),
  bcrypt = require('bcrypt'),
  check = require('validator').check,
  uniqueValidator = require('mongoose-unique-validator');

var  Schema = mongoose.Schema,
  SALT_WORK_FACTOR = 10,
  MAX_LOGIN_ATTEMPTS = 5,
  LOCK_TIME = 2 * 60 * 60 * 1000;

/**
 * User model. Password hashing and flood control from:
 * {@link http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt}
 */
var UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    index: {
      unique: true
    },
    validate: [
      function(v) {
        return check(v).isEmail();
      },
      'Must be a valid email address'
      ]
  },
  password: {
    type: String,
    required: true,
    validate: [
      function(v) {
        // http://regexlib.com/REDetails.aspx?regexp_id=2204
        return check(v).is(/(?-i)(?=^.{8,}$)((?!.*\s)(?=.*[A-Z])(?=.*[a-z]))((?=(.*\d){1,})|(?=(.*\W){1,}))^.*$/);
      },
      'Password must be at least 8 characters long and be a mix of upper and lower case, with at least one number or special character'
    ]
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: {
    type: Number
  },
  permissions: {
    type: Object
  }
});

UserSchema.plugin(uniqueValidator, {
  mongoose: mongoose
});

UserSchema.virtual('isLocked').get(function() {
  // check for a future lockUntil timestamp
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Hash the password if it has been modified.
 */
UserSchema.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

/**
 * Compare a given password with the model's hashed password.
 *
 * @param {String} candidatePassword Plain text password to check.
 * @param {Function} cb Callback executed when comparison is complete.
 */
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

/**
 * Increment login attempts.
 *
 * @param {Function} cb Callback executed when login attempt counter has been incremented.
 */
UserSchema.methods.incrementLoginAttempts = function(cb) {
  // if we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    }, cb);
  }
  // otherwise we're incrementing
  var updates = { $inc: { loginAttempts: 1 } };
  // lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.update(updates, cb);
};

/**
 * Enum representing failed login reasons.
 */
UserSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
  MAX_ATTEMPTS: 2
};

/**
 * Check for and retrieve the user represented by the given email and password.
 *
 * @param {String} email The email.
 * @param {String} password The password
 * @param {Function} cb Callback executed when lookup is complete.
 */
UserSchema.statics.getAuthenticated = function(email, password, cb) {
  this.findOne({ email: email }, function(err, user) {
    if (err) return cb(err);

    // make sure the user exists
    if (!user) {
      return cb(null, null, UserSchema.statics.failedLogin.NOT_FOUND);
    }

    // check if the account is currently locked
    if (user.isLocked) {
      // just increment login attempts if account is already locked
      return user.incrementLoginAttempts(function(err) {
        if (err) return cb(err);
        return cb(null, null, UserSchema.statics.failedLogin.MAX_ATTEMPTS);
      });
    }

    // test for a matching password
    user.comparePassword(password, function(err, isMatch) {
      if (err) return cb(err);

      // check if the password was a match
      if (isMatch) {
        // if there's no lock or failed attempts, just return the user
        if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
        // reset attempts and lock info
        var updates = {
          $set: { loginAttempts: 0 },
          $unset: { lockUntil: 1 }
        };
        return user.update(updates, function(err) {
          if (err) return cb(err);
          return cb(null, user);
        });
      }

      // password is incorrect, so increment login attempts before responding
      user.incrementLoginAttempts(function(err) {
        if (err) return cb(err);
        return cb(null, null, UserSchema.statics.failedLogin.PASSWORD_INCORRECT);
      });
    });
  });
};

UserSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission];
}

module.exports ={
  model: mongoose.model('User', UserSchema),
  schema: UserSchema
};
