module.exports = prop;
prop._ = _;
prop.attr = attr;


// Prop getter / setter helper
//
// Example:
//
//    ['auth', 'url', file].forEach(prop(SomeObject.prototype));
//
//
function prop(obj, options) {
  options = options || {};

  // gettet / setter strategy, defaults to tihs._name props
  var strategy = options.strategy;
  var helper = strategy === '_' ? _ :
    strategy === 'attr' ? attr :
    typeof strategy === 'function' ? strategy :
    _;

  var validate = typeof options.validate === 'function' ? options.validate : null;

  return function _prop(name) {
    obj[name] = function(value) {
      if (typeof value === 'undefined') return helper.call(this, name);
      if (validate && !validate(name, value)) return;
      helper.call(this, name, value);
      return this;
    };
  };
};

// Getter / Setter implementations
//
// Each represent a slightly different way to set and get in and out of
// an object

function _(name, value) {
  if (!value) return this['_' + name];
  this['_' + name] = value;
  return this;
}

// Using this.attributes object
function attr(name, value) {
  this.attributes = this.attributes || {};

  if (!value) return this.attributes[name];
  this.attributes[name] = value;
  return this;
}
