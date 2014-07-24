var bcrypt = require('bcrypt'),
  q = require('q'),
  check = require('validator');

// @todo move these values into site local config
var SALT_WORK_FACTOR = 10,
  MAX_LOGIN_ATTEMPTS = 5,
  LOCK_TIME = 2 * 60 * 60 * 1000;

var User = null;

var initialiseSchema = function(database, additions) {

  /**
  * User model. Password hashing and flood control from:
  * {@link http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt}
  */
  User = database.connections.main.define('users', {
    email: {
      type: String,
      required: true,
      // validate: [
      //   {
      //     validator: function(v) {
      //       return check.isEmail(v);
      //     },
      //     msg: 'Must be a valid email address',
      //   },
      //   {
      //     validator: function(v, callback) {
      //       var params = {
      //         email: v
      //       };

      //       if (!this.isNew) {
      //         params.$not = {
      //           _id: this._id
      //         };
      //       }

      //       User.findOne(params, function(error, user) {
      //         if (error) return callback(false);
      //         if (user) return callback(false);
      //         callback(true);
      //       });
      //     },
      //     msg: 'Email address already registered'
      //   }
      // ]
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
    login_attempts: {
      type: Number,
      required: true,
      default: 0
    },
    lock_until: {
      type: Number
    },
    super: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: 'Active'
    },
    created: {
      type: Date,
      default: Date.now
    },
    updated: Date
  });

  var Permission = database.connections.main.define('permissions', {
    permission: {
      type: String,
      length: 100
    }
  }, {
    indexes : {
      user_permission: {
        columns: 'user_id, permission',
        kind: 'UNIQUE'
      }
    }
  });

  User.hasMany(Permission, {
    as: 'permissions',
    foreignKey: 'user_id'
  });

  // if (additions) {
  //   UserSchema.add(additions);
  // }

  /**
   * Ensure user has only permissions passed to function
   *
   * @name updatePermissions
   * @param {String[]} permissions Permissions to be applied to user
   */
  User.prototype.updatePermissions = function(permissions) {
    permissions = permissions || [];
    var self = this;
    self.permissions(true).then(function(currentPermissions) {

      currentPermissions.forEach(function(currentPermission) {
        var currentPermissionIndex = permissions.indexOf(currentPermission.permission);

        // Permission exists in database but not in desired updates
        if (currentPermissionIndex === -1) {
          currentPermission.destroy();
          return;
        }

        permissions.splice(currentPermissionIndex, 1);
      });

      permissions.forEach(function(permission) {
        self.permissions.create({
          permission: permission
        });
      });

    });
  };

  User.prototype.isLocked = function() {
    // Check for a future lockUntil timestamp
    return !!(this.lock_until && this.lock_until > Date.now());
  };

  function hashPassword(next, data) {
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

      // hash the password along with our new salt
      bcrypt.hash(data.password, salt, function(err, hash) {
        if (err) return next(err);

        // override the cleartext password with the hashed one
        data.password = hash;
        next();
      });
    });
  }

  /**
  * Hash the password if it has been modified.
  */
  User.beforeCreate = function(next, data) {
    hashPassword(next, data);
  };

  /**
  * Hash the password if it has been modified.
  */
  User.beforeUpdate = function(next, data) {
    // only hash the password if it has been modified (or is new)
    if (!this.propertyChanged('password')) return next();
    hashPassword(next, data);
  };

  /**
  * Compare a given password with the model's hashed password.
  *
  * @param {String} candidatePassword Plain text password to check.
  * @param {Function} cb Callback executed when comparison is complete.
  */
  User.prototype.comparePassword = function(candidatePassword, cb) {
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
  User.prototype.incrementLoginAttempts = function(cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lock_until && this.lock_until < Date.now()) {
      return this.updateAttributes({
        login_attempts: 1,
        lock_until: 1
      }, cb);
    }
    // otherwise we're incrementing
    var updates = { login_attempts: 1 };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.login_attempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
      updates = { lock_until: Date.now() + LOCK_TIME };
    }

    return this.updateAttributes(updates, cb);
  };

  User.prototype.getPublicValues = function() {
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
  User.failedLogin = {
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
  User.statuses = statuses;

  /**
  * Check for and retrieve the user represented by the given email and password.
  *
  * @param {String} email The email.
  * @param {String} password The password
  * @param {Function} cb Callback executed when lookup is complete.
  */
  User.getAuthenticated = function(email, password, callback) {
    this.findOne({
      where: {
        email: email
      }
    }, function(error, user) {
      if (error) return callback(error);

      // make sure the user exists
      if (!user) {
        return callback(null, null, User.failedLogin.NOT_FOUND);
      }

      if (user.status !== statuses.ACTIVE) {
        return callback(null, null, User.failedLogin.NOT_ACTIVE);
      }

      // check if the account is currently locked
      if (user.isLocked()) {
        // just increment login attempts if account is already locked
        return user.incrementLoginAttempts(function(error) {
          if (error) return callback(error);
          return callback(null, null, User.failedLogin.MAX_ATTEMPTS);
        });
      }

      // test for a matching password
      user.comparePassword(password, function(error, isMatch) {
        if (error) return callback(error);

        // check if the password was a match
        if (isMatch) {
          // if there's no lock or failed attempts, just return the user
          if (!user.login_attempts && !user.lock_until) return callback(null, user);
          // reset attempts and lock info
          var updates = {
            login_attempts: 0,
            lock_until: 1
          };
          return user.updateAttributes(updates, function(err) {
            if (err) return callback(err);
            return callback(null, user);
          });
        }

        // password is incorrect, so increment login attempts before responding
        user.incrementLoginAttempts(function(error) {
          if (error) return callback(error);
          return callback(null, null, User.failedLogin.PASSWORD_INCORRECT);
        });
      });
    });
  };

  User.prototype.hasPermission = function(permission) {
    var deferred = q.defer();

    if (this.super) {
      deferred.resolve(true);
    }

    this.permissions(true).then(function(permissions) {
      if (!permissions || !permissions.length) {
        deferred.resolve(false);
      }
      deferred.resolve(permissions.indexOf(permission) !== -1);
    });

    return deferred.promise;
  };

};

module.exports = {
  /**
   * Initialse the User and User model.
   *
   * @param {[Object]} additions Optional extra User fields.
   */
  initialise: function(database, additions) {
    initialiseSchema(database, additions);
  },
  model: function() {
    return User;
  }
};
