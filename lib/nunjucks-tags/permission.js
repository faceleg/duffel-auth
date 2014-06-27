module.exports = new function() {
  this.tags = ['permission'];

  this.parse = function(parser, nodes) {
    var tok = parser.nextToken();
    var args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(tok.value);

    var body = parser.parseUntilBlocks('endpermission');
    parser.advanceAfterBlockEnd();

    return new nodes.CallExtensionAsync(this, 'run', args, [body]);
  };

  this.run = function(context, options, body, callback) {
    body(function(error, html) {
      if (error) throw error;

      if (!context.ctx.user) {
        return callback(null, '');
      }

      context.ctx.user.hasPermission(options).then(function(hasPermission) {
        callback(null, html);
      });
    });
  };
};

