'use strict';

var _ = require('lodash');

function format(message, args) {
  return message
    .replace('{0}', args[0])
    .replace('{1}', args[1])
    .replace('{2}', args[2]);
}
var traverseNode = function(parent, errorDefinition) {
  var NodeError = function() {
    if (_.isString(errorDefinition.message)) {
      this.message = format(errorDefinition.message, arguments);
    } else if (_.isFunction(errorDefinition.message)) {
      this.message = errorDefinition.message.apply(null, arguments);
    } else {
      throw new Error('Invalid error definition for ' + errorDefinition.name);
    }
    this.stack = this.message + '\n' + (new Error()).stack;
  };
  NodeError.prototype = Object.create(parent.prototype);
  NodeError.prototype.name = parent.prototype.name + errorDefinition.name;
  parent[errorDefinition.name] = NodeError;
  if (errorDefinition.errors) {
    childDefinitions(NodeError, errorDefinition.errors);
  }
  return NodeError;
};

/* jshint latedef: false */
var childDefinitions = function(parent, childDefinitions) {
  _.each(childDefinitions, function(childDefinition) {
    traverseNode(parent, childDefinition);
  });
};
/* jshint latedef: true */

var traverseRoot = function(parent, errorsDefinition) {
  childDefinitions(parent, errorsDefinition);
  return parent;
};


var kobracore = {};
kobracore.Error = function() {
  this.message = 'Internal error';
  this.stack = this.message + '\n' + (new Error()).stack;
};
kobracore.Error.prototype = Object.create(Error.prototype);
kobracore.Error.prototype.name = 'kobracore.Error';


var data = require('./spec');
traverseRoot(kobracore.Error, data);

module.exports = kobracore.Error;

module.exports.extend = function(spec) {
  return traverseNode(kobracore.Error, spec);
};
