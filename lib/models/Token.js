var TOKEN_EXPIRY_TIME = 1 * 60 * 60; // One day

var TokenSchema = null,
  Token = null;

var initialiseSchema = function(mongoose, connection) {

  TokenSchema = new mongoose.Schema({
    user_id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    created: {
      type: Date,
      default: Date.now
    },
    token: {
      type: String,
      unique: true
    },
    used: {
      type: Boolean,
      default: false
    }
  });

  TokenSchema.virtual('isExpired').get(function() {
    return this.created + TOKEN_EXPIRY_TIME > Date.now;
  });

  TokenSchema.methods.incrementUses = function(callback) {
    var updates = { $inc: { uses: 1 } };
    return this.update(updates, callback);
  };

  TokenSchema.statics.getValid = function(token, type, callback) {
    this.findOne({ token: token, type: type, used: false }, function(error, instance) {
      if (error) return callback(error);

      if (!instance) {
        return callback(new Error('Token not found'), null, TokenSchema.statics.failedRetrieval.NOT_FOUND);
      }

      instance.incrementUses(function(error) {
        if (error) callback(error);
        if (instance.isExpired) {
          return callback(new Error('Token expired'), null, TokenSchema.statics.failedRetrieval.EXPIRED);
        }
        callback(null, instance);
      });
    });
  }

  /**
  * Enum representing failed login reasons.
  */
  TokenSchema.statics.failedRetrieval = {
    NOT_FOUND: 0,
    EXPIRED: 1
  };

  TokenSchema.pre('save', function(next) {
    if (!this.isNew) {
      next();
    }
    var self = this;
    require('crypto').randomBytes(48, function(ex, buf) {
      self.token = buf.toString('hex');
      next();
    });
  });

  Token = connection.model('Token', TokenSchema);
}

module.exports = {
  /**
   * Initialse the TokenSchema and Token model.
   *
   * @param {Mongoose} mongoose Instance to bind schema to.
   * @param {Connection} connection Mongoose connection to use when initialising model.
   * @param {[Object]} additions Optional extra TokenSchema fields.
   */
  initialise: function(mongoose, connection, additions) {
    initialiseSchema(mongoose, connection, additions);
  },
  model: function() {
    return Token;
  }
};
