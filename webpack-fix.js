// Fix Webpack 5 ProgressPlugin schema validation for Node 24
const Module = require('module');
const origRequire = Module.prototype.require;

const stripLegacyProgressOptions = (options) => {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return options;
  }
  const { name, color, reporters, reporter, ...rest } = options;
  return rest;
};

const patchCompilerValidate = (Compiler) => {
  if (!Compiler || !Compiler.prototype || !Compiler.prototype.validate || Compiler.__tdsPatchedValidate) {
    return;
  }
  const origValidate = Compiler.prototype.validate;
  Compiler.prototype.validate = function patchedValidate(schema, value, options, check) {
    if (options && options.name === 'Progress Plugin') {
      return origValidate.call(this, schema, stripLegacyProgressOptions(value), options, check);
    }
    return origValidate.call(this, schema, value, options, check);
  };
  Object.defineProperty(Compiler, '__tdsPatchedValidate', {
    value: true,
    enumerable: false,
    writable: false,
  });
};

Module.prototype.require = function requirePatched(id) {
  const result = origRequire.apply(this, arguments);

  if (result && typeof result === 'object') {
    if (Object.prototype.hasOwnProperty.call(result, 'Compiler')) {
      patchCompilerValidate(result.Compiler);
    }
    if (Object.prototype.hasOwnProperty.call(result, 'default') && result.default) {
      if (Object.prototype.hasOwnProperty.call(result.default, 'Compiler')) {
        patchCompilerValidate(result.default.Compiler);
      } else {
        patchCompilerValidate(result.default);
      }
    }
  } else {
    patchCompilerValidate(result);
  }

  return result;
};
