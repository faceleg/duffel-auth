var bcrypt = require('bcrypt'),
  check = require('validator'),
  timestamps = require('mongoose-timestamp');

// @todo move these values into site local config
var SALT_WORK_FACTOR = 10,
  MAX_LOGIN_ATTEMPTS = 5,
  LOCK_TIME = 2 * 60 * 60 * 1000;

var UserSchema = null,
  User = null;

var initialiseSchema = function(mongoose, connection, additions) {

  mongoose.plugin(timestamps, {
    createdAt: 'created',
    updatedAt: 'updated'
  });

  /**
  * User model. Password hashing and flood control from:
  * {@link http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt}
  */
  UserSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      index: {
        unique: true
      },
      validate: [
        {
          validator: function(v) {
            return check.isEmail(v);
          },
          msg: 'Must be a valid email address',
        },
        {
          validator: function(v, callback) {
            var params = {
              email: v
            };

            if (!this.isNew) {
              params.$not = {
                _id: this._id
              };
            }

            User.findOne(params, function(error, user) {
              console.log(error, user);
              if (error) return callback(false);
              if (user) return callback(false);
              callback(true);
            });
          },
          msg: 'Email address already registered'
        }
      ]
    },
    password: {
      type: String,
      required: true,
      // validate: [
      //   {
      //   validator: function(v) {
      //     try {
      //       check(v).is(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/gi);
      //     } catch (e) {
      //       return false;
      //     }
      //     return true;
      //   },
      //   msg: 'Password must be at least 8 characters long and be a mix of upper and lower case, with at least one number or special character'
      // }
      // ]
    },
    /**
     * Whether the email address has been confirmed to be valid.
     */
    confirmed: {
      type: Boolean,
      default: false
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0
    },
    lockUntil: {
      type: Number
    },
    super: {
      type: Boolean,
      default: false
    },
    permissions: {
      type: Array,
      default: [
        'login'
      ]
    },
    status: {
      type: String,
      default: 'Active'
    }
  });

  if (additions) {
    UserSchema.add(additions);
  }

  UserSchema.virtual('isLocked').get(function() {
    // Check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
  });

  /**
  * Hash the password if it has been modified.
  */
  UserSchema.pre('save', function(next) {
    var self = this;

    // only hash the password if it has been modified (or is new)
    if (!self.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

      // hash the password along with our new salt
      bcrypt.hash(self.password, salt, function(err, hash) {
        if (err) return next(err);

        // override the cleartext password with the hashed one
        self.password = hash;
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

  UserSchema.methods.getPublicValues = function() {
    var publicValues = {
      id: this._id,
      email: this.email,
      status: this.status,
      super: this.super,
      permissions: this.permissions
    };

    if (additions) {
      var self = this;
      Object.keys(additions).forEach(function(additionKey) {
        publicValues[additionKey] = self[additionKey];
      });
    }

    return publicValues;
  };

  /**
  * Enum representing failed login reasons.
  */
  UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2,
    NOT_ACTIVE: 3
  };

  var statuses = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    DELETED: 'Deleted'
  };
  UserSchema.statics.statuses = statuses;

  /**
  * Check for and retrieve the user represented by the given email and password.
  *
  * @param {String} email The email.
  * @param {String} password The password
  * @param {Function} cb Callback executed when lookup is complete.
  */
  UserSchema.statics.getAuthenticated = function(email, password, callback) {
    this.findOne({ email: email }, function(error, user) {
      if (error) return callback(error);

      // make sure the user exists
      if (!user) {
        return callback(null, null, UserSchema.statics.failedLogin.NOT_FOUND);
      }

      if (user.status !== statuses.ACTIVE) {
        return callback(null, null, UserSchema.statics.failedLogin.NOT_ACTIVE);
      }

      // check if the account is currently locked
      if (user.isLocked) {
        // just increment login attempts if account is already locked
        return user.incrementLoginAttempts(function(error) {
          if (error) return callback(error);
          return callback(null, null, UserSchema.statics.failedLogin.MAX_ATTEMPTS);
        });
      }

      // test for a matching password
      user.comparePassword(password, function(error, isMatch) {
        if (error) return callback(error);

        // check if the password was a match
        if (isMatch) {
          // if there's no lock or failed attempts, just return the user
          if (!user.loginAttempts && !user.lockUntil) return callback(null, user);
          // reset attempts and lock info
          var updates = {
            $set: { loginAttempts: 0 },
            $unset: { lockUntil: 1 }
          };
          return user.update(updates, function(err) {
            if (err) return callback(err);
            return callback(null, user);
          });
        }

        // password is incorrect, so increment login attempts before responding
        user.incrementLoginAttempts(function(error) {
          if (error) return callback(error);
          return callback(null, null, UserSchema.statics.failedLogin.PASSWORD_INCORRECT);
        });
      });
    });
  };

  UserSchema.methods.hasPermission = function(permission) {
    if (this.super) {
      return true;
    }
    if (!this.permissions || !this.permissions.length) {
      return false;
    }
    return this.permissions.indexOf(permission) !== -1;
  };

  UserSchema.plugin(timestamps);
  User = connection.model('User', UserSchema);
};

module.exports = {
  /**
   * Initialse the UserSchema and User model.
   *
   * @param {Mongoose} mongoose Instance to bind schema to.
   * @param {Connection} connection Mongoose connection to use when initialising model.
   * @param {[Object]} additions Optional extra UserSchema fields.
   */
  initialise: function(mongoose, connection, additions) {
    initialiseSchema(mongoose, connection, additions);
  },
  model: function() {
    return User;
  }
};
