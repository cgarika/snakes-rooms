/* Bundled: openskill 5.0.1 (philihp/openskill.js, MIT) and glicko2 1.2.2 (mmai/glicko2js, MIT). Built with esbuild; see Tools/servers/README.md. */
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// node_modules/ramda/src/F.js
var require_F = __commonJS({
  "node_modules/ramda/src/F.js"(exports2, module2) {
    var F = function() {
      return false;
    };
    module2.exports = F;
  }
});

// node_modules/ramda/src/T.js
var require_T = __commonJS({
  "node_modules/ramda/src/T.js"(exports2, module2) {
    var T = function() {
      return true;
    };
    module2.exports = T;
  }
});

// node_modules/ramda/src/__.js
var require__ = __commonJS({
  "node_modules/ramda/src/__.js"(exports2, module2) {
    module2.exports = {
      "@@functional/placeholder": true
    };
  }
});

// node_modules/ramda/src/internal/_isPlaceholder.js
var require_isPlaceholder = __commonJS({
  "node_modules/ramda/src/internal/_isPlaceholder.js"(exports2, module2) {
    function _isPlaceholder(a) {
      return a != null && typeof a === "object" && a["@@functional/placeholder"] === true;
    }
    module2.exports = _isPlaceholder;
  }
});

// node_modules/ramda/src/internal/_curry1.js
var require_curry1 = __commonJS({
  "node_modules/ramda/src/internal/_curry1.js"(exports2, module2) {
    var _isPlaceholder = require_isPlaceholder();
    function _curry1(fn) {
      return function f1(a) {
        if (arguments.length === 0 || _isPlaceholder(a)) {
          return f1;
        } else {
          return fn.apply(this, arguments);
        }
      };
    }
    module2.exports = _curry1;
  }
});

// node_modules/ramda/src/internal/_curry2.js
var require_curry2 = __commonJS({
  "node_modules/ramda/src/internal/_curry2.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _isPlaceholder = require_isPlaceholder();
    function _curry2(fn) {
      return function f2(a, b) {
        switch (arguments.length) {
          case 0:
            return f2;
          case 1:
            return _isPlaceholder(a) ? f2 : _curry1(function(_b) {
              return fn(a, _b);
            });
          default:
            return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function(_a) {
              return fn(_a, b);
            }) : _isPlaceholder(b) ? _curry1(function(_b) {
              return fn(a, _b);
            }) : fn(a, b);
        }
      };
    }
    module2.exports = _curry2;
  }
});

// node_modules/ramda/src/add.js
var require_add = __commonJS({
  "node_modules/ramda/src/add.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var add = /* @__PURE__ */ _curry2(function add2(a, b) {
      return Number(a) + Number(b);
    });
    module2.exports = add;
  }
});

// node_modules/ramda/src/internal/_concat.js
var require_concat = __commonJS({
  "node_modules/ramda/src/internal/_concat.js"(exports2, module2) {
    function _concat(set1, set2) {
      set1 = set1 || [];
      set2 = set2 || [];
      var idx;
      var len1 = set1.length;
      var len2 = set2.length;
      var result = [];
      idx = 0;
      while (idx < len1) {
        result[result.length] = set1[idx];
        idx += 1;
      }
      idx = 0;
      while (idx < len2) {
        result[result.length] = set2[idx];
        idx += 1;
      }
      return result;
    }
    module2.exports = _concat;
  }
});

// node_modules/ramda/src/internal/_arity.js
var require_arity = __commonJS({
  "node_modules/ramda/src/internal/_arity.js"(exports2, module2) {
    function _arity(n, fn) {
      switch (n) {
        case 0:
          return function() {
            return fn.apply(this, arguments);
          };
        case 1:
          return function(a0) {
            return fn.apply(this, arguments);
          };
        case 2:
          return function(a0, a1) {
            return fn.apply(this, arguments);
          };
        case 3:
          return function(a0, a1, a2) {
            return fn.apply(this, arguments);
          };
        case 4:
          return function(a0, a1, a2, a3) {
            return fn.apply(this, arguments);
          };
        case 5:
          return function(a0, a1, a2, a3, a4) {
            return fn.apply(this, arguments);
          };
        case 6:
          return function(a0, a1, a2, a3, a4, a5) {
            return fn.apply(this, arguments);
          };
        case 7:
          return function(a0, a1, a2, a3, a4, a5, a6) {
            return fn.apply(this, arguments);
          };
        case 8:
          return function(a0, a1, a2, a3, a4, a5, a6, a7) {
            return fn.apply(this, arguments);
          };
        case 9:
          return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
            return fn.apply(this, arguments);
          };
        case 10:
          return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
            return fn.apply(this, arguments);
          };
        default:
          throw new Error("First argument to _arity must be a non-negative integer no greater than ten");
      }
    }
    module2.exports = _arity;
  }
});

// node_modules/ramda/src/internal/_curryN.js
var require_curryN = __commonJS({
  "node_modules/ramda/src/internal/_curryN.js"(exports2, module2) {
    var _arity = require_arity();
    var _isPlaceholder = require_isPlaceholder();
    function _curryN(length, received, fn) {
      return function() {
        var combined = [];
        var argsIdx = 0;
        var left = length;
        var combinedIdx = 0;
        var hasPlaceholder = false;
        while (combinedIdx < received.length || argsIdx < arguments.length) {
          var result;
          if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
            result = received[combinedIdx];
          } else {
            result = arguments[argsIdx];
            argsIdx += 1;
          }
          combined[combinedIdx] = result;
          if (!_isPlaceholder(result)) {
            left -= 1;
          } else {
            hasPlaceholder = true;
          }
          combinedIdx += 1;
        }
        return !hasPlaceholder && left <= 0 ? fn.apply(this, combined) : _arity(Math.max(0, left), _curryN(length, combined, fn));
      };
    }
    module2.exports = _curryN;
  }
});

// node_modules/ramda/src/curryN.js
var require_curryN2 = __commonJS({
  "node_modules/ramda/src/curryN.js"(exports2, module2) {
    var _arity = require_arity();
    var _curry1 = require_curry1();
    var _curry2 = require_curry2();
    var _curryN = require_curryN();
    var curryN = /* @__PURE__ */ _curry2(function curryN2(length, fn) {
      if (length === 1) {
        return _curry1(fn);
      }
      return _arity(length, _curryN(length, [], fn));
    });
    module2.exports = curryN;
  }
});

// node_modules/ramda/src/addIndex.js
var require_addIndex = __commonJS({
  "node_modules/ramda/src/addIndex.js"(exports2, module2) {
    var _concat = require_concat();
    var _curry1 = require_curry1();
    var curryN = require_curryN2();
    var addIndex = /* @__PURE__ */ _curry1(function addIndex2(fn) {
      return curryN(fn.length, function() {
        var idx = 0;
        var origFn = arguments[0];
        var list = arguments[arguments.length - 1];
        var args = Array.prototype.slice.call(arguments, 0);
        args[0] = function() {
          var result = origFn.apply(this, _concat(arguments, [idx, list]));
          idx += 1;
          return result;
        };
        return fn.apply(this, args);
      });
    });
    module2.exports = addIndex;
  }
});

// node_modules/ramda/src/addIndexRight.js
var require_addIndexRight = __commonJS({
  "node_modules/ramda/src/addIndexRight.js"(exports2, module2) {
    var _concat = require_concat();
    var _curry1 = require_curry1();
    var curryN = require_curryN2();
    var addIndexRight = /* @__PURE__ */ _curry1(function addIndex(fn) {
      return curryN(fn.length, function() {
        var origFn = arguments[0];
        var list = arguments[arguments.length - 1];
        var idx = list.length - 1;
        var args = Array.prototype.slice.call(arguments, 0);
        args[0] = function() {
          var result = origFn.apply(this, _concat(arguments, [idx, list]));
          idx -= 1;
          return result;
        };
        return fn.apply(this, args);
      });
    });
    module2.exports = addIndexRight;
  }
});

// node_modules/ramda/src/internal/_curry3.js
var require_curry3 = __commonJS({
  "node_modules/ramda/src/internal/_curry3.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _curry2 = require_curry2();
    var _isPlaceholder = require_isPlaceholder();
    function _curry3(fn) {
      return function f3(a, b, c) {
        switch (arguments.length) {
          case 0:
            return f3;
          case 1:
            return _isPlaceholder(a) ? f3 : _curry2(function(_b, _c) {
              return fn(a, _b, _c);
            });
          case 2:
            return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function(_a, _c) {
              return fn(_a, b, _c);
            }) : _isPlaceholder(b) ? _curry2(function(_b, _c) {
              return fn(a, _b, _c);
            }) : _curry1(function(_c) {
              return fn(a, b, _c);
            });
          default:
            return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function(_a, _b) {
              return fn(_a, _b, c);
            }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function(_a, _c) {
              return fn(_a, b, _c);
            }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function(_b, _c) {
              return fn(a, _b, _c);
            }) : _isPlaceholder(a) ? _curry1(function(_a) {
              return fn(_a, b, c);
            }) : _isPlaceholder(b) ? _curry1(function(_b) {
              return fn(a, _b, c);
            }) : _isPlaceholder(c) ? _curry1(function(_c) {
              return fn(a, b, _c);
            }) : fn(a, b, c);
        }
      };
    }
    module2.exports = _curry3;
  }
});

// node_modules/ramda/src/adjust.js
var require_adjust = __commonJS({
  "node_modules/ramda/src/adjust.js"(exports2, module2) {
    var _concat = require_concat();
    var _curry3 = require_curry3();
    var adjust = /* @__PURE__ */ _curry3(function adjust2(idx, fn, list) {
      var len = list.length;
      if (idx >= len || idx < -len) {
        return list;
      }
      var _idx = (len + idx) % len;
      var _list = _concat(list);
      _list[_idx] = fn(list[_idx]);
      return _list;
    });
    module2.exports = adjust;
  }
});

// node_modules/ramda/src/internal/_isArray.js
var require_isArray = __commonJS({
  "node_modules/ramda/src/internal/_isArray.js"(exports2, module2) {
    module2.exports = Array.isArray || function _isArray(val) {
      return val != null && val.length >= 0 && Object.prototype.toString.call(val) === "[object Array]";
    };
  }
});

// node_modules/ramda/src/internal/_isTransformer.js
var require_isTransformer = __commonJS({
  "node_modules/ramda/src/internal/_isTransformer.js"(exports2, module2) {
    function _isTransformer(obj) {
      return obj != null && typeof obj["@@transducer/step"] === "function";
    }
    module2.exports = _isTransformer;
  }
});

// node_modules/ramda/src/internal/_dispatchable.js
var require_dispatchable = __commonJS({
  "node_modules/ramda/src/internal/_dispatchable.js"(exports2, module2) {
    var _isArray = require_isArray();
    var _isTransformer = require_isTransformer();
    function _dispatchable(methodNames, transducerCreator, fn) {
      return function() {
        if (arguments.length === 0) {
          return fn();
        }
        var obj = arguments[arguments.length - 1];
        if (!_isArray(obj)) {
          var idx = 0;
          while (idx < methodNames.length) {
            if (typeof obj[methodNames[idx]] === "function") {
              return obj[methodNames[idx]].apply(obj, Array.prototype.slice.call(arguments, 0, -1));
            }
            idx += 1;
          }
          if (_isTransformer(obj)) {
            var transducer = transducerCreator.apply(null, Array.prototype.slice.call(arguments, 0, -1));
            return transducer(obj);
          }
        }
        return fn.apply(this, arguments);
      };
    }
    module2.exports = _dispatchable;
  }
});

// node_modules/ramda/src/internal/_reduced.js
var require_reduced = __commonJS({
  "node_modules/ramda/src/internal/_reduced.js"(exports2, module2) {
    function _reduced(x) {
      return x && x["@@transducer/reduced"] ? x : {
        "@@transducer/value": x,
        "@@transducer/reduced": true
      };
    }
    module2.exports = _reduced;
  }
});

// node_modules/ramda/src/internal/_xfBase.js
var require_xfBase = __commonJS({
  "node_modules/ramda/src/internal/_xfBase.js"(exports2, module2) {
    module2.exports = {
      init: function() {
        return this.xf["@@transducer/init"]();
      },
      result: function(result) {
        return this.xf["@@transducer/result"](result);
      }
    };
  }
});

// node_modules/ramda/src/internal/_xall.js
var require_xall = __commonJS({
  "node_modules/ramda/src/internal/_xall.js"(exports2, module2) {
    var _reduced = require_reduced();
    var _xfBase = require_xfBase();
    var XAll = /* @__PURE__ */ (function() {
      function XAll2(f, xf) {
        this.xf = xf;
        this.f = f;
        this.all = true;
      }
      XAll2.prototype["@@transducer/init"] = _xfBase.init;
      XAll2.prototype["@@transducer/result"] = function(result) {
        if (this.all) {
          result = this.xf["@@transducer/step"](result, true);
        }
        return this.xf["@@transducer/result"](result);
      };
      XAll2.prototype["@@transducer/step"] = function(result, input) {
        if (!this.f(input)) {
          this.all = false;
          result = _reduced(this.xf["@@transducer/step"](result, false));
        }
        return result;
      };
      return XAll2;
    })();
    function _xall(f) {
      return function(xf) {
        return new XAll(f, xf);
      };
    }
    module2.exports = _xall;
  }
});

// node_modules/ramda/src/all.js
var require_all = __commonJS({
  "node_modules/ramda/src/all.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xall = require_xall();
    var all = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["all"], _xall, function all2(fn, list) {
      var idx = 0;
      while (idx < list.length) {
        if (!fn(list[idx])) {
          return false;
        }
        idx += 1;
      }
      return true;
    }));
    module2.exports = all;
  }
});

// node_modules/ramda/src/internal/_arrayFromIterator.js
var require_arrayFromIterator = __commonJS({
  "node_modules/ramda/src/internal/_arrayFromIterator.js"(exports2, module2) {
    function _arrayFromIterator(iter) {
      var list = [];
      var next;
      while (!(next = iter.next()).done) {
        list.push(next.value);
      }
      return list;
    }
    module2.exports = _arrayFromIterator;
  }
});

// node_modules/ramda/src/internal/_includesWith.js
var require_includesWith = __commonJS({
  "node_modules/ramda/src/internal/_includesWith.js"(exports2, module2) {
    function _includesWith(pred, x, list) {
      var idx = 0;
      var len = list.length;
      while (idx < len) {
        if (pred(x, list[idx])) {
          return true;
        }
        idx += 1;
      }
      return false;
    }
    module2.exports = _includesWith;
  }
});

// node_modules/ramda/src/internal/_functionName.js
var require_functionName = __commonJS({
  "node_modules/ramda/src/internal/_functionName.js"(exports2, module2) {
    function _functionName(f) {
      var match = String(f).match(/^function (\w*)/);
      return match == null ? "" : match[1];
    }
    module2.exports = _functionName;
  }
});

// node_modules/ramda/src/internal/_has.js
var require_has = __commonJS({
  "node_modules/ramda/src/internal/_has.js"(exports2, module2) {
    function _has(prop, obj) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    module2.exports = _has;
  }
});

// node_modules/ramda/src/internal/_objectIs.js
var require_objectIs = __commonJS({
  "node_modules/ramda/src/internal/_objectIs.js"(exports2, module2) {
    function _objectIs(a, b) {
      if (a === b) {
        return a !== 0 || 1 / a === 1 / b;
      } else {
        return a !== a && b !== b;
      }
    }
    module2.exports = typeof Object.is === "function" ? Object.is : _objectIs;
  }
});

// node_modules/ramda/src/internal/_isArguments.js
var require_isArguments = __commonJS({
  "node_modules/ramda/src/internal/_isArguments.js"(exports2, module2) {
    var _has = require_has();
    var toString = Object.prototype.toString;
    var _isArguments = /* @__PURE__ */ (function() {
      return toString.call(arguments) === "[object Arguments]" ? function _isArguments2(x) {
        return toString.call(x) === "[object Arguments]";
      } : function _isArguments2(x) {
        return _has("callee", x);
      };
    })();
    module2.exports = _isArguments;
  }
});

// node_modules/ramda/src/keys.js
var require_keys = __commonJS({
  "node_modules/ramda/src/keys.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _has = require_has();
    var _isArguments = require_isArguments();
    var hasEnumBug = !/* @__PURE__ */ {
      toString: null
    }.propertyIsEnumerable("toString");
    var nonEnumerableProps = ["constructor", "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
    var hasArgsEnumBug = /* @__PURE__ */ (function() {
      "use strict";
      return arguments.propertyIsEnumerable("length");
    })();
    var contains = function contains2(list, item) {
      var idx = 0;
      while (idx < list.length) {
        if (list[idx] === item) {
          return true;
        }
        idx += 1;
      }
      return false;
    };
    var keys = typeof Object.keys === "function" && !hasArgsEnumBug ? /* @__PURE__ */ _curry1(function keys2(obj) {
      return Object(obj) !== obj ? [] : Object.keys(obj);
    }) : /* @__PURE__ */ _curry1(function keys2(obj) {
      if (Object(obj) !== obj) {
        return [];
      }
      var prop, nIdx;
      var ks = [];
      var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
      for (prop in obj) {
        if (_has(prop, obj) && (!checkArgsLength || prop !== "length")) {
          ks[ks.length] = prop;
        }
      }
      if (hasEnumBug) {
        nIdx = nonEnumerableProps.length - 1;
        while (nIdx >= 0) {
          prop = nonEnumerableProps[nIdx];
          if (_has(prop, obj) && !contains(ks, prop)) {
            ks[ks.length] = prop;
          }
          nIdx -= 1;
        }
      }
      return ks;
    });
    module2.exports = keys;
  }
});

// node_modules/ramda/src/type.js
var require_type = __commonJS({
  "node_modules/ramda/src/type.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var type = /* @__PURE__ */ _curry1(function type2(val) {
      return val === null ? "Null" : val === void 0 ? "Undefined" : Object.prototype.toString.call(val).slice(8, -1);
    });
    module2.exports = type;
  }
});

// node_modules/ramda/src/internal/_equals.js
var require_equals = __commonJS({
  "node_modules/ramda/src/internal/_equals.js"(exports2, module2) {
    var _arrayFromIterator = require_arrayFromIterator();
    var _includesWith = require_includesWith();
    var _functionName = require_functionName();
    var _has = require_has();
    var _objectIs = require_objectIs();
    var keys = require_keys();
    var type = require_type();
    function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
      var a = _arrayFromIterator(aIterator);
      var b = _arrayFromIterator(bIterator);
      function eq(_a, _b) {
        return _equals(_a, _b, stackA.slice(), stackB.slice());
      }
      return !_includesWith(function(b2, aItem) {
        return !_includesWith(eq, aItem, b2);
      }, b, a);
    }
    function _equals(a, b, stackA, stackB) {
      if (_objectIs(a, b)) {
        return true;
      }
      var typeA = type(a);
      if (typeA !== type(b)) {
        return false;
      }
      if (typeof a["fantasy-land/equals"] === "function" || typeof b["fantasy-land/equals"] === "function") {
        return typeof a["fantasy-land/equals"] === "function" && a["fantasy-land/equals"](b) && typeof b["fantasy-land/equals"] === "function" && b["fantasy-land/equals"](a);
      }
      if (typeof a.equals === "function" || typeof b.equals === "function") {
        return typeof a.equals === "function" && a.equals(b) && typeof b.equals === "function" && b.equals(a);
      }
      switch (typeA) {
        case "Arguments":
        case "Array":
        case "Object":
          if (typeof a.constructor === "function" && _functionName(a.constructor) === "Promise") {
            return a === b;
          }
          break;
        case "Boolean":
        case "Number":
        case "String":
          if (!(typeof a === typeof b && _objectIs(a.valueOf(), b.valueOf()))) {
            return false;
          }
          break;
        case "Date":
          if (!_objectIs(a.valueOf(), b.valueOf())) {
            return false;
          }
          break;
        case "Error":
          return a.name === b.name && a.message === b.message;
        case "RegExp":
          if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
            return false;
          }
          break;
      }
      var idx = stackA.length - 1;
      while (idx >= 0) {
        if (stackA[idx] === a) {
          return stackB[idx] === b;
        }
        idx -= 1;
      }
      switch (typeA) {
        case "Map":
          if (a.size !== b.size) {
            return false;
          }
          return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));
        case "Set":
          if (a.size !== b.size) {
            return false;
          }
          return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));
        case "Arguments":
        case "Array":
        case "Object":
        case "Boolean":
        case "Number":
        case "String":
        case "Date":
        case "Error":
        case "RegExp":
        case "Int8Array":
        case "Uint8Array":
        case "Uint8ClampedArray":
        case "Int16Array":
        case "Uint16Array":
        case "Int32Array":
        case "Uint32Array":
        case "Float32Array":
        case "Float64Array":
        case "ArrayBuffer":
          break;
        default:
          return false;
      }
      var keysA = keys(a);
      if (keysA.length !== keys(b).length) {
        return false;
      }
      var extendedStackA = stackA.concat([a]);
      var extendedStackB = stackB.concat([b]);
      idx = keysA.length - 1;
      while (idx >= 0) {
        var key = keysA[idx];
        if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
          return false;
        }
        idx -= 1;
      }
      return true;
    }
    module2.exports = _equals;
  }
});

// node_modules/ramda/src/equals.js
var require_equals2 = __commonJS({
  "node_modules/ramda/src/equals.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _equals = require_equals();
    var equals = /* @__PURE__ */ _curry2(function equals2(a, b) {
      return _equals(a, b, [], []);
    });
    module2.exports = equals;
  }
});

// node_modules/ramda/src/internal/_indexOf.js
var require_indexOf = __commonJS({
  "node_modules/ramda/src/internal/_indexOf.js"(exports2, module2) {
    var equals = require_equals2();
    function _indexOf(list, a, idx) {
      var inf, item;
      if (typeof list.indexOf === "function") {
        switch (typeof a) {
          case "number":
            if (a === 0) {
              inf = 1 / a;
              while (idx < list.length) {
                item = list[idx];
                if (item === 0 && 1 / item === inf) {
                  return idx;
                }
                idx += 1;
              }
              return -1;
            } else if (a !== a) {
              while (idx < list.length) {
                item = list[idx];
                if (typeof item === "number" && item !== item) {
                  return idx;
                }
                idx += 1;
              }
              return -1;
            }
            return list.indexOf(a, idx);
          // all these types can utilise Set
          case "string":
          case "boolean":
          case "function":
          case "undefined":
            return list.indexOf(a, idx);
          case "object":
            if (a === null) {
              return list.indexOf(a, idx);
            }
        }
      }
      while (idx < list.length) {
        if (equals(list[idx], a)) {
          return idx;
        }
        idx += 1;
      }
      return -1;
    }
    module2.exports = _indexOf;
  }
});

// node_modules/ramda/src/internal/_includes.js
var require_includes = __commonJS({
  "node_modules/ramda/src/internal/_includes.js"(exports2, module2) {
    var _indexOf = require_indexOf();
    function _includes(a, list) {
      return _indexOf(list, a, 0) >= 0;
    }
    module2.exports = _includes;
  }
});

// node_modules/ramda/src/internal/_map.js
var require_map = __commonJS({
  "node_modules/ramda/src/internal/_map.js"(exports2, module2) {
    function _map(fn, functor) {
      var idx = 0;
      var len = functor.length;
      var result = Array(len);
      while (idx < len) {
        result[idx] = fn(functor[idx]);
        idx += 1;
      }
      return result;
    }
    module2.exports = _map;
  }
});

// node_modules/ramda/src/internal/_quote.js
var require_quote = __commonJS({
  "node_modules/ramda/src/internal/_quote.js"(exports2, module2) {
    function _quote(s) {
      var escaped = s.replace(/\\/g, "\\\\").replace(/[\b]/g, "\\b").replace(/\f/g, "\\f").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\v/g, "\\v").replace(/\0/g, "\\0");
      return '"' + escaped.replace(/"/g, '\\"') + '"';
    }
    module2.exports = _quote;
  }
});

// node_modules/ramda/src/internal/_toISOString.js
var require_toISOString = __commonJS({
  "node_modules/ramda/src/internal/_toISOString.js"(exports2, module2) {
    var pad = function pad2(n) {
      return (n < 10 ? "0" : "") + n;
    };
    var _toISOString = typeof Date.prototype.toISOString === "function" ? function _toISOString2(d2) {
      return d2.toISOString();
    } : function _toISOString2(d2) {
      return d2.getUTCFullYear() + "-" + pad(d2.getUTCMonth() + 1) + "-" + pad(d2.getUTCDate()) + "T" + pad(d2.getUTCHours()) + ":" + pad(d2.getUTCMinutes()) + ":" + pad(d2.getUTCSeconds()) + "." + (d2.getUTCMilliseconds() / 1e3).toFixed(3).slice(2, 5) + "Z";
    };
    module2.exports = _toISOString;
  }
});

// node_modules/ramda/src/internal/_complement.js
var require_complement = __commonJS({
  "node_modules/ramda/src/internal/_complement.js"(exports2, module2) {
    function _complement(f) {
      return function() {
        return !f.apply(this, arguments);
      };
    }
    module2.exports = _complement;
  }
});

// node_modules/ramda/src/internal/_arrayReduce.js
var require_arrayReduce = __commonJS({
  "node_modules/ramda/src/internal/_arrayReduce.js"(exports2, module2) {
    function _arrayReduce(reducer, acc, list) {
      var index = 0;
      var length = list.length;
      while (index < length) {
        acc = reducer(acc, list[index]);
        index += 1;
      }
      return acc;
    }
    module2.exports = _arrayReduce;
  }
});

// node_modules/ramda/src/internal/_filter.js
var require_filter = __commonJS({
  "node_modules/ramda/src/internal/_filter.js"(exports2, module2) {
    function _filter(fn, list) {
      var idx = 0;
      var len = list.length;
      var result = [];
      while (idx < len) {
        if (fn(list[idx])) {
          result[result.length] = list[idx];
        }
        idx += 1;
      }
      return result;
    }
    module2.exports = _filter;
  }
});

// node_modules/ramda/src/internal/_filterMap.js
var require_filterMap = __commonJS({
  "node_modules/ramda/src/internal/_filterMap.js"(exports2, module2) {
    function _filterMap(fn, map) {
      var result = /* @__PURE__ */ new Map();
      var iterator = map.entries();
      var current = iterator.next();
      while (!current.done) {
        if (fn(current.value[1])) {
          result.set(current.value[0], current.value[1]);
        }
        current = iterator.next();
      }
      return result;
    }
    module2.exports = _filterMap;
  }
});

// node_modules/ramda/src/internal/_isMap.js
var require_isMap = __commonJS({
  "node_modules/ramda/src/internal/_isMap.js"(exports2, module2) {
    function _isMap(x) {
      return Object.prototype.toString.call(x) === "[object Map]";
    }
    module2.exports = _isMap;
  }
});

// node_modules/ramda/src/internal/_isObject.js
var require_isObject = __commonJS({
  "node_modules/ramda/src/internal/_isObject.js"(exports2, module2) {
    function _isObject(x) {
      return Object.prototype.toString.call(x) === "[object Object]";
    }
    module2.exports = _isObject;
  }
});

// node_modules/ramda/src/internal/_xfilter.js
var require_xfilter = __commonJS({
  "node_modules/ramda/src/internal/_xfilter.js"(exports2, module2) {
    var _xfBase = require_xfBase();
    var XFilter = /* @__PURE__ */ (function() {
      function XFilter2(f, xf) {
        this.xf = xf;
        this.f = f;
      }
      XFilter2.prototype["@@transducer/init"] = _xfBase.init;
      XFilter2.prototype["@@transducer/result"] = _xfBase.result;
      XFilter2.prototype["@@transducer/step"] = function(result, input) {
        return this.f(input) ? this.xf["@@transducer/step"](result, input) : result;
      };
      return XFilter2;
    })();
    function _xfilter(f) {
      return function(xf) {
        return new XFilter(f, xf);
      };
    }
    module2.exports = _xfilter;
  }
});

// node_modules/ramda/src/filter.js
var require_filter2 = __commonJS({
  "node_modules/ramda/src/filter.js"(exports2, module2) {
    var _arrayReduce = require_arrayReduce();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _filter = require_filter();
    var _filterMap = require_filterMap();
    var _isMap = require_isMap();
    var _isObject = require_isObject();
    var _xfilter = require_xfilter();
    var keys = require_keys();
    var filter = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["fantasy-land/filter", "filter"], _xfilter, function(pred, filterable) {
      return _isObject(filterable) ? _arrayReduce(function(acc, key) {
        if (pred(filterable[key])) {
          acc[key] = filterable[key];
        }
        return acc;
      }, {}, keys(filterable)) : _isMap(filterable) ? _filterMap(pred, filterable) : (
        // else
        _filter(pred, filterable)
      );
    }));
    module2.exports = filter;
  }
});

// node_modules/ramda/src/reject.js
var require_reject = __commonJS({
  "node_modules/ramda/src/reject.js"(exports2, module2) {
    var _complement = require_complement();
    var _curry2 = require_curry2();
    var filter = require_filter2();
    var reject = /* @__PURE__ */ _curry2(function reject2(pred, filterable) {
      return filter(_complement(pred), filterable);
    });
    module2.exports = reject;
  }
});

// node_modules/ramda/src/internal/_toString.js
var require_toString = __commonJS({
  "node_modules/ramda/src/internal/_toString.js"(exports2, module2) {
    var _includes = require_includes();
    var _map = require_map();
    var _quote = require_quote();
    var _toISOString = require_toISOString();
    var keys = require_keys();
    var reject = require_reject();
    function _toString(x, seen) {
      var recur = function recur2(y) {
        var xs = seen.concat([x]);
        return _includes(y, xs) ? "<Circular>" : _toString(y, xs);
      };
      var mapPairs = function(obj, keys2) {
        return _map(function(k) {
          return _quote(k) + ": " + recur(obj[k]);
        }, keys2.slice().sort());
      };
      switch (Object.prototype.toString.call(x)) {
        case "[object Arguments]":
          return "(function() { return arguments; }(" + _map(recur, x).join(", ") + "))";
        case "[object Array]":
          return "[" + _map(recur, x).concat(mapPairs(x, reject(function(k) {
            return /^\d+$/.test(k);
          }, keys(x)))).join(", ") + "]";
        case "[object Boolean]":
          return typeof x === "object" ? "new Boolean(" + recur(x.valueOf()) + ")" : x.toString();
        case "[object Date]":
          return "new Date(" + (isNaN(x.valueOf()) ? recur(NaN) : _quote(_toISOString(x))) + ")";
        case "[object Map]":
          return "new Map(" + recur(Array.from(x)) + ")";
        case "[object Null]":
          return "null";
        case "[object Number]":
          return typeof x === "object" ? "new Number(" + recur(x.valueOf()) + ")" : 1 / x === -Infinity ? "-0" : x.toString(10);
        case "[object Set]":
          return "new Set(" + recur(Array.from(x).sort()) + ")";
        case "[object String]":
          return typeof x === "object" ? "new String(" + recur(x.valueOf()) + ")" : _quote(x);
        case "[object Undefined]":
          return "undefined";
        default:
          if (typeof x.toString === "function") {
            var repr = x.toString();
            if (repr !== "[object Object]") {
              return repr;
            }
          }
          return "{" + mapPairs(x, keys(x)).join(", ") + "}";
      }
    }
    module2.exports = _toString;
  }
});

// node_modules/ramda/src/toString.js
var require_toString2 = __commonJS({
  "node_modules/ramda/src/toString.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _toString = require_toString();
    var toString = /* @__PURE__ */ _curry1(function toString2(val) {
      return _toString(val, []);
    });
    module2.exports = toString;
  }
});

// node_modules/ramda/src/max.js
var require_max = __commonJS({
  "node_modules/ramda/src/max.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var toString = require_toString2();
    var max = /* @__PURE__ */ _curry2(function max2(a, b) {
      if (a === b) {
        return b;
      }
      function safeMax(x, y) {
        if (x > y !== y > x) {
          return y > x ? y : x;
        }
        return void 0;
      }
      var maxByValue = safeMax(a, b);
      if (maxByValue !== void 0) {
        return maxByValue;
      }
      var maxByType = safeMax(typeof a, typeof b);
      if (maxByType !== void 0) {
        return maxByType === typeof a ? a : b;
      }
      var stringA = toString(a);
      var maxByStringValue = safeMax(stringA, toString(b));
      if (maxByStringValue !== void 0) {
        return maxByStringValue === stringA ? a : b;
      }
      return b;
    });
    module2.exports = max;
  }
});

// node_modules/ramda/src/internal/_xmap.js
var require_xmap = __commonJS({
  "node_modules/ramda/src/internal/_xmap.js"(exports2, module2) {
    var _xfBase = require_xfBase();
    var XMap = /* @__PURE__ */ (function() {
      function XMap2(f, xf) {
        this.xf = xf;
        this.f = f;
      }
      XMap2.prototype["@@transducer/init"] = _xfBase.init;
      XMap2.prototype["@@transducer/result"] = _xfBase.result;
      XMap2.prototype["@@transducer/step"] = function(result, input) {
        return this.xf["@@transducer/step"](result, this.f(input));
      };
      return XMap2;
    })();
    var _xmap = function _xmap2(f) {
      return function(xf) {
        return new XMap(f, xf);
      };
    };
    module2.exports = _xmap;
  }
});

// node_modules/ramda/src/map.js
var require_map2 = __commonJS({
  "node_modules/ramda/src/map.js"(exports2, module2) {
    var _arrayReduce = require_arrayReduce();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _map = require_map();
    var _xmap = require_xmap();
    var curryN = require_curryN2();
    var keys = require_keys();
    var map = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["fantasy-land/map", "map"], _xmap, function map2(fn, functor) {
      switch (Object.prototype.toString.call(functor)) {
        case "[object Function]":
          return curryN(functor.length, function() {
            return fn.call(this, functor.apply(this, arguments));
          });
        case "[object Object]":
          return _arrayReduce(function(acc, key) {
            acc[key] = fn(functor[key]);
            return acc;
          }, {}, keys(functor));
        default:
          return _map(fn, functor);
      }
    }));
    module2.exports = map;
  }
});

// node_modules/ramda/src/internal/_isInteger.js
var require_isInteger = __commonJS({
  "node_modules/ramda/src/internal/_isInteger.js"(exports2, module2) {
    module2.exports = Number.isInteger || function _isInteger(n) {
      return n << 0 === n;
    };
  }
});

// node_modules/ramda/src/internal/_nth.js
var require_nth = __commonJS({
  "node_modules/ramda/src/internal/_nth.js"(exports2, module2) {
    function _nth(offset, list) {
      var idx = offset < 0 ? list.length + offset : offset;
      return list[idx];
    }
    module2.exports = _nth;
  }
});

// node_modules/ramda/src/internal/_prop.js
var require_prop = __commonJS({
  "node_modules/ramda/src/internal/_prop.js"(exports2, module2) {
    var _isInteger = require_isInteger();
    var _nth = require_nth();
    function _prop(p, obj) {
      if (obj == null) {
        return;
      }
      return _isInteger(p) ? _nth(p, obj) : obj[p];
    }
    module2.exports = _prop;
  }
});

// node_modules/ramda/src/prop.js
var require_prop2 = __commonJS({
  "node_modules/ramda/src/prop.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _prop = require_prop();
    var prop = /* @__PURE__ */ _curry2(_prop);
    module2.exports = prop;
  }
});

// node_modules/ramda/src/pluck.js
var require_pluck = __commonJS({
  "node_modules/ramda/src/pluck.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var map = require_map2();
    var prop = require_prop2();
    var pluck = /* @__PURE__ */ _curry2(function pluck2(p, list) {
      return map(prop(p), list);
    });
    module2.exports = pluck;
  }
});

// node_modules/ramda/src/internal/_isString.js
var require_isString = __commonJS({
  "node_modules/ramda/src/internal/_isString.js"(exports2, module2) {
    function _isString(x) {
      return Object.prototype.toString.call(x) === "[object String]";
    }
    module2.exports = _isString;
  }
});

// node_modules/ramda/src/internal/_isArrayLike.js
var require_isArrayLike = __commonJS({
  "node_modules/ramda/src/internal/_isArrayLike.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _isArray = require_isArray();
    var _isString = require_isString();
    var _isArrayLike = /* @__PURE__ */ _curry1(function isArrayLike(x) {
      if (_isArray(x)) {
        return true;
      }
      if (!x) {
        return false;
      }
      if (typeof x !== "object") {
        return false;
      }
      if (_isString(x)) {
        return false;
      }
      if (x.length === 0) {
        return true;
      }
      if (x.length > 0) {
        return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
      }
      return false;
    });
    module2.exports = _isArrayLike;
  }
});

// node_modules/ramda/src/internal/_createReduce.js
var require_createReduce = __commonJS({
  "node_modules/ramda/src/internal/_createReduce.js"(exports2, module2) {
    var _isArrayLike = require_isArrayLike();
    var symIterator = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
    function _createReduce(arrayReduce, methodReduce, iterableReduce) {
      return function _reduce(xf, acc, list) {
        if (_isArrayLike(list)) {
          return arrayReduce(xf, acc, list);
        }
        if (list == null) {
          return acc;
        }
        if (typeof list["fantasy-land/reduce"] === "function") {
          return methodReduce(xf, acc, list, "fantasy-land/reduce");
        }
        if (list[symIterator] != null) {
          return iterableReduce(xf, acc, list[symIterator]());
        }
        if (typeof list.next === "function") {
          return iterableReduce(xf, acc, list);
        }
        if (typeof list.reduce === "function") {
          return methodReduce(xf, acc, list, "reduce");
        }
        throw new TypeError("reduce: list must be array or iterable");
      };
    }
    module2.exports = _createReduce;
  }
});

// node_modules/ramda/src/internal/_xArrayReduce.js
var require_xArrayReduce = __commonJS({
  "node_modules/ramda/src/internal/_xArrayReduce.js"(exports2, module2) {
    function _xArrayReduce(xf, acc, list) {
      var idx = 0;
      var len = list.length;
      while (idx < len) {
        acc = xf["@@transducer/step"](acc, list[idx]);
        if (acc && acc["@@transducer/reduced"]) {
          acc = acc["@@transducer/value"];
          break;
        }
        idx += 1;
      }
      return xf["@@transducer/result"](acc);
    }
    module2.exports = _xArrayReduce;
  }
});

// node_modules/ramda/src/bind.js
var require_bind = __commonJS({
  "node_modules/ramda/src/bind.js"(exports2, module2) {
    var _arity = require_arity();
    var _curry2 = require_curry2();
    var bind = /* @__PURE__ */ _curry2(function bind2(fn, thisObj) {
      return _arity(fn.length, function() {
        return fn.apply(thisObj, arguments);
      });
    });
    module2.exports = bind;
  }
});

// node_modules/ramda/src/internal/_xReduce.js
var require_xReduce = __commonJS({
  "node_modules/ramda/src/internal/_xReduce.js"(exports2, module2) {
    var _createReduce = require_createReduce();
    var _xArrayReduce = require_xArrayReduce();
    var bind = require_bind();
    function _xIterableReduce(xf, acc, iter) {
      var step = iter.next();
      while (!step.done) {
        acc = xf["@@transducer/step"](acc, step.value);
        if (acc && acc["@@transducer/reduced"]) {
          acc = acc["@@transducer/value"];
          break;
        }
        step = iter.next();
      }
      return xf["@@transducer/result"](acc);
    }
    function _xMethodReduce(xf, acc, obj, methodName) {
      return xf["@@transducer/result"](obj[methodName](bind(xf["@@transducer/step"], xf), acc));
    }
    var _xReduce = /* @__PURE__ */ _createReduce(_xArrayReduce, _xMethodReduce, _xIterableReduce);
    module2.exports = _xReduce;
  }
});

// node_modules/ramda/src/internal/_xwrap.js
var require_xwrap = __commonJS({
  "node_modules/ramda/src/internal/_xwrap.js"(exports2, module2) {
    var XWrap = /* @__PURE__ */ (function() {
      function XWrap2(fn) {
        this.f = fn;
      }
      XWrap2.prototype["@@transducer/init"] = function() {
        throw new Error("init not implemented on XWrap");
      };
      XWrap2.prototype["@@transducer/result"] = function(acc) {
        return acc;
      };
      XWrap2.prototype["@@transducer/step"] = function(acc, x) {
        return this.f(acc, x);
      };
      return XWrap2;
    })();
    function _xwrap(fn) {
      return new XWrap(fn);
    }
    module2.exports = _xwrap;
  }
});

// node_modules/ramda/src/reduce.js
var require_reduce = __commonJS({
  "node_modules/ramda/src/reduce.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var _xReduce = require_xReduce();
    var _xwrap = require_xwrap();
    var reduce = /* @__PURE__ */ _curry3(function(xf, acc, list) {
      return _xReduce(typeof xf === "function" ? _xwrap(xf) : xf, acc, list);
    });
    module2.exports = reduce;
  }
});

// node_modules/ramda/src/allPass.js
var require_allPass = __commonJS({
  "node_modules/ramda/src/allPass.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var curryN = require_curryN2();
    var max = require_max();
    var pluck = require_pluck();
    var reduce = require_reduce();
    var allPass = /* @__PURE__ */ _curry1(function allPass2(preds) {
      return curryN(reduce(max, 0, pluck("length", preds)), function() {
        var idx = 0;
        var len = preds.length;
        while (idx < len) {
          if (!preds[idx].apply(this, arguments)) {
            return false;
          }
          idx += 1;
        }
        return true;
      });
    });
    module2.exports = allPass;
  }
});

// node_modules/ramda/src/always.js
var require_always = __commonJS({
  "node_modules/ramda/src/always.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var always = /* @__PURE__ */ _curry1(function always2(val) {
      return function() {
        return val;
      };
    });
    module2.exports = always;
  }
});

// node_modules/ramda/src/and.js
var require_and = __commonJS({
  "node_modules/ramda/src/and.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var and = /* @__PURE__ */ _curry2(function and2(a, b) {
      return a && b;
    });
    module2.exports = and;
  }
});

// node_modules/ramda/src/internal/_xany.js
var require_xany = __commonJS({
  "node_modules/ramda/src/internal/_xany.js"(exports2, module2) {
    var _reduced = require_reduced();
    var _xfBase = require_xfBase();
    var XAny = /* @__PURE__ */ (function() {
      function XAny2(f, xf) {
        this.xf = xf;
        this.f = f;
        this.any = false;
      }
      XAny2.prototype["@@transducer/init"] = _xfBase.init;
      XAny2.prototype["@@transducer/result"] = function(result) {
        if (!this.any) {
          result = this.xf["@@transducer/step"](result, false);
        }
        return this.xf["@@transducer/result"](result);
      };
      XAny2.prototype["@@transducer/step"] = function(result, input) {
        if (this.f(input)) {
          this.any = true;
          result = _reduced(this.xf["@@transducer/step"](result, true));
        }
        return result;
      };
      return XAny2;
    })();
    function _xany(f) {
      return function(xf) {
        return new XAny(f, xf);
      };
    }
    module2.exports = _xany;
  }
});

// node_modules/ramda/src/any.js
var require_any = __commonJS({
  "node_modules/ramda/src/any.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xany = require_xany();
    var any = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["any"], _xany, function any2(fn, list) {
      var idx = 0;
      while (idx < list.length) {
        if (fn(list[idx])) {
          return true;
        }
        idx += 1;
      }
      return false;
    }));
    module2.exports = any;
  }
});

// node_modules/ramda/src/anyPass.js
var require_anyPass = __commonJS({
  "node_modules/ramda/src/anyPass.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var curryN = require_curryN2();
    var max = require_max();
    var pluck = require_pluck();
    var reduce = require_reduce();
    var anyPass = /* @__PURE__ */ _curry1(function anyPass2(preds) {
      return curryN(reduce(max, 0, pluck("length", preds)), function() {
        var idx = 0;
        var len = preds.length;
        while (idx < len) {
          if (preds[idx].apply(this, arguments)) {
            return true;
          }
          idx += 1;
        }
        return false;
      });
    });
    module2.exports = anyPass;
  }
});

// node_modules/ramda/src/internal/_reduce.js
var require_reduce2 = __commonJS({
  "node_modules/ramda/src/internal/_reduce.js"(exports2, module2) {
    var _arrayReduce = require_arrayReduce();
    var _createReduce = require_createReduce();
    function _iterableReduce(reducer, acc, iter) {
      var step = iter.next();
      while (!step.done) {
        acc = reducer(acc, step.value);
        step = iter.next();
      }
      return acc;
    }
    function _methodReduce(reducer, acc, obj, methodName) {
      return obj[methodName](reducer, acc);
    }
    var _reduce = /* @__PURE__ */ _createReduce(_arrayReduce, _methodReduce, _iterableReduce);
    module2.exports = _reduce;
  }
});

// node_modules/ramda/src/ap.js
var require_ap = __commonJS({
  "node_modules/ramda/src/ap.js"(exports2, module2) {
    var _concat = require_concat();
    var _curry2 = require_curry2();
    var _reduce = require_reduce2();
    var map = require_map2();
    var ap = /* @__PURE__ */ _curry2(function ap2(applyF, applyX) {
      return typeof applyX["fantasy-land/ap"] === "function" ? applyX["fantasy-land/ap"](applyF) : typeof applyF.ap === "function" ? applyF.ap(applyX) : typeof applyF === "function" ? function(x) {
        return applyF(x)(applyX(x));
      } : _reduce(function(acc, f) {
        return _concat(acc, map(f, applyX));
      }, [], applyF);
    });
    module2.exports = ap;
  }
});

// node_modules/ramda/src/internal/_aperture.js
var require_aperture = __commonJS({
  "node_modules/ramda/src/internal/_aperture.js"(exports2, module2) {
    function _aperture(n, list) {
      var idx = 0;
      var limit = list.length - (n - 1);
      var acc = new Array(limit >= 0 ? limit : 0);
      while (idx < limit) {
        acc[idx] = Array.prototype.slice.call(list, idx, idx + n);
        idx += 1;
      }
      return acc;
    }
    module2.exports = _aperture;
  }
});

// node_modules/ramda/src/internal/_xaperture.js
var require_xaperture = __commonJS({
  "node_modules/ramda/src/internal/_xaperture.js"(exports2, module2) {
    var _concat = require_concat();
    var _xfBase = require_xfBase();
    var XAperture = /* @__PURE__ */ (function() {
      function XAperture2(n, xf) {
        this.xf = xf;
        this.pos = 0;
        this.full = false;
        this.acc = new Array(n);
      }
      XAperture2.prototype["@@transducer/init"] = _xfBase.init;
      XAperture2.prototype["@@transducer/result"] = function(result) {
        this.acc = null;
        return this.xf["@@transducer/result"](result);
      };
      XAperture2.prototype["@@transducer/step"] = function(result, input) {
        this.store(input);
        return this.full ? this.xf["@@transducer/step"](result, this.getCopy()) : result;
      };
      XAperture2.prototype.store = function(input) {
        this.acc[this.pos] = input;
        this.pos += 1;
        if (this.pos === this.acc.length) {
          this.pos = 0;
          this.full = true;
        }
      };
      XAperture2.prototype.getCopy = function() {
        return _concat(Array.prototype.slice.call(this.acc, this.pos), Array.prototype.slice.call(this.acc, 0, this.pos));
      };
      return XAperture2;
    })();
    function _xaperture(n) {
      return function(xf) {
        return new XAperture(n, xf);
      };
    }
    module2.exports = _xaperture;
  }
});

// node_modules/ramda/src/aperture.js
var require_aperture2 = __commonJS({
  "node_modules/ramda/src/aperture.js"(exports2, module2) {
    var _aperture = require_aperture();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xaperture = require_xaperture();
    var aperture = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xaperture, _aperture));
    module2.exports = aperture;
  }
});

// node_modules/ramda/src/append.js
var require_append = __commonJS({
  "node_modules/ramda/src/append.js"(exports2, module2) {
    var _concat = require_concat();
    var _curry2 = require_curry2();
    var append = /* @__PURE__ */ _curry2(function append2(el, list) {
      return _concat(list, [el]);
    });
    module2.exports = append;
  }
});

// node_modules/ramda/src/apply.js
var require_apply = __commonJS({
  "node_modules/ramda/src/apply.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var apply = /* @__PURE__ */ _curry2(function apply2(fn, args) {
      return fn.apply(this, args);
    });
    module2.exports = apply;
  }
});

// node_modules/ramda/src/values.js
var require_values = __commonJS({
  "node_modules/ramda/src/values.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var keys = require_keys();
    var values = /* @__PURE__ */ _curry1(function values2(obj) {
      var props = keys(obj);
      var len = props.length;
      var vals = [];
      var idx = 0;
      while (idx < len) {
        vals[idx] = obj[props[idx]];
        idx += 1;
      }
      return vals;
    });
    module2.exports = values;
  }
});

// node_modules/ramda/src/applySpec.js
var require_applySpec = __commonJS({
  "node_modules/ramda/src/applySpec.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _isArray = require_isArray();
    var apply = require_apply();
    var curryN = require_curryN2();
    var max = require_max();
    var pluck = require_pluck();
    var reduce = require_reduce();
    var keys = require_keys();
    var values = require_values();
    function mapValues(fn, obj) {
      return _isArray(obj) ? obj.map(fn) : keys(obj).reduce(function(acc, key) {
        acc[key] = fn(obj[key]);
        return acc;
      }, {});
    }
    var applySpec = /* @__PURE__ */ _curry1(function applySpec2(spec) {
      spec = mapValues(function(v) {
        return typeof v == "function" ? v : applySpec2(v);
      }, spec);
      return curryN(reduce(max, 0, pluck("length", values(spec))), function() {
        var args = arguments;
        return mapValues(function(f) {
          return apply(f, args);
        }, spec);
      });
    });
    module2.exports = applySpec;
  }
});

// node_modules/ramda/src/applyTo.js
var require_applyTo = __commonJS({
  "node_modules/ramda/src/applyTo.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var applyTo = /* @__PURE__ */ _curry2(function applyTo2(x, f) {
      return f(x);
    });
    module2.exports = applyTo;
  }
});

// node_modules/ramda/src/ascend.js
var require_ascend = __commonJS({
  "node_modules/ramda/src/ascend.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var ascend = /* @__PURE__ */ _curry3(function ascend2(fn, a, b) {
      var aa = fn(a);
      var bb = fn(b);
      return aa < bb ? -1 : aa > bb ? 1 : 0;
    });
    module2.exports = ascend;
  }
});

// node_modules/ramda/src/curry.js
var require_curry = __commonJS({
  "node_modules/ramda/src/curry.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var curryN = require_curryN2();
    var curry = /* @__PURE__ */ _curry1(function curry2(fn) {
      return curryN(fn.length, fn);
    });
    module2.exports = curry;
  }
});

// node_modules/ramda/src/ascendNatural.js
var require_ascendNatural = __commonJS({
  "node_modules/ramda/src/ascendNatural.js"(exports2, module2) {
    var curry = require_curry();
    var ascendNatural = /* @__PURE__ */ curry(function ascendNatural2(locales, fn, a, b) {
      const aa = fn(a);
      const bb = fn(b);
      return aa.localeCompare(bb, locales, {
        numeric: true
      });
    });
    module2.exports = ascendNatural;
  }
});

// node_modules/ramda/src/internal/_assoc.js
var require_assoc = __commonJS({
  "node_modules/ramda/src/internal/_assoc.js"(exports2, module2) {
    var _isArray = require_isArray();
    var _isInteger = require_isInteger();
    function _assoc(prop, val, obj) {
      if (_isInteger(prop) && _isArray(obj)) {
        var _idx = prop < 0 ? obj.length + prop : prop;
        var arr = [].concat(obj);
        arr[_idx] = val;
        return arr;
      }
      var result = {};
      for (var p in obj) {
        result[p] = obj[p];
      }
      result[prop] = val;
      return result;
    }
    module2.exports = _assoc;
  }
});

// node_modules/ramda/src/isNil.js
var require_isNil = __commonJS({
  "node_modules/ramda/src/isNil.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var isNil = /* @__PURE__ */ _curry1(function isNil2(x) {
      return x == null;
    });
    module2.exports = isNil;
  }
});

// node_modules/ramda/src/assocPath.js
var require_assocPath = __commonJS({
  "node_modules/ramda/src/assocPath.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var _isInteger = require_isInteger();
    var _assoc = require_assoc();
    var isNil = require_isNil();
    var _prop = require_prop();
    var assocPath = /* @__PURE__ */ _curry3(function assocPath2(path, val, obj) {
      if (path.length === 0) {
        return val;
      }
      var idx = path[0];
      if (path.length > 1) {
        var nextObj = _prop(idx, obj);
        if (isNil(nextObj) || typeof nextObj !== "object") {
          nextObj = _isInteger(path[1]) ? [] : {};
        }
        val = assocPath2(Array.prototype.slice.call(path, 1), val, nextObj);
      }
      return _assoc(idx, val, obj);
    });
    module2.exports = assocPath;
  }
});

// node_modules/ramda/src/assoc.js
var require_assoc2 = __commonJS({
  "node_modules/ramda/src/assoc.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var assocPath = require_assocPath();
    var assoc = /* @__PURE__ */ _curry3(function assoc2(prop, val, obj) {
      return assocPath([prop], val, obj);
    });
    module2.exports = assoc;
  }
});

// node_modules/ramda/src/nAry.js
var require_nAry = __commonJS({
  "node_modules/ramda/src/nAry.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var nAry = /* @__PURE__ */ _curry2(function nAry2(n, fn) {
      switch (n) {
        case 0:
          return function() {
            return fn.call(this);
          };
        case 1:
          return function(a0) {
            return fn.call(this, a0);
          };
        case 2:
          return function(a0, a1) {
            return fn.call(this, a0, a1);
          };
        case 3:
          return function(a0, a1, a2) {
            return fn.call(this, a0, a1, a2);
          };
        case 4:
          return function(a0, a1, a2, a3) {
            return fn.call(this, a0, a1, a2, a3);
          };
        case 5:
          return function(a0, a1, a2, a3, a4) {
            return fn.call(this, a0, a1, a2, a3, a4);
          };
        case 6:
          return function(a0, a1, a2, a3, a4, a5) {
            return fn.call(this, a0, a1, a2, a3, a4, a5);
          };
        case 7:
          return function(a0, a1, a2, a3, a4, a5, a6) {
            return fn.call(this, a0, a1, a2, a3, a4, a5, a6);
          };
        case 8:
          return function(a0, a1, a2, a3, a4, a5, a6, a7) {
            return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7);
          };
        case 9:
          return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
            return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8);
          };
        case 10:
          return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
            return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
          };
        default:
          throw new Error("First argument to nAry must be a non-negative integer no greater than ten");
      }
    });
    module2.exports = nAry;
  }
});

// node_modules/ramda/src/binary.js
var require_binary = __commonJS({
  "node_modules/ramda/src/binary.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var nAry = require_nAry();
    var binary = /* @__PURE__ */ _curry1(function binary2(fn) {
      return nAry(2, fn);
    });
    module2.exports = binary;
  }
});

// node_modules/ramda/src/internal/_isFunction.js
var require_isFunction = __commonJS({
  "node_modules/ramda/src/internal/_isFunction.js"(exports2, module2) {
    function _isFunction(x) {
      var type = Object.prototype.toString.call(x);
      return type === "[object Function]" || type === "[object AsyncFunction]" || type === "[object GeneratorFunction]" || type === "[object AsyncGeneratorFunction]";
    }
    module2.exports = _isFunction;
  }
});

// node_modules/ramda/src/liftN.js
var require_liftN = __commonJS({
  "node_modules/ramda/src/liftN.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _arrayReduce = require_arrayReduce();
    var ap = require_ap();
    var curryN = require_curryN2();
    var map = require_map2();
    var liftN = /* @__PURE__ */ _curry2(function liftN2(arity, fn) {
      var lifted = curryN(arity, fn);
      return curryN(arity, function() {
        return _arrayReduce(ap, map(lifted, arguments[0]), Array.prototype.slice.call(arguments, 1));
      });
    });
    module2.exports = liftN;
  }
});

// node_modules/ramda/src/lift.js
var require_lift = __commonJS({
  "node_modules/ramda/src/lift.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var liftN = require_liftN();
    var lift = /* @__PURE__ */ _curry1(function lift2(fn) {
      return liftN(fn.length, fn);
    });
    module2.exports = lift;
  }
});

// node_modules/ramda/src/both.js
var require_both = __commonJS({
  "node_modules/ramda/src/both.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _isFunction = require_isFunction();
    var and = require_and();
    var lift = require_lift();
    var both = /* @__PURE__ */ _curry2(function both2(f, g) {
      return _isFunction(f) ? function _both() {
        return f.apply(this, arguments) && g.apply(this, arguments);
      } : lift(and)(f, g);
    });
    module2.exports = both;
  }
});

// node_modules/ramda/src/call.js
var require_call = __commonJS({
  "node_modules/ramda/src/call.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var call = /* @__PURE__ */ _curry1(function call2(fn) {
      return fn.apply(this, Array.prototype.slice.call(arguments, 1));
    });
    module2.exports = call;
  }
});

// node_modules/ramda/src/internal/_makeFlat.js
var require_makeFlat = __commonJS({
  "node_modules/ramda/src/internal/_makeFlat.js"(exports2, module2) {
    var _isArrayLike = require_isArrayLike();
    function _makeFlat(recursive) {
      return function flatt(list) {
        var value, jlen, j;
        var result = [];
        var idx = 0;
        var ilen = list.length;
        while (idx < ilen) {
          if (_isArrayLike(list[idx])) {
            value = recursive ? flatt(list[idx]) : list[idx];
            j = 0;
            jlen = value.length;
            while (j < jlen) {
              result[result.length] = value[j];
              j += 1;
            }
          } else {
            result[result.length] = list[idx];
          }
          idx += 1;
        }
        return result;
      };
    }
    module2.exports = _makeFlat;
  }
});

// node_modules/ramda/src/internal/_forceReduced.js
var require_forceReduced = __commonJS({
  "node_modules/ramda/src/internal/_forceReduced.js"(exports2, module2) {
    function _forceReduced(x) {
      return {
        "@@transducer/value": x,
        "@@transducer/reduced": true
      };
    }
    module2.exports = _forceReduced;
  }
});

// node_modules/ramda/src/internal/_flatCat.js
var require_flatCat = __commonJS({
  "node_modules/ramda/src/internal/_flatCat.js"(exports2, module2) {
    var _forceReduced = require_forceReduced();
    var _isArrayLike = require_isArrayLike();
    var _xArrayReduce = require_xArrayReduce();
    var _xReduce = require_xReduce();
    var _xfBase = require_xfBase();
    var tInit = "@@transducer/init";
    var tStep = "@@transducer/step";
    var tResult = "@@transducer/result";
    var XPreservingReduced = /* @__PURE__ */ (function() {
      function XPreservingReduced2(xf) {
        this.xf = xf;
      }
      XPreservingReduced2.prototype[tInit] = _xfBase.init;
      XPreservingReduced2.prototype[tResult] = _xfBase.result;
      XPreservingReduced2.prototype[tStep] = function(result, input) {
        var ret = this.xf[tStep](result, input);
        return ret["@@transducer/reduced"] ? _forceReduced(ret) : ret;
      };
      return XPreservingReduced2;
    })();
    var XFlatCat = /* @__PURE__ */ (function() {
      function XFlatCat2(xf) {
        this.xf = new XPreservingReduced(xf);
      }
      XFlatCat2.prototype[tInit] = _xfBase.init;
      XFlatCat2.prototype[tResult] = _xfBase.result;
      XFlatCat2.prototype[tStep] = function(result, input) {
        return !_isArrayLike(input) ? _xArrayReduce(this.xf, result, [input]) : _xReduce(this.xf, result, input);
      };
      return XFlatCat2;
    })();
    var _flatCat = function _xcat(xf) {
      return new XFlatCat(xf);
    };
    module2.exports = _flatCat;
  }
});

// node_modules/ramda/src/internal/_xchain.js
var require_xchain = __commonJS({
  "node_modules/ramda/src/internal/_xchain.js"(exports2, module2) {
    var _flatCat = require_flatCat();
    var _xmap = require_xmap();
    function _xchain(f) {
      return function(xf) {
        return _xmap(f)(_flatCat(xf));
      };
    }
    module2.exports = _xchain;
  }
});

// node_modules/ramda/src/internal/_chain.js
var require_chain = __commonJS({
  "node_modules/ramda/src/internal/_chain.js"(exports2, module2) {
    var _dispatchable = require_dispatchable();
    var _makeFlat = require_makeFlat();
    var _xchain = require_xchain();
    var map = require_map2();
    module2.exports = /* @__PURE__ */ _dispatchable(["fantasy-land/chain", "chain"], _xchain, function chain(fn, monad) {
      if (typeof monad === "function") {
        return function(x) {
          return fn(monad(x))(x);
        };
      }
      return _makeFlat(false)(map(fn, monad));
    });
  }
});

// node_modules/ramda/src/chain.js
var require_chain2 = __commonJS({
  "node_modules/ramda/src/chain.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _chain = require_chain();
    var chain = /* @__PURE__ */ _curry2(_chain);
    module2.exports = chain;
  }
});

// node_modules/ramda/src/clamp.js
var require_clamp = __commonJS({
  "node_modules/ramda/src/clamp.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var clamp = /* @__PURE__ */ _curry3(function clamp2(min, max, value) {
      if (min > max) {
        throw new Error("min must not be greater than max in clamp(min, max, value)");
      }
      return value < min ? min : value > max ? max : value;
    });
    module2.exports = clamp;
  }
});

// node_modules/ramda/src/internal/_cloneRegExp.js
var require_cloneRegExp = __commonJS({
  "node_modules/ramda/src/internal/_cloneRegExp.js"(exports2, module2) {
    function _cloneRegExp(pattern) {
      return new RegExp(pattern.source, pattern.flags ? pattern.flags : (pattern.global ? "g" : "") + (pattern.ignoreCase ? "i" : "") + (pattern.multiline ? "m" : "") + (pattern.sticky ? "y" : "") + (pattern.unicode ? "u" : "") + (pattern.dotAll ? "s" : ""));
    }
    module2.exports = _cloneRegExp;
  }
});

// node_modules/ramda/src/internal/_clone.js
var require_clone = __commonJS({
  "node_modules/ramda/src/internal/_clone.js"(exports2, module2) {
    var _cloneRegExp = require_cloneRegExp();
    var type = require_type();
    function _clone(value, deep, map) {
      map || (map = new _ObjectMap());
      if (_isPrimitive(value)) {
        return value;
      }
      var copy = function copy2(copiedValue) {
        var cachedCopy = map.get(value);
        if (cachedCopy) {
          return cachedCopy;
        }
        map.set(value, copiedValue);
        for (var key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            copiedValue[key] = deep ? _clone(value[key], true, map) : value[key];
          }
        }
        return copiedValue;
      };
      switch (type(value)) {
        case "Object":
          return copy(Object.create(Object.getPrototypeOf(value)));
        case "Array":
          return copy(Array(value.length));
        case "Date":
          return new Date(value.valueOf());
        case "RegExp":
          return _cloneRegExp(value);
        case "Int8Array":
        case "Uint8Array":
        case "Uint8ClampedArray":
        case "Int16Array":
        case "Uint16Array":
        case "Int32Array":
        case "Uint32Array":
        case "Float32Array":
        case "Float64Array":
        case "BigInt64Array":
        case "BigUint64Array":
          return value.slice();
        default:
          return value;
      }
    }
    module2.exports = _clone;
    function _isPrimitive(param) {
      var type2 = typeof param;
      return param == null || type2 != "object" && type2 != "function";
    }
    var _ObjectMap = /* @__PURE__ */ (function() {
      function _ObjectMap2() {
        this.map = {};
        this.length = 0;
      }
      _ObjectMap2.prototype.set = function(key, value) {
        var hashedKey = this.hash(key);
        var bucket = this.map[hashedKey];
        if (!bucket) {
          this.map[hashedKey] = bucket = [];
        }
        bucket.push([key, value]);
        this.length += 1;
      };
      _ObjectMap2.prototype.hash = function(key) {
        var hashedKey = [];
        for (var value in key) {
          hashedKey.push(Object.prototype.toString.call(key[value]));
        }
        return hashedKey.join();
      };
      _ObjectMap2.prototype.get = function(key) {
        if (this.length <= 180) {
          for (var p in this.map) {
            var bucket = this.map[p];
            for (var i = 0; i < bucket.length; i += 1) {
              var element = bucket[i];
              if (element[0] === key) {
                return element[1];
              }
            }
          }
          return;
        }
        var hashedKey = this.hash(key);
        var bucket = this.map[hashedKey];
        if (!bucket) {
          return;
        }
        for (var i = 0; i < bucket.length; i += 1) {
          var element = bucket[i];
          if (element[0] === key) {
            return element[1];
          }
        }
      };
      return _ObjectMap2;
    })();
  }
});

// node_modules/ramda/src/clone.js
var require_clone2 = __commonJS({
  "node_modules/ramda/src/clone.js"(exports2, module2) {
    var _clone = require_clone();
    var _curry1 = require_curry1();
    var clone = /* @__PURE__ */ _curry1(function clone2(value) {
      return value != null && typeof value.clone === "function" ? value.clone() : _clone(value, true);
    });
    module2.exports = clone;
  }
});

// node_modules/ramda/src/collectBy.js
var require_collectBy = __commonJS({
  "node_modules/ramda/src/collectBy.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _reduce = require_reduce2();
    var collectBy = /* @__PURE__ */ _curry2(function collectBy2(fn, list) {
      var group = _reduce(function(o, x) {
        var tag2 = fn(x);
        if (o[tag2] === void 0) {
          o[tag2] = [];
        }
        o[tag2].push(x);
        return o;
      }, {}, list);
      var newList = [];
      for (var tag in group) {
        newList.push(group[tag]);
      }
      return newList;
    });
    module2.exports = collectBy;
  }
});

// node_modules/ramda/src/comparator.js
var require_comparator = __commonJS({
  "node_modules/ramda/src/comparator.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var comparator = /* @__PURE__ */ _curry1(function comparator2(pred) {
      return function(a, b) {
        return pred(a, b) ? -1 : pred(b, a) ? 1 : 0;
      };
    });
    module2.exports = comparator;
  }
});

// node_modules/ramda/src/not.js
var require_not = __commonJS({
  "node_modules/ramda/src/not.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var not = /* @__PURE__ */ _curry1(function not2(a) {
      return !a;
    });
    module2.exports = not;
  }
});

// node_modules/ramda/src/complement.js
var require_complement2 = __commonJS({
  "node_modules/ramda/src/complement.js"(exports2, module2) {
    var lift = require_lift();
    var not = require_not();
    var complement = /* @__PURE__ */ lift(not);
    module2.exports = complement;
  }
});

// node_modules/ramda/src/internal/_pipe.js
var require_pipe = __commonJS({
  "node_modules/ramda/src/internal/_pipe.js"(exports2, module2) {
    function _pipe(f, g) {
      return function() {
        return g.call(this, f.apply(this, arguments));
      };
    }
    module2.exports = _pipe;
  }
});

// node_modules/ramda/src/internal/_checkForMethod.js
var require_checkForMethod = __commonJS({
  "node_modules/ramda/src/internal/_checkForMethod.js"(exports2, module2) {
    var _isArray = require_isArray();
    function _checkForMethod(methodname, fn) {
      return function() {
        var length = arguments.length;
        if (length === 0) {
          return fn();
        }
        var obj = arguments[length - 1];
        return _isArray(obj) || typeof obj[methodname] !== "function" ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
      };
    }
    module2.exports = _checkForMethod;
  }
});

// node_modules/ramda/src/slice.js
var require_slice = __commonJS({
  "node_modules/ramda/src/slice.js"(exports2, module2) {
    var _checkForMethod = require_checkForMethod();
    var _curry3 = require_curry3();
    var slice = /* @__PURE__ */ _curry3(/* @__PURE__ */ _checkForMethod("slice", function slice2(fromIndex, toIndex, list) {
      return Array.prototype.slice.call(list, fromIndex, toIndex);
    }));
    module2.exports = slice;
  }
});

// node_modules/ramda/src/tail.js
var require_tail = __commonJS({
  "node_modules/ramda/src/tail.js"(exports2, module2) {
    var _checkForMethod = require_checkForMethod();
    var _curry1 = require_curry1();
    var slice = require_slice();
    var tail = /* @__PURE__ */ _curry1(/* @__PURE__ */ _checkForMethod("tail", /* @__PURE__ */ slice(1, Infinity)));
    module2.exports = tail;
  }
});

// node_modules/ramda/src/pipe.js
var require_pipe2 = __commonJS({
  "node_modules/ramda/src/pipe.js"(exports2, module2) {
    var _arity = require_arity();
    var _pipe = require_pipe();
    var reduce = require_reduce();
    var tail = require_tail();
    function pipe() {
      if (arguments.length === 0) {
        throw new Error("pipe requires at least one argument");
      }
      return _arity(arguments[0].length, reduce(_pipe, arguments[0], tail(arguments)));
    }
    module2.exports = pipe;
  }
});

// node_modules/ramda/src/reverse.js
var require_reverse = __commonJS({
  "node_modules/ramda/src/reverse.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _isString = require_isString();
    var reverse = /* @__PURE__ */ _curry1(function reverse2(list) {
      return _isString(list) ? list.split("").reverse().join("") : Array.prototype.slice.call(list, 0).reverse();
    });
    module2.exports = reverse;
  }
});

// node_modules/ramda/src/compose.js
var require_compose = __commonJS({
  "node_modules/ramda/src/compose.js"(exports2, module2) {
    var pipe = require_pipe2();
    var reverse = require_reverse();
    function compose() {
      if (arguments.length === 0) {
        throw new Error("compose requires at least one argument");
      }
      return pipe.apply(this, reverse(arguments));
    }
    module2.exports = compose;
  }
});

// node_modules/ramda/src/head.js
var require_head = __commonJS({
  "node_modules/ramda/src/head.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _nth = require_nth();
    var head = /* @__PURE__ */ _curry1(function(list) {
      return _nth(0, list);
    });
    module2.exports = head;
  }
});

// node_modules/ramda/src/internal/_identity.js
var require_identity = __commonJS({
  "node_modules/ramda/src/internal/_identity.js"(exports2, module2) {
    function _identity(x) {
      return x;
    }
    module2.exports = _identity;
  }
});

// node_modules/ramda/src/identity.js
var require_identity2 = __commonJS({
  "node_modules/ramda/src/identity.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _identity = require_identity();
    var identity = /* @__PURE__ */ _curry1(_identity);
    module2.exports = identity;
  }
});

// node_modules/ramda/src/pipeWith.js
var require_pipeWith = __commonJS({
  "node_modules/ramda/src/pipeWith.js"(exports2, module2) {
    var _arity = require_arity();
    var _curry2 = require_curry2();
    var head = require_head();
    var _reduce = require_reduce2();
    var tail = require_tail();
    var identity = require_identity2();
    var pipeWith = /* @__PURE__ */ _curry2(function pipeWith2(xf, list) {
      if (list.length <= 0) {
        return identity;
      }
      var headList = head(list);
      var tailList = tail(list);
      return _arity(headList.length, function() {
        return _reduce(function(result, f) {
          return xf.call(this, f, result);
        }, headList.apply(this, arguments), tailList);
      });
    });
    module2.exports = pipeWith;
  }
});

// node_modules/ramda/src/composeWith.js
var require_composeWith = __commonJS({
  "node_modules/ramda/src/composeWith.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var pipeWith = require_pipeWith();
    var reverse = require_reverse();
    var composeWith = /* @__PURE__ */ _curry2(function composeWith2(xf, list) {
      return pipeWith.apply(this, [xf, reverse(list)]);
    });
    module2.exports = composeWith;
  }
});

// node_modules/ramda/src/concat.js
var require_concat2 = __commonJS({
  "node_modules/ramda/src/concat.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _isArray = require_isArray();
    var _isFunction = require_isFunction();
    var _isString = require_isString();
    var toString = require_toString2();
    var concat = /* @__PURE__ */ _curry2(function concat2(a, b) {
      if (_isArray(a)) {
        if (_isArray(b)) {
          return a.concat(b);
        }
        throw new TypeError(toString(b) + " is not an array");
      }
      if (_isString(a)) {
        if (_isString(b)) {
          return a + b;
        }
        throw new TypeError(toString(b) + " is not a string");
      }
      if (a != null && _isFunction(a["fantasy-land/concat"])) {
        return a["fantasy-land/concat"](b);
      }
      if (a != null && _isFunction(a.concat)) {
        return a.concat(b);
      }
      throw new TypeError(toString(a) + ' does not have a method named "concat" or "fantasy-land/concat"');
    });
    module2.exports = concat;
  }
});

// node_modules/ramda/src/cond.js
var require_cond = __commonJS({
  "node_modules/ramda/src/cond.js"(exports2, module2) {
    var _arity = require_arity();
    var _curry1 = require_curry1();
    var map = require_map2();
    var max = require_max();
    var reduce = require_reduce();
    var cond = /* @__PURE__ */ _curry1(function cond2(pairs) {
      var arity = reduce(max, 0, map(function(pair) {
        return pair[0].length;
      }, pairs));
      return _arity(arity, function() {
        var idx = 0;
        while (idx < pairs.length) {
          if (pairs[idx][0].apply(this, arguments)) {
            return pairs[idx][1].apply(this, arguments);
          }
          idx += 1;
        }
      });
    });
    module2.exports = cond;
  }
});

// node_modules/ramda/src/constructN.js
var require_constructN = __commonJS({
  "node_modules/ramda/src/constructN.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var curry = require_curry();
    var nAry = require_nAry();
    var constructN = /* @__PURE__ */ _curry2(function constructN2(n, Fn) {
      if (n > 10) {
        throw new Error("Constructor with greater than ten arguments");
      }
      if (n === 0) {
        return function() {
          return new Fn();
        };
      }
      return curry(nAry(n, function($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
        switch (n) {
          case 1:
            return new Fn($0);
          case 2:
            return new Fn($0, $1);
          case 3:
            return new Fn($0, $1, $2);
          case 4:
            return new Fn($0, $1, $2, $3);
          case 5:
            return new Fn($0, $1, $2, $3, $4);
          case 6:
            return new Fn($0, $1, $2, $3, $4, $5);
          case 7:
            return new Fn($0, $1, $2, $3, $4, $5, $6);
          case 8:
            return new Fn($0, $1, $2, $3, $4, $5, $6, $7);
          case 9:
            return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8);
          case 10:
            return new Fn($0, $1, $2, $3, $4, $5, $6, $7, $8, $9);
        }
      }));
    });
    module2.exports = constructN;
  }
});

// node_modules/ramda/src/construct.js
var require_construct = __commonJS({
  "node_modules/ramda/src/construct.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var constructN = require_constructN();
    var construct = /* @__PURE__ */ _curry1(function construct2(Fn) {
      return constructN(Fn.length, Fn);
    });
    module2.exports = construct;
  }
});

// node_modules/ramda/src/converge.js
var require_converge = __commonJS({
  "node_modules/ramda/src/converge.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _map = require_map();
    var curryN = require_curryN2();
    var max = require_max();
    var pluck = require_pluck();
    var reduce = require_reduce();
    var converge = /* @__PURE__ */ _curry2(function converge2(after, fns) {
      return curryN(reduce(max, 0, pluck("length", fns)), function() {
        var args = arguments;
        var context = this;
        return after.apply(context, _map(function(fn) {
          return fn.apply(context, args);
        }, fns));
      });
    });
    module2.exports = converge;
  }
});

// node_modules/ramda/src/count.js
var require_count = __commonJS({
  "node_modules/ramda/src/count.js"(exports2, module2) {
    var _reduce = require_reduce2();
    var curry = require_curry();
    var count = /* @__PURE__ */ curry(function(pred, list) {
      return _reduce(function(a, e) {
        return pred(e) ? a + 1 : a;
      }, 0, list);
    });
    module2.exports = count;
  }
});

// node_modules/ramda/src/internal/_xreduceBy.js
var require_xreduceBy = __commonJS({
  "node_modules/ramda/src/internal/_xreduceBy.js"(exports2, module2) {
    var _clone = require_clone();
    var _has = require_has();
    var _xfBase = require_xfBase();
    var XReduceBy = /* @__PURE__ */ (function() {
      function XReduceBy2(valueFn, valueAcc, keyFn, xf) {
        this.valueFn = valueFn;
        this.valueAcc = valueAcc;
        this.keyFn = keyFn;
        this.xf = xf;
        this.inputs = {};
      }
      XReduceBy2.prototype["@@transducer/init"] = _xfBase.init;
      XReduceBy2.prototype["@@transducer/result"] = function(result) {
        var key;
        for (key in this.inputs) {
          if (_has(key, this.inputs)) {
            result = this.xf["@@transducer/step"](result, this.inputs[key]);
            if (result["@@transducer/reduced"]) {
              result = result["@@transducer/value"];
              break;
            }
          }
        }
        this.inputs = null;
        return this.xf["@@transducer/result"](result);
      };
      XReduceBy2.prototype["@@transducer/step"] = function(result, input) {
        var key = this.keyFn(input);
        this.inputs[key] = this.inputs[key] || [key, _clone(this.valueAcc, false)];
        this.inputs[key][1] = this.valueFn(this.inputs[key][1], input);
        return result;
      };
      return XReduceBy2;
    })();
    function _xreduceBy(valueFn, valueAcc, keyFn) {
      return function(xf) {
        return new XReduceBy(valueFn, valueAcc, keyFn, xf);
      };
    }
    module2.exports = _xreduceBy;
  }
});

// node_modules/ramda/src/reduceBy.js
var require_reduceBy = __commonJS({
  "node_modules/ramda/src/reduceBy.js"(exports2, module2) {
    var _clone = require_clone();
    var _curryN = require_curryN();
    var _dispatchable = require_dispatchable();
    var _has = require_has();
    var _reduced = require_reduced();
    var _xReduce = require_xReduce();
    var _xreduceBy = require_xreduceBy();
    var _xwrap = require_xwrap();
    var reduceBy = /* @__PURE__ */ _curryN(4, [], /* @__PURE__ */ _dispatchable([], _xreduceBy, function reduceBy2(valueFn, valueAcc, keyFn, list) {
      var xf = _xwrap(function(acc, elt) {
        var key = keyFn(elt);
        var value = valueFn(_has(key, acc) ? acc[key] : _clone(valueAcc, false), elt);
        if (value && value["@@transducer/reduced"]) {
          return _reduced(acc);
        }
        acc[key] = value;
        return acc;
      });
      return _xReduce(xf, {}, list);
    }));
    module2.exports = reduceBy;
  }
});

// node_modules/ramda/src/countBy.js
var require_countBy = __commonJS({
  "node_modules/ramda/src/countBy.js"(exports2, module2) {
    var reduceBy = require_reduceBy();
    var countBy = /* @__PURE__ */ reduceBy(function(acc, elem) {
      return acc + 1;
    }, 0);
    module2.exports = countBy;
  }
});

// node_modules/ramda/src/dec.js
var require_dec = __commonJS({
  "node_modules/ramda/src/dec.js"(exports2, module2) {
    var add = require_add();
    var dec = /* @__PURE__ */ add(-1);
    module2.exports = dec;
  }
});

// node_modules/ramda/src/defaultTo.js
var require_defaultTo = __commonJS({
  "node_modules/ramda/src/defaultTo.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var defaultTo = /* @__PURE__ */ _curry2(function defaultTo2(d2, v) {
      return v == null || v !== v ? d2 : v;
    });
    module2.exports = defaultTo;
  }
});

// node_modules/ramda/src/descend.js
var require_descend = __commonJS({
  "node_modules/ramda/src/descend.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var descend = /* @__PURE__ */ _curry3(function descend2(fn, a, b) {
      var aa = fn(a);
      var bb = fn(b);
      return aa > bb ? -1 : aa < bb ? 1 : 0;
    });
    module2.exports = descend;
  }
});

// node_modules/ramda/src/descendNatural.js
var require_descendNatural = __commonJS({
  "node_modules/ramda/src/descendNatural.js"(exports2, module2) {
    var curry = require_curry();
    var descendNatural = /* @__PURE__ */ curry(function descendNatural2(locales, fn, a, b) {
      const aa = fn(a);
      const bb = fn(b);
      return bb.localeCompare(aa, locales, {
        numeric: true
      });
    });
    module2.exports = descendNatural;
  }
});

// node_modules/ramda/src/internal/_Set.js
var require_Set = __commonJS({
  "node_modules/ramda/src/internal/_Set.js"(exports2, module2) {
    var _includes = require_includes();
    var _Set = /* @__PURE__ */ (function() {
      function _Set2() {
        this._nativeSet = typeof Set === "function" ? /* @__PURE__ */ new Set() : null;
        this._items = {};
      }
      _Set2.prototype.add = function(item) {
        return !hasOrAdd(item, true, this);
      };
      _Set2.prototype.has = function(item) {
        return hasOrAdd(item, false, this);
      };
      return _Set2;
    })();
    function hasOrAdd(item, shouldAdd, set) {
      var type = typeof item;
      var prevSize, newSize;
      switch (type) {
        case "string":
        case "number":
          if (item === 0 && 1 / item === -Infinity) {
            if (set._items["-0"]) {
              return true;
            } else {
              if (shouldAdd) {
                set._items["-0"] = true;
              }
              return false;
            }
          }
          if (set._nativeSet !== null) {
            if (shouldAdd) {
              prevSize = set._nativeSet.size;
              set._nativeSet.add(item);
              newSize = set._nativeSet.size;
              return newSize === prevSize;
            } else {
              return set._nativeSet.has(item);
            }
          } else {
            if (!(type in set._items)) {
              if (shouldAdd) {
                set._items[type] = {};
                set._items[type][item] = true;
              }
              return false;
            } else if (item in set._items[type]) {
              return true;
            } else {
              if (shouldAdd) {
                set._items[type][item] = true;
              }
              return false;
            }
          }
        case "boolean":
          if (type in set._items) {
            var bIdx = item ? 1 : 0;
            if (set._items[type][bIdx]) {
              return true;
            } else {
              if (shouldAdd) {
                set._items[type][bIdx] = true;
              }
              return false;
            }
          } else {
            if (shouldAdd) {
              set._items[type] = item ? [false, true] : [true, false];
            }
            return false;
          }
        case "function":
          if (set._nativeSet !== null) {
            if (shouldAdd) {
              prevSize = set._nativeSet.size;
              set._nativeSet.add(item);
              newSize = set._nativeSet.size;
              return newSize === prevSize;
            } else {
              return set._nativeSet.has(item);
            }
          } else {
            if (!(type in set._items)) {
              if (shouldAdd) {
                set._items[type] = [item];
              }
              return false;
            }
            if (!_includes(item, set._items[type])) {
              if (shouldAdd) {
                set._items[type].push(item);
              }
              return false;
            }
            return true;
          }
        case "undefined":
          if (set._items[type]) {
            return true;
          } else {
            if (shouldAdd) {
              set._items[type] = true;
            }
            return false;
          }
        case "object":
          if (item === null) {
            if (!set._items["null"]) {
              if (shouldAdd) {
                set._items["null"] = true;
              }
              return false;
            }
            return true;
          }
        /* falls through */
        default:
          type = Object.prototype.toString.call(item);
          if (!(type in set._items)) {
            if (shouldAdd) {
              set._items[type] = [item];
            }
            return false;
          }
          if (!_includes(item, set._items[type])) {
            if (shouldAdd) {
              set._items[type].push(item);
            }
            return false;
          }
          return true;
      }
    }
    module2.exports = _Set;
  }
});

// node_modules/ramda/src/difference.js
var require_difference = __commonJS({
  "node_modules/ramda/src/difference.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _Set = require_Set();
    var difference = /* @__PURE__ */ _curry2(function difference2(first, second) {
      var out = [];
      var idx = 0;
      var firstLen = first.length;
      var secondLen = second.length;
      var toFilterOut = new _Set();
      for (var i = 0; i < secondLen; i += 1) {
        toFilterOut.add(second[i]);
      }
      while (idx < firstLen) {
        if (toFilterOut.add(first[idx])) {
          out[out.length] = first[idx];
        }
        idx += 1;
      }
      return out;
    });
    module2.exports = difference;
  }
});

// node_modules/ramda/src/differenceWith.js
var require_differenceWith = __commonJS({
  "node_modules/ramda/src/differenceWith.js"(exports2, module2) {
    var _includesWith = require_includesWith();
    var _curry3 = require_curry3();
    var differenceWith = /* @__PURE__ */ _curry3(function differenceWith2(pred, first, second) {
      var out = [];
      var idx = 0;
      var firstLen = first.length;
      while (idx < firstLen) {
        if (!_includesWith(pred, first[idx], second) && !_includesWith(pred, first[idx], out)) {
          out.push(first[idx]);
        }
        idx += 1;
      }
      return out;
    });
    module2.exports = differenceWith;
  }
});

// node_modules/ramda/src/remove.js
var require_remove = __commonJS({
  "node_modules/ramda/src/remove.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var remove = /* @__PURE__ */ _curry3(function remove2(start, count, list) {
      var result = Array.prototype.slice.call(list, 0);
      result.splice(start, count);
      return result;
    });
    module2.exports = remove;
  }
});

// node_modules/ramda/src/internal/_dissoc.js
var require_dissoc = __commonJS({
  "node_modules/ramda/src/internal/_dissoc.js"(exports2, module2) {
    var _isInteger = require_isInteger();
    var _isArray = require_isArray();
    var remove = require_remove();
    function _dissoc(prop, obj) {
      if (obj == null) {
        return obj;
      }
      if (_isInteger(prop) && _isArray(obj)) {
        return remove(prop, 1, obj);
      }
      var result = {};
      for (var p in obj) {
        result[p] = obj[p];
      }
      delete result[prop];
      return result;
    }
    module2.exports = _dissoc;
  }
});

// node_modules/ramda/src/dissocPath.js
var require_dissocPath = __commonJS({
  "node_modules/ramda/src/dissocPath.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dissoc = require_dissoc();
    var _isInteger = require_isInteger();
    var _isArray = require_isArray();
    var assoc = require_assoc2();
    function _shallowCloneObject(prop, obj) {
      if (_isInteger(prop) && _isArray(obj)) {
        return [].concat(obj);
      }
      var result = {};
      for (var p in obj) {
        result[p] = obj[p];
      }
      return result;
    }
    var dissocPath = /* @__PURE__ */ _curry2(function dissocPath2(path, obj) {
      if (obj == null) {
        return obj;
      }
      switch (path.length) {
        case 0:
          return obj;
        case 1:
          return _dissoc(path[0], obj);
        default:
          var head = path[0];
          var tail = Array.prototype.slice.call(path, 1);
          if (obj[head] == null) {
            return _shallowCloneObject(head, obj);
          } else {
            return assoc(head, dissocPath2(tail, obj[head]), obj);
          }
      }
    });
    module2.exports = dissocPath;
  }
});

// node_modules/ramda/src/dissoc.js
var require_dissoc2 = __commonJS({
  "node_modules/ramda/src/dissoc.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var dissocPath = require_dissocPath();
    var dissoc = /* @__PURE__ */ _curry2(function dissoc2(prop, obj) {
      return dissocPath([prop], obj);
    });
    module2.exports = dissoc;
  }
});

// node_modules/ramda/src/divide.js
var require_divide = __commonJS({
  "node_modules/ramda/src/divide.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var divide = /* @__PURE__ */ _curry2(function divide2(a, b) {
      return a / b;
    });
    module2.exports = divide;
  }
});

// node_modules/ramda/src/internal/_xdrop.js
var require_xdrop = __commonJS({
  "node_modules/ramda/src/internal/_xdrop.js"(exports2, module2) {
    var _xfBase = require_xfBase();
    var XDrop = /* @__PURE__ */ (function() {
      function XDrop2(n, xf) {
        this.xf = xf;
        this.n = n;
      }
      XDrop2.prototype["@@transducer/init"] = _xfBase.init;
      XDrop2.prototype["@@transducer/result"] = _xfBase.result;
      XDrop2.prototype["@@transducer/step"] = function(result, input) {
        if (this.n > 0) {
          this.n -= 1;
          return result;
        }
        return this.xf["@@transducer/step"](result, input);
      };
      return XDrop2;
    })();
    function _xdrop(n) {
      return function(xf) {
        return new XDrop(n, xf);
      };
    }
    module2.exports = _xdrop;
  }
});

// node_modules/ramda/src/drop.js
var require_drop = __commonJS({
  "node_modules/ramda/src/drop.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xdrop = require_xdrop();
    var slice = require_slice();
    var drop = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["drop"], _xdrop, function drop2(n, xs) {
      return slice(Math.max(0, n), Infinity, xs);
    }));
    module2.exports = drop;
  }
});

// node_modules/ramda/src/internal/_xtake.js
var require_xtake = __commonJS({
  "node_modules/ramda/src/internal/_xtake.js"(exports2, module2) {
    var _reduced = require_reduced();
    var _xfBase = require_xfBase();
    var XTake = /* @__PURE__ */ (function() {
      function XTake2(n, xf) {
        this.xf = xf;
        this.n = n;
        this.i = 0;
      }
      XTake2.prototype["@@transducer/init"] = _xfBase.init;
      XTake2.prototype["@@transducer/result"] = _xfBase.result;
      XTake2.prototype["@@transducer/step"] = function(result, input) {
        this.i += 1;
        var ret = this.n === 0 ? result : this.xf["@@transducer/step"](result, input);
        return this.n >= 0 && this.i >= this.n ? _reduced(ret) : ret;
      };
      return XTake2;
    })();
    function _xtake(n) {
      return function(xf) {
        return new XTake(n, xf);
      };
    }
    module2.exports = _xtake;
  }
});

// node_modules/ramda/src/take.js
var require_take = __commonJS({
  "node_modules/ramda/src/take.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xtake = require_xtake();
    var slice = require_slice();
    var take = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["take"], _xtake, function take2(n, xs) {
      return slice(0, n < 0 ? Infinity : n, xs);
    }));
    module2.exports = take;
  }
});

// node_modules/ramda/src/internal/_dropLast.js
var require_dropLast = __commonJS({
  "node_modules/ramda/src/internal/_dropLast.js"(exports2, module2) {
    var take = require_take();
    function dropLast(n, xs) {
      return take(n < xs.length ? xs.length - n : 0, xs);
    }
    module2.exports = dropLast;
  }
});

// node_modules/ramda/src/internal/_xdropLast.js
var require_xdropLast = __commonJS({
  "node_modules/ramda/src/internal/_xdropLast.js"(exports2, module2) {
    var _xfBase = require_xfBase();
    var XDropLast = /* @__PURE__ */ (function() {
      function XDropLast2(n, xf) {
        if (n <= 0) {
          return xf;
        }
        this.xf = xf;
        this.pos = 0;
        this.full = false;
        this.acc = new Array(n);
      }
      XDropLast2.prototype["@@transducer/init"] = _xfBase.init;
      XDropLast2.prototype["@@transducer/result"] = function(result) {
        this.acc = null;
        return this.xf["@@transducer/result"](result);
      };
      XDropLast2.prototype["@@transducer/step"] = function(result, input) {
        if (this.full) {
          result = this.xf["@@transducer/step"](result, this.acc[this.pos]);
        }
        this.store(input);
        return result;
      };
      XDropLast2.prototype.store = function(input) {
        this.acc[this.pos] = input;
        this.pos += 1;
        if (this.pos === this.acc.length) {
          this.pos = 0;
          this.full = true;
        }
      };
      return XDropLast2;
    })();
    function _xdropLast(n) {
      return function(xf) {
        return new XDropLast(n, xf);
      };
    }
    module2.exports = _xdropLast;
  }
});

// node_modules/ramda/src/dropLast.js
var require_dropLast2 = __commonJS({
  "node_modules/ramda/src/dropLast.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _dropLast = require_dropLast();
    var _xdropLast = require_xdropLast();
    var dropLast = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xdropLast, _dropLast));
    module2.exports = dropLast;
  }
});

// node_modules/ramda/src/internal/_dropLastWhile.js
var require_dropLastWhile = __commonJS({
  "node_modules/ramda/src/internal/_dropLastWhile.js"(exports2, module2) {
    var slice = require_slice();
    function dropLastWhile(pred, xs) {
      var idx = xs.length - 1;
      while (idx >= 0 && pred(xs[idx])) {
        idx -= 1;
      }
      return slice(0, idx + 1, xs);
    }
    module2.exports = dropLastWhile;
  }
});

// node_modules/ramda/src/internal/_xdropLastWhile.js
var require_xdropLastWhile = __commonJS({
  "node_modules/ramda/src/internal/_xdropLastWhile.js"(exports2, module2) {
    var _xfBase = require_xfBase();
    var _xReduce = require_xReduce();
    var XDropLastWhile = /* @__PURE__ */ (function() {
      function XDropLastWhile2(fn, xf) {
        this.f = fn;
        this.retained = [];
        this.xf = xf;
      }
      XDropLastWhile2.prototype["@@transducer/init"] = _xfBase.init;
      XDropLastWhile2.prototype["@@transducer/result"] = function(result) {
        this.retained = null;
        return this.xf["@@transducer/result"](result);
      };
      XDropLastWhile2.prototype["@@transducer/step"] = function(result, input) {
        return this.f(input) ? this.retain(result, input) : this.flush(result, input);
      };
      XDropLastWhile2.prototype.flush = function(result, input) {
        result = _xReduce(this.xf, result, this.retained);
        this.retained = [];
        return this.xf["@@transducer/step"](result, input);
      };
      XDropLastWhile2.prototype.retain = function(result, input) {
        this.retained.push(input);
        return result;
      };
      return XDropLastWhile2;
    })();
    function _xdropLastWhile(fn) {
      return function(xf) {
        return new XDropLastWhile(fn, xf);
      };
    }
    module2.exports = _xdropLastWhile;
  }
});

// node_modules/ramda/src/dropLastWhile.js
var require_dropLastWhile2 = __commonJS({
  "node_modules/ramda/src/dropLastWhile.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _dropLastWhile = require_dropLastWhile();
    var _xdropLastWhile = require_xdropLastWhile();
    var dropLastWhile = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xdropLastWhile, _dropLastWhile));
    module2.exports = dropLastWhile;
  }
});

// node_modules/ramda/src/internal/_xdropRepeatsWith.js
var require_xdropRepeatsWith = __commonJS({
  "node_modules/ramda/src/internal/_xdropRepeatsWith.js"(exports2, module2) {
    var _xfBase = require_xfBase();
    var XDropRepeatsWith = /* @__PURE__ */ (function() {
      function XDropRepeatsWith2(pred, xf) {
        this.xf = xf;
        this.pred = pred;
        this.lastValue = void 0;
        this.seenFirstValue = false;
      }
      XDropRepeatsWith2.prototype["@@transducer/init"] = _xfBase.init;
      XDropRepeatsWith2.prototype["@@transducer/result"] = _xfBase.result;
      XDropRepeatsWith2.prototype["@@transducer/step"] = function(result, input) {
        var sameAsLast = false;
        if (!this.seenFirstValue) {
          this.seenFirstValue = true;
        } else if (this.pred(this.lastValue, input)) {
          sameAsLast = true;
        }
        this.lastValue = input;
        return sameAsLast ? result : this.xf["@@transducer/step"](result, input);
      };
      return XDropRepeatsWith2;
    })();
    function _xdropRepeatsWith(pred) {
      return function(xf) {
        return new XDropRepeatsWith(pred, xf);
      };
    }
    module2.exports = _xdropRepeatsWith;
  }
});

// node_modules/ramda/src/last.js
var require_last = __commonJS({
  "node_modules/ramda/src/last.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _nth = require_nth();
    var last = /* @__PURE__ */ _curry1(function(list) {
      return _nth(-1, list);
    });
    module2.exports = last;
  }
});

// node_modules/ramda/src/dropRepeatsWith.js
var require_dropRepeatsWith = __commonJS({
  "node_modules/ramda/src/dropRepeatsWith.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xdropRepeatsWith = require_xdropRepeatsWith();
    var last = require_last();
    var dropRepeatsWith = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xdropRepeatsWith, function dropRepeatsWith2(pred, list) {
      var result = [];
      var idx = 1;
      var len = list.length;
      if (len !== 0) {
        result[0] = list[0];
        while (idx < len) {
          if (!pred(last(result), list[idx])) {
            result[result.length] = list[idx];
          }
          idx += 1;
        }
      }
      return result;
    }));
    module2.exports = dropRepeatsWith;
  }
});

// node_modules/ramda/src/dropRepeats.js
var require_dropRepeats = __commonJS({
  "node_modules/ramda/src/dropRepeats.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _dispatchable = require_dispatchable();
    var _xdropRepeatsWith = require_xdropRepeatsWith();
    var dropRepeatsWith = require_dropRepeatsWith();
    var equals = require_equals2();
    var dropRepeats = /* @__PURE__ */ _curry1(/* @__PURE__ */ _dispatchable([], function() {
      return _xdropRepeatsWith(equals);
    }, /* @__PURE__ */ dropRepeatsWith(equals)));
    module2.exports = dropRepeats;
  }
});

// node_modules/ramda/src/eqBy.js
var require_eqBy = __commonJS({
  "node_modules/ramda/src/eqBy.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var equals = require_equals2();
    var eqBy = /* @__PURE__ */ _curry3(function eqBy2(f, x, y) {
      return equals(f(x), f(y));
    });
    module2.exports = eqBy;
  }
});

// node_modules/ramda/src/dropRepeatsBy.js
var require_dropRepeatsBy = __commonJS({
  "node_modules/ramda/src/dropRepeatsBy.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xdropRepeatsWith = require_xdropRepeatsWith();
    var dropRepeatsWith = require_dropRepeatsWith();
    var eqBy = require_eqBy();
    var dropRepeatsBy = /* @__PURE__ */ _curry2(function(fn, list) {
      return _dispatchable([], function() {
        return _xdropRepeatsWith(eqBy(fn));
      }, dropRepeatsWith(eqBy(fn)))(list);
    });
    module2.exports = dropRepeatsBy;
  }
});

// node_modules/ramda/src/internal/_xdropWhile.js
var require_xdropWhile = __commonJS({
  "node_modules/ramda/src/internal/_xdropWhile.js"(exports2, module2) {
    var _xfBase = require_xfBase();
    var XDropWhile = /* @__PURE__ */ (function() {
      function XDropWhile2(f, xf) {
        this.xf = xf;
        this.f = f;
      }
      XDropWhile2.prototype["@@transducer/init"] = _xfBase.init;
      XDropWhile2.prototype["@@transducer/result"] = _xfBase.result;
      XDropWhile2.prototype["@@transducer/step"] = function(result, input) {
        if (this.f) {
          if (this.f(input)) {
            return result;
          }
          this.f = null;
        }
        return this.xf["@@transducer/step"](result, input);
      };
      return XDropWhile2;
    })();
    function _xdropWhile(f) {
      return function(xf) {
        return new XDropWhile(f, xf);
      };
    }
    module2.exports = _xdropWhile;
  }
});

// node_modules/ramda/src/dropWhile.js
var require_dropWhile = __commonJS({
  "node_modules/ramda/src/dropWhile.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xdropWhile = require_xdropWhile();
    var slice = require_slice();
    var dropWhile = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["dropWhile"], _xdropWhile, function dropWhile2(pred, xs) {
      var idx = 0;
      var len = xs.length;
      while (idx < len && pred(xs[idx])) {
        idx += 1;
      }
      return slice(idx, Infinity, xs);
    }));
    module2.exports = dropWhile;
  }
});

// node_modules/ramda/src/or.js
var require_or = __commonJS({
  "node_modules/ramda/src/or.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var or = /* @__PURE__ */ _curry2(function or2(a, b) {
      return a || b;
    });
    module2.exports = or;
  }
});

// node_modules/ramda/src/either.js
var require_either = __commonJS({
  "node_modules/ramda/src/either.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _isFunction = require_isFunction();
    var lift = require_lift();
    var or = require_or();
    var either = /* @__PURE__ */ _curry2(function either2(f, g) {
      return _isFunction(f) ? function _either() {
        return f.apply(this, arguments) || g.apply(this, arguments);
      } : lift(or)(f, g);
    });
    module2.exports = either;
  }
});

// node_modules/ramda/src/internal/_isTypedArray.js
var require_isTypedArray = __commonJS({
  "node_modules/ramda/src/internal/_isTypedArray.js"(exports2, module2) {
    function _isTypedArray(val) {
      var type = Object.prototype.toString.call(val);
      return type === "[object Uint8ClampedArray]" || type === "[object Int8Array]" || type === "[object Uint8Array]" || type === "[object Int16Array]" || type === "[object Uint16Array]" || type === "[object Int32Array]" || type === "[object Uint32Array]" || type === "[object Float32Array]" || type === "[object Float64Array]" || type === "[object BigInt64Array]" || type === "[object BigUint64Array]";
    }
    module2.exports = _isTypedArray;
  }
});

// node_modules/ramda/src/empty.js
var require_empty = __commonJS({
  "node_modules/ramda/src/empty.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _isArguments = require_isArguments();
    var _isArray = require_isArray();
    var _isObject = require_isObject();
    var _isString = require_isString();
    var _isTypedArray = require_isTypedArray();
    var empty = /* @__PURE__ */ _curry1(function empty2(x) {
      return x != null && typeof x["fantasy-land/empty"] === "function" ? x["fantasy-land/empty"]() : x != null && x.constructor != null && typeof x.constructor["fantasy-land/empty"] === "function" ? x.constructor["fantasy-land/empty"]() : x != null && typeof x.empty === "function" ? x.empty() : x != null && x.constructor != null && typeof x.constructor.empty === "function" ? x.constructor.empty() : x == Set || x instanceof Set ? /* @__PURE__ */ new Set() : x == Map || x instanceof Map ? /* @__PURE__ */ new Map() : _isArray(x) ? [] : _isString(x) ? "" : _isObject(x) ? {} : _isArguments(x) ? /* @__PURE__ */ (function() {
        return arguments;
      })() : _isTypedArray(x) ? x.constructor.from("") : void 0;
    });
    module2.exports = empty;
  }
});

// node_modules/ramda/src/takeLast.js
var require_takeLast = __commonJS({
  "node_modules/ramda/src/takeLast.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var drop = require_drop();
    var takeLast = /* @__PURE__ */ _curry2(function takeLast2(n, xs) {
      return drop(n >= 0 ? xs.length - n : 0, xs);
    });
    module2.exports = takeLast;
  }
});

// node_modules/ramda/src/endsWith.js
var require_endsWith = __commonJS({
  "node_modules/ramda/src/endsWith.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var equals = require_equals2();
    var takeLast = require_takeLast();
    var endsWith = /* @__PURE__ */ _curry2(function(suffix, list) {
      return equals(takeLast(suffix.length, list), suffix);
    });
    module2.exports = endsWith;
  }
});

// node_modules/ramda/src/eqProps.js
var require_eqProps = __commonJS({
  "node_modules/ramda/src/eqProps.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var equals = require_equals2();
    var eqProps = /* @__PURE__ */ _curry3(function eqProps2(prop, obj1, obj2) {
      return equals(obj1[prop], obj2[prop]);
    });
    module2.exports = eqProps;
  }
});

// node_modules/ramda/src/evolve.js
var require_evolve = __commonJS({
  "node_modules/ramda/src/evolve.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _isArray = require_isArray();
    var _isObject = require_isObject();
    var evolve = /* @__PURE__ */ _curry2(function evolve2(transformations, object) {
      if (!_isObject(object) && !_isArray(object)) {
        return object;
      }
      var result = object instanceof Array ? [] : {};
      var transformation, key, type;
      for (key in object) {
        transformation = transformations[key];
        type = typeof transformation;
        result[key] = type === "function" ? transformation(object[key]) : transformation && type === "object" ? evolve2(transformation, object[key]) : object[key];
      }
      return result;
    });
    module2.exports = evolve;
  }
});

// node_modules/ramda/src/internal/_xfind.js
var require_xfind = __commonJS({
  "node_modules/ramda/src/internal/_xfind.js"(exports2, module2) {
    var _reduced = require_reduced();
    var _xfBase = require_xfBase();
    var XFind = /* @__PURE__ */ (function() {
      function XFind2(f, xf) {
        this.xf = xf;
        this.f = f;
        this.found = false;
      }
      XFind2.prototype["@@transducer/init"] = _xfBase.init;
      XFind2.prototype["@@transducer/result"] = function(result) {
        if (!this.found) {
          result = this.xf["@@transducer/step"](result, void 0);
        }
        return this.xf["@@transducer/result"](result);
      };
      XFind2.prototype["@@transducer/step"] = function(result, input) {
        if (this.f(input)) {
          this.found = true;
          result = _reduced(this.xf["@@transducer/step"](result, input));
        }
        return result;
      };
      return XFind2;
    })();
    function _xfind(f) {
      return function(xf) {
        return new XFind(f, xf);
      };
    }
    module2.exports = _xfind;
  }
});

// node_modules/ramda/src/find.js
var require_find = __commonJS({
  "node_modules/ramda/src/find.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xfind = require_xfind();
    var find = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["find"], _xfind, function find2(fn, list) {
      var idx = 0;
      var len = list.length;
      while (idx < len) {
        if (fn(list[idx])) {
          return list[idx];
        }
        idx += 1;
      }
    }));
    module2.exports = find;
  }
});

// node_modules/ramda/src/internal/_xfindIndex.js
var require_xfindIndex = __commonJS({
  "node_modules/ramda/src/internal/_xfindIndex.js"(exports2, module2) {
    var _reduced = require_reduced();
    var _xfBase = require_xfBase();
    var XFindIndex = /* @__PURE__ */ (function() {
      function XFindIndex2(f, xf) {
        this.xf = xf;
        this.f = f;
        this.idx = -1;
        this.found = false;
      }
      XFindIndex2.prototype["@@transducer/init"] = _xfBase.init;
      XFindIndex2.prototype["@@transducer/result"] = function(result) {
        if (!this.found) {
          result = this.xf["@@transducer/step"](result, -1);
        }
        return this.xf["@@transducer/result"](result);
      };
      XFindIndex2.prototype["@@transducer/step"] = function(result, input) {
        this.idx += 1;
        if (this.f(input)) {
          this.found = true;
          result = _reduced(this.xf["@@transducer/step"](result, this.idx));
        }
        return result;
      };
      return XFindIndex2;
    })();
    function _xfindIndex(f) {
      return function(xf) {
        return new XFindIndex(f, xf);
      };
    }
    module2.exports = _xfindIndex;
  }
});

// node_modules/ramda/src/findIndex.js
var require_findIndex = __commonJS({
  "node_modules/ramda/src/findIndex.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xfindIndex = require_xfindIndex();
    var findIndex = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xfindIndex, function findIndex2(fn, list) {
      var idx = 0;
      var len = list.length;
      while (idx < len) {
        if (fn(list[idx])) {
          return idx;
        }
        idx += 1;
      }
      return -1;
    }));
    module2.exports = findIndex;
  }
});

// node_modules/ramda/src/internal/_xfindLast.js
var require_xfindLast = __commonJS({
  "node_modules/ramda/src/internal/_xfindLast.js"(exports2, module2) {
    var _xfBase = require_xfBase();
    var XFindLast = /* @__PURE__ */ (function() {
      function XFindLast2(f, xf) {
        this.xf = xf;
        this.f = f;
      }
      XFindLast2.prototype["@@transducer/init"] = _xfBase.init;
      XFindLast2.prototype["@@transducer/result"] = function(result) {
        return this.xf["@@transducer/result"](this.xf["@@transducer/step"](result, this.last));
      };
      XFindLast2.prototype["@@transducer/step"] = function(result, input) {
        if (this.f(input)) {
          this.last = input;
        }
        return result;
      };
      return XFindLast2;
    })();
    function _xfindLast(f) {
      return function(xf) {
        return new XFindLast(f, xf);
      };
    }
    module2.exports = _xfindLast;
  }
});

// node_modules/ramda/src/findLast.js
var require_findLast = __commonJS({
  "node_modules/ramda/src/findLast.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xfindLast = require_xfindLast();
    var findLast = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xfindLast, function findLast2(fn, list) {
      var idx = list.length - 1;
      while (idx >= 0) {
        if (fn(list[idx])) {
          return list[idx];
        }
        idx -= 1;
      }
    }));
    module2.exports = findLast;
  }
});

// node_modules/ramda/src/internal/_xfindLastIndex.js
var require_xfindLastIndex = __commonJS({
  "node_modules/ramda/src/internal/_xfindLastIndex.js"(exports2, module2) {
    var _xfBase = require_xfBase();
    var XFindLastIndex = /* @__PURE__ */ (function() {
      function XFindLastIndex2(f, xf) {
        this.xf = xf;
        this.f = f;
        this.idx = -1;
        this.lastIdx = -1;
      }
      XFindLastIndex2.prototype["@@transducer/init"] = _xfBase.init;
      XFindLastIndex2.prototype["@@transducer/result"] = function(result) {
        return this.xf["@@transducer/result"](this.xf["@@transducer/step"](result, this.lastIdx));
      };
      XFindLastIndex2.prototype["@@transducer/step"] = function(result, input) {
        this.idx += 1;
        if (this.f(input)) {
          this.lastIdx = this.idx;
        }
        return result;
      };
      return XFindLastIndex2;
    })();
    function _xfindLastIndex(f) {
      return function(xf) {
        return new XFindLastIndex(f, xf);
      };
    }
    module2.exports = _xfindLastIndex;
  }
});

// node_modules/ramda/src/findLastIndex.js
var require_findLastIndex = __commonJS({
  "node_modules/ramda/src/findLastIndex.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xfindLastIndex = require_xfindLastIndex();
    var findLastIndex = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xfindLastIndex, function findLastIndex2(fn, list) {
      var idx = list.length - 1;
      while (idx >= 0) {
        if (fn(list[idx])) {
          return idx;
        }
        idx -= 1;
      }
      return -1;
    }));
    module2.exports = findLastIndex;
  }
});

// node_modules/ramda/src/flatten.js
var require_flatten = __commonJS({
  "node_modules/ramda/src/flatten.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _makeFlat = require_makeFlat();
    var flatten = /* @__PURE__ */ _curry1(/* @__PURE__ */ _makeFlat(true));
    module2.exports = flatten;
  }
});

// node_modules/ramda/src/flip.js
var require_flip = __commonJS({
  "node_modules/ramda/src/flip.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var curryN = require_curryN2();
    var flip = /* @__PURE__ */ _curry1(function flip2(fn) {
      return curryN(fn.length, function(a, b) {
        var args = Array.prototype.slice.call(arguments, 0);
        args[0] = b;
        args[1] = a;
        return fn.apply(this, args);
      });
    });
    module2.exports = flip;
  }
});

// node_modules/ramda/src/flow.js
var require_flow = __commonJS({
  "node_modules/ramda/src/flow.js"(exports2, module2) {
    var applyTo = require_applyTo();
    var _curry2 = require_curry2();
    var _reduce = require_reduce2();
    var flow = /* @__PURE__ */ _curry2(function flow2(seed, pipeline) {
      return _reduce(applyTo, seed, pipeline);
    });
    module2.exports = flow;
  }
});

// node_modules/ramda/src/forEach.js
var require_forEach = __commonJS({
  "node_modules/ramda/src/forEach.js"(exports2, module2) {
    var _checkForMethod = require_checkForMethod();
    var _curry2 = require_curry2();
    var forEach = /* @__PURE__ */ _curry2(/* @__PURE__ */ _checkForMethod("forEach", function forEach2(fn, list) {
      var len = list.length;
      var idx = 0;
      while (idx < len) {
        fn(list[idx]);
        idx += 1;
      }
      return list;
    }));
    module2.exports = forEach;
  }
});

// node_modules/ramda/src/forEachObjIndexed.js
var require_forEachObjIndexed = __commonJS({
  "node_modules/ramda/src/forEachObjIndexed.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var keys = require_keys();
    var forEachObjIndexed = /* @__PURE__ */ _curry2(function forEachObjIndexed2(fn, obj) {
      var keyList = keys(obj);
      var idx = 0;
      while (idx < keyList.length) {
        var key = keyList[idx];
        fn(obj[key], key, obj);
        idx += 1;
      }
      return obj;
    });
    module2.exports = forEachObjIndexed;
  }
});

// node_modules/ramda/src/internal/_fromPairs.js
var require_fromPairs = __commonJS({
  "node_modules/ramda/src/internal/_fromPairs.js"(exports2, module2) {
    function fromPairs(pairs) {
      var result = {};
      var idx = 0;
      while (idx < pairs.length) {
        result[pairs[idx][0]] = pairs[idx][1];
        idx += 1;
      }
      return result;
    }
    module2.exports = fromPairs;
  }
});

// node_modules/ramda/src/fromPairs.js
var require_fromPairs2 = __commonJS({
  "node_modules/ramda/src/fromPairs.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _fromPairs = require_fromPairs();
    var fromPairs = /* @__PURE__ */ _curry1(_fromPairs);
    module2.exports = fromPairs;
  }
});

// node_modules/ramda/src/groupBy.js
var require_groupBy = __commonJS({
  "node_modules/ramda/src/groupBy.js"(exports2, module2) {
    var _checkForMethod = require_checkForMethod();
    var _curry2 = require_curry2();
    var reduceBy = require_reduceBy();
    var groupBy = /* @__PURE__ */ _curry2(/* @__PURE__ */ _checkForMethod("groupBy", /* @__PURE__ */ reduceBy(function(acc, item) {
      acc.push(item);
      return acc;
    }, [])));
    module2.exports = groupBy;
  }
});

// node_modules/ramda/src/groupWith.js
var require_groupWith = __commonJS({
  "node_modules/ramda/src/groupWith.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var groupWith = /* @__PURE__ */ _curry2(function(fn, list) {
      var res = [];
      var idx = 0;
      var len = list.length;
      while (idx < len) {
        var nextidx = idx + 1;
        while (nextidx < len && fn(list[nextidx - 1], list[nextidx])) {
          nextidx += 1;
        }
        res.push(list.slice(idx, nextidx));
        idx = nextidx;
      }
      return res;
    });
    module2.exports = groupWith;
  }
});

// node_modules/ramda/src/gt.js
var require_gt = __commonJS({
  "node_modules/ramda/src/gt.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var gt = /* @__PURE__ */ _curry2(function gt2(a, b) {
      return a > b;
    });
    module2.exports = gt;
  }
});

// node_modules/ramda/src/gte.js
var require_gte = __commonJS({
  "node_modules/ramda/src/gte.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var gte = /* @__PURE__ */ _curry2(function gte2(a, b) {
      return a >= b;
    });
    module2.exports = gte;
  }
});

// node_modules/ramda/src/hasPath.js
var require_hasPath = __commonJS({
  "node_modules/ramda/src/hasPath.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _has = require_has();
    var isNil = require_isNil();
    var hasPath = /* @__PURE__ */ _curry2(function hasPath2(_path, obj) {
      if (_path.length === 0 || isNil(obj)) {
        return false;
      }
      var val = obj;
      var idx = 0;
      while (idx < _path.length) {
        if (!isNil(val) && _has(_path[idx], val)) {
          val = val[_path[idx]];
          idx += 1;
        } else {
          return false;
        }
      }
      return true;
    });
    module2.exports = hasPath;
  }
});

// node_modules/ramda/src/has.js
var require_has2 = __commonJS({
  "node_modules/ramda/src/has.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var hasPath = require_hasPath();
    var has = /* @__PURE__ */ _curry2(function has2(prop, obj) {
      return hasPath([prop], obj);
    });
    module2.exports = has;
  }
});

// node_modules/ramda/src/hasIn.js
var require_hasIn = __commonJS({
  "node_modules/ramda/src/hasIn.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var isNil = require_isNil();
    var hasIn = /* @__PURE__ */ _curry2(function hasIn2(prop, obj) {
      if (isNil(obj)) {
        return false;
      }
      return prop in obj;
    });
    module2.exports = hasIn;
  }
});

// node_modules/ramda/src/identical.js
var require_identical = __commonJS({
  "node_modules/ramda/src/identical.js"(exports2, module2) {
    var _objectIs = require_objectIs();
    var identical = function(a, b) {
      switch (arguments.length) {
        case 0:
          return identical;
        case 1:
          return /* @__PURE__ */ (function() {
            return function unaryIdentical(_b) {
              switch (arguments.length) {
                case 0:
                  return unaryIdentical;
                default:
                  return _objectIs(a, _b);
              }
            };
          })();
        default:
          return _objectIs(a, b);
      }
    };
    module2.exports = identical;
  }
});

// node_modules/ramda/src/ifElse.js
var require_ifElse = __commonJS({
  "node_modules/ramda/src/ifElse.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var curryN = require_curryN2();
    var ifElse = /* @__PURE__ */ _curry3(function ifElse2(condition, onTrue, onFalse) {
      return curryN(Math.max(condition.length, onTrue.length, onFalse.length), function _ifElse() {
        return condition.apply(this, arguments) ? onTrue.apply(this, arguments) : onFalse.apply(this, arguments);
      });
    });
    module2.exports = ifElse;
  }
});

// node_modules/ramda/src/inc.js
var require_inc = __commonJS({
  "node_modules/ramda/src/inc.js"(exports2, module2) {
    var add = require_add();
    var inc = /* @__PURE__ */ add(1);
    module2.exports = inc;
  }
});

// node_modules/ramda/src/includes.js
var require_includes2 = __commonJS({
  "node_modules/ramda/src/includes.js"(exports2, module2) {
    var _includes = require_includes();
    var _curry2 = require_curry2();
    var includes = /* @__PURE__ */ _curry2(_includes);
    module2.exports = includes;
  }
});

// node_modules/ramda/src/indexBy.js
var require_indexBy = __commonJS({
  "node_modules/ramda/src/indexBy.js"(exports2, module2) {
    var reduceBy = require_reduceBy();
    var indexBy = /* @__PURE__ */ reduceBy(function(acc, elem) {
      return elem;
    }, null);
    module2.exports = indexBy;
  }
});

// node_modules/ramda/src/indexOf.js
var require_indexOf2 = __commonJS({
  "node_modules/ramda/src/indexOf.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _indexOf = require_indexOf();
    var _isArray = require_isArray();
    var indexOf = /* @__PURE__ */ _curry2(function indexOf2(target, xs) {
      return typeof xs.indexOf === "function" && !_isArray(xs) ? xs.indexOf(target) : _indexOf(xs, target, 0);
    });
    module2.exports = indexOf;
  }
});

// node_modules/ramda/src/init.js
var require_init = __commonJS({
  "node_modules/ramda/src/init.js"(exports2, module2) {
    var slice = require_slice();
    var init = /* @__PURE__ */ slice(0, -1);
    module2.exports = init;
  }
});

// node_modules/ramda/src/innerJoin.js
var require_innerJoin = __commonJS({
  "node_modules/ramda/src/innerJoin.js"(exports2, module2) {
    var _includesWith = require_includesWith();
    var _curry3 = require_curry3();
    var _filter = require_filter();
    var innerJoin = /* @__PURE__ */ _curry3(function innerJoin2(pred, xs, ys) {
      return _filter(function(x) {
        return _includesWith(pred, x, ys);
      }, xs);
    });
    module2.exports = innerJoin;
  }
});

// node_modules/ramda/src/insert.js
var require_insert = __commonJS({
  "node_modules/ramda/src/insert.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var insert = /* @__PURE__ */ _curry3(function insert2(idx, elt, list) {
      idx = idx < list.length && idx >= 0 ? idx : list.length;
      var result = Array.prototype.slice.call(list, 0);
      result.splice(idx, 0, elt);
      return result;
    });
    module2.exports = insert;
  }
});

// node_modules/ramda/src/insertAll.js
var require_insertAll = __commonJS({
  "node_modules/ramda/src/insertAll.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var insertAll = /* @__PURE__ */ _curry3(function insertAll2(idx, elts, list) {
      idx = idx < list.length && idx >= 0 ? idx : list.length;
      return [].concat(Array.prototype.slice.call(list, 0, idx), elts, Array.prototype.slice.call(list, idx));
    });
    module2.exports = insertAll;
  }
});

// node_modules/ramda/src/internal/_xuniqBy.js
var require_xuniqBy = __commonJS({
  "node_modules/ramda/src/internal/_xuniqBy.js"(exports2, module2) {
    var _Set = require_Set();
    var _xfBase = require_xfBase();
    var XUniqBy = /* @__PURE__ */ (function() {
      function XUniqBy2(f, xf) {
        this.xf = xf;
        this.f = f;
        this.set = new _Set();
      }
      XUniqBy2.prototype["@@transducer/init"] = _xfBase.init;
      XUniqBy2.prototype["@@transducer/result"] = _xfBase.result;
      XUniqBy2.prototype["@@transducer/step"] = function(result, input) {
        return this.set.add(this.f(input)) ? this.xf["@@transducer/step"](result, input) : result;
      };
      return XUniqBy2;
    })();
    function _xuniqBy(f) {
      return function(xf) {
        return new XUniqBy(f, xf);
      };
    }
    module2.exports = _xuniqBy;
  }
});

// node_modules/ramda/src/uniqBy.js
var require_uniqBy = __commonJS({
  "node_modules/ramda/src/uniqBy.js"(exports2, module2) {
    var _Set = require_Set();
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xuniqBy = require_xuniqBy();
    var uniqBy = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xuniqBy, function(fn, list) {
      var set = new _Set();
      var result = [];
      var idx = 0;
      var appliedItem, item;
      while (idx < list.length) {
        item = list[idx];
        appliedItem = fn(item);
        if (set.add(appliedItem)) {
          result.push(item);
        }
        idx += 1;
      }
      return result;
    }));
    module2.exports = uniqBy;
  }
});

// node_modules/ramda/src/uniq.js
var require_uniq = __commonJS({
  "node_modules/ramda/src/uniq.js"(exports2, module2) {
    var identity = require_identity2();
    var uniqBy = require_uniqBy();
    var uniq = /* @__PURE__ */ uniqBy(identity);
    module2.exports = uniq;
  }
});

// node_modules/ramda/src/intersection.js
var require_intersection = __commonJS({
  "node_modules/ramda/src/intersection.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _filter = require_filter();
    var _Set = require_Set();
    var uniq = require_uniq();
    var intersection = /* @__PURE__ */ _curry2(function intersection2(list1, list2) {
      var toKeep = new _Set();
      for (var i = 0; i < list1.length; i += 1) {
        toKeep.add(list1[i]);
      }
      return uniq(_filter(toKeep.has.bind(toKeep), list2));
    });
    module2.exports = intersection;
  }
});

// node_modules/ramda/src/intersperse.js
var require_intersperse = __commonJS({
  "node_modules/ramda/src/intersperse.js"(exports2, module2) {
    var _checkForMethod = require_checkForMethod();
    var _curry2 = require_curry2();
    var intersperse = /* @__PURE__ */ _curry2(/* @__PURE__ */ _checkForMethod("intersperse", function _intersperse(separator, list) {
      var length = list.length;
      if (length === 0) {
        return [];
      }
      var out = Array(length * 2 - 1);
      var idx = 0;
      while (idx < length) {
        var i = idx * 2;
        if (idx === length - 1) {
          out[i] = list[idx];
        } else {
          out[i] = list[idx];
          out[i + 1] = separator;
        }
        idx += 1;
      }
      return out;
    }));
    module2.exports = intersperse;
  }
});

// node_modules/ramda/src/internal/_objectAssign.js
var require_objectAssign = __commonJS({
  "node_modules/ramda/src/internal/_objectAssign.js"(exports2, module2) {
    var _has = require_has();
    function _objectAssign(target) {
      if (target == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      var output = Object(target);
      var idx = 1;
      var length = arguments.length;
      while (idx < length) {
        var source = arguments[idx];
        if (source != null) {
          for (var nextKey in source) {
            if (_has(nextKey, source)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
        idx += 1;
      }
      return output;
    }
    module2.exports = typeof Object.assign === "function" ? Object.assign : _objectAssign;
  }
});

// node_modules/ramda/src/objOf.js
var require_objOf = __commonJS({
  "node_modules/ramda/src/objOf.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var objOf = /* @__PURE__ */ _curry2(function objOf2(key, val) {
      var obj = {};
      obj[key] = val;
      return obj;
    });
    module2.exports = objOf;
  }
});

// node_modules/ramda/src/internal/_stepCat.js
var require_stepCat = __commonJS({
  "node_modules/ramda/src/internal/_stepCat.js"(exports2, module2) {
    var _objectAssign = require_objectAssign();
    var _identity = require_identity();
    var _isArrayLike = require_isArrayLike();
    var _isTransformer = require_isTransformer();
    var objOf = require_objOf();
    var _stepCatArray = {
      "@@transducer/init": Array,
      "@@transducer/step": function(xs, x) {
        xs.push(x);
        return xs;
      },
      "@@transducer/result": _identity
    };
    var _stepCatString = {
      "@@transducer/init": String,
      "@@transducer/step": function(a, b) {
        return a + b;
      },
      "@@transducer/result": _identity
    };
    var _stepCatObject = {
      "@@transducer/init": Object,
      "@@transducer/step": function(result, input) {
        return _objectAssign(result, _isArrayLike(input) ? objOf(input[0], input[1]) : input);
      },
      "@@transducer/result": _identity
    };
    function _stepCat(obj) {
      if (_isTransformer(obj)) {
        return obj;
      }
      if (_isArrayLike(obj)) {
        return _stepCatArray;
      }
      if (typeof obj === "string") {
        return _stepCatString;
      }
      if (typeof obj === "object") {
        return _stepCatObject;
      }
      throw new Error("Cannot create transformer for " + obj);
    }
    module2.exports = _stepCat;
  }
});

// node_modules/ramda/src/into.js
var require_into = __commonJS({
  "node_modules/ramda/src/into.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var _isTransformer = require_isTransformer();
    var _xReduce = require_xReduce();
    var _stepCat = require_stepCat();
    var into = /* @__PURE__ */ _curry3(function into2(acc, transducer, list) {
      var xf = transducer(_isTransformer(acc) ? acc : _stepCat(acc));
      return _xReduce(xf, xf["@@transducer/init"](), list);
    });
    module2.exports = into;
  }
});

// node_modules/ramda/src/invert.js
var require_invert = __commonJS({
  "node_modules/ramda/src/invert.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _has = require_has();
    var keys = require_keys();
    var invert = /* @__PURE__ */ _curry1(function invert2(obj) {
      var props = keys(obj);
      var len = props.length;
      var idx = 0;
      var out = {};
      while (idx < len) {
        var key = props[idx];
        var val = obj[key];
        var list = _has(val, out) ? out[val] : out[val] = [];
        list[list.length] = key;
        idx += 1;
      }
      return out;
    });
    module2.exports = invert;
  }
});

// node_modules/ramda/src/invertObj.js
var require_invertObj = __commonJS({
  "node_modules/ramda/src/invertObj.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var keys = require_keys();
    var invertObj = /* @__PURE__ */ _curry1(function invertObj2(obj) {
      var props = keys(obj);
      var len = props.length;
      var idx = 0;
      var out = {};
      while (idx < len) {
        var key = props[idx];
        out[obj[key]] = key;
        idx += 1;
      }
      return out;
    });
    module2.exports = invertObj;
  }
});

// node_modules/ramda/src/invoker.js
var require_invoker = __commonJS({
  "node_modules/ramda/src/invoker.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _isFunction = require_isFunction();
    var curryN = require_curryN2();
    var toString = require_toString2();
    var invoker = /* @__PURE__ */ _curry2(function invoker2(arity, method) {
      return curryN(arity + 1, function() {
        var target = arguments[arity];
        if (target != null && _isFunction(target[method])) {
          return target[method].apply(target, Array.prototype.slice.call(arguments, 0, arity));
        }
        throw new TypeError(toString(target) + ' does not have a method named "' + method + '"');
      });
    });
    module2.exports = invoker;
  }
});

// node_modules/ramda/src/is.js
var require_is = __commonJS({
  "node_modules/ramda/src/is.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var is = /* @__PURE__ */ _curry2(function is2(Ctor, val) {
      return val instanceof Ctor || val != null && (val.constructor === Ctor || Ctor.name === "Object" && typeof val === "object");
    });
    module2.exports = is;
  }
});

// node_modules/ramda/src/isEmpty.js
var require_isEmpty = __commonJS({
  "node_modules/ramda/src/isEmpty.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var empty = require_empty();
    var equals = require_equals2();
    var isEmpty = /* @__PURE__ */ _curry1(function isEmpty2(x) {
      return x != null && equals(x, empty(x));
    });
    module2.exports = isEmpty;
  }
});

// node_modules/ramda/src/isNotEmpty.js
var require_isNotEmpty = __commonJS({
  "node_modules/ramda/src/isNotEmpty.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var isEmpty = require_isEmpty();
    var isNotEmpty = /* @__PURE__ */ _curry1(function isNotEmpty2(x) {
      return !isEmpty(x);
    });
    module2.exports = isNotEmpty;
  }
});

// node_modules/ramda/src/isNotNil.js
var require_isNotNil = __commonJS({
  "node_modules/ramda/src/isNotNil.js"(exports2, module2) {
    var isNil = require_isNil();
    var _curry1 = require_curry1();
    var isNotNil = /* @__PURE__ */ _curry1(function isNotNil2(x) {
      return !isNil(x);
    });
    module2.exports = isNotNil;
  }
});

// node_modules/ramda/src/join.js
var require_join = __commonJS({
  "node_modules/ramda/src/join.js"(exports2, module2) {
    var invoker = require_invoker();
    var join = /* @__PURE__ */ invoker(1, "join");
    module2.exports = join;
  }
});

// node_modules/ramda/src/juxt.js
var require_juxt = __commonJS({
  "node_modules/ramda/src/juxt.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var converge = require_converge();
    var juxt = /* @__PURE__ */ _curry1(function juxt2(fns) {
      return converge(function() {
        return Array.prototype.slice.call(arguments, 0);
      }, fns);
    });
    module2.exports = juxt;
  }
});

// node_modules/ramda/src/keysIn.js
var require_keysIn = __commonJS({
  "node_modules/ramda/src/keysIn.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var keysIn = /* @__PURE__ */ _curry1(function keysIn2(obj) {
      var prop;
      var ks = [];
      for (prop in obj) {
        ks[ks.length] = prop;
      }
      return ks;
    });
    module2.exports = keysIn;
  }
});

// node_modules/ramda/src/lastIndexOf.js
var require_lastIndexOf = __commonJS({
  "node_modules/ramda/src/lastIndexOf.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _isArray = require_isArray();
    var equals = require_equals2();
    var lastIndexOf = /* @__PURE__ */ _curry2(function lastIndexOf2(target, xs) {
      if (typeof xs.lastIndexOf === "function" && !_isArray(xs)) {
        return xs.lastIndexOf(target);
      } else {
        var idx = xs.length - 1;
        while (idx >= 0) {
          if (equals(xs[idx], target)) {
            return idx;
          }
          idx -= 1;
        }
        return -1;
      }
    });
    module2.exports = lastIndexOf;
  }
});

// node_modules/ramda/src/internal/_isNumber.js
var require_isNumber = __commonJS({
  "node_modules/ramda/src/internal/_isNumber.js"(exports2, module2) {
    function _isNumber(x) {
      return Object.prototype.toString.call(x) === "[object Number]";
    }
    module2.exports = _isNumber;
  }
});

// node_modules/ramda/src/length.js
var require_length = __commonJS({
  "node_modules/ramda/src/length.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _isNumber = require_isNumber();
    var length = /* @__PURE__ */ _curry1(function length2(list) {
      return list != null && _isNumber(list.length) ? list.length : NaN;
    });
    module2.exports = length;
  }
});

// node_modules/ramda/src/lens.js
var require_lens = __commonJS({
  "node_modules/ramda/src/lens.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var map = require_map2();
    var lens = /* @__PURE__ */ _curry2(function lens2(getter, setter) {
      return function(toFunctorFn) {
        return function(target) {
          return map(function(focus) {
            return setter(focus, target);
          }, toFunctorFn(getter(target)));
        };
      };
    });
    module2.exports = lens;
  }
});

// node_modules/ramda/src/update.js
var require_update = __commonJS({
  "node_modules/ramda/src/update.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var adjust = require_adjust();
    var always = require_always();
    var update = /* @__PURE__ */ _curry3(function update2(idx, x, list) {
      return adjust(idx, always(x), list);
    });
    module2.exports = update;
  }
});

// node_modules/ramda/src/lensIndex.js
var require_lensIndex = __commonJS({
  "node_modules/ramda/src/lensIndex.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _nth = require_nth();
    var lens = require_lens();
    var update = require_update();
    var lensIndex = /* @__PURE__ */ _curry1(function lensIndex2(n) {
      return lens(function(val) {
        return _nth(n, val);
      }, update(n));
    });
    module2.exports = lensIndex;
  }
});

// node_modules/ramda/src/internal/_path.js
var require_path = __commonJS({
  "node_modules/ramda/src/internal/_path.js"(exports2, module2) {
    var _isInteger = require_isInteger();
    var _nth = require_nth();
    function _path(pathAr, obj) {
      var val = obj;
      for (var i = 0; i < pathAr.length; i += 1) {
        if (val == null) {
          return void 0;
        }
        var p = pathAr[i];
        if (_isInteger(p)) {
          val = _nth(p, val);
        } else {
          val = val[p];
        }
      }
      return val;
    }
    module2.exports = _path;
  }
});

// node_modules/ramda/src/lensPath.js
var require_lensPath = __commonJS({
  "node_modules/ramda/src/lensPath.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var assocPath = require_assocPath();
    var lens = require_lens();
    var _path = require_path();
    var lensPath = /* @__PURE__ */ _curry1(function lensPath2(p) {
      return lens(function(val) {
        return _path(p, val);
      }, assocPath(p));
    });
    module2.exports = lensPath;
  }
});

// node_modules/ramda/src/lensProp.js
var require_lensProp = __commonJS({
  "node_modules/ramda/src/lensProp.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var assoc = require_assoc2();
    var lens = require_lens();
    var prop = require_prop2();
    var lensProp = /* @__PURE__ */ _curry1(function lensProp2(k) {
      return lens(prop(k), assoc(k));
    });
    module2.exports = lensProp;
  }
});

// node_modules/ramda/src/lt.js
var require_lt = __commonJS({
  "node_modules/ramda/src/lt.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var lt = /* @__PURE__ */ _curry2(function lt2(a, b) {
      return a < b;
    });
    module2.exports = lt;
  }
});

// node_modules/ramda/src/lte.js
var require_lte = __commonJS({
  "node_modules/ramda/src/lte.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var lte = /* @__PURE__ */ _curry2(function lte2(a, b) {
      return a <= b;
    });
    module2.exports = lte;
  }
});

// node_modules/ramda/src/mapAccum.js
var require_mapAccum = __commonJS({
  "node_modules/ramda/src/mapAccum.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var mapAccum = /* @__PURE__ */ _curry3(function mapAccum2(fn, acc, list) {
      var idx = 0;
      var len = list.length;
      var result = Array(len);
      var tuple = [acc];
      while (idx < len) {
        tuple = fn(tuple[0], list[idx]);
        result[idx] = tuple[1];
        idx += 1;
      }
      return [tuple[0], result];
    });
    module2.exports = mapAccum;
  }
});

// node_modules/ramda/src/mapAccumRight.js
var require_mapAccumRight = __commonJS({
  "node_modules/ramda/src/mapAccumRight.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var mapAccumRight = /* @__PURE__ */ _curry3(function mapAccumRight2(fn, acc, list) {
      var idx = list.length - 1;
      var result = Array(list.length);
      var tuple = [acc];
      while (idx >= 0) {
        tuple = fn(tuple[0], list[idx]);
        result[idx] = tuple[1];
        idx -= 1;
      }
      return [tuple[0], result];
    });
    module2.exports = mapAccumRight;
  }
});

// node_modules/ramda/src/internal/_toPairs.js
var require_toPairs = __commonJS({
  "node_modules/ramda/src/internal/_toPairs.js"(exports2, module2) {
    var _has = require_has();
    function _toPairs(obj) {
      var pairs = [];
      for (var prop in obj) {
        if (_has(prop, obj)) {
          pairs[pairs.length] = [prop, obj[prop]];
        }
      }
      return pairs;
    }
    module2.exports = _toPairs;
  }
});

// node_modules/ramda/src/internal/_rebuild.js
var require_rebuild = __commonJS({
  "node_modules/ramda/src/internal/_rebuild.js"(exports2, module2) {
    var _fromPairs = require_fromPairs();
    var _toPairs = require_toPairs();
    var _chain = require_chain();
    var rebuild = function(convert, obj) {
      return _fromPairs(_chain(function(pair) {
        return convert(pair[0], pair[1]);
      }, _toPairs(obj)));
    };
    module2.exports = rebuild;
  }
});

// node_modules/ramda/src/internal/_mapKeys.js
var require_mapKeys = __commonJS({
  "node_modules/ramda/src/internal/_mapKeys.js"(exports2, module2) {
    var _rebuild = require_rebuild();
    var mapKeys = function mapKeys2(fn, obj) {
      return _rebuild(function(k, v) {
        return [[fn(k), v]];
      }, obj);
    };
    module2.exports = mapKeys;
  }
});

// node_modules/ramda/src/mapKeys.js
var require_mapKeys2 = __commonJS({
  "node_modules/ramda/src/mapKeys.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _mapKeys = require_mapKeys();
    var mapKeys = /* @__PURE__ */ _curry2(_mapKeys);
    module2.exports = mapKeys;
  }
});

// node_modules/ramda/src/mapObjIndexed.js
var require_mapObjIndexed = __commonJS({
  "node_modules/ramda/src/mapObjIndexed.js"(exports2, module2) {
    var _arrayReduce = require_arrayReduce();
    var _curry2 = require_curry2();
    var keys = require_keys();
    var mapObjIndexed = /* @__PURE__ */ _curry2(function mapObjIndexed2(fn, obj) {
      return _arrayReduce(function(acc, key) {
        acc[key] = fn(obj[key], key, obj);
        return acc;
      }, {}, keys(obj));
    });
    module2.exports = mapObjIndexed;
  }
});

// node_modules/ramda/src/match.js
var require_match = __commonJS({
  "node_modules/ramda/src/match.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var match = /* @__PURE__ */ _curry2(function match2(rx, str) {
      return str.match(rx) || [];
    });
    module2.exports = match;
  }
});

// node_modules/ramda/src/mathMod.js
var require_mathMod = __commonJS({
  "node_modules/ramda/src/mathMod.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _isInteger = require_isInteger();
    var mathMod = /* @__PURE__ */ _curry2(function mathMod2(m, p) {
      if (!_isInteger(m)) {
        return NaN;
      }
      if (!_isInteger(p) || p < 1) {
        return NaN;
      }
      return (m % p + p) % p;
    });
    module2.exports = mathMod;
  }
});

// node_modules/ramda/src/maxBy.js
var require_maxBy = __commonJS({
  "node_modules/ramda/src/maxBy.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var max = require_max();
    var maxBy = /* @__PURE__ */ _curry3(function maxBy2(f, a, b) {
      var resultB = f(b);
      return max(f(a), resultB) === resultB ? b : a;
    });
    module2.exports = maxBy;
  }
});

// node_modules/ramda/src/sum.js
var require_sum = __commonJS({
  "node_modules/ramda/src/sum.js"(exports2, module2) {
    var add = require_add();
    var reduce = require_reduce();
    var sum = /* @__PURE__ */ reduce(add, 0);
    module2.exports = sum;
  }
});

// node_modules/ramda/src/mean.js
var require_mean = __commonJS({
  "node_modules/ramda/src/mean.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var sum = require_sum();
    var mean = /* @__PURE__ */ _curry1(function mean2(list) {
      return sum(list) / list.length;
    });
    module2.exports = mean;
  }
});

// node_modules/ramda/src/median.js
var require_median = __commonJS({
  "node_modules/ramda/src/median.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var mean = require_mean();
    var median = /* @__PURE__ */ _curry1(function median2(list) {
      var len = list.length;
      if (len === 0) {
        return NaN;
      }
      var width = 2 - len % 2;
      var idx = (len - width) / 2;
      return mean(Array.prototype.slice.call(list, 0).sort(function(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
      }).slice(idx, idx + width));
    });
    module2.exports = median;
  }
});

// node_modules/ramda/src/memoizeWith.js
var require_memoizeWith = __commonJS({
  "node_modules/ramda/src/memoizeWith.js"(exports2, module2) {
    var _arity = require_arity();
    var _curry2 = require_curry2();
    var _has = require_has();
    var memoizeWith = /* @__PURE__ */ _curry2(function memoizeWith2(keyGen, fn) {
      var cache = {};
      return _arity(fn.length, function() {
        var key = keyGen.apply(this, arguments);
        if (!_has(key, cache)) {
          cache[key] = fn.apply(this, arguments);
        }
        return cache[key];
      });
    });
    module2.exports = memoizeWith;
  }
});

// node_modules/ramda/src/mergeAll.js
var require_mergeAll = __commonJS({
  "node_modules/ramda/src/mergeAll.js"(exports2, module2) {
    var _objectAssign = require_objectAssign();
    var _curry1 = require_curry1();
    var mergeAll = /* @__PURE__ */ _curry1(function mergeAll2(list) {
      return _objectAssign.apply(null, [{}].concat(list));
    });
    module2.exports = mergeAll;
  }
});

// node_modules/ramda/src/mergeWithKey.js
var require_mergeWithKey = __commonJS({
  "node_modules/ramda/src/mergeWithKey.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var _has = require_has();
    var mergeWithKey = /* @__PURE__ */ _curry3(function mergeWithKey2(fn, l, r) {
      var result = {};
      var k;
      l = l || {};
      r = r || {};
      for (k in l) {
        if (_has(k, l)) {
          result[k] = _has(k, r) ? fn(k, l[k], r[k]) : l[k];
        }
      }
      for (k in r) {
        if (_has(k, r) && !_has(k, result)) {
          result[k] = r[k];
        }
      }
      return result;
    });
    module2.exports = mergeWithKey;
  }
});

// node_modules/ramda/src/mergeDeepWithKey.js
var require_mergeDeepWithKey = __commonJS({
  "node_modules/ramda/src/mergeDeepWithKey.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var _isObject = require_isObject();
    var mergeWithKey = require_mergeWithKey();
    var mergeDeepWithKey = /* @__PURE__ */ _curry3(function mergeDeepWithKey2(fn, lObj, rObj) {
      return mergeWithKey(function(k, lVal, rVal) {
        if (_isObject(lVal) && _isObject(rVal)) {
          return mergeDeepWithKey2(fn, lVal, rVal);
        } else {
          return fn(k, lVal, rVal);
        }
      }, lObj, rObj);
    });
    module2.exports = mergeDeepWithKey;
  }
});

// node_modules/ramda/src/mergeDeepLeft.js
var require_mergeDeepLeft = __commonJS({
  "node_modules/ramda/src/mergeDeepLeft.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var mergeDeepWithKey = require_mergeDeepWithKey();
    var mergeDeepLeft = /* @__PURE__ */ _curry2(function mergeDeepLeft2(lObj, rObj) {
      return mergeDeepWithKey(function(k, lVal, rVal) {
        return lVal;
      }, lObj, rObj);
    });
    module2.exports = mergeDeepLeft;
  }
});

// node_modules/ramda/src/mergeDeepRight.js
var require_mergeDeepRight = __commonJS({
  "node_modules/ramda/src/mergeDeepRight.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var mergeDeepWithKey = require_mergeDeepWithKey();
    var mergeDeepRight = /* @__PURE__ */ _curry2(function mergeDeepRight2(lObj, rObj) {
      return mergeDeepWithKey(function(k, lVal, rVal) {
        return rVal;
      }, lObj, rObj);
    });
    module2.exports = mergeDeepRight;
  }
});

// node_modules/ramda/src/mergeDeepWith.js
var require_mergeDeepWith = __commonJS({
  "node_modules/ramda/src/mergeDeepWith.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var mergeDeepWithKey = require_mergeDeepWithKey();
    var mergeDeepWith = /* @__PURE__ */ _curry3(function mergeDeepWith2(fn, lObj, rObj) {
      return mergeDeepWithKey(function(k, lVal, rVal) {
        return fn(lVal, rVal);
      }, lObj, rObj);
    });
    module2.exports = mergeDeepWith;
  }
});

// node_modules/ramda/src/mergeLeft.js
var require_mergeLeft = __commonJS({
  "node_modules/ramda/src/mergeLeft.js"(exports2, module2) {
    var _objectAssign = require_objectAssign();
    var _curry2 = require_curry2();
    var mergeLeft = /* @__PURE__ */ _curry2(function mergeLeft2(l, r) {
      return _objectAssign({}, r, l);
    });
    module2.exports = mergeLeft;
  }
});

// node_modules/ramda/src/mergeRight.js
var require_mergeRight = __commonJS({
  "node_modules/ramda/src/mergeRight.js"(exports2, module2) {
    var _objectAssign = require_objectAssign();
    var _curry2 = require_curry2();
    var mergeRight = /* @__PURE__ */ _curry2(function mergeRight2(l, r) {
      return _objectAssign({}, l, r);
    });
    module2.exports = mergeRight;
  }
});

// node_modules/ramda/src/mergeWith.js
var require_mergeWith = __commonJS({
  "node_modules/ramda/src/mergeWith.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var mergeWithKey = require_mergeWithKey();
    var mergeWith = /* @__PURE__ */ _curry3(function mergeWith2(fn, l, r) {
      return mergeWithKey(function(_, _l, _r) {
        return fn(_l, _r);
      }, l, r);
    });
    module2.exports = mergeWith;
  }
});

// node_modules/ramda/src/min.js
var require_min = __commonJS({
  "node_modules/ramda/src/min.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var toString = require_toString2();
    var min = /* @__PURE__ */ _curry2(function min2(a, b) {
      if (a === b) {
        return a;
      }
      function safeMin(x, y) {
        if (x < y !== y < x) {
          return y < x ? y : x;
        }
        return void 0;
      }
      var minByValue = safeMin(a, b);
      if (minByValue !== void 0) {
        return minByValue;
      }
      var minByType = safeMin(typeof a, typeof b);
      if (minByType !== void 0) {
        return minByType === typeof a ? a : b;
      }
      var stringA = toString(a);
      var minByStringValue = safeMin(stringA, toString(b));
      if (minByStringValue !== void 0) {
        return minByStringValue === stringA ? a : b;
      }
      return a;
    });
    module2.exports = min;
  }
});

// node_modules/ramda/src/minBy.js
var require_minBy = __commonJS({
  "node_modules/ramda/src/minBy.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var min = require_min();
    var minBy = /* @__PURE__ */ _curry3(function minBy2(f, a, b) {
      var resultB = f(b);
      return min(f(a), resultB) === resultB ? b : a;
    });
    module2.exports = minBy;
  }
});

// node_modules/ramda/src/internal/_modify.js
var require_modify = __commonJS({
  "node_modules/ramda/src/internal/_modify.js"(exports2, module2) {
    var _isArray = require_isArray();
    var _isInteger = require_isInteger();
    function _modify(prop, fn, obj) {
      if (_isInteger(prop) && _isArray(obj)) {
        var arr = [].concat(obj);
        arr[prop] = fn(arr[prop]);
        return arr;
      }
      var result = {};
      for (var p in obj) {
        result[p] = obj[p];
      }
      result[prop] = fn(result[prop]);
      return result;
    }
    module2.exports = _modify;
  }
});

// node_modules/ramda/src/modifyPath.js
var require_modifyPath = __commonJS({
  "node_modules/ramda/src/modifyPath.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var _isArray = require_isArray();
    var _isObject = require_isObject();
    var _has = require_has();
    var _assoc = require_assoc();
    var _modify = require_modify();
    var modifyPath = /* @__PURE__ */ _curry3(function modifyPath2(path, fn, object) {
      if (!_isObject(object) && !_isArray(object)) {
        return object;
      }
      if (path.length === 0) {
        return fn(object);
      }
      var idx = path[0];
      if (!_has(idx, object)) {
        return object;
      }
      if (path.length === 1) {
        return _modify(idx, fn, object);
      }
      var val = modifyPath2(Array.prototype.slice.call(path, 1), fn, object[idx]);
      if (val === object[idx]) {
        return object;
      }
      return _assoc(idx, val, object);
    });
    module2.exports = modifyPath;
  }
});

// node_modules/ramda/src/modify.js
var require_modify2 = __commonJS({
  "node_modules/ramda/src/modify.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var modifyPath = require_modifyPath();
    var modify = /* @__PURE__ */ _curry3(function modify2(prop, fn, object) {
      return modifyPath([prop], fn, object);
    });
    module2.exports = modify;
  }
});

// node_modules/ramda/src/modulo.js
var require_modulo = __commonJS({
  "node_modules/ramda/src/modulo.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var modulo = /* @__PURE__ */ _curry2(function modulo2(a, b) {
      return a % b;
    });
    module2.exports = modulo;
  }
});

// node_modules/ramda/src/move.js
var require_move = __commonJS({
  "node_modules/ramda/src/move.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var move = /* @__PURE__ */ _curry3(function(from, to, list) {
      var length = list.length;
      var result = list.slice();
      var positiveFrom = from < 0 ? length + from : from;
      var positiveTo = to < 0 ? length + to : to;
      var item = result.splice(positiveFrom, 1);
      return positiveFrom < 0 || positiveFrom >= list.length || positiveTo < 0 || positiveTo >= list.length ? list : [].concat(result.slice(0, positiveTo)).concat(item).concat(result.slice(positiveTo, list.length));
    });
    module2.exports = move;
  }
});

// node_modules/ramda/src/multiply.js
var require_multiply = __commonJS({
  "node_modules/ramda/src/multiply.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var multiply = /* @__PURE__ */ _curry2(function multiply2(a, b) {
      return a * b;
    });
    module2.exports = multiply;
  }
});

// node_modules/ramda/src/partialObject.js
var require_partialObject = __commonJS({
  "node_modules/ramda/src/partialObject.js"(exports2, module2) {
    var mergeDeepRight = require_mergeDeepRight();
    var _curry2 = require_curry2();
    var partialObject = /* @__PURE__ */ _curry2(function partialObject2(f, o) {
      return function _partialObject(props) {
        return f(mergeDeepRight(o, props));
      };
    });
    module2.exports = partialObject;
  }
});

// node_modules/ramda/src/negate.js
var require_negate = __commonJS({
  "node_modules/ramda/src/negate.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var negate = /* @__PURE__ */ _curry1(function negate2(n) {
      return -n;
    });
    module2.exports = negate;
  }
});

// node_modules/ramda/src/none.js
var require_none = __commonJS({
  "node_modules/ramda/src/none.js"(exports2, module2) {
    var _complement = require_complement();
    var _curry2 = require_curry2();
    var all = require_all();
    var none = /* @__PURE__ */ _curry2(function none2(fn, input) {
      return all(_complement(fn), input);
    });
    module2.exports = none;
  }
});

// node_modules/ramda/src/nth.js
var require_nth2 = __commonJS({
  "node_modules/ramda/src/nth.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _nth = require_nth();
    var nth = /* @__PURE__ */ _curry2(_nth);
    module2.exports = nth;
  }
});

// node_modules/ramda/src/nthArg.js
var require_nthArg = __commonJS({
  "node_modules/ramda/src/nthArg.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _nth = require_nth();
    var curryN = require_curryN2();
    var nthArg = /* @__PURE__ */ _curry1(function nthArg2(n) {
      var arity = n < 0 ? 1 : n + 1;
      return curryN(arity, function() {
        return _nth(n, arguments);
      });
    });
    module2.exports = nthArg;
  }
});

// node_modules/ramda/src/o.js
var require_o = __commonJS({
  "node_modules/ramda/src/o.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var o = /* @__PURE__ */ _curry3(function o2(f, g, x) {
      return f(g(x));
    });
    module2.exports = o;
  }
});

// node_modules/ramda/src/of.js
var require_of = __commonJS({
  "node_modules/ramda/src/of.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var of = /* @__PURE__ */ _curry2(function of2(Ctor, val) {
      return typeof Ctor["fantasy-land/of"] === "function" ? Ctor["fantasy-land/of"](val) : typeof Ctor.of === "function" ? Ctor.of(val) : [val];
    });
    module2.exports = of;
  }
});

// node_modules/ramda/src/omit.js
var require_omit = __commonJS({
  "node_modules/ramda/src/omit.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var omit = /* @__PURE__ */ _curry2(function omit2(names, obj) {
      var result = {};
      var index = {};
      var idx = 0;
      var len = names.length;
      while (idx < len) {
        index[names[idx]] = 1;
        idx += 1;
      }
      for (var prop in obj) {
        if (!index.hasOwnProperty(prop)) {
          result[prop] = obj[prop];
        }
      }
      return result;
    });
    module2.exports = omit;
  }
});

// node_modules/ramda/src/on.js
var require_on = __commonJS({
  "node_modules/ramda/src/on.js"(exports2, module2) {
    var curryN = require_curryN();
    var on = /* @__PURE__ */ curryN(4, [], function on2(f, g, a, b) {
      return f(g(a), g(b));
    });
    module2.exports = on;
  }
});

// node_modules/ramda/src/once.js
var require_once = __commonJS({
  "node_modules/ramda/src/once.js"(exports2, module2) {
    var _arity = require_arity();
    var _curry1 = require_curry1();
    var once = /* @__PURE__ */ _curry1(function once2(fn) {
      var called = false;
      var result;
      return _arity(fn.length, function() {
        if (called) {
          return result;
        }
        called = true;
        result = fn.apply(this, arguments);
        return result;
      });
    });
    module2.exports = once;
  }
});

// node_modules/ramda/src/internal/_assertPromise.js
var require_assertPromise = __commonJS({
  "node_modules/ramda/src/internal/_assertPromise.js"(exports2, module2) {
    var _isFunction = require_isFunction();
    var _toString = require_toString();
    function _assertPromise(name, p) {
      if (p == null || !_isFunction(p.then)) {
        throw new TypeError("`" + name + "` expected a Promise, received " + _toString(p, []));
      }
    }
    module2.exports = _assertPromise;
  }
});

// node_modules/ramda/src/otherwise.js
var require_otherwise = __commonJS({
  "node_modules/ramda/src/otherwise.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _assertPromise = require_assertPromise();
    var otherwise = /* @__PURE__ */ _curry2(function otherwise2(f, p) {
      _assertPromise("otherwise", p);
      return p.then(null, f);
    });
    module2.exports = otherwise;
  }
});

// node_modules/ramda/src/over.js
var require_over = __commonJS({
  "node_modules/ramda/src/over.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var Identity = function(x) {
      return {
        value: x,
        map: function(f) {
          return Identity(f(x));
        }
      };
    };
    var over = /* @__PURE__ */ _curry3(function over2(lens, f, x) {
      return lens(function(y) {
        return Identity(f(y));
      })(x).value;
    });
    module2.exports = over;
  }
});

// node_modules/ramda/src/pair.js
var require_pair = __commonJS({
  "node_modules/ramda/src/pair.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var pair = /* @__PURE__ */ _curry2(function pair2(fst, snd) {
      return [fst, snd];
    });
    module2.exports = pair;
  }
});

// node_modules/ramda/src/internal/_createPartialApplicator.js
var require_createPartialApplicator = __commonJS({
  "node_modules/ramda/src/internal/_createPartialApplicator.js"(exports2, module2) {
    var _arity = require_arity();
    var _curry2 = require_curry2();
    function _createPartialApplicator(concat) {
      return _curry2(function(fn, args) {
        return _arity(Math.max(0, fn.length - args.length), function() {
          return fn.apply(this, concat(args, arguments));
        });
      });
    }
    module2.exports = _createPartialApplicator;
  }
});

// node_modules/ramda/src/partial.js
var require_partial = __commonJS({
  "node_modules/ramda/src/partial.js"(exports2, module2) {
    var _concat = require_concat();
    var _createPartialApplicator = require_createPartialApplicator();
    var partial = /* @__PURE__ */ _createPartialApplicator(_concat);
    module2.exports = partial;
  }
});

// node_modules/ramda/src/partialRight.js
var require_partialRight = __commonJS({
  "node_modules/ramda/src/partialRight.js"(exports2, module2) {
    var _concat = require_concat();
    var _createPartialApplicator = require_createPartialApplicator();
    var flip = require_flip();
    var partialRight = /* @__PURE__ */ _createPartialApplicator(/* @__PURE__ */ flip(_concat));
    module2.exports = partialRight;
  }
});

// node_modules/ramda/src/partition.js
var require_partition = __commonJS({
  "node_modules/ramda/src/partition.js"(exports2, module2) {
    var filter = require_filter2();
    var juxt = require_juxt();
    var reject = require_reject();
    var partition = /* @__PURE__ */ juxt([filter, reject]);
    module2.exports = partition;
  }
});

// node_modules/ramda/src/path.js
var require_path2 = __commonJS({
  "node_modules/ramda/src/path.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _path = require_path();
    var path = /* @__PURE__ */ _curry2(_path);
    module2.exports = path;
  }
});

// node_modules/ramda/src/paths.js
var require_paths = __commonJS({
  "node_modules/ramda/src/paths.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _isInteger = require_isInteger();
    var _nth = require_nth();
    var paths = /* @__PURE__ */ _curry2(function paths2(pathsArray, obj) {
      return pathsArray.map(function(paths3) {
        var val = obj;
        var idx = 0;
        var p;
        while (idx < paths3.length) {
          if (val == null) {
            return;
          }
          p = paths3[idx];
          val = _isInteger(p) ? _nth(p, val) : val[p];
          idx += 1;
        }
        return val;
      });
    });
    module2.exports = paths;
  }
});

// node_modules/ramda/src/pathEq.js
var require_pathEq = __commonJS({
  "node_modules/ramda/src/pathEq.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var _path = require_path();
    var equals = require_equals2();
    var pathEq = /* @__PURE__ */ _curry3(function pathEq2(val, pathAr, obj) {
      return equals(_path(pathAr, obj), val);
    });
    module2.exports = pathEq;
  }
});

// node_modules/ramda/src/pathOr.js
var require_pathOr = __commonJS({
  "node_modules/ramda/src/pathOr.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var _path = require_path();
    var defaultTo = require_defaultTo();
    var pathOr = /* @__PURE__ */ _curry3(function pathOr2(d2, p, obj) {
      return defaultTo(d2, _path(p, obj));
    });
    module2.exports = pathOr;
  }
});

// node_modules/ramda/src/pathSatisfies.js
var require_pathSatisfies = __commonJS({
  "node_modules/ramda/src/pathSatisfies.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var _path = require_path();
    var pathSatisfies = /* @__PURE__ */ _curry3(function pathSatisfies2(pred, propPath, obj) {
      return pred(_path(propPath, obj));
    });
    module2.exports = pathSatisfies;
  }
});

// node_modules/ramda/src/pick.js
var require_pick = __commonJS({
  "node_modules/ramda/src/pick.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var pick = /* @__PURE__ */ _curry2(function pick2(names, obj) {
      var result = {};
      var idx = 0;
      while (idx < names.length) {
        if (names[idx] in obj) {
          result[names[idx]] = obj[names[idx]];
        }
        idx += 1;
      }
      return result;
    });
    module2.exports = pick;
  }
});

// node_modules/ramda/src/pickAll.js
var require_pickAll = __commonJS({
  "node_modules/ramda/src/pickAll.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var pickAll = /* @__PURE__ */ _curry2(function pickAll2(names, obj) {
      var result = {};
      var idx = 0;
      var len = names.length;
      while (idx < len) {
        var name = names[idx];
        result[name] = obj[name];
        idx += 1;
      }
      return result;
    });
    module2.exports = pickAll;
  }
});

// node_modules/ramda/src/pickBy.js
var require_pickBy = __commonJS({
  "node_modules/ramda/src/pickBy.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var pickBy = /* @__PURE__ */ _curry2(function pickBy2(test, obj) {
      var result = {};
      for (var prop in obj) {
        if (test(obj[prop], prop, obj)) {
          result[prop] = obj[prop];
        }
      }
      return result;
    });
    module2.exports = pickBy;
  }
});

// node_modules/ramda/src/prepend.js
var require_prepend = __commonJS({
  "node_modules/ramda/src/prepend.js"(exports2, module2) {
    var _concat = require_concat();
    var _curry2 = require_curry2();
    var prepend = /* @__PURE__ */ _curry2(function prepend2(el, list) {
      return _concat([el], list);
    });
    module2.exports = prepend;
  }
});

// node_modules/ramda/src/product.js
var require_product = __commonJS({
  "node_modules/ramda/src/product.js"(exports2, module2) {
    var multiply = require_multiply();
    var reduce = require_reduce();
    var product = /* @__PURE__ */ reduce(multiply, 1);
    module2.exports = product;
  }
});

// node_modules/ramda/src/useWith.js
var require_useWith = __commonJS({
  "node_modules/ramda/src/useWith.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var curryN = require_curryN2();
    var useWith = /* @__PURE__ */ _curry2(function useWith2(fn, transformers) {
      return curryN(transformers.length, function() {
        var args = [];
        var idx = 0;
        while (idx < transformers.length) {
          args.push(transformers[idx].call(this, arguments[idx]));
          idx += 1;
        }
        return fn.apply(this, args.concat(Array.prototype.slice.call(arguments, transformers.length)));
      });
    });
    module2.exports = useWith;
  }
});

// node_modules/ramda/src/project.js
var require_project = __commonJS({
  "node_modules/ramda/src/project.js"(exports2, module2) {
    var _map = require_map();
    var identity = require_identity2();
    var pickAll = require_pickAll();
    var useWith = require_useWith();
    var project = /* @__PURE__ */ useWith(_map, [pickAll, identity]);
    module2.exports = project;
  }
});

// node_modules/ramda/src/internal/_promap.js
var require_promap = __commonJS({
  "node_modules/ramda/src/internal/_promap.js"(exports2, module2) {
    function _promap(f, g, profunctor) {
      return function(x) {
        return g(profunctor(f(x)));
      };
    }
    module2.exports = _promap;
  }
});

// node_modules/ramda/src/internal/_xpromap.js
var require_xpromap = __commonJS({
  "node_modules/ramda/src/internal/_xpromap.js"(exports2, module2) {
    var _xfBase = require_xfBase();
    var _promap = require_promap();
    var XPromap = /* @__PURE__ */ (function() {
      function XPromap2(f, g, xf) {
        this.xf = xf;
        this.f = f;
        this.g = g;
      }
      XPromap2.prototype["@@transducer/init"] = _xfBase.init;
      XPromap2.prototype["@@transducer/result"] = _xfBase.result;
      XPromap2.prototype["@@transducer/step"] = function(result, input) {
        return this.xf["@@transducer/step"](result, _promap(this.f, this.g, input));
      };
      return XPromap2;
    })();
    function _xpromap(f, g) {
      return function(xf) {
        return new XPromap(f, g, xf);
      };
    }
    module2.exports = _xpromap;
  }
});

// node_modules/ramda/src/promap.js
var require_promap2 = __commonJS({
  "node_modules/ramda/src/promap.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var _dispatchable = require_dispatchable();
    var _promap = require_promap();
    var _xpromap = require_xpromap();
    var promap = /* @__PURE__ */ _curry3(/* @__PURE__ */ _dispatchable(["fantasy-land/promap", "promap"], _xpromap, _promap));
    module2.exports = promap;
  }
});

// node_modules/ramda/src/propEq.js
var require_propEq = __commonJS({
  "node_modules/ramda/src/propEq.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var prop = require_prop2();
    var equals = require_equals2();
    var propEq = /* @__PURE__ */ _curry3(function propEq2(val, name, obj) {
      return equals(val, prop(name, obj));
    });
    module2.exports = propEq;
  }
});

// node_modules/ramda/src/propIs.js
var require_propIs = __commonJS({
  "node_modules/ramda/src/propIs.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var prop = require_prop2();
    var is = require_is();
    var propIs = /* @__PURE__ */ _curry3(function propIs2(type, name, obj) {
      return is(type, prop(name, obj));
    });
    module2.exports = propIs;
  }
});

// node_modules/ramda/src/propOr.js
var require_propOr = __commonJS({
  "node_modules/ramda/src/propOr.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var defaultTo = require_defaultTo();
    var prop = require_prop2();
    var propOr = /* @__PURE__ */ _curry3(function propOr2(val, p, obj) {
      return defaultTo(val, prop(p, obj));
    });
    module2.exports = propOr;
  }
});

// node_modules/ramda/src/propSatisfies.js
var require_propSatisfies = __commonJS({
  "node_modules/ramda/src/propSatisfies.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var prop = require_prop2();
    var propSatisfies = /* @__PURE__ */ _curry3(function propSatisfies2(pred, name, obj) {
      return pred(prop(name, obj));
    });
    module2.exports = propSatisfies;
  }
});

// node_modules/ramda/src/props.js
var require_props = __commonJS({
  "node_modules/ramda/src/props.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var prop = require_prop2();
    var props = /* @__PURE__ */ _curry2(function props2(ps, obj) {
      return ps.map(function(p) {
        return prop(p, obj);
      });
    });
    module2.exports = props;
  }
});

// node_modules/ramda/src/range.js
var require_range = __commonJS({
  "node_modules/ramda/src/range.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _isNumber = require_isNumber();
    var range = /* @__PURE__ */ _curry2(function range2(from, to) {
      if (!(_isNumber(from) && _isNumber(to))) {
        throw new TypeError("Both arguments to range must be numbers");
      }
      var length = from < to ? Math.ceil(to - from) : 0;
      var result = Array(length);
      var idx = 0;
      while (idx < length) {
        result[idx] = idx + from;
        idx += 1;
      }
      return result;
    });
    module2.exports = range;
  }
});

// node_modules/ramda/src/rebuild.js
var require_rebuild2 = __commonJS({
  "node_modules/ramda/src/rebuild.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _rebuild = require_rebuild();
    var rebuild = /* @__PURE__ */ _curry2(_rebuild);
    module2.exports = rebuild;
  }
});

// node_modules/ramda/src/reduceRight.js
var require_reduceRight = __commonJS({
  "node_modules/ramda/src/reduceRight.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var reduceRight = /* @__PURE__ */ _curry3(function reduceRight2(fn, acc, list) {
      var idx = list.length - 1;
      while (idx >= 0) {
        acc = fn(list[idx], acc);
        if (acc && acc["@@transducer/reduced"]) {
          acc = acc["@@transducer/value"];
          break;
        }
        idx -= 1;
      }
      return acc;
    });
    module2.exports = reduceRight;
  }
});

// node_modules/ramda/src/reduceWhile.js
var require_reduceWhile = __commonJS({
  "node_modules/ramda/src/reduceWhile.js"(exports2, module2) {
    var _curryN = require_curryN();
    var _xReduce = require_xReduce();
    var _xwrap = require_xwrap();
    var _reduced = require_reduced();
    var reduceWhile = /* @__PURE__ */ _curryN(4, [], function _reduceWhile(pred, fn, a, list) {
      var xf = _xwrap(function(acc, x) {
        return pred(acc, x) ? fn(acc, x) : _reduced(acc);
      });
      return _xReduce(xf, a, list);
    });
    module2.exports = reduceWhile;
  }
});

// node_modules/ramda/src/reduced.js
var require_reduced2 = __commonJS({
  "node_modules/ramda/src/reduced.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _reduced = require_reduced();
    var reduced = /* @__PURE__ */ _curry1(_reduced);
    module2.exports = reduced;
  }
});

// node_modules/ramda/src/renameKeys.js
var require_renameKeys = __commonJS({
  "node_modules/ramda/src/renameKeys.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _has = require_has();
    var _mapKeys = require_mapKeys();
    var renameKeys = /* @__PURE__ */ _curry2(function renameKeys2(mapping, obj) {
      return _mapKeys(function(key) {
        return _has(key, mapping) ? mapping[key] : key;
      }, obj);
    });
    module2.exports = renameKeys;
  }
});

// node_modules/ramda/src/times.js
var require_times = __commonJS({
  "node_modules/ramda/src/times.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var times = /* @__PURE__ */ _curry2(function times2(fn, n) {
      var len = Number(n);
      if (len < 0 || isNaN(len)) {
        throw new RangeError("n must be a non-negative number");
      }
      var idx = 0;
      var list = Array(len);
      while (idx < len) {
        list[idx] = fn(idx);
        idx += 1;
      }
      return list;
    });
    module2.exports = times;
  }
});

// node_modules/ramda/src/repeat.js
var require_repeat = __commonJS({
  "node_modules/ramda/src/repeat.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var always = require_always();
    var times = require_times();
    var repeat = /* @__PURE__ */ _curry2(function repeat2(value, n) {
      return times(always(value), n);
    });
    module2.exports = repeat;
  }
});

// node_modules/ramda/src/replace.js
var require_replace = __commonJS({
  "node_modules/ramda/src/replace.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var replace = /* @__PURE__ */ _curry3(function replace2(regex, replacement, str) {
      return str.replace(regex, replacement);
    });
    module2.exports = replace;
  }
});

// node_modules/ramda/src/internal/_xscan.js
var require_xscan = __commonJS({
  "node_modules/ramda/src/internal/_xscan.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var _xfBase = require_xfBase();
    var tInit = "@@transducer/init";
    var tStep = "@@transducer/step";
    var XScan = /* @__PURE__ */ (function() {
      function XScan2(reducer, acc, xf) {
        this.xf = xf;
        this.f = reducer;
        this.acc = acc;
      }
      XScan2.prototype[tInit] = function() {
        return this.xf[tStep](this.xf[tInit](), this.acc);
      };
      XScan2.prototype["@@transducer/result"] = _xfBase.result;
      XScan2.prototype[tStep] = function(result, input) {
        if (result["@@transducer/reduced"]) {
          return result;
        }
        this.acc = this.f(this.acc, input);
        return this.xf[tStep](result, this.acc);
      };
      return XScan2;
    })();
    var _xscan = /* @__PURE__ */ _curry3(function _xscan2(reducer, acc, xf) {
      return new XScan(reducer, acc, xf);
    });
    module2.exports = _xscan;
  }
});

// node_modules/ramda/src/scan.js
var require_scan = __commonJS({
  "node_modules/ramda/src/scan.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var _dispatchable = require_dispatchable();
    var _xscan = require_xscan();
    var scan = /* @__PURE__ */ _curry3(/* @__PURE__ */ _dispatchable([], _xscan, function scan2(fn, acc, list) {
      var idx = 0;
      var len = list.length;
      var result = Array(len + 1);
      result[0] = acc;
      while (idx < len) {
        acc = fn(acc, list[idx]);
        result[idx + 1] = acc;
        idx += 1;
      }
      return result;
    }));
    module2.exports = scan;
  }
});

// node_modules/ramda/src/sequence.js
var require_sequence = __commonJS({
  "node_modules/ramda/src/sequence.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var ap = require_ap();
    var map = require_map2();
    var prepend = require_prepend();
    var reduceRight = require_reduceRight();
    var identity = require_identity();
    var sequence = /* @__PURE__ */ _curry2(function sequence2(F, traversable) {
      var of = typeof F["fantasy-land/of"] === "function" ? F["fantasy-land/of"] : typeof F.of === "function" ? F.of : F;
      var TypeRep = {
        "fantasy-land/of": of
      };
      return typeof traversable["fantasy-land/traverse"] === "function" ? traversable["fantasy-land/traverse"](TypeRep, identity) : typeof traversable.traverse === "function" ? traversable.traverse(TypeRep, identity) : reduceRight(function(x, acc) {
        return ap(map(prepend, x), acc);
      }, of([]), traversable);
    });
    module2.exports = sequence;
  }
});

// node_modules/ramda/src/set.js
var require_set = __commonJS({
  "node_modules/ramda/src/set.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var always = require_always();
    var over = require_over();
    var set = /* @__PURE__ */ _curry3(function set2(lens, v, x) {
      return over(lens, always(v), x);
    });
    module2.exports = set;
  }
});

// node_modules/ramda/src/sort.js
var require_sort = __commonJS({
  "node_modules/ramda/src/sort.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var sort = /* @__PURE__ */ _curry2(function sort2(comparator, list) {
      return Array.prototype.slice.call(list, 0).sort(comparator);
    });
    module2.exports = sort;
  }
});

// node_modules/ramda/src/sortBy.js
var require_sortBy = __commonJS({
  "node_modules/ramda/src/sortBy.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var sortBy = /* @__PURE__ */ _curry2(function sortBy2(fn, list) {
      return Array.prototype.slice.call(list, 0).sort(function(a, b) {
        var aa = fn(a);
        var bb = fn(b);
        return aa < bb ? -1 : aa > bb ? 1 : 0;
      });
    });
    module2.exports = sortBy;
  }
});

// node_modules/ramda/src/sortWith.js
var require_sortWith = __commonJS({
  "node_modules/ramda/src/sortWith.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var sortWith = /* @__PURE__ */ _curry2(function sortWith2(fns, list) {
      return Array.prototype.slice.call(list, 0).sort(function(a, b) {
        var result = 0;
        var i = 0;
        while (result === 0 && i < fns.length) {
          result = fns[i](a, b);
          i += 1;
        }
        return result;
      });
    });
    module2.exports = sortWith;
  }
});

// node_modules/ramda/src/split.js
var require_split = __commonJS({
  "node_modules/ramda/src/split.js"(exports2, module2) {
    var invoker = require_invoker();
    var split = /* @__PURE__ */ invoker(1, "split");
    module2.exports = split;
  }
});

// node_modules/ramda/src/splitAt.js
var require_splitAt = __commonJS({
  "node_modules/ramda/src/splitAt.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var length = require_length();
    var slice = require_slice();
    var splitAt = /* @__PURE__ */ _curry2(function splitAt2(index, array) {
      return [slice(0, index, array), slice(index, length(array), array)];
    });
    module2.exports = splitAt;
  }
});

// node_modules/ramda/src/splitEvery.js
var require_splitEvery = __commonJS({
  "node_modules/ramda/src/splitEvery.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var slice = require_slice();
    var splitEvery = /* @__PURE__ */ _curry2(function splitEvery2(n, list) {
      if (n <= 0) {
        throw new Error("First argument to splitEvery must be a positive integer");
      }
      var result = [];
      var idx = 0;
      while (idx < list.length) {
        result.push(slice(idx, idx += n, list));
      }
      return result;
    });
    module2.exports = splitEvery;
  }
});

// node_modules/ramda/src/splitWhen.js
var require_splitWhen = __commonJS({
  "node_modules/ramda/src/splitWhen.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var splitWhen = /* @__PURE__ */ _curry2(function splitWhen2(pred, list) {
      var idx = 0;
      var len = list.length;
      var prefix = [];
      while (idx < len && !pred(list[idx])) {
        prefix.push(list[idx]);
        idx += 1;
      }
      return [prefix, Array.prototype.slice.call(list, idx)];
    });
    module2.exports = splitWhen;
  }
});

// node_modules/ramda/src/splitWhenever.js
var require_splitWhenever = __commonJS({
  "node_modules/ramda/src/splitWhenever.js"(exports2, module2) {
    var _curryN = require_curryN();
    var splitWhenever = /* @__PURE__ */ _curryN(2, [], function splitWhenever2(pred, list) {
      var acc = [];
      var curr = [];
      for (var i = 0; i < list.length; i = i + 1) {
        if (!pred(list[i])) {
          curr.push(list[i]);
        }
        if ((i < list.length - 1 && pred(list[i + 1]) || i === list.length - 1) && curr.length > 0) {
          acc.push(curr);
          curr = [];
        }
      }
      return acc;
    });
    module2.exports = splitWhenever;
  }
});

// node_modules/ramda/src/startsWith.js
var require_startsWith = __commonJS({
  "node_modules/ramda/src/startsWith.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var equals = require_equals2();
    var take = require_take();
    var startsWith = /* @__PURE__ */ _curry2(function(prefix, list) {
      return equals(take(prefix.length, list), prefix);
    });
    module2.exports = startsWith;
  }
});

// node_modules/ramda/src/subtract.js
var require_subtract = __commonJS({
  "node_modules/ramda/src/subtract.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var subtract = /* @__PURE__ */ _curry2(function subtract2(a, b) {
      return Number(a) - Number(b);
    });
    module2.exports = subtract;
  }
});

// node_modules/ramda/src/swap.js
var require_swap = __commonJS({
  "node_modules/ramda/src/swap.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var _isArray = require_isArray();
    var _isString = require_isString();
    var clone = require_clone2();
    var swapObject = function(indexA, indexB, o) {
      var copy = clone(o);
      var properties = Object.getOwnPropertyNames(copy);
      if (properties.includes(indexA) && properties.includes(indexB)) {
        var tmp = copy[indexA];
        copy[indexA] = copy[indexB];
        copy[indexB] = tmp;
      }
      return copy;
    };
    var swapList = function(indexA, indexB, list) {
      var length = list.length;
      var result = list.slice();
      var positiveIndexA = indexA < 0 ? length + indexA : indexA;
      var positiveIndexB = indexB < 0 ? length + indexB : indexB;
      var positiveMin = Math.min(positiveIndexA, positiveIndexB);
      var positiveMax = Math.max(positiveIndexA, positiveIndexB);
      if (positiveIndexA < 0 || positiveIndexA > length) {
        return result;
      }
      if (positiveIndexB < 0 || positiveIndexB > length) {
        return result;
      }
      if (positiveIndexA === positiveIndexB) {
        return result;
      }
      result = [].concat(result.slice(0, positiveMin)).concat([result[positiveMax]]).concat(result.slice(positiveMin + 1, positiveMax)).concat([result[positiveMin]]).concat(result.slice(positiveMax + 1, length));
      return result;
    };
    var swapString = function(indexA, indexB, s) {
      var result = swapList(indexA, indexB, s);
      return _isArray(result) ? result.join("") : result;
    };
    var swap = /* @__PURE__ */ _curry3(function(indexA, indexB, o) {
      if (_isArray(o)) {
        return swapList(indexA, indexB, o);
      } else if (_isString(o)) {
        return swapString(indexA, indexB, o);
      } else {
        return swapObject(indexA, indexB, o);
      }
    });
    module2.exports = swap;
  }
});

// node_modules/ramda/src/symmetricDifference.js
var require_symmetricDifference = __commonJS({
  "node_modules/ramda/src/symmetricDifference.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var concat = require_concat2();
    var difference = require_difference();
    var symmetricDifference = /* @__PURE__ */ _curry2(function symmetricDifference2(list1, list2) {
      return concat(difference(list1, list2), difference(list2, list1));
    });
    module2.exports = symmetricDifference;
  }
});

// node_modules/ramda/src/symmetricDifferenceWith.js
var require_symmetricDifferenceWith = __commonJS({
  "node_modules/ramda/src/symmetricDifferenceWith.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var concat = require_concat2();
    var differenceWith = require_differenceWith();
    var symmetricDifferenceWith = /* @__PURE__ */ _curry3(function symmetricDifferenceWith2(pred, list1, list2) {
      return concat(differenceWith(pred, list1, list2), differenceWith(pred, list2, list1));
    });
    module2.exports = symmetricDifferenceWith;
  }
});

// node_modules/ramda/src/takeLastWhile.js
var require_takeLastWhile = __commonJS({
  "node_modules/ramda/src/takeLastWhile.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var slice = require_slice();
    var takeLastWhile = /* @__PURE__ */ _curry2(function takeLastWhile2(fn, xs) {
      var idx = xs.length - 1;
      while (idx >= 0 && fn(xs[idx])) {
        idx -= 1;
      }
      return slice(idx + 1, Infinity, xs);
    });
    module2.exports = takeLastWhile;
  }
});

// node_modules/ramda/src/internal/_xtakeWhile.js
var require_xtakeWhile = __commonJS({
  "node_modules/ramda/src/internal/_xtakeWhile.js"(exports2, module2) {
    var _reduced = require_reduced();
    var _xfBase = require_xfBase();
    var XTakeWhile = /* @__PURE__ */ (function() {
      function XTakeWhile2(f, xf) {
        this.xf = xf;
        this.f = f;
      }
      XTakeWhile2.prototype["@@transducer/init"] = _xfBase.init;
      XTakeWhile2.prototype["@@transducer/result"] = _xfBase.result;
      XTakeWhile2.prototype["@@transducer/step"] = function(result, input) {
        return this.f(input) ? this.xf["@@transducer/step"](result, input) : _reduced(result);
      };
      return XTakeWhile2;
    })();
    function _xtakeWhile(f) {
      return function(xf) {
        return new XTakeWhile(f, xf);
      };
    }
    module2.exports = _xtakeWhile;
  }
});

// node_modules/ramda/src/takeWhile.js
var require_takeWhile = __commonJS({
  "node_modules/ramda/src/takeWhile.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xtakeWhile = require_xtakeWhile();
    var slice = require_slice();
    var takeWhile = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["takeWhile"], _xtakeWhile, function takeWhile2(fn, xs) {
      var idx = 0;
      var len = xs.length;
      while (idx < len && fn(xs[idx])) {
        idx += 1;
      }
      return slice(0, idx, xs);
    }));
    module2.exports = takeWhile;
  }
});

// node_modules/ramda/src/internal/_xtap.js
var require_xtap = __commonJS({
  "node_modules/ramda/src/internal/_xtap.js"(exports2, module2) {
    var _xfBase = require_xfBase();
    var XTap = /* @__PURE__ */ (function() {
      function XTap2(f, xf) {
        this.xf = xf;
        this.f = f;
      }
      XTap2.prototype["@@transducer/init"] = _xfBase.init;
      XTap2.prototype["@@transducer/result"] = _xfBase.result;
      XTap2.prototype["@@transducer/step"] = function(result, input) {
        this.f(input);
        return this.xf["@@transducer/step"](result, input);
      };
      return XTap2;
    })();
    function _xtap(f) {
      return function(xf) {
        return new XTap(f, xf);
      };
    }
    module2.exports = _xtap;
  }
});

// node_modules/ramda/src/tap.js
var require_tap = __commonJS({
  "node_modules/ramda/src/tap.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _xtap = require_xtap();
    var tap = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xtap, function tap2(fn, x) {
      fn(x);
      return x;
    }));
    module2.exports = tap;
  }
});

// node_modules/ramda/src/internal/_isRegExp.js
var require_isRegExp = __commonJS({
  "node_modules/ramda/src/internal/_isRegExp.js"(exports2, module2) {
    function _isRegExp(x) {
      return Object.prototype.toString.call(x) === "[object RegExp]";
    }
    module2.exports = _isRegExp;
  }
});

// node_modules/ramda/src/test.js
var require_test = __commonJS({
  "node_modules/ramda/src/test.js"(exports2, module2) {
    var _cloneRegExp = require_cloneRegExp();
    var _curry2 = require_curry2();
    var _isRegExp = require_isRegExp();
    var toString = require_toString2();
    var test = /* @__PURE__ */ _curry2(function test2(pattern, str) {
      if (!_isRegExp(pattern)) {
        throw new TypeError("\u2018test\u2019 requires a value of type RegExp as its first argument; received " + toString(pattern));
      }
      return _cloneRegExp(pattern).test(str);
    });
    module2.exports = test;
  }
});

// node_modules/ramda/src/andThen.js
var require_andThen = __commonJS({
  "node_modules/ramda/src/andThen.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _assertPromise = require_assertPromise();
    var andThen = /* @__PURE__ */ _curry2(function andThen2(f, p) {
      _assertPromise("andThen", p);
      return p.then(f);
    });
    module2.exports = andThen;
  }
});

// node_modules/ramda/src/toLower.js
var require_toLower = __commonJS({
  "node_modules/ramda/src/toLower.js"(exports2, module2) {
    var invoker = require_invoker();
    var toLower = /* @__PURE__ */ invoker(0, "toLowerCase");
    module2.exports = toLower;
  }
});

// node_modules/ramda/src/toPairs.js
var require_toPairs2 = __commonJS({
  "node_modules/ramda/src/toPairs.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var _toPairs = require_toPairs();
    var toPairs = /* @__PURE__ */ _curry1(_toPairs);
    module2.exports = toPairs;
  }
});

// node_modules/ramda/src/toPairsIn.js
var require_toPairsIn = __commonJS({
  "node_modules/ramda/src/toPairsIn.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var toPairsIn = /* @__PURE__ */ _curry1(function toPairsIn2(obj) {
      var pairs = [];
      for (var prop in obj) {
        pairs[pairs.length] = [prop, obj[prop]];
      }
      return pairs;
    });
    module2.exports = toPairsIn;
  }
});

// node_modules/ramda/src/toUpper.js
var require_toUpper = __commonJS({
  "node_modules/ramda/src/toUpper.js"(exports2, module2) {
    var invoker = require_invoker();
    var toUpper = /* @__PURE__ */ invoker(0, "toUpperCase");
    module2.exports = toUpper;
  }
});

// node_modules/ramda/src/transduce.js
var require_transduce = __commonJS({
  "node_modules/ramda/src/transduce.js"(exports2, module2) {
    var _xReduce = require_xReduce();
    var _xwrap = require_xwrap();
    var curryN = require_curryN2();
    var transduce = /* @__PURE__ */ curryN(4, function transduce2(xf, fn, acc, list) {
      return _xReduce(xf(typeof fn === "function" ? _xwrap(fn) : fn), acc, list);
    });
    module2.exports = transduce;
  }
});

// node_modules/ramda/src/transpose.js
var require_transpose = __commonJS({
  "node_modules/ramda/src/transpose.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var transpose = /* @__PURE__ */ _curry1(function transpose2(outerlist) {
      var i = 0;
      var result = [];
      while (i < outerlist.length) {
        var innerlist = outerlist[i];
        var j = 0;
        while (j < innerlist.length) {
          if (typeof result[j] === "undefined") {
            result[j] = [];
          }
          result[j].push(innerlist[j]);
          j += 1;
        }
        i += 1;
      }
      return result;
    });
    module2.exports = transpose;
  }
});

// node_modules/ramda/src/traverse.js
var require_traverse = __commonJS({
  "node_modules/ramda/src/traverse.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var map = require_map2();
    var sequence = require_sequence();
    var traverse = /* @__PURE__ */ _curry3(function traverse2(F, f, traversable) {
      var of = typeof F["fantasy-land/of"] === "function" ? F["fantasy-land/of"] : typeof F.of === "function" ? F.of : F;
      var TypeRep = {
        "fantasy-land/of": of
      };
      return typeof traversable["fantasy-land/traverse"] === "function" ? traversable["fantasy-land/traverse"](TypeRep, f) : typeof traversable.traverse === "function" ? traversable.traverse(TypeRep, f) : sequence(TypeRep, map(f, traversable));
    });
    module2.exports = traverse;
  }
});

// node_modules/ramda/src/trim.js
var require_trim = __commonJS({
  "node_modules/ramda/src/trim.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var ws = "	\n\v\f\r \xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";
    var zeroWidth = "\u200B";
    var hasProtoTrim = typeof String.prototype.trim === "function";
    var trim = !hasProtoTrim || /* @__PURE__ */ ws.trim() || !/* @__PURE__ */ zeroWidth.trim() ? /* @__PURE__ */ _curry1(function trim2(str) {
      var beginRx = new RegExp("^[" + ws + "][" + ws + "]*");
      var endRx = new RegExp("[" + ws + "][" + ws + "]*$");
      return str.replace(beginRx, "").replace(endRx, "");
    }) : /* @__PURE__ */ _curry1(function trim2(str) {
      return str.trim();
    });
    module2.exports = trim;
  }
});

// node_modules/ramda/src/tryCatch.js
var require_tryCatch = __commonJS({
  "node_modules/ramda/src/tryCatch.js"(exports2, module2) {
    var _arity = require_arity();
    var _concat = require_concat();
    var _curry2 = require_curry2();
    var tryCatch = /* @__PURE__ */ _curry2(function _tryCatch(tryer, catcher) {
      return _arity(tryer.length, function() {
        try {
          return tryer.apply(this, arguments);
        } catch (e) {
          return catcher.apply(this, _concat([e], arguments));
        }
      });
    });
    module2.exports = tryCatch;
  }
});

// node_modules/ramda/src/unapply.js
var require_unapply = __commonJS({
  "node_modules/ramda/src/unapply.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var unapply = /* @__PURE__ */ _curry1(function unapply2(fn) {
      return function() {
        return fn(Array.prototype.slice.call(arguments, 0));
      };
    });
    module2.exports = unapply;
  }
});

// node_modules/ramda/src/unary.js
var require_unary = __commonJS({
  "node_modules/ramda/src/unary.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var nAry = require_nAry();
    var unary = /* @__PURE__ */ _curry1(function unary2(fn) {
      return nAry(1, fn);
    });
    module2.exports = unary;
  }
});

// node_modules/ramda/src/uncurryN.js
var require_uncurryN = __commonJS({
  "node_modules/ramda/src/uncurryN.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var curryN = require_curryN2();
    var uncurryN = /* @__PURE__ */ _curry2(function uncurryN2(depth, fn) {
      return curryN(depth, function() {
        var currentDepth = 1;
        var value = fn;
        var idx = 0;
        var endIdx;
        while (currentDepth <= depth && typeof value === "function") {
          endIdx = currentDepth === depth ? arguments.length : idx + value.length;
          value = value.apply(this, Array.prototype.slice.call(arguments, idx, endIdx));
          currentDepth += 1;
          idx = endIdx;
        }
        return value;
      });
    });
    module2.exports = uncurryN;
  }
});

// node_modules/ramda/src/unfold.js
var require_unfold = __commonJS({
  "node_modules/ramda/src/unfold.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var unfold = /* @__PURE__ */ _curry2(function unfold2(fn, seed) {
      var pair = fn(seed);
      var result = [];
      while (pair && pair.length) {
        result[result.length] = pair[0];
        pair = fn(pair[1]);
      }
      return result;
    });
    module2.exports = unfold;
  }
});

// node_modules/ramda/src/union.js
var require_union = __commonJS({
  "node_modules/ramda/src/union.js"(exports2, module2) {
    var _concat = require_concat();
    var _curry2 = require_curry2();
    var compose = require_compose();
    var uniq = require_uniq();
    var union = /* @__PURE__ */ _curry2(/* @__PURE__ */ compose(uniq, _concat));
    module2.exports = union;
  }
});

// node_modules/ramda/src/internal/_xuniqWith.js
var require_xuniqWith = __commonJS({
  "node_modules/ramda/src/internal/_xuniqWith.js"(exports2, module2) {
    var _includesWith = require_includesWith();
    var _xfBase = require_xfBase();
    var XUniqWith = /* @__PURE__ */ (function() {
      function XUniqWith2(pred, xf) {
        this.xf = xf;
        this.pred = pred;
        this.items = [];
      }
      XUniqWith2.prototype["@@transducer/init"] = _xfBase.init;
      XUniqWith2.prototype["@@transducer/result"] = _xfBase.result;
      XUniqWith2.prototype["@@transducer/step"] = function(result, input) {
        if (_includesWith(this.pred, input, this.items)) {
          return result;
        } else {
          this.items.push(input);
          return this.xf["@@transducer/step"](result, input);
        }
      };
      return XUniqWith2;
    })();
    function _xuniqWith(pred) {
      return function(xf) {
        return new XUniqWith(pred, xf);
      };
    }
    module2.exports = _xuniqWith;
  }
});

// node_modules/ramda/src/uniqWith.js
var require_uniqWith = __commonJS({
  "node_modules/ramda/src/uniqWith.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _dispatchable = require_dispatchable();
    var _includesWith = require_includesWith();
    var _xuniqWith = require_xuniqWith();
    var uniqWith = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], _xuniqWith, function(pred, list) {
      var idx = 0;
      var len = list.length;
      var result = [];
      var item;
      while (idx < len) {
        item = list[idx];
        if (!_includesWith(pred, item, result)) {
          result[result.length] = item;
        }
        idx += 1;
      }
      return result;
    }));
    module2.exports = uniqWith;
  }
});

// node_modules/ramda/src/unionWith.js
var require_unionWith = __commonJS({
  "node_modules/ramda/src/unionWith.js"(exports2, module2) {
    var _concat = require_concat();
    var _curry3 = require_curry3();
    var uniqWith = require_uniqWith();
    var unionWith = /* @__PURE__ */ _curry3(function unionWith2(pred, list1, list2) {
      return uniqWith(pred, _concat(list1, list2));
    });
    module2.exports = unionWith;
  }
});

// node_modules/ramda/src/unless.js
var require_unless = __commonJS({
  "node_modules/ramda/src/unless.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var unless = /* @__PURE__ */ _curry3(function unless2(pred, whenFalseFn, x) {
      return pred(x) ? x : whenFalseFn(x);
    });
    module2.exports = unless;
  }
});

// node_modules/ramda/src/unnest.js
var require_unnest = __commonJS({
  "node_modules/ramda/src/unnest.js"(exports2, module2) {
    var _identity = require_identity();
    var chain = require_chain2();
    var unnest = /* @__PURE__ */ chain(_identity);
    module2.exports = unnest;
  }
});

// node_modules/ramda/src/until.js
var require_until = __commonJS({
  "node_modules/ramda/src/until.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var until = /* @__PURE__ */ _curry3(function until2(pred, fn, init) {
      var val = init;
      while (!pred(val)) {
        val = fn(val);
      }
      return val;
    });
    module2.exports = until;
  }
});

// node_modules/ramda/src/unwind.js
var require_unwind = __commonJS({
  "node_modules/ramda/src/unwind.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _isArray = require_isArray();
    var _map = require_map();
    var _assoc = require_assoc();
    var unwind = /* @__PURE__ */ _curry2(function(key, object) {
      if (!(key in object && _isArray(object[key]))) {
        return [object];
      }
      return _map(function(item) {
        return _assoc(key, item, object);
      }, object[key]);
    });
    module2.exports = unwind;
  }
});

// node_modules/ramda/src/valuesIn.js
var require_valuesIn = __commonJS({
  "node_modules/ramda/src/valuesIn.js"(exports2, module2) {
    var _curry1 = require_curry1();
    var valuesIn = /* @__PURE__ */ _curry1(function valuesIn2(obj) {
      var prop;
      var vs = [];
      for (prop in obj) {
        vs[vs.length] = obj[prop];
      }
      return vs;
    });
    module2.exports = valuesIn;
  }
});

// node_modules/ramda/src/view.js
var require_view = __commonJS({
  "node_modules/ramda/src/view.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var Const = function(x) {
      return {
        value: x,
        "fantasy-land/map": function() {
          return this;
        }
      };
    };
    var view = /* @__PURE__ */ _curry2(function view2(lens, x) {
      return lens(Const)(x).value;
    });
    module2.exports = view;
  }
});

// node_modules/ramda/src/when.js
var require_when = __commonJS({
  "node_modules/ramda/src/when.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var when = /* @__PURE__ */ _curry3(function when2(pred, whenTrueFn, x) {
      return pred(x) ? whenTrueFn(x) : x;
    });
    module2.exports = when;
  }
});

// node_modules/ramda/src/where.js
var require_where = __commonJS({
  "node_modules/ramda/src/where.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _has = require_has();
    var where = /* @__PURE__ */ _curry2(function where2(spec, testObj) {
      for (var prop in spec) {
        if (_has(prop, spec) && !spec[prop](testObj[prop])) {
          return false;
        }
      }
      return true;
    });
    module2.exports = where;
  }
});

// node_modules/ramda/src/whereAny.js
var require_whereAny = __commonJS({
  "node_modules/ramda/src/whereAny.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _has = require_has();
    var whereAny = /* @__PURE__ */ _curry2(function whereAny2(spec, testObj) {
      for (var prop in spec) {
        if (_has(prop, spec) && spec[prop](testObj[prop])) {
          return true;
        }
      }
      return false;
    });
    module2.exports = whereAny;
  }
});

// node_modules/ramda/src/whereEq.js
var require_whereEq = __commonJS({
  "node_modules/ramda/src/whereEq.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var equals = require_equals2();
    var map = require_map2();
    var where = require_where();
    var whereEq = /* @__PURE__ */ _curry2(function whereEq2(spec, testObj) {
      return where(map(equals, spec), testObj);
    });
    module2.exports = whereEq;
  }
});

// node_modules/ramda/src/without.js
var require_without = __commonJS({
  "node_modules/ramda/src/without.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var _Set = require_Set();
    var reject = require_reject();
    var without = /* @__PURE__ */ _curry2(function without2(xs, list) {
      var toRemove = new _Set();
      for (var i = 0; i < xs.length; i += 1) {
        toRemove.add(xs[i]);
      }
      return reject(toRemove.has.bind(toRemove), list);
    });
    module2.exports = without;
  }
});

// node_modules/ramda/src/xor.js
var require_xor = __commonJS({
  "node_modules/ramda/src/xor.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var xor = /* @__PURE__ */ _curry2(function xor2(a, b) {
      return Boolean(!a ^ !b);
    });
    module2.exports = xor;
  }
});

// node_modules/ramda/src/xprod.js
var require_xprod = __commonJS({
  "node_modules/ramda/src/xprod.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var xprod = /* @__PURE__ */ _curry2(function xprod2(a, b) {
      var i = 0;
      var ilen = a.length;
      var j;
      var jlen = b.length;
      var result = Array(ilen * jlen);
      while (i < ilen) {
        j = 0;
        while (j < jlen) {
          result[i * jlen + j] = [a[i], b[j]];
          j += 1;
        }
        i += 1;
      }
      return result;
    });
    module2.exports = xprod;
  }
});

// node_modules/ramda/src/zip.js
var require_zip = __commonJS({
  "node_modules/ramda/src/zip.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var zip = /* @__PURE__ */ _curry2(function zip2(a, b) {
      var len = Math.min(a.length, b.length);
      var rv = Array(len);
      var idx = 0;
      while (idx < len) {
        rv[idx] = [a[idx], b[idx]];
        idx += 1;
      }
      return rv;
    });
    module2.exports = zip;
  }
});

// node_modules/ramda/src/zipObj.js
var require_zipObj = __commonJS({
  "node_modules/ramda/src/zipObj.js"(exports2, module2) {
    var _curry2 = require_curry2();
    var zipObj = /* @__PURE__ */ _curry2(function zipObj2(keys, values) {
      var idx = 0;
      var len = Math.min(keys.length, values.length);
      var out = {};
      while (idx < len) {
        out[keys[idx]] = values[idx];
        idx += 1;
      }
      return out;
    });
    module2.exports = zipObj;
  }
});

// node_modules/ramda/src/zipWith.js
var require_zipWith = __commonJS({
  "node_modules/ramda/src/zipWith.js"(exports2, module2) {
    var _curry3 = require_curry3();
    var zipWith = /* @__PURE__ */ _curry3(function zipWith2(fn, a, b) {
      var len = Math.min(a.length, b.length);
      var rv = Array(len);
      var idx = 0;
      while (idx < len) {
        rv[idx] = fn(a[idx], b[idx]);
        idx += 1;
      }
      return rv;
    });
    module2.exports = zipWith;
  }
});

// node_modules/ramda/src/thunkify.js
var require_thunkify = __commonJS({
  "node_modules/ramda/src/thunkify.js"(exports2, module2) {
    var curryN = require_curryN2();
    var _curry1 = require_curry1();
    var thunkify = /* @__PURE__ */ _curry1(function thunkify2(fn) {
      return curryN(fn.length, function createThunk() {
        var fnArgs = arguments;
        return function invokeThunk() {
          return fn.apply(this, fnArgs);
        };
      });
    });
    module2.exports = thunkify;
  }
});

// node_modules/ramda/src/index.js
var require_src = __commonJS({
  "node_modules/ramda/src/index.js"(exports2, module2) {
    module2.exports = {};
    module2.exports.F = require_F();
    module2.exports.T = require_T();
    module2.exports.__ = require__();
    module2.exports.add = require_add();
    module2.exports.addIndex = require_addIndex();
    module2.exports.addIndexRight = require_addIndexRight();
    module2.exports.adjust = require_adjust();
    module2.exports.all = require_all();
    module2.exports.allPass = require_allPass();
    module2.exports.always = require_always();
    module2.exports.and = require_and();
    module2.exports.any = require_any();
    module2.exports.anyPass = require_anyPass();
    module2.exports.ap = require_ap();
    module2.exports.aperture = require_aperture2();
    module2.exports.append = require_append();
    module2.exports.apply = require_apply();
    module2.exports.applySpec = require_applySpec();
    module2.exports.applyTo = require_applyTo();
    module2.exports.ascend = require_ascend();
    module2.exports.ascendNatural = require_ascendNatural();
    module2.exports.assoc = require_assoc2();
    module2.exports.assocPath = require_assocPath();
    module2.exports.binary = require_binary();
    module2.exports.bind = require_bind();
    module2.exports.both = require_both();
    module2.exports.call = require_call();
    module2.exports.chain = require_chain2();
    module2.exports.clamp = require_clamp();
    module2.exports.clone = require_clone2();
    module2.exports.collectBy = require_collectBy();
    module2.exports.comparator = require_comparator();
    module2.exports.complement = require_complement2();
    module2.exports.compose = require_compose();
    module2.exports.composeWith = require_composeWith();
    module2.exports.concat = require_concat2();
    module2.exports.cond = require_cond();
    module2.exports.construct = require_construct();
    module2.exports.constructN = require_constructN();
    module2.exports.converge = require_converge();
    module2.exports.count = require_count();
    module2.exports.countBy = require_countBy();
    module2.exports.curry = require_curry();
    module2.exports.curryN = require_curryN2();
    module2.exports.dec = require_dec();
    module2.exports.defaultTo = require_defaultTo();
    module2.exports.descend = require_descend();
    module2.exports.descendNatural = require_descendNatural();
    module2.exports.difference = require_difference();
    module2.exports.differenceWith = require_differenceWith();
    module2.exports.dissoc = require_dissoc2();
    module2.exports.dissocPath = require_dissocPath();
    module2.exports.divide = require_divide();
    module2.exports.drop = require_drop();
    module2.exports.dropLast = require_dropLast2();
    module2.exports.dropLastWhile = require_dropLastWhile2();
    module2.exports.dropRepeats = require_dropRepeats();
    module2.exports.dropRepeatsBy = require_dropRepeatsBy();
    module2.exports.dropRepeatsWith = require_dropRepeatsWith();
    module2.exports.dropWhile = require_dropWhile();
    module2.exports.either = require_either();
    module2.exports.empty = require_empty();
    module2.exports.endsWith = require_endsWith();
    module2.exports.eqBy = require_eqBy();
    module2.exports.eqProps = require_eqProps();
    module2.exports.equals = require_equals2();
    module2.exports.evolve = require_evolve();
    module2.exports.filter = require_filter2();
    module2.exports.find = require_find();
    module2.exports.findIndex = require_findIndex();
    module2.exports.findLast = require_findLast();
    module2.exports.findLastIndex = require_findLastIndex();
    module2.exports.flatten = require_flatten();
    module2.exports.flip = require_flip();
    module2.exports.flow = require_flow();
    module2.exports.forEach = require_forEach();
    module2.exports.forEachObjIndexed = require_forEachObjIndexed();
    module2.exports.fromPairs = require_fromPairs2();
    module2.exports.groupBy = require_groupBy();
    module2.exports.groupWith = require_groupWith();
    module2.exports.gt = require_gt();
    module2.exports.gte = require_gte();
    module2.exports.has = require_has2();
    module2.exports.hasIn = require_hasIn();
    module2.exports.hasPath = require_hasPath();
    module2.exports.head = require_head();
    module2.exports.identical = require_identical();
    module2.exports.identity = require_identity2();
    module2.exports.ifElse = require_ifElse();
    module2.exports.inc = require_inc();
    module2.exports.includes = require_includes2();
    module2.exports.indexBy = require_indexBy();
    module2.exports.indexOf = require_indexOf2();
    module2.exports.init = require_init();
    module2.exports.innerJoin = require_innerJoin();
    module2.exports.insert = require_insert();
    module2.exports.insertAll = require_insertAll();
    module2.exports.intersection = require_intersection();
    module2.exports.intersperse = require_intersperse();
    module2.exports.into = require_into();
    module2.exports.invert = require_invert();
    module2.exports.invertObj = require_invertObj();
    module2.exports.invoker = require_invoker();
    module2.exports.is = require_is();
    module2.exports.isEmpty = require_isEmpty();
    module2.exports.isNil = require_isNil();
    module2.exports.isNotEmpty = require_isNotEmpty();
    module2.exports.isNotNil = require_isNotNil();
    module2.exports.join = require_join();
    module2.exports.juxt = require_juxt();
    module2.exports.keys = require_keys();
    module2.exports.keysIn = require_keysIn();
    module2.exports.last = require_last();
    module2.exports.lastIndexOf = require_lastIndexOf();
    module2.exports.length = require_length();
    module2.exports.lens = require_lens();
    module2.exports.lensIndex = require_lensIndex();
    module2.exports.lensPath = require_lensPath();
    module2.exports.lensProp = require_lensProp();
    module2.exports.lift = require_lift();
    module2.exports.liftN = require_liftN();
    module2.exports.lt = require_lt();
    module2.exports.lte = require_lte();
    module2.exports.map = require_map2();
    module2.exports.mapAccum = require_mapAccum();
    module2.exports.mapAccumRight = require_mapAccumRight();
    module2.exports.mapKeys = require_mapKeys2();
    module2.exports.mapObjIndexed = require_mapObjIndexed();
    module2.exports.match = require_match();
    module2.exports.mathMod = require_mathMod();
    module2.exports.max = require_max();
    module2.exports.maxBy = require_maxBy();
    module2.exports.mean = require_mean();
    module2.exports.median = require_median();
    module2.exports.memoizeWith = require_memoizeWith();
    module2.exports.mergeAll = require_mergeAll();
    module2.exports.mergeDeepLeft = require_mergeDeepLeft();
    module2.exports.mergeDeepRight = require_mergeDeepRight();
    module2.exports.mergeDeepWith = require_mergeDeepWith();
    module2.exports.mergeDeepWithKey = require_mergeDeepWithKey();
    module2.exports.mergeLeft = require_mergeLeft();
    module2.exports.mergeRight = require_mergeRight();
    module2.exports.mergeWith = require_mergeWith();
    module2.exports.mergeWithKey = require_mergeWithKey();
    module2.exports.min = require_min();
    module2.exports.minBy = require_minBy();
    module2.exports.modify = require_modify2();
    module2.exports.modifyPath = require_modifyPath();
    module2.exports.modulo = require_modulo();
    module2.exports.move = require_move();
    module2.exports.multiply = require_multiply();
    module2.exports.nAry = require_nAry();
    module2.exports.partialObject = require_partialObject();
    module2.exports.negate = require_negate();
    module2.exports.none = require_none();
    module2.exports.not = require_not();
    module2.exports.nth = require_nth2();
    module2.exports.nthArg = require_nthArg();
    module2.exports.o = require_o();
    module2.exports.objOf = require_objOf();
    module2.exports.of = require_of();
    module2.exports.omit = require_omit();
    module2.exports.on = require_on();
    module2.exports.once = require_once();
    module2.exports.or = require_or();
    module2.exports.otherwise = require_otherwise();
    module2.exports.over = require_over();
    module2.exports.pair = require_pair();
    module2.exports.partial = require_partial();
    module2.exports.partialRight = require_partialRight();
    module2.exports.partition = require_partition();
    module2.exports.path = require_path2();
    module2.exports.paths = require_paths();
    module2.exports.pathEq = require_pathEq();
    module2.exports.pathOr = require_pathOr();
    module2.exports.pathSatisfies = require_pathSatisfies();
    module2.exports.pick = require_pick();
    module2.exports.pickAll = require_pickAll();
    module2.exports.pickBy = require_pickBy();
    module2.exports.pipe = require_pipe2();
    module2.exports.pipeWith = require_pipeWith();
    module2.exports.pluck = require_pluck();
    module2.exports.prepend = require_prepend();
    module2.exports.product = require_product();
    module2.exports.project = require_project();
    module2.exports.promap = require_promap2();
    module2.exports.prop = require_prop2();
    module2.exports.propEq = require_propEq();
    module2.exports.propIs = require_propIs();
    module2.exports.propOr = require_propOr();
    module2.exports.propSatisfies = require_propSatisfies();
    module2.exports.props = require_props();
    module2.exports.range = require_range();
    module2.exports.rebuild = require_rebuild2();
    module2.exports.reduce = require_reduce();
    module2.exports.reduceBy = require_reduceBy();
    module2.exports.reduceRight = require_reduceRight();
    module2.exports.reduceWhile = require_reduceWhile();
    module2.exports.reduced = require_reduced2();
    module2.exports.reject = require_reject();
    module2.exports.remove = require_remove();
    module2.exports.renameKeys = require_renameKeys();
    module2.exports.repeat = require_repeat();
    module2.exports.replace = require_replace();
    module2.exports.reverse = require_reverse();
    module2.exports.scan = require_scan();
    module2.exports.sequence = require_sequence();
    module2.exports.set = require_set();
    module2.exports.slice = require_slice();
    module2.exports.sort = require_sort();
    module2.exports.sortBy = require_sortBy();
    module2.exports.sortWith = require_sortWith();
    module2.exports.split = require_split();
    module2.exports.splitAt = require_splitAt();
    module2.exports.splitEvery = require_splitEvery();
    module2.exports.splitWhen = require_splitWhen();
    module2.exports.splitWhenever = require_splitWhenever();
    module2.exports.startsWith = require_startsWith();
    module2.exports.subtract = require_subtract();
    module2.exports.sum = require_sum();
    module2.exports.swap = require_swap();
    module2.exports.symmetricDifference = require_symmetricDifference();
    module2.exports.symmetricDifferenceWith = require_symmetricDifferenceWith();
    module2.exports.tail = require_tail();
    module2.exports.take = require_take();
    module2.exports.takeLast = require_takeLast();
    module2.exports.takeLastWhile = require_takeLastWhile();
    module2.exports.takeWhile = require_takeWhile();
    module2.exports.tap = require_tap();
    module2.exports.test = require_test();
    module2.exports.andThen = require_andThen();
    module2.exports.times = require_times();
    module2.exports.toLower = require_toLower();
    module2.exports.toPairs = require_toPairs2();
    module2.exports.toPairsIn = require_toPairsIn();
    module2.exports.toString = require_toString2();
    module2.exports.toUpper = require_toUpper();
    module2.exports.transduce = require_transduce();
    module2.exports.transpose = require_transpose();
    module2.exports.traverse = require_traverse();
    module2.exports.trim = require_trim();
    module2.exports.tryCatch = require_tryCatch();
    module2.exports.type = require_type();
    module2.exports.unapply = require_unapply();
    module2.exports.unary = require_unary();
    module2.exports.uncurryN = require_uncurryN();
    module2.exports.unfold = require_unfold();
    module2.exports.union = require_union();
    module2.exports.unionWith = require_unionWith();
    module2.exports.uniq = require_uniq();
    module2.exports.uniqBy = require_uniqBy();
    module2.exports.uniqWith = require_uniqWith();
    module2.exports.unless = require_unless();
    module2.exports.unnest = require_unnest();
    module2.exports.until = require_until();
    module2.exports.unwind = require_unwind();
    module2.exports.update = require_update();
    module2.exports.useWith = require_useWith();
    module2.exports.values = require_values();
    module2.exports.valuesIn = require_valuesIn();
    module2.exports.view = require_view();
    module2.exports.when = require_when();
    module2.exports.where = require_where();
    module2.exports.whereAny = require_whereAny();
    module2.exports.whereEq = require_whereEq();
    module2.exports.without = require_without();
    module2.exports.xor = require_xor();
    module2.exports.xprod = require_xprod();
    module2.exports.zip = require_zip();
    module2.exports.zipObj = require_zipObj();
    module2.exports.zipWith = require_zipWith();
    module2.exports.thunkify = require_thunkify();
  }
});

// node_modules/sort-unwind/dist/index.cjs
var require_dist = __commonJS({
  "node_modules/sort-unwind/dist/index.cjs"(exports2, module2) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var src_exports = {};
    __export(src_exports, {
      curried: () => curried,
      default: () => src_default,
      unwind: () => unwind
    });
    module2.exports = __toCommonJS(src_exports);
    var curried = (rank) => (src) => {
      if (src.length === 0) return [[], []];
      const zipped = [];
      src.forEach((_, i) => {
        zipped.push([rank[i], i, src[i]]);
      });
      zipped.sort(([a], [b]) => a - b);
      const dst = [];
      const derank = [];
      zipped.forEach(([_, i, o]) => {
        derank.push(i);
        dst.push(o);
      });
      return [dst, derank];
    };
    var unwind = (rank, src) => curried(rank)(src);
    var src_default = unwind;
  }
});

// node_modules/@stdlib/math-base-assert-is-nan/lib/main.js
var require_main = __commonJS({
  "node_modules/@stdlib/math-base-assert-is-nan/lib/main.js"(exports2, module2) {
    "use strict";
    function isnan(x) {
      return x !== x;
    }
    module2.exports = isnan;
  }
});

// node_modules/@stdlib/math-base-assert-is-nan/lib/index.js
var require_lib = __commonJS({
  "node_modules/@stdlib/math-base-assert-is-nan/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main();
    module2.exports = main;
  }
});

// node_modules/@stdlib/math-base-special-floor/lib/main.js
var require_main2 = __commonJS({
  "node_modules/@stdlib/math-base-special-floor/lib/main.js"(exports2, module2) {
    "use strict";
    var floor = Math.floor;
    module2.exports = floor;
  }
});

// node_modules/@stdlib/math-base-special-floor/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/@stdlib/math-base-special-floor/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main2();
    module2.exports = main;
  }
});

// node_modules/@stdlib/math-base-special-ceil/lib/main.js
var require_main3 = __commonJS({
  "node_modules/@stdlib/math-base-special-ceil/lib/main.js"(exports2, module2) {
    "use strict";
    var ceil = Math.ceil;
    module2.exports = ceil;
  }
});

// node_modules/@stdlib/math-base-special-ceil/lib/index.js
var require_lib3 = __commonJS({
  "node_modules/@stdlib/math-base-special-ceil/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main3();
    module2.exports = main;
  }
});

// node_modules/@stdlib/math-base-special-trunc/lib/main.js
var require_main4 = __commonJS({
  "node_modules/@stdlib/math-base-special-trunc/lib/main.js"(exports2, module2) {
    "use strict";
    var floor = require_lib2();
    var ceil = require_lib3();
    function trunc(x) {
      if (x < 0) {
        return ceil(x);
      }
      return floor(x);
    }
    module2.exports = trunc;
  }
});

// node_modules/@stdlib/math-base-special-trunc/lib/index.js
var require_lib4 = __commonJS({
  "node_modules/@stdlib/math-base-special-trunc/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main4();
    module2.exports = main;
  }
});

// node_modules/@stdlib/number-ctor/lib/main.js
var require_main5 = __commonJS({
  "node_modules/@stdlib/number-ctor/lib/main.js"(exports2, module2) {
    "use strict";
    module2.exports = Number;
  }
});

// node_modules/@stdlib/number-ctor/lib/index.js
var require_lib5 = __commonJS({
  "node_modules/@stdlib/number-ctor/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main5();
    module2.exports = main;
  }
});

// node_modules/@stdlib/constants-float64-ninf/lib/index.js
var require_lib6 = __commonJS({
  "node_modules/@stdlib/constants-float64-ninf/lib/index.js"(exports2, module2) {
    "use strict";
    var Number2 = require_lib5();
    var FLOAT64_NINF = Number2.NEGATIVE_INFINITY;
    module2.exports = FLOAT64_NINF;
  }
});

// node_modules/@stdlib/constants-float64-pinf/lib/index.js
var require_lib7 = __commonJS({
  "node_modules/@stdlib/constants-float64-pinf/lib/index.js"(exports2, module2) {
    "use strict";
    var FLOAT64_PINF = Number.POSITIVE_INFINITY;
    module2.exports = FLOAT64_PINF;
  }
});

// node_modules/@stdlib/constants-float64-exponent-bias/lib/index.js
var require_lib8 = __commonJS({
  "node_modules/@stdlib/constants-float64-exponent-bias/lib/index.js"(exports2, module2) {
    "use strict";
    var FLOAT64_EXPONENT_BIAS = 1023 | 0;
    module2.exports = FLOAT64_EXPONENT_BIAS;
  }
});

// node_modules/@stdlib/constants-float64-max-base2-exponent/lib/index.js
var require_lib9 = __commonJS({
  "node_modules/@stdlib/constants-float64-max-base2-exponent/lib/index.js"(exports2, module2) {
    "use strict";
    var FLOAT64_MAX_BASE2_EXPONENT = 1023 | 0;
    module2.exports = FLOAT64_MAX_BASE2_EXPONENT;
  }
});

// node_modules/@stdlib/constants-float64-max-base2-exponent-subnormal/lib/index.js
var require_lib10 = __commonJS({
  "node_modules/@stdlib/constants-float64-max-base2-exponent-subnormal/lib/index.js"(exports2, module2) {
    "use strict";
    var FLOAT64_MAX_BASE2_EXPONENT_SUBNORMAL = -1023 | 0;
    module2.exports = FLOAT64_MAX_BASE2_EXPONENT_SUBNORMAL;
  }
});

// node_modules/@stdlib/constants-float64-min-base2-exponent-subnormal/lib/index.js
var require_lib11 = __commonJS({
  "node_modules/@stdlib/constants-float64-min-base2-exponent-subnormal/lib/index.js"(exports2, module2) {
    "use strict";
    var FLOAT64_MIN_BASE2_EXPONENT_SUBNORMAL = -1074 | 0;
    module2.exports = FLOAT64_MIN_BASE2_EXPONENT_SUBNORMAL;
  }
});

// node_modules/@stdlib/math-base-assert-is-infinite/lib/main.js
var require_main6 = __commonJS({
  "node_modules/@stdlib/math-base-assert-is-infinite/lib/main.js"(exports2, module2) {
    "use strict";
    var PINF = require_lib7();
    var NINF = require_lib6();
    function isInfinite(x) {
      return x === PINF || x === NINF;
    }
    module2.exports = isInfinite;
  }
});

// node_modules/@stdlib/math-base-assert-is-infinite/lib/index.js
var require_lib12 = __commonJS({
  "node_modules/@stdlib/math-base-assert-is-infinite/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main6();
    module2.exports = main;
  }
});

// node_modules/@stdlib/constants-float64-high-word-sign-mask/lib/index.js
var require_lib13 = __commonJS({
  "node_modules/@stdlib/constants-float64-high-word-sign-mask/lib/index.js"(exports2, module2) {
    "use strict";
    var FLOAT64_HIGH_WORD_SIGN_MASK = 2147483648 >>> 0;
    module2.exports = FLOAT64_HIGH_WORD_SIGN_MASK;
  }
});

// node_modules/@stdlib/constants-float64-high-word-abs-mask/lib/index.js
var require_lib14 = __commonJS({
  "node_modules/@stdlib/constants-float64-high-word-abs-mask/lib/index.js"(exports2, module2) {
    "use strict";
    var FLOAT64_HIGH_WORD_ABS_MASK = 2147483647 >>> 0;
    module2.exports = FLOAT64_HIGH_WORD_ABS_MASK;
  }
});

// node_modules/@stdlib/utils-define-property/lib/define_property.js
var require_define_property = __commonJS({
  "node_modules/@stdlib/utils-define-property/lib/define_property.js"(exports2, module2) {
    "use strict";
    var main = typeof Object.defineProperty === "function" ? Object.defineProperty : null;
    module2.exports = main;
  }
});

// node_modules/@stdlib/utils-define-property/lib/has_define_property_support.js
var require_has_define_property_support = __commonJS({
  "node_modules/@stdlib/utils-define-property/lib/has_define_property_support.js"(exports2, module2) {
    "use strict";
    var defineProperty = require_define_property();
    function hasDefinePropertySupport() {
      try {
        defineProperty({}, "x", {});
        return true;
      } catch (err) {
        return false;
      }
    }
    module2.exports = hasDefinePropertySupport;
  }
});

// node_modules/@stdlib/utils-define-property/lib/builtin.js
var require_builtin = __commonJS({
  "node_modules/@stdlib/utils-define-property/lib/builtin.js"(exports2, module2) {
    "use strict";
    var defineProperty = Object.defineProperty;
    module2.exports = defineProperty;
  }
});

// node_modules/@stdlib/string-base-format-interpolate/lib/is_number.js
var require_is_number = __commonJS({
  "node_modules/@stdlib/string-base-format-interpolate/lib/is_number.js"(exports2, module2) {
    "use strict";
    function isNumber(value) {
      return typeof value === "number";
    }
    module2.exports = isNumber;
  }
});

// node_modules/@stdlib/string-base-format-interpolate/lib/zero_pad.js
var require_zero_pad = __commonJS({
  "node_modules/@stdlib/string-base-format-interpolate/lib/zero_pad.js"(exports2, module2) {
    "use strict";
    function startsWithMinus(str) {
      return str[0] === "-";
    }
    function zeros(n) {
      var out = "";
      var i;
      for (i = 0; i < n; i++) {
        out += "0";
      }
      return out;
    }
    function zeroPad(str, width, right) {
      var negative = false;
      var pad = width - str.length;
      if (pad < 0) {
        return str;
      }
      if (startsWithMinus(str)) {
        negative = true;
        str = str.substr(1);
      }
      str = right ? str + zeros(pad) : zeros(pad) + str;
      if (negative) {
        str = "-" + str;
      }
      return str;
    }
    module2.exports = zeroPad;
  }
});

// node_modules/@stdlib/string-base-format-interpolate/lib/format_integer.js
var require_format_integer = __commonJS({
  "node_modules/@stdlib/string-base-format-interpolate/lib/format_integer.js"(exports2, module2) {
    "use strict";
    var isNumber = require_is_number();
    var zeroPad = require_zero_pad();
    var lowercase = String.prototype.toLowerCase;
    var uppercase = String.prototype.toUpperCase;
    function formatInteger(token) {
      var base;
      var out;
      var i;
      switch (token.specifier) {
        case "b":
          base = 2;
          break;
        case "o":
          base = 8;
          break;
        case "x":
        case "X":
          base = 16;
          break;
        case "d":
        case "i":
        case "u":
        default:
          base = 10;
          break;
      }
      out = token.arg;
      i = parseInt(out, 10);
      if (!isFinite(i)) {
        if (!isNumber(out)) {
          throw new Error("invalid integer. Value: " + out);
        }
        i = 0;
      }
      if (i < 0 && (token.specifier === "u" || base !== 10)) {
        i = 4294967295 + i + 1;
      }
      if (i < 0) {
        out = (-i).toString(base);
        if (token.precision) {
          out = zeroPad(out, token.precision, token.padRight);
        }
        out = "-" + out;
      } else {
        out = i.toString(base);
        if (!i && !token.precision) {
          out = "";
        } else if (token.precision) {
          out = zeroPad(out, token.precision, token.padRight);
        }
        if (token.sign) {
          out = token.sign + out;
        }
      }
      if (base === 16) {
        if (token.alternate) {
          out = "0x" + out;
        }
        out = token.specifier === uppercase.call(token.specifier) ? uppercase.call(out) : lowercase.call(out);
      }
      if (base === 8) {
        if (token.alternate && out.charAt(0) !== "0") {
          out = "0" + out;
        }
      }
      return out;
    }
    module2.exports = formatInteger;
  }
});

// node_modules/@stdlib/string-base-format-interpolate/lib/is_string.js
var require_is_string = __commonJS({
  "node_modules/@stdlib/string-base-format-interpolate/lib/is_string.js"(exports2, module2) {
    "use strict";
    function isString(value) {
      return typeof value === "string";
    }
    module2.exports = isString;
  }
});

// node_modules/@stdlib/string-base-format-interpolate/lib/format_double.js
var require_format_double = __commonJS({
  "node_modules/@stdlib/string-base-format-interpolate/lib/format_double.js"(exports2, module2) {
    "use strict";
    var abs = Math.abs;
    var lowercase = String.prototype.toLowerCase;
    var uppercase = String.prototype.toUpperCase;
    var replace = String.prototype.replace;
    var RE_EXP_POS_DIGITS = /e\+(\d)$/;
    var RE_EXP_NEG_DIGITS = /e-(\d)$/;
    var RE_ONLY_DIGITS = /^(\d+)$/;
    var RE_DIGITS_BEFORE_EXP = /^(\d+)e/;
    var RE_TRAILING_PERIOD_ZERO = /\.0$/;
    var RE_PERIOD_ZERO_EXP = /\.0*e/;
    var RE_ZERO_BEFORE_EXP = /(\..*[^0])0*e/;
    function formatDouble(f, token) {
      var digits;
      var out;
      switch (token.specifier) {
        case "e":
        case "E":
          out = f.toExponential(token.precision);
          break;
        case "f":
        case "F":
          out = f.toFixed(token.precision);
          break;
        case "g":
        case "G":
          if (abs(f) < 1e-4) {
            digits = token.precision;
            if (digits > 0) {
              digits -= 1;
            }
            out = f.toExponential(digits);
          } else {
            out = f.toPrecision(token.precision);
          }
          if (!token.alternate) {
            out = replace.call(out, RE_ZERO_BEFORE_EXP, "$1e");
            out = replace.call(out, RE_PERIOD_ZERO_EXP, "e");
            out = replace.call(out, RE_TRAILING_PERIOD_ZERO, "");
          }
          break;
        default:
          throw new Error("invalid double notation. Value: " + token.specifier);
      }
      out = replace.call(out, RE_EXP_POS_DIGITS, "e+0$1");
      out = replace.call(out, RE_EXP_NEG_DIGITS, "e-0$1");
      if (token.alternate) {
        out = replace.call(out, RE_ONLY_DIGITS, "$1.");
        out = replace.call(out, RE_DIGITS_BEFORE_EXP, "$1.e");
      }
      if (f >= 0 && token.sign) {
        out = token.sign + out;
      }
      out = token.specifier === uppercase.call(token.specifier) ? uppercase.call(out) : lowercase.call(out);
      return out;
    }
    module2.exports = formatDouble;
  }
});

// node_modules/@stdlib/string-base-format-interpolate/lib/space_pad.js
var require_space_pad = __commonJS({
  "node_modules/@stdlib/string-base-format-interpolate/lib/space_pad.js"(exports2, module2) {
    "use strict";
    function spaces(n) {
      var out = "";
      var i;
      for (i = 0; i < n; i++) {
        out += " ";
      }
      return out;
    }
    function spacePad(str, width, right) {
      var pad = width - str.length;
      if (pad < 0) {
        return str;
      }
      str = right ? str + spaces(pad) : spaces(pad) + str;
      return str;
    }
    module2.exports = spacePad;
  }
});

// node_modules/@stdlib/string-base-format-interpolate/lib/main.js
var require_main7 = __commonJS({
  "node_modules/@stdlib/string-base-format-interpolate/lib/main.js"(exports2, module2) {
    "use strict";
    var formatInteger = require_format_integer();
    var isString = require_is_string();
    var isNumber = require_is_number();
    var formatDouble = require_format_double();
    var spacePad = require_space_pad();
    var zeroPad = require_zero_pad();
    var fromCharCode = String.fromCharCode;
    var isArray = Array.isArray;
    function isnan(value) {
      return value !== value;
    }
    function initialize(token) {
      var out = {};
      out.specifier = token.specifier;
      out.precision = token.precision === void 0 ? 1 : token.precision;
      out.width = token.width;
      out.flags = token.flags || "";
      out.mapping = token.mapping;
      return out;
    }
    function formatInterpolate(tokens) {
      var hasPeriod;
      var flags;
      var token;
      var flag;
      var num;
      var out;
      var pos;
      var f;
      var i;
      var j;
      if (!isArray(tokens)) {
        throw new TypeError("invalid argument. First argument must be an array. Value: `" + tokens + "`.");
      }
      out = "";
      pos = 1;
      for (i = 0; i < tokens.length; i++) {
        token = tokens[i];
        if (isString(token)) {
          out += token;
        } else {
          hasPeriod = token.precision !== void 0;
          token = initialize(token);
          if (!token.specifier) {
            throw new TypeError("invalid argument. Token is missing `specifier` property. Index: `" + i + "`. Value: `" + token + "`.");
          }
          if (token.mapping) {
            pos = token.mapping;
          }
          flags = token.flags;
          for (j = 0; j < flags.length; j++) {
            flag = flags.charAt(j);
            switch (flag) {
              case " ":
                token.sign = " ";
                break;
              case "+":
                token.sign = "+";
                break;
              case "-":
                token.padRight = true;
                token.padZeros = false;
                break;
              case "0":
                token.padZeros = flags.indexOf("-") < 0;
                break;
              case "#":
                token.alternate = true;
                break;
              default:
                throw new Error("invalid flag: " + flag);
            }
          }
          if (token.width === "*") {
            token.width = parseInt(arguments[pos], 10);
            pos += 1;
            if (isnan(token.width)) {
              throw new TypeError("the argument for * width at position " + pos + " is not a number. Value: `" + token.width + "`.");
            }
            if (token.width < 0) {
              token.padRight = true;
              token.width = -token.width;
            }
          }
          if (hasPeriod) {
            if (token.precision === "*") {
              token.precision = parseInt(arguments[pos], 10);
              pos += 1;
              if (isnan(token.precision)) {
                throw new TypeError("the argument for * precision at position " + pos + " is not a number. Value: `" + token.precision + "`.");
              }
              if (token.precision < 0) {
                token.precision = 1;
                hasPeriod = false;
              }
            }
          }
          token.arg = arguments[pos];
          switch (token.specifier) {
            case "b":
            case "o":
            case "x":
            case "X":
            case "d":
            case "i":
            case "u":
              if (hasPeriod) {
                token.padZeros = false;
              }
              token.arg = formatInteger(token);
              break;
            case "s":
              token.maxWidth = hasPeriod ? token.precision : -1;
              token.arg = String(token.arg);
              break;
            case "c":
              if (!isnan(token.arg)) {
                num = parseInt(token.arg, 10);
                if (num < 0 || num > 127) {
                  throw new Error("invalid character code. Value: " + token.arg);
                }
                token.arg = isnan(num) ? String(token.arg) : fromCharCode(num);
              }
              break;
            case "e":
            case "E":
            case "f":
            case "F":
            case "g":
            case "G":
              if (!hasPeriod) {
                token.precision = 6;
              }
              f = parseFloat(token.arg);
              if (!isFinite(f)) {
                if (!isNumber(token.arg)) {
                  throw new Error("invalid floating-point number. Value: " + out);
                }
                f = token.arg;
                token.padZeros = false;
              }
              token.arg = formatDouble(f, token);
              break;
            default:
              throw new Error("invalid specifier: " + token.specifier);
          }
          if (token.maxWidth >= 0 && token.arg.length > token.maxWidth) {
            token.arg = token.arg.substring(0, token.maxWidth);
          }
          if (token.padZeros) {
            token.arg = zeroPad(token.arg, token.width || token.precision, token.padRight);
          } else if (token.width) {
            token.arg = spacePad(token.arg, token.width, token.padRight);
          }
          out += token.arg || "";
          pos += 1;
        }
      }
      return out;
    }
    module2.exports = formatInterpolate;
  }
});

// node_modules/@stdlib/string-base-format-interpolate/lib/index.js
var require_lib15 = __commonJS({
  "node_modules/@stdlib/string-base-format-interpolate/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main7();
    module2.exports = main;
  }
});

// node_modules/@stdlib/string-base-format-tokenize/lib/main.js
var require_main8 = __commonJS({
  "node_modules/@stdlib/string-base-format-tokenize/lib/main.js"(exports2, module2) {
    "use strict";
    var RE = /%(?:([1-9]\d*)\$)?([0 +\-#]*)(\*|\d+)?(?:(\.)(\*|\d+)?)?[hlL]?([%A-Za-z])/g;
    function parse(match) {
      var token = {
        "mapping": match[1] ? parseInt(match[1], 10) : void 0,
        "flags": match[2],
        "width": match[3],
        "precision": match[5],
        "specifier": match[6]
      };
      if (match[4] === "." && match[5] === void 0) {
        token.precision = "1";
      }
      return token;
    }
    function formatTokenize(str) {
      var content;
      var tokens;
      var match;
      var prev;
      tokens = [];
      prev = 0;
      match = RE.exec(str);
      while (match) {
        content = str.slice(prev, RE.lastIndex - match[0].length);
        if (content.length) {
          tokens.push(content);
        }
        if (match[6] === "%") {
          tokens.push("%");
        } else {
          tokens.push(parse(match));
        }
        prev = RE.lastIndex;
        match = RE.exec(str);
      }
      content = str.slice(prev);
      if (content.length) {
        tokens.push(content);
      }
      return tokens;
    }
    module2.exports = formatTokenize;
  }
});

// node_modules/@stdlib/string-base-format-tokenize/lib/index.js
var require_lib16 = __commonJS({
  "node_modules/@stdlib/string-base-format-tokenize/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main8();
    module2.exports = main;
  }
});

// node_modules/@stdlib/string-format/lib/is_string.js
var require_is_string2 = __commonJS({
  "node_modules/@stdlib/string-format/lib/is_string.js"(exports2, module2) {
    "use strict";
    function isString(value) {
      return typeof value === "string";
    }
    module2.exports = isString;
  }
});

// node_modules/@stdlib/string-format/lib/main.js
var require_main9 = __commonJS({
  "node_modules/@stdlib/string-format/lib/main.js"(exports2, module2) {
    "use strict";
    var interpolate = require_lib15();
    var tokenize = require_lib16();
    var isString = require_is_string2();
    function format(str) {
      var args;
      var i;
      if (!isString(str)) {
        throw new TypeError(format("invalid argument. First argument must be a string. Value: `%s`.", str));
      }
      args = [tokenize(str)];
      for (i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      return interpolate.apply(null, args);
    }
    module2.exports = format;
  }
});

// node_modules/@stdlib/string-format/lib/index.js
var require_lib17 = __commonJS({
  "node_modules/@stdlib/string-format/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main9();
    module2.exports = main;
  }
});

// node_modules/@stdlib/utils-define-property/lib/polyfill.js
var require_polyfill = __commonJS({
  "node_modules/@stdlib/utils-define-property/lib/polyfill.js"(exports2, module2) {
    "use strict";
    var format = require_lib17();
    var objectProtoype = Object.prototype;
    var toStr = objectProtoype.toString;
    var defineGetter = objectProtoype.__defineGetter__;
    var defineSetter = objectProtoype.__defineSetter__;
    var lookupGetter = objectProtoype.__lookupGetter__;
    var lookupSetter = objectProtoype.__lookupSetter__;
    function defineProperty(obj, prop, descriptor) {
      var prototype;
      var hasValue;
      var hasGet;
      var hasSet;
      if (typeof obj !== "object" || obj === null || toStr.call(obj) === "[object Array]") {
        throw new TypeError(format("invalid argument. First argument must be an object. Value: `%s`.", obj));
      }
      if (typeof descriptor !== "object" || descriptor === null || toStr.call(descriptor) === "[object Array]") {
        throw new TypeError(format("invalid argument. Property descriptor must be an object. Value: `%s`.", descriptor));
      }
      hasValue = "value" in descriptor;
      if (hasValue) {
        if (lookupGetter.call(obj, prop) || lookupSetter.call(obj, prop)) {
          prototype = obj.__proto__;
          obj.__proto__ = objectProtoype;
          delete obj[prop];
          obj[prop] = descriptor.value;
          obj.__proto__ = prototype;
        } else {
          obj[prop] = descriptor.value;
        }
      }
      hasGet = "get" in descriptor;
      hasSet = "set" in descriptor;
      if (hasValue && (hasGet || hasSet)) {
        throw new Error("invalid argument. Cannot specify one or more accessors and a value or writable attribute in the property descriptor.");
      }
      if (hasGet && defineGetter) {
        defineGetter.call(obj, prop, descriptor.get);
      }
      if (hasSet && defineSetter) {
        defineSetter.call(obj, prop, descriptor.set);
      }
      return obj;
    }
    module2.exports = defineProperty;
  }
});

// node_modules/@stdlib/utils-define-property/lib/index.js
var require_lib18 = __commonJS({
  "node_modules/@stdlib/utils-define-property/lib/index.js"(exports2, module2) {
    "use strict";
    var hasDefinePropertySupport = require_has_define_property_support();
    var builtin = require_builtin();
    var polyfill = require_polyfill();
    var defineProperty;
    if (hasDefinePropertySupport()) {
      defineProperty = builtin;
    } else {
      defineProperty = polyfill;
    }
    module2.exports = defineProperty;
  }
});

// node_modules/@stdlib/utils-define-nonenumerable-read-only-property/lib/main.js
var require_main10 = __commonJS({
  "node_modules/@stdlib/utils-define-nonenumerable-read-only-property/lib/main.js"(exports2, module2) {
    "use strict";
    var defineProperty = require_lib18();
    function setNonEnumerableReadOnly(obj, prop, value) {
      defineProperty(obj, prop, {
        "configurable": false,
        "enumerable": false,
        "writable": false,
        "value": value
      });
    }
    module2.exports = setNonEnumerableReadOnly;
  }
});

// node_modules/@stdlib/utils-define-nonenumerable-read-only-property/lib/index.js
var require_lib19 = __commonJS({
  "node_modules/@stdlib/utils-define-nonenumerable-read-only-property/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main10();
    module2.exports = main;
  }
});

// node_modules/@stdlib/assert-has-symbol-support/lib/main.js
var require_main11 = __commonJS({
  "node_modules/@stdlib/assert-has-symbol-support/lib/main.js"(exports2, module2) {
    "use strict";
    function hasSymbolSupport() {
      return typeof Symbol === "function" && typeof /* @__PURE__ */ Symbol("foo") === "symbol";
    }
    module2.exports = hasSymbolSupport;
  }
});

// node_modules/@stdlib/assert-has-symbol-support/lib/index.js
var require_lib20 = __commonJS({
  "node_modules/@stdlib/assert-has-symbol-support/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main11();
    module2.exports = main;
  }
});

// node_modules/@stdlib/assert-has-tostringtag-support/lib/main.js
var require_main12 = __commonJS({
  "node_modules/@stdlib/assert-has-tostringtag-support/lib/main.js"(exports2, module2) {
    "use strict";
    var hasSymbols = require_lib20();
    var FLG = hasSymbols();
    function hasToStringTagSupport() {
      return FLG && typeof Symbol.toStringTag === "symbol";
    }
    module2.exports = hasToStringTagSupport;
  }
});

// node_modules/@stdlib/assert-has-tostringtag-support/lib/index.js
var require_lib21 = __commonJS({
  "node_modules/@stdlib/assert-has-tostringtag-support/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main12();
    module2.exports = main;
  }
});

// node_modules/@stdlib/utils-native-class/lib/tostring.js
var require_tostring = __commonJS({
  "node_modules/@stdlib/utils-native-class/lib/tostring.js"(exports2, module2) {
    "use strict";
    var toStr = Object.prototype.toString;
    module2.exports = toStr;
  }
});

// node_modules/@stdlib/utils-native-class/lib/main.js
var require_main13 = __commonJS({
  "node_modules/@stdlib/utils-native-class/lib/main.js"(exports2, module2) {
    "use strict";
    var toStr = require_tostring();
    function nativeClass(v) {
      return toStr.call(v);
    }
    module2.exports = nativeClass;
  }
});

// node_modules/@stdlib/assert-has-own-property/lib/main.js
var require_main14 = __commonJS({
  "node_modules/@stdlib/assert-has-own-property/lib/main.js"(exports2, module2) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    function hasOwnProp(value, property) {
      if (value === void 0 || value === null) {
        return false;
      }
      return has.call(value, property);
    }
    module2.exports = hasOwnProp;
  }
});

// node_modules/@stdlib/assert-has-own-property/lib/index.js
var require_lib22 = __commonJS({
  "node_modules/@stdlib/assert-has-own-property/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main14();
    module2.exports = main;
  }
});

// node_modules/@stdlib/symbol-ctor/lib/main.js
var require_main15 = __commonJS({
  "node_modules/@stdlib/symbol-ctor/lib/main.js"(exports2, module2) {
    "use strict";
    var Sym = typeof Symbol === "function" ? Symbol : void 0;
    module2.exports = Sym;
  }
});

// node_modules/@stdlib/symbol-ctor/lib/index.js
var require_lib23 = __commonJS({
  "node_modules/@stdlib/symbol-ctor/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main15();
    module2.exports = main;
  }
});

// node_modules/@stdlib/utils-native-class/lib/tostringtag.js
var require_tostringtag = __commonJS({
  "node_modules/@stdlib/utils-native-class/lib/tostringtag.js"(exports2, module2) {
    "use strict";
    var Symbol2 = require_lib23();
    var toStrTag = typeof Symbol2 === "function" ? Symbol2.toStringTag : "";
    module2.exports = toStrTag;
  }
});

// node_modules/@stdlib/utils-native-class/lib/polyfill.js
var require_polyfill2 = __commonJS({
  "node_modules/@stdlib/utils-native-class/lib/polyfill.js"(exports2, module2) {
    "use strict";
    var hasOwnProp = require_lib22();
    var toStringTag = require_tostringtag();
    var toStr = require_tostring();
    function nativeClass(v) {
      var isOwn;
      var tag;
      var out;
      if (v === null || v === void 0) {
        return toStr.call(v);
      }
      tag = v[toStringTag];
      isOwn = hasOwnProp(v, toStringTag);
      try {
        v[toStringTag] = void 0;
      } catch (err) {
        return toStr.call(v);
      }
      out = toStr.call(v);
      if (isOwn) {
        v[toStringTag] = tag;
      } else {
        delete v[toStringTag];
      }
      return out;
    }
    module2.exports = nativeClass;
  }
});

// node_modules/@stdlib/utils-native-class/lib/index.js
var require_lib24 = __commonJS({
  "node_modules/@stdlib/utils-native-class/lib/index.js"(exports2, module2) {
    "use strict";
    var hasToStringTag = require_lib21();
    var builtin = require_main13();
    var polyfill = require_polyfill2();
    var main;
    if (hasToStringTag()) {
      main = polyfill;
    } else {
      main = builtin;
    }
    module2.exports = main;
  }
});

// node_modules/@stdlib/assert-is-uint32array/lib/main.js
var require_main16 = __commonJS({
  "node_modules/@stdlib/assert-is-uint32array/lib/main.js"(exports2, module2) {
    "use strict";
    var nativeClass = require_lib24();
    var hasUint32Array = typeof Uint32Array === "function";
    function isUint32Array(value) {
      return hasUint32Array && value instanceof Uint32Array || // eslint-disable-line stdlib/require-globals
      nativeClass(value) === "[object Uint32Array]";
    }
    module2.exports = isUint32Array;
  }
});

// node_modules/@stdlib/assert-is-uint32array/lib/index.js
var require_lib25 = __commonJS({
  "node_modules/@stdlib/assert-is-uint32array/lib/index.js"(exports2, module2) {
    "use strict";
    var isUint32Array = require_main16();
    module2.exports = isUint32Array;
  }
});

// node_modules/@stdlib/constants-uint32-max/lib/index.js
var require_lib26 = __commonJS({
  "node_modules/@stdlib/constants-uint32-max/lib/index.js"(exports2, module2) {
    "use strict";
    var UINT32_MAX = 4294967295;
    module2.exports = UINT32_MAX;
  }
});

// node_modules/@stdlib/assert-has-uint32array-support/lib/uint32array.js
var require_uint32array = __commonJS({
  "node_modules/@stdlib/assert-has-uint32array-support/lib/uint32array.js"(exports2, module2) {
    "use strict";
    var main = typeof Uint32Array === "function" ? Uint32Array : null;
    module2.exports = main;
  }
});

// node_modules/@stdlib/assert-has-uint32array-support/lib/main.js
var require_main17 = __commonJS({
  "node_modules/@stdlib/assert-has-uint32array-support/lib/main.js"(exports2, module2) {
    "use strict";
    var isUint32Array = require_lib25();
    var UINT32_MAX = require_lib26();
    var GlobalUint32Array = require_uint32array();
    function hasUint32ArraySupport() {
      var bool;
      var arr;
      if (typeof GlobalUint32Array !== "function") {
        return false;
      }
      try {
        arr = [1, 3.14, -3.14, UINT32_MAX + 1, UINT32_MAX + 2];
        arr = new GlobalUint32Array(arr);
        bool = isUint32Array(arr) && arr[0] === 1 && arr[1] === 3 && // truncation
        arr[2] === UINT32_MAX - 2 && // truncation and wrap around
        arr[3] === 0 && // wrap around
        arr[4] === 1;
      } catch (err) {
        bool = false;
      }
      return bool;
    }
    module2.exports = hasUint32ArraySupport;
  }
});

// node_modules/@stdlib/assert-has-uint32array-support/lib/index.js
var require_lib27 = __commonJS({
  "node_modules/@stdlib/assert-has-uint32array-support/lib/index.js"(exports2, module2) {
    "use strict";
    var hasUint32ArraySupport = require_main17();
    module2.exports = hasUint32ArraySupport;
  }
});

// node_modules/@stdlib/array-uint32/lib/main.js
var require_main18 = __commonJS({
  "node_modules/@stdlib/array-uint32/lib/main.js"(exports2, module2) {
    "use strict";
    var ctor = typeof Uint32Array === "function" ? Uint32Array : void 0;
    module2.exports = ctor;
  }
});

// node_modules/@stdlib/array-uint32/lib/polyfill.js
var require_polyfill3 = __commonJS({
  "node_modules/@stdlib/array-uint32/lib/polyfill.js"(exports2, module2) {
    "use strict";
    function polyfill() {
      throw new Error("not implemented");
    }
    module2.exports = polyfill;
  }
});

// node_modules/@stdlib/array-uint32/lib/index.js
var require_lib28 = __commonJS({
  "node_modules/@stdlib/array-uint32/lib/index.js"(exports2, module2) {
    "use strict";
    var hasUint32ArraySupport = require_lib27();
    var builtin = require_main18();
    var polyfill = require_polyfill3();
    var ctor;
    if (hasUint32ArraySupport()) {
      ctor = builtin;
    } else {
      ctor = polyfill;
    }
    module2.exports = ctor;
  }
});

// node_modules/@stdlib/assert-is-float64array/lib/main.js
var require_main19 = __commonJS({
  "node_modules/@stdlib/assert-is-float64array/lib/main.js"(exports2, module2) {
    "use strict";
    var nativeClass = require_lib24();
    var hasFloat64Array = typeof Float64Array === "function";
    function isFloat64Array(value) {
      return hasFloat64Array && value instanceof Float64Array || // eslint-disable-line stdlib/require-globals
      nativeClass(value) === "[object Float64Array]";
    }
    module2.exports = isFloat64Array;
  }
});

// node_modules/@stdlib/assert-is-float64array/lib/index.js
var require_lib29 = __commonJS({
  "node_modules/@stdlib/assert-is-float64array/lib/index.js"(exports2, module2) {
    "use strict";
    var isFloat64Array = require_main19();
    module2.exports = isFloat64Array;
  }
});

// node_modules/@stdlib/assert-has-float64array-support/lib/float64array.js
var require_float64array = __commonJS({
  "node_modules/@stdlib/assert-has-float64array-support/lib/float64array.js"(exports2, module2) {
    "use strict";
    var main = typeof Float64Array === "function" ? Float64Array : null;
    module2.exports = main;
  }
});

// node_modules/@stdlib/assert-has-float64array-support/lib/main.js
var require_main20 = __commonJS({
  "node_modules/@stdlib/assert-has-float64array-support/lib/main.js"(exports2, module2) {
    "use strict";
    var isFloat64Array = require_lib29();
    var GlobalFloat64Array = require_float64array();
    function hasFloat64ArraySupport() {
      var bool;
      var arr;
      if (typeof GlobalFloat64Array !== "function") {
        return false;
      }
      try {
        arr = new GlobalFloat64Array([1, 3.14, -3.14, NaN]);
        bool = isFloat64Array(arr) && arr[0] === 1 && arr[1] === 3.14 && arr[2] === -3.14 && arr[3] !== arr[3];
      } catch (err) {
        bool = false;
      }
      return bool;
    }
    module2.exports = hasFloat64ArraySupport;
  }
});

// node_modules/@stdlib/assert-has-float64array-support/lib/index.js
var require_lib30 = __commonJS({
  "node_modules/@stdlib/assert-has-float64array-support/lib/index.js"(exports2, module2) {
    "use strict";
    var hasFloat64ArraySupport = require_main20();
    module2.exports = hasFloat64ArraySupport;
  }
});

// node_modules/@stdlib/array-float64/lib/main.js
var require_main21 = __commonJS({
  "node_modules/@stdlib/array-float64/lib/main.js"(exports2, module2) {
    "use strict";
    var ctor = typeof Float64Array === "function" ? Float64Array : void 0;
    module2.exports = ctor;
  }
});

// node_modules/@stdlib/array-float64/lib/polyfill.js
var require_polyfill4 = __commonJS({
  "node_modules/@stdlib/array-float64/lib/polyfill.js"(exports2, module2) {
    "use strict";
    function polyfill() {
      throw new Error("not implemented");
    }
    module2.exports = polyfill;
  }
});

// node_modules/@stdlib/array-float64/lib/index.js
var require_lib31 = __commonJS({
  "node_modules/@stdlib/array-float64/lib/index.js"(exports2, module2) {
    "use strict";
    var hasFloat64ArraySupport = require_lib30();
    var builtin = require_main21();
    var polyfill = require_polyfill4();
    var ctor;
    if (hasFloat64ArraySupport()) {
      ctor = builtin;
    } else {
      ctor = polyfill;
    }
    module2.exports = ctor;
  }
});

// node_modules/@stdlib/assert-is-uint8array/lib/main.js
var require_main22 = __commonJS({
  "node_modules/@stdlib/assert-is-uint8array/lib/main.js"(exports2, module2) {
    "use strict";
    var nativeClass = require_lib24();
    var hasUint8Array = typeof Uint8Array === "function";
    function isUint8Array(value) {
      return hasUint8Array && value instanceof Uint8Array || // eslint-disable-line stdlib/require-globals
      nativeClass(value) === "[object Uint8Array]";
    }
    module2.exports = isUint8Array;
  }
});

// node_modules/@stdlib/assert-is-uint8array/lib/index.js
var require_lib32 = __commonJS({
  "node_modules/@stdlib/assert-is-uint8array/lib/index.js"(exports2, module2) {
    "use strict";
    var isUint8Array = require_main22();
    module2.exports = isUint8Array;
  }
});

// node_modules/@stdlib/constants-uint8-max/lib/index.js
var require_lib33 = __commonJS({
  "node_modules/@stdlib/constants-uint8-max/lib/index.js"(exports2, module2) {
    "use strict";
    var UINT8_MAX = 255 | 0;
    module2.exports = UINT8_MAX;
  }
});

// node_modules/@stdlib/assert-has-uint8array-support/lib/uint8array.js
var require_uint8array = __commonJS({
  "node_modules/@stdlib/assert-has-uint8array-support/lib/uint8array.js"(exports2, module2) {
    "use strict";
    var main = typeof Uint8Array === "function" ? Uint8Array : null;
    module2.exports = main;
  }
});

// node_modules/@stdlib/assert-has-uint8array-support/lib/main.js
var require_main23 = __commonJS({
  "node_modules/@stdlib/assert-has-uint8array-support/lib/main.js"(exports2, module2) {
    "use strict";
    var isUint8Array = require_lib32();
    var UINT8_MAX = require_lib33();
    var GlobalUint8Array = require_uint8array();
    function hasUint8ArraySupport() {
      var bool;
      var arr;
      if (typeof GlobalUint8Array !== "function") {
        return false;
      }
      try {
        arr = [1, 3.14, -3.14, UINT8_MAX + 1, UINT8_MAX + 2];
        arr = new GlobalUint8Array(arr);
        bool = isUint8Array(arr) && arr[0] === 1 && arr[1] === 3 && // truncation
        arr[2] === UINT8_MAX - 2 && // truncation and wrap around
        arr[3] === 0 && // wrap around
        arr[4] === 1;
      } catch (err) {
        bool = false;
      }
      return bool;
    }
    module2.exports = hasUint8ArraySupport;
  }
});

// node_modules/@stdlib/assert-has-uint8array-support/lib/index.js
var require_lib34 = __commonJS({
  "node_modules/@stdlib/assert-has-uint8array-support/lib/index.js"(exports2, module2) {
    "use strict";
    var hasUint8ArraySupport = require_main23();
    module2.exports = hasUint8ArraySupport;
  }
});

// node_modules/@stdlib/array-uint8/lib/main.js
var require_main24 = __commonJS({
  "node_modules/@stdlib/array-uint8/lib/main.js"(exports2, module2) {
    "use strict";
    var ctor = typeof Uint8Array === "function" ? Uint8Array : void 0;
    module2.exports = ctor;
  }
});

// node_modules/@stdlib/array-uint8/lib/polyfill.js
var require_polyfill5 = __commonJS({
  "node_modules/@stdlib/array-uint8/lib/polyfill.js"(exports2, module2) {
    "use strict";
    function polyfill() {
      throw new Error("not implemented");
    }
    module2.exports = polyfill;
  }
});

// node_modules/@stdlib/array-uint8/lib/index.js
var require_lib35 = __commonJS({
  "node_modules/@stdlib/array-uint8/lib/index.js"(exports2, module2) {
    "use strict";
    var hasUint8ArraySupport = require_lib34();
    var builtin = require_main24();
    var polyfill = require_polyfill5();
    var ctor;
    if (hasUint8ArraySupport()) {
      ctor = builtin;
    } else {
      ctor = polyfill;
    }
    module2.exports = ctor;
  }
});

// node_modules/@stdlib/assert-is-uint16array/lib/main.js
var require_main25 = __commonJS({
  "node_modules/@stdlib/assert-is-uint16array/lib/main.js"(exports2, module2) {
    "use strict";
    var nativeClass = require_lib24();
    var hasUint16Array = typeof Uint16Array === "function";
    function isUint16Array(value) {
      return hasUint16Array && value instanceof Uint16Array || // eslint-disable-line stdlib/require-globals
      nativeClass(value) === "[object Uint16Array]";
    }
    module2.exports = isUint16Array;
  }
});

// node_modules/@stdlib/assert-is-uint16array/lib/index.js
var require_lib36 = __commonJS({
  "node_modules/@stdlib/assert-is-uint16array/lib/index.js"(exports2, module2) {
    "use strict";
    var isUint16Array = require_main25();
    module2.exports = isUint16Array;
  }
});

// node_modules/@stdlib/constants-uint16-max/lib/index.js
var require_lib37 = __commonJS({
  "node_modules/@stdlib/constants-uint16-max/lib/index.js"(exports2, module2) {
    "use strict";
    var UINT16_MAX = 65535 | 0;
    module2.exports = UINT16_MAX;
  }
});

// node_modules/@stdlib/assert-has-uint16array-support/lib/uint16array.js
var require_uint16array = __commonJS({
  "node_modules/@stdlib/assert-has-uint16array-support/lib/uint16array.js"(exports2, module2) {
    "use strict";
    var main = typeof Uint16Array === "function" ? Uint16Array : null;
    module2.exports = main;
  }
});

// node_modules/@stdlib/assert-has-uint16array-support/lib/main.js
var require_main26 = __commonJS({
  "node_modules/@stdlib/assert-has-uint16array-support/lib/main.js"(exports2, module2) {
    "use strict";
    var isUint16Array = require_lib36();
    var UINT16_MAX = require_lib37();
    var GlobalUint16Array = require_uint16array();
    function hasUint16ArraySupport() {
      var bool;
      var arr;
      if (typeof GlobalUint16Array !== "function") {
        return false;
      }
      try {
        arr = [1, 3.14, -3.14, UINT16_MAX + 1, UINT16_MAX + 2];
        arr = new GlobalUint16Array(arr);
        bool = isUint16Array(arr) && arr[0] === 1 && arr[1] === 3 && // truncation
        arr[2] === UINT16_MAX - 2 && // truncation and wrap around
        arr[3] === 0 && // wrap around
        arr[4] === 1;
      } catch (err) {
        bool = false;
      }
      return bool;
    }
    module2.exports = hasUint16ArraySupport;
  }
});

// node_modules/@stdlib/assert-has-uint16array-support/lib/index.js
var require_lib38 = __commonJS({
  "node_modules/@stdlib/assert-has-uint16array-support/lib/index.js"(exports2, module2) {
    "use strict";
    var hasUint16ArraySupport = require_main26();
    module2.exports = hasUint16ArraySupport;
  }
});

// node_modules/@stdlib/array-uint16/lib/main.js
var require_main27 = __commonJS({
  "node_modules/@stdlib/array-uint16/lib/main.js"(exports2, module2) {
    "use strict";
    var ctor = typeof Uint16Array === "function" ? Uint16Array : void 0;
    module2.exports = ctor;
  }
});

// node_modules/@stdlib/array-uint16/lib/polyfill.js
var require_polyfill6 = __commonJS({
  "node_modules/@stdlib/array-uint16/lib/polyfill.js"(exports2, module2) {
    "use strict";
    function polyfill() {
      throw new Error("not implemented");
    }
    module2.exports = polyfill;
  }
});

// node_modules/@stdlib/array-uint16/lib/index.js
var require_lib39 = __commonJS({
  "node_modules/@stdlib/array-uint16/lib/index.js"(exports2, module2) {
    "use strict";
    var hasUint16ArraySupport = require_lib38();
    var builtin = require_main27();
    var polyfill = require_polyfill6();
    var ctor;
    if (hasUint16ArraySupport()) {
      ctor = builtin;
    } else {
      ctor = polyfill;
    }
    module2.exports = ctor;
  }
});

// node_modules/@stdlib/assert-is-little-endian/lib/ctors.js
var require_ctors = __commonJS({
  "node_modules/@stdlib/assert-is-little-endian/lib/ctors.js"(exports2, module2) {
    "use strict";
    var Uint8Array2 = require_lib35();
    var Uint16Array2 = require_lib39();
    var ctors = {
      "uint16": Uint16Array2,
      "uint8": Uint8Array2
    };
    module2.exports = ctors;
  }
});

// node_modules/@stdlib/assert-is-little-endian/lib/main.js
var require_main28 = __commonJS({
  "node_modules/@stdlib/assert-is-little-endian/lib/main.js"(exports2, module2) {
    "use strict";
    var ctors = require_ctors();
    var bool;
    function isLittleEndian() {
      var uint16view;
      var uint8view;
      uint16view = new ctors["uint16"](1);
      uint16view[0] = 4660;
      uint8view = new ctors["uint8"](uint16view.buffer);
      return uint8view[0] === 52;
    }
    bool = isLittleEndian();
    module2.exports = bool;
  }
});

// node_modules/@stdlib/assert-is-little-endian/lib/index.js
var require_lib40 = __commonJS({
  "node_modules/@stdlib/assert-is-little-endian/lib/index.js"(exports2, module2) {
    "use strict";
    var IS_LITTLE_ENDIAN = require_main28();
    module2.exports = IS_LITTLE_ENDIAN;
  }
});

// node_modules/@stdlib/number-float64-base-to-words/lib/indices.js
var require_indices = __commonJS({
  "node_modules/@stdlib/number-float64-base-to-words/lib/indices.js"(exports2, module2) {
    "use strict";
    var isLittleEndian = require_lib40();
    var indices;
    var HIGH;
    var LOW;
    if (isLittleEndian === true) {
      HIGH = 1;
      LOW = 0;
    } else {
      HIGH = 0;
      LOW = 1;
    }
    indices = {
      "HIGH": HIGH,
      "LOW": LOW
    };
    module2.exports = indices;
  }
});

// node_modules/@stdlib/number-float64-base-to-words/lib/assign.js
var require_assign = __commonJS({
  "node_modules/@stdlib/number-float64-base-to-words/lib/assign.js"(exports2, module2) {
    "use strict";
    var Uint32Array2 = require_lib28();
    var Float64Array2 = require_lib31();
    var indices = require_indices();
    var FLOAT64_VIEW = new Float64Array2(1);
    var UINT32_VIEW = new Uint32Array2(FLOAT64_VIEW.buffer);
    var HIGH = indices.HIGH;
    var LOW = indices.LOW;
    function toWords(x, out, stride, offset) {
      FLOAT64_VIEW[0] = x;
      out[offset] = UINT32_VIEW[HIGH];
      out[offset + stride] = UINT32_VIEW[LOW];
      return out;
    }
    module2.exports = toWords;
  }
});

// node_modules/@stdlib/number-float64-base-to-words/lib/main.js
var require_main29 = __commonJS({
  "node_modules/@stdlib/number-float64-base-to-words/lib/main.js"(exports2, module2) {
    "use strict";
    var fcn = require_assign();
    function toWords(x) {
      return fcn(x, [0 >>> 0, 0 >>> 0], 1, 0);
    }
    module2.exports = toWords;
  }
});

// node_modules/@stdlib/number-float64-base-to-words/lib/index.js
var require_lib41 = __commonJS({
  "node_modules/@stdlib/number-float64-base-to-words/lib/index.js"(exports2, module2) {
    "use strict";
    var setReadOnly = require_lib19();
    var main = require_main29();
    var assign = require_assign();
    setReadOnly(main, "assign", assign);
    module2.exports = main;
  }
});

// node_modules/@stdlib/number-float64-base-get-high-word/lib/high.js
var require_high = __commonJS({
  "node_modules/@stdlib/number-float64-base-get-high-word/lib/high.js"(exports2, module2) {
    "use strict";
    var isLittleEndian = require_lib40();
    var HIGH;
    if (isLittleEndian === true) {
      HIGH = 1;
    } else {
      HIGH = 0;
    }
    module2.exports = HIGH;
  }
});

// node_modules/@stdlib/number-float64-base-get-high-word/lib/main.js
var require_main30 = __commonJS({
  "node_modules/@stdlib/number-float64-base-get-high-word/lib/main.js"(exports2, module2) {
    "use strict";
    var Uint32Array2 = require_lib28();
    var Float64Array2 = require_lib31();
    var HIGH = require_high();
    var FLOAT64_VIEW = new Float64Array2(1);
    var UINT32_VIEW = new Uint32Array2(FLOAT64_VIEW.buffer);
    function getHighWord(x) {
      FLOAT64_VIEW[0] = x;
      return UINT32_VIEW[HIGH];
    }
    module2.exports = getHighWord;
  }
});

// node_modules/@stdlib/number-float64-base-get-high-word/lib/index.js
var require_lib42 = __commonJS({
  "node_modules/@stdlib/number-float64-base-get-high-word/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main30();
    module2.exports = main;
  }
});

// node_modules/@stdlib/number-float64-base-from-words/lib/indices.js
var require_indices2 = __commonJS({
  "node_modules/@stdlib/number-float64-base-from-words/lib/indices.js"(exports2, module2) {
    "use strict";
    var isLittleEndian = require_lib40();
    var indices;
    var HIGH;
    var LOW;
    if (isLittleEndian === true) {
      HIGH = 1;
      LOW = 0;
    } else {
      HIGH = 0;
      LOW = 1;
    }
    indices = {
      "HIGH": HIGH,
      "LOW": LOW
    };
    module2.exports = indices;
  }
});

// node_modules/@stdlib/number-float64-base-from-words/lib/main.js
var require_main31 = __commonJS({
  "node_modules/@stdlib/number-float64-base-from-words/lib/main.js"(exports2, module2) {
    "use strict";
    var Uint32Array2 = require_lib28();
    var Float64Array2 = require_lib31();
    var indices = require_indices2();
    var FLOAT64_VIEW = new Float64Array2(1);
    var UINT32_VIEW = new Uint32Array2(FLOAT64_VIEW.buffer);
    var HIGH = indices.HIGH;
    var LOW = indices.LOW;
    function fromWords(high, low) {
      UINT32_VIEW[HIGH] = high;
      UINT32_VIEW[LOW] = low;
      return FLOAT64_VIEW[0];
    }
    module2.exports = fromWords;
  }
});

// node_modules/@stdlib/number-float64-base-from-words/lib/index.js
var require_lib43 = __commonJS({
  "node_modules/@stdlib/number-float64-base-from-words/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main31();
    module2.exports = main;
  }
});

// node_modules/@stdlib/math-base-special-copysign/lib/main.js
var require_main32 = __commonJS({
  "node_modules/@stdlib/math-base-special-copysign/lib/main.js"(exports2, module2) {
    "use strict";
    var SIGN_MASK = require_lib13();
    var ABS_MASK = require_lib14();
    var toWords = require_lib41();
    var getHighWord = require_lib42();
    var fromWords = require_lib43();
    var WORDS = [0, 0];
    function copysign(x, y) {
      var hx;
      var hy;
      toWords.assign(x, WORDS, 1, 0);
      hx = WORDS[0];
      hx &= ABS_MASK;
      hy = getHighWord(y);
      hy &= SIGN_MASK;
      hx |= hy;
      return fromWords(hx, WORDS[1]);
    }
    module2.exports = copysign;
  }
});

// node_modules/@stdlib/math-base-special-copysign/lib/index.js
var require_lib44 = __commonJS({
  "node_modules/@stdlib/math-base-special-copysign/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main32();
    module2.exports = main;
  }
});

// node_modules/@stdlib/constants-float64-smallest-normal/lib/index.js
var require_lib45 = __commonJS({
  "node_modules/@stdlib/constants-float64-smallest-normal/lib/index.js"(exports2, module2) {
    "use strict";
    var FLOAT64_SMALLEST_NORMAL = 22250738585072014e-324;
    module2.exports = FLOAT64_SMALLEST_NORMAL;
  }
});

// node_modules/@stdlib/math-base-special-abs/lib/main.js
var require_main33 = __commonJS({
  "node_modules/@stdlib/math-base-special-abs/lib/main.js"(exports2, module2) {
    "use strict";
    function abs(x) {
      return Math.abs(x);
    }
    module2.exports = abs;
  }
});

// node_modules/@stdlib/math-base-special-abs/lib/index.js
var require_lib46 = __commonJS({
  "node_modules/@stdlib/math-base-special-abs/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main33();
    module2.exports = main;
  }
});

// node_modules/@stdlib/number-float64-base-normalize/lib/assign.js
var require_assign2 = __commonJS({
  "node_modules/@stdlib/number-float64-base-normalize/lib/assign.js"(exports2, module2) {
    "use strict";
    var FLOAT64_SMALLEST_NORMAL = require_lib45();
    var isInfinite = require_lib12();
    var isnan = require_lib();
    var abs = require_lib46();
    var SCALAR = 4503599627370496;
    function normalize(x, out, stride, offset) {
      if (isnan(x) || isInfinite(x)) {
        out[offset] = x;
        out[offset + stride] = 0;
        return out;
      }
      if (x !== 0 && abs(x) < FLOAT64_SMALLEST_NORMAL) {
        out[offset] = x * SCALAR;
        out[offset + stride] = -52;
        return out;
      }
      out[offset] = x;
      out[offset + stride] = 0;
      return out;
    }
    module2.exports = normalize;
  }
});

// node_modules/@stdlib/number-float64-base-normalize/lib/main.js
var require_main34 = __commonJS({
  "node_modules/@stdlib/number-float64-base-normalize/lib/main.js"(exports2, module2) {
    "use strict";
    var fcn = require_assign2();
    function normalize(x) {
      return fcn(x, [0, 0], 1, 0);
    }
    module2.exports = normalize;
  }
});

// node_modules/@stdlib/number-float64-base-normalize/lib/index.js
var require_lib47 = __commonJS({
  "node_modules/@stdlib/number-float64-base-normalize/lib/index.js"(exports2, module2) {
    "use strict";
    var setReadOnly = require_lib19();
    var main = require_main34();
    var assign = require_assign2();
    setReadOnly(main, "assign", assign);
    module2.exports = main;
  }
});

// node_modules/@stdlib/constants-float64-high-word-exponent-mask/lib/index.js
var require_lib48 = __commonJS({
  "node_modules/@stdlib/constants-float64-high-word-exponent-mask/lib/index.js"(exports2, module2) {
    "use strict";
    var FLOAT64_HIGH_WORD_EXPONENT_MASK = 2146435072;
    module2.exports = FLOAT64_HIGH_WORD_EXPONENT_MASK;
  }
});

// node_modules/@stdlib/number-float64-base-exponent/lib/main.js
var require_main35 = __commonJS({
  "node_modules/@stdlib/number-float64-base-exponent/lib/main.js"(exports2, module2) {
    "use strict";
    var getHighWord = require_lib42();
    var EXP_MASK = require_lib48();
    var BIAS = require_lib8();
    function exponent(x) {
      var high = getHighWord(x);
      high = (high & EXP_MASK) >>> 20;
      return high - BIAS | 0;
    }
    module2.exports = exponent;
  }
});

// node_modules/@stdlib/number-float64-base-exponent/lib/index.js
var require_lib49 = __commonJS({
  "node_modules/@stdlib/number-float64-base-exponent/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main35();
    module2.exports = main;
  }
});

// node_modules/@stdlib/math-base-special-ldexp/lib/main.js
var require_main36 = __commonJS({
  "node_modules/@stdlib/math-base-special-ldexp/lib/main.js"(exports2, module2) {
    "use strict";
    var PINF = require_lib7();
    var NINF = require_lib6();
    var BIAS = require_lib8();
    var MAX_EXPONENT = require_lib9();
    var MAX_SUBNORMAL_EXPONENT = require_lib10();
    var MIN_SUBNORMAL_EXPONENT = require_lib11();
    var isnan = require_lib();
    var isInfinite = require_lib12();
    var copysign = require_lib44();
    var normalize = require_lib47().assign;
    var floatExp = require_lib49();
    var toWords = require_lib41();
    var fromWords = require_lib43();
    var TWO52_INV = 2220446049250313e-31;
    var CLEAR_EXP_MASK = 2148532223 >>> 0;
    var FRAC = [0, 0];
    var WORDS = [0, 0];
    function ldexp(frac, exp) {
      var high;
      var m;
      if (exp === 0 || frac === 0 || // handles +-0
      isnan(frac) || isInfinite(frac)) {
        return frac;
      }
      normalize(frac, FRAC, 1, 0);
      frac = FRAC[0];
      exp += FRAC[1];
      exp += floatExp(frac);
      if (exp < MIN_SUBNORMAL_EXPONENT) {
        return copysign(0, frac);
      }
      if (exp > MAX_EXPONENT) {
        if (frac < 0) {
          return NINF;
        }
        return PINF;
      }
      if (exp <= MAX_SUBNORMAL_EXPONENT) {
        exp += 52;
        m = TWO52_INV;
      } else {
        m = 1;
      }
      toWords.assign(frac, WORDS, 1, 0);
      high = WORDS[0];
      high &= CLEAR_EXP_MASK;
      high |= exp + BIAS << 20;
      return m * fromWords(high, WORDS[1]);
    }
    module2.exports = ldexp;
  }
});

// node_modules/@stdlib/math-base-special-ldexp/lib/index.js
var require_lib50 = __commonJS({
  "node_modules/@stdlib/math-base-special-ldexp/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main36();
    module2.exports = main;
  }
});

// node_modules/@stdlib/math-base-special-exp/lib/polyval_p.js
var require_polyval_p = __commonJS({
  "node_modules/@stdlib/math-base-special-exp/lib/polyval_p.js"(exports2, module2) {
    "use strict";
    function evalpoly(x) {
      if (x === 0) {
        return 0.16666666666666602;
      }
      return 0.16666666666666602 + x * (-0.0027777777777015593 + x * (6613756321437934e-20 + x * (-16533902205465252e-22 + x * 41381367970572385e-24)));
    }
    module2.exports = evalpoly;
  }
});

// node_modules/@stdlib/math-base-special-exp/lib/expmulti.js
var require_expmulti = __commonJS({
  "node_modules/@stdlib/math-base-special-exp/lib/expmulti.js"(exports2, module2) {
    "use strict";
    var ldexp = require_lib50();
    var polyvalP = require_polyval_p();
    function expmulti(hi, lo, k) {
      var r;
      var t;
      var c;
      var y;
      r = hi - lo;
      t = r * r;
      c = r - t * polyvalP(t);
      y = 1 - (lo - r * c / (2 - c) - hi);
      return ldexp(y, k);
    }
    module2.exports = expmulti;
  }
});

// node_modules/@stdlib/math-base-special-exp/lib/main.js
var require_main37 = __commonJS({
  "node_modules/@stdlib/math-base-special-exp/lib/main.js"(exports2, module2) {
    "use strict";
    var isnan = require_lib();
    var trunc = require_lib4();
    var NINF = require_lib6();
    var PINF = require_lib7();
    var expmulti = require_expmulti();
    var LN2_HI = 0.6931471803691238;
    var LN2_LO = 19082149292705877e-26;
    var LOG2_E = 1.4426950408889634;
    var OVERFLOW = 709.782712893384;
    var UNDERFLOW = -745.1332191019411;
    var NEARZERO = 1 / (1 << 28);
    var NEG_NEARZERO = -NEARZERO;
    function exp(x) {
      var hi;
      var lo;
      var k;
      if (isnan(x) || x === PINF) {
        return x;
      }
      if (x === NINF) {
        return 0;
      }
      if (x > OVERFLOW) {
        return PINF;
      }
      if (x < UNDERFLOW) {
        return 0;
      }
      if (x > NEG_NEARZERO && x < NEARZERO) {
        return 1 + x;
      }
      if (x < 0) {
        k = trunc(LOG2_E * x - 0.5);
      } else {
        k = trunc(LOG2_E * x + 0.5);
      }
      hi = x - k * LN2_HI;
      lo = k * LN2_LO;
      return expmulti(hi, lo, k);
    }
    module2.exports = exp;
  }
});

// node_modules/@stdlib/math-base-special-exp/lib/index.js
var require_lib51 = __commonJS({
  "node_modules/@stdlib/math-base-special-exp/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main37();
    module2.exports = main;
  }
});

// node_modules/@stdlib/number-float64-base-set-low-word/lib/low.js
var require_low = __commonJS({
  "node_modules/@stdlib/number-float64-base-set-low-word/lib/low.js"(exports2, module2) {
    "use strict";
    var isLittleEndian = require_lib40();
    var LOW;
    if (isLittleEndian === true) {
      LOW = 0;
    } else {
      LOW = 1;
    }
    module2.exports = LOW;
  }
});

// node_modules/@stdlib/number-float64-base-set-low-word/lib/main.js
var require_main38 = __commonJS({
  "node_modules/@stdlib/number-float64-base-set-low-word/lib/main.js"(exports2, module2) {
    "use strict";
    var Uint32Array2 = require_lib28();
    var Float64Array2 = require_lib31();
    var LOW = require_low();
    var FLOAT64_VIEW = new Float64Array2(1);
    var UINT32_VIEW = new Uint32Array2(FLOAT64_VIEW.buffer);
    function setLowWord(x, low) {
      FLOAT64_VIEW[0] = x;
      UINT32_VIEW[LOW] = low >>> 0;
      return FLOAT64_VIEW[0];
    }
    module2.exports = setLowWord;
  }
});

// node_modules/@stdlib/number-float64-base-set-low-word/lib/index.js
var require_lib52 = __commonJS({
  "node_modules/@stdlib/number-float64-base-set-low-word/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main38();
    module2.exports = main;
  }
});

// node_modules/@stdlib/math-base-special-erf/lib/polyval_pp.js
var require_polyval_pp = __commonJS({
  "node_modules/@stdlib/math-base-special-erf/lib/polyval_pp.js"(exports2, module2) {
    "use strict";
    function evalpoly(x) {
      if (x === 0) {
        return -0.3250421072470015;
      }
      return -0.3250421072470015 + x * (-0.02848174957559851 + x * (-0.005770270296489442 + x * -23763016656650163e-21));
    }
    module2.exports = evalpoly;
  }
});

// node_modules/@stdlib/math-base-special-erf/lib/polyval_qq.js
var require_polyval_qq = __commonJS({
  "node_modules/@stdlib/math-base-special-erf/lib/polyval_qq.js"(exports2, module2) {
    "use strict";
    function evalpoly(x) {
      if (x === 0) {
        return 0.39791722395915535;
      }
      return 0.39791722395915535 + x * (0.0650222499887673 + x * (0.005081306281875766 + x * (13249473800432164e-20 + x * -3960228278775368e-21)));
    }
    module2.exports = evalpoly;
  }
});

// node_modules/@stdlib/math-base-special-erf/lib/polyval_pa.js
var require_polyval_pa = __commonJS({
  "node_modules/@stdlib/math-base-special-erf/lib/polyval_pa.js"(exports2, module2) {
    "use strict";
    function evalpoly(x) {
      if (x === 0) {
        return 0.41485611868374833;
      }
      return 0.41485611868374833 + x * (-0.3722078760357013 + x * (0.31834661990116175 + x * (-0.11089469428239668 + x * (0.035478304325618236 + x * -0.002166375594868791))));
    }
    module2.exports = evalpoly;
  }
});

// node_modules/@stdlib/math-base-special-erf/lib/polyval_qa.js
var require_polyval_qa = __commonJS({
  "node_modules/@stdlib/math-base-special-erf/lib/polyval_qa.js"(exports2, module2) {
    "use strict";
    function evalpoly(x) {
      if (x === 0) {
        return 0.10642088040084423;
      }
      return 0.10642088040084423 + x * (0.540397917702171 + x * (0.07182865441419627 + x * (0.12617121980876164 + x * (0.01363708391202905 + x * 0.011984499846799107))));
    }
    module2.exports = evalpoly;
  }
});

// node_modules/@stdlib/math-base-special-erf/lib/polyval_ra.js
var require_polyval_ra = __commonJS({
  "node_modules/@stdlib/math-base-special-erf/lib/polyval_ra.js"(exports2, module2) {
    "use strict";
    function evalpoly(x) {
      if (x === 0) {
        return -0.6938585727071818;
      }
      return -0.6938585727071818 + x * (-10.558626225323291 + x * (-62.375332450326006 + x * (-162.39666946257347 + x * (-184.60509290671104 + x * (-81.2874355063066 + x * -9.814329344169145)))));
    }
    module2.exports = evalpoly;
  }
});

// node_modules/@stdlib/math-base-special-erf/lib/polyval_sa.js
var require_polyval_sa = __commonJS({
  "node_modules/@stdlib/math-base-special-erf/lib/polyval_sa.js"(exports2, module2) {
    "use strict";
    function evalpoly(x) {
      if (x === 0) {
        return 19.651271667439257;
      }
      return 19.651271667439257 + x * (137.65775414351904 + x * (434.56587747522923 + x * (645.3872717332679 + x * (429.00814002756783 + x * (108.63500554177944 + x * (6.570249770319282 + x * -0.0604244152148581))))));
    }
    module2.exports = evalpoly;
  }
});

// node_modules/@stdlib/math-base-special-erf/lib/polyval_rb.js
var require_polyval_rb = __commonJS({
  "node_modules/@stdlib/math-base-special-erf/lib/polyval_rb.js"(exports2, module2) {
    "use strict";
    function evalpoly(x) {
      if (x === 0) {
        return -0.799283237680523;
      }
      return -0.799283237680523 + x * (-17.757954917754752 + x * (-160.63638485582192 + x * (-637.5664433683896 + x * (-1025.0951316110772 + x * -483.5191916086514))));
    }
    module2.exports = evalpoly;
  }
});

// node_modules/@stdlib/math-base-special-erf/lib/polyval_sb.js
var require_polyval_sb = __commonJS({
  "node_modules/@stdlib/math-base-special-erf/lib/polyval_sb.js"(exports2, module2) {
    "use strict";
    function evalpoly(x) {
      if (x === 0) {
        return 30.33806074348246;
      }
      return 30.33806074348246 + x * (325.7925129965739 + x * (1536.729586084437 + x * (3199.8582195085955 + x * (2553.0504064331644 + x * (474.52854120695537 + x * -22.44095244658582)))));
    }
    module2.exports = evalpoly;
  }
});

// node_modules/@stdlib/math-base-special-erf/lib/main.js
var require_main39 = __commonJS({
  "node_modules/@stdlib/math-base-special-erf/lib/main.js"(exports2, module2) {
    "use strict";
    var isnan = require_lib();
    var exp = require_lib51();
    var setLowWord = require_lib52();
    var PINF = require_lib7();
    var NINF = require_lib6();
    var polyvalPP = require_polyval_pp();
    var polyvalQQ = require_polyval_qq();
    var polyvalPA = require_polyval_pa();
    var polyvalQA = require_polyval_qa();
    var polyvalRA = require_polyval_ra();
    var polyvalSA = require_polyval_sa();
    var polyvalRB = require_polyval_rb();
    var polyvalSB = require_polyval_sb();
    var TINY = 1e-300;
    var VERY_TINY = 2848094538889218e-321;
    var SMALL = 3725290298461914e-24;
    var ERX = 0.8450629115104675;
    var EFX = 0.1283791670955126;
    var EFX8 = 1.0270333367641007;
    var PPC = 0.12837916709551256;
    var QQC = 1;
    var PAC = -0.0023621185607526594;
    var QAC = 1;
    var RAC = -0.009864944034847148;
    var SAC = 1;
    var RBC = -0.0098649429247001;
    var SBC = 1;
    function erf(x) {
      var sign;
      var ax;
      var z;
      var r;
      var s;
      var y;
      var p;
      var q;
      if (isnan(x)) {
        return NaN;
      }
      if (x === PINF) {
        return 1;
      }
      if (x === NINF) {
        return -1;
      }
      if (x === 0) {
        return x;
      }
      if (x < 0) {
        sign = true;
        ax = -x;
      } else {
        sign = false;
        ax = x;
      }
      if (ax < 0.84375) {
        if (ax < SMALL) {
          if (ax < VERY_TINY) {
            return 0.125 * (8 * x + EFX8 * x);
          }
          return x + EFX * x;
        }
        z = x * x;
        r = PPC + z * polyvalPP(z);
        s = QQC + z * polyvalQQ(z);
        y = r / s;
        return x + x * y;
      }
      if (ax < 1.25) {
        s = ax - 1;
        p = PAC + s * polyvalPA(s);
        q = QAC + s * polyvalQA(s);
        if (sign) {
          return -ERX - p / q;
        }
        return ERX + p / q;
      }
      if (ax >= 6) {
        if (sign) {
          return TINY - 1;
        }
        return 1 - TINY;
      }
      s = 1 / (ax * ax);
      if (ax < 2.857142857142857) {
        r = RAC + s * polyvalRA(s);
        s = SAC + s * polyvalSA(s);
      } else {
        r = RBC + s * polyvalRB(s);
        s = SBC + s * polyvalSB(s);
      }
      z = setLowWord(ax, 0);
      r = exp(-(z * z) - 0.5625) * exp((z - ax) * (z + ax) + r / s);
      if (sign) {
        return r / ax - 1;
      }
      return 1 - r / ax;
    }
    module2.exports = erf;
  }
});

// node_modules/@stdlib/math-base-special-erf/lib/index.js
var require_lib53 = __commonJS({
  "node_modules/@stdlib/math-base-special-erf/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main39();
    module2.exports = main;
  }
});

// node_modules/@stdlib/math-base-special-sqrt/lib/main.js
var require_main40 = __commonJS({
  "node_modules/@stdlib/math-base-special-sqrt/lib/main.js"(exports2, module2) {
    "use strict";
    var sqrt = Math.sqrt;
    module2.exports = sqrt;
  }
});

// node_modules/@stdlib/math-base-special-sqrt/lib/index.js
var require_lib54 = __commonJS({
  "node_modules/@stdlib/math-base-special-sqrt/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main40();
    module2.exports = main;
  }
});

// node_modules/@stdlib/number-float64-base-set-high-word/lib/high.js
var require_high2 = __commonJS({
  "node_modules/@stdlib/number-float64-base-set-high-word/lib/high.js"(exports2, module2) {
    "use strict";
    var isLittleEndian = require_lib40();
    var HIGH;
    if (isLittleEndian === true) {
      HIGH = 1;
    } else {
      HIGH = 0;
    }
    module2.exports = HIGH;
  }
});

// node_modules/@stdlib/number-float64-base-set-high-word/lib/main.js
var require_main41 = __commonJS({
  "node_modules/@stdlib/number-float64-base-set-high-word/lib/main.js"(exports2, module2) {
    "use strict";
    var Uint32Array2 = require_lib28();
    var Float64Array2 = require_lib31();
    var HIGH = require_high2();
    var FLOAT64_VIEW = new Float64Array2(1);
    var UINT32_VIEW = new Uint32Array2(FLOAT64_VIEW.buffer);
    function setHighWord(x, high) {
      FLOAT64_VIEW[0] = x;
      UINT32_VIEW[HIGH] = high >>> 0;
      return FLOAT64_VIEW[0];
    }
    module2.exports = setHighWord;
  }
});

// node_modules/@stdlib/number-float64-base-set-high-word/lib/index.js
var require_lib55 = __commonJS({
  "node_modules/@stdlib/number-float64-base-set-high-word/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main41();
    module2.exports = main;
  }
});

// node_modules/@stdlib/math-base-special-ln/lib/polyval_p.js
var require_polyval_p2 = __commonJS({
  "node_modules/@stdlib/math-base-special-ln/lib/polyval_p.js"(exports2, module2) {
    "use strict";
    function evalpoly(x) {
      if (x === 0) {
        return 0.3999999999940942;
      }
      return 0.3999999999940942 + x * (0.22222198432149784 + x * 0.15313837699209373);
    }
    module2.exports = evalpoly;
  }
});

// node_modules/@stdlib/math-base-special-ln/lib/polyval_q.js
var require_polyval_q = __commonJS({
  "node_modules/@stdlib/math-base-special-ln/lib/polyval_q.js"(exports2, module2) {
    "use strict";
    function evalpoly(x) {
      if (x === 0) {
        return 0.6666666666666735;
      }
      return 0.6666666666666735 + x * (0.2857142874366239 + x * (0.1818357216161805 + x * 0.14798198605116586));
    }
    module2.exports = evalpoly;
  }
});

// node_modules/@stdlib/math-base-special-ln/lib/main.js
var require_main42 = __commonJS({
  "node_modules/@stdlib/math-base-special-ln/lib/main.js"(exports2, module2) {
    "use strict";
    var getHighWord = require_lib42();
    var setHighWord = require_lib55();
    var isnan = require_lib();
    var BIAS = require_lib8();
    var NINF = require_lib6();
    var polyvalP = require_polyval_p2();
    var polyvalQ = require_polyval_q();
    var LN2_HI = 0.6931471803691238;
    var LN2_LO = 19082149292705877e-26;
    var TWO54 = 18014398509481984;
    var ONE_THIRD = 0.3333333333333333;
    var HIGH_SIGNIFICAND_MASK = 1048575 | 0;
    var HIGH_MAX_NORMAL_EXP = 2146435072 | 0;
    var HIGH_MIN_NORMAL_EXP = 1048576 | 0;
    var HIGH_BIASED_EXP_0 = 1072693248 | 0;
    function ln(x) {
      var hfsq;
      var hx;
      var t2;
      var t1;
      var k;
      var R;
      var f;
      var i;
      var j;
      var s;
      var w;
      var z;
      if (x === 0) {
        return NINF;
      }
      if (isnan(x) || x < 0) {
        return NaN;
      }
      hx = getHighWord(x);
      k = 0 | 0;
      if (hx < HIGH_MIN_NORMAL_EXP) {
        k -= 54 | 0;
        x *= TWO54;
        hx = getHighWord(x);
      }
      if (hx >= HIGH_MAX_NORMAL_EXP) {
        return x + x;
      }
      k += (hx >> 20) - BIAS | 0;
      hx &= HIGH_SIGNIFICAND_MASK;
      i = hx + 614244 & 1048576 | 0;
      x = setHighWord(x, hx | i ^ HIGH_BIASED_EXP_0);
      k += i >> 20 | 0;
      f = x - 1;
      if ((HIGH_SIGNIFICAND_MASK & 2 + hx) < 3) {
        if (f === 0) {
          if (k === 0) {
            return 0;
          }
          return k * LN2_HI + k * LN2_LO;
        }
        R = f * f * (0.5 - ONE_THIRD * f);
        if (k === 0) {
          return f - R;
        }
        return k * LN2_HI - (R - k * LN2_LO - f);
      }
      s = f / (2 + f);
      z = s * s;
      i = hx - 398458 | 0;
      w = z * z;
      j = 440401 - hx | 0;
      t1 = w * polyvalP(w);
      t2 = z * polyvalQ(w);
      i |= j;
      R = t2 + t1;
      if (i > 0) {
        hfsq = 0.5 * f * f;
        if (k === 0) {
          return f - (hfsq - s * (hfsq + R));
        }
        return k * LN2_HI - (hfsq - (s * (hfsq + R) + k * LN2_LO) - f);
      }
      if (k === 0) {
        return f - s * (f - R);
      }
      return k * LN2_HI - (s * (f - R) - k * LN2_LO - f);
    }
    module2.exports = ln;
  }
});

// node_modules/@stdlib/math-base-special-ln/lib/index.js
var require_lib56 = __commonJS({
  "node_modules/@stdlib/math-base-special-ln/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main42();
    module2.exports = main;
  }
});

// node_modules/@stdlib/math-base-special-erfinv/lib/rational_p1q1.js
var require_rational_p1q1 = __commonJS({
  "node_modules/@stdlib/math-base-special-erfinv/lib/rational_p1q1.js"(exports2, module2) {
    "use strict";
    function evalrational(x) {
      var ax;
      var s1;
      var s2;
      if (x === 0) {
        return -5087819496582806e-19;
      }
      if (x < 0) {
        ax = -x;
      } else {
        ax = x;
      }
      if (ax <= 1) {
        s1 = -5087819496582806e-19 + x * (-0.008368748197417368 + x * (0.03348066254097446 + x * (-0.012692614766297404 + x * (-0.03656379714117627 + x * (0.02198786811111689 + x * (0.008226878746769157 + x * (-0.005387729650712429 + x * (0 + x * 0))))))));
        s2 = 1 + x * (-0.9700050433032906 + x * (-1.5657455823417585 + x * (1.5622155839842302 + x * (0.662328840472003 + x * (-0.7122890234154284 + x * (-0.05273963823400997 + x * (0.07952836873415717 + x * (-0.0023339375937419 + x * 8862163904564247e-19))))))));
      } else {
        x = 1 / x;
        s1 = 0 + x * (0 + x * (-0.005387729650712429 + x * (0.008226878746769157 + x * (0.02198786811111689 + x * (-0.03656379714117627 + x * (-0.012692614766297404 + x * (0.03348066254097446 + x * (-0.008368748197417368 + x * -5087819496582806e-19))))))));
        s2 = 8862163904564247e-19 + x * (-0.0023339375937419 + x * (0.07952836873415717 + x * (-0.05273963823400997 + x * (-0.7122890234154284 + x * (0.662328840472003 + x * (1.5622155839842302 + x * (-1.5657455823417585 + x * (-0.9700050433032906 + x * 1))))))));
      }
      return s1 / s2;
    }
    module2.exports = evalrational;
  }
});

// node_modules/@stdlib/math-base-special-erfinv/lib/rational_p2q2.js
var require_rational_p2q2 = __commonJS({
  "node_modules/@stdlib/math-base-special-erfinv/lib/rational_p2q2.js"(exports2, module2) {
    "use strict";
    function evalrational(x) {
      var ax;
      var s1;
      var s2;
      if (x === 0) {
        return -0.20243350835593876;
      }
      if (x < 0) {
        ax = -x;
      } else {
        ax = x;
      }
      if (ax <= 1) {
        s1 = -0.20243350835593876 + x * (0.10526468069939171 + x * (8.3705032834312 + x * (17.644729840837403 + x * (-18.851064805871424 + x * (-44.6382324441787 + x * (17.445385985570866 + x * (21.12946554483405 + x * -3.6719225470772936)))))));
        s2 = 1 + x * (6.242641248542475 + x * (3.971343795334387 + x * (-28.66081804998 + x * (-20.14326346804852 + x * (48.560921310873994 + x * (10.826866735546016 + x * (-22.643693341313973 + x * 1.7211476576120028)))))));
      } else {
        x = 1 / x;
        s1 = -3.6719225470772936 + x * (21.12946554483405 + x * (17.445385985570866 + x * (-44.6382324441787 + x * (-18.851064805871424 + x * (17.644729840837403 + x * (8.3705032834312 + x * (0.10526468069939171 + x * -0.20243350835593876)))))));
        s2 = 1.7211476576120028 + x * (-22.643693341313973 + x * (10.826866735546016 + x * (48.560921310873994 + x * (-20.14326346804852 + x * (-28.66081804998 + x * (3.971343795334387 + x * (6.242641248542475 + x * 1)))))));
      }
      return s1 / s2;
    }
    module2.exports = evalrational;
  }
});

// node_modules/@stdlib/math-base-special-erfinv/lib/rational_p3q3.js
var require_rational_p3q3 = __commonJS({
  "node_modules/@stdlib/math-base-special-erfinv/lib/rational_p3q3.js"(exports2, module2) {
    "use strict";
    function evalrational(x) {
      var ax;
      var s1;
      var s2;
      if (x === 0) {
        return -0.1311027816799519;
      }
      if (x < 0) {
        ax = -x;
      } else {
        ax = x;
      }
      if (ax <= 1) {
        s1 = -0.1311027816799519 + x * (-0.16379404719331705 + x * (0.11703015634199525 + x * (0.38707973897260434 + x * (0.3377855389120359 + x * (0.14286953440815717 + x * (0.029015791000532906 + x * (0.0021455899538880526 + x * (-6794655751811263e-22 + x * (28522533178221704e-24 + x * -681149956853777e-24)))))))));
        s2 = 1 + x * (3.4662540724256723 + x * (5.381683457070069 + x * (4.778465929458438 + x * (2.5930192162362027 + x * (0.848854343457902 + x * (0.15226433829533179 + x * (0.011059242293464892 + x * (0 + x * (0 + x * 0)))))))));
      } else {
        x = 1 / x;
        s1 = -681149956853777e-24 + x * (28522533178221704e-24 + x * (-6794655751811263e-22 + x * (0.0021455899538880526 + x * (0.029015791000532906 + x * (0.14286953440815717 + x * (0.3377855389120359 + x * (0.38707973897260434 + x * (0.11703015634199525 + x * (-0.16379404719331705 + x * -0.1311027816799519)))))))));
        s2 = 0 + x * (0 + x * (0 + x * (0.011059242293464892 + x * (0.15226433829533179 + x * (0.848854343457902 + x * (2.5930192162362027 + x * (4.778465929458438 + x * (5.381683457070069 + x * (3.4662540724256723 + x * 1)))))))));
      }
      return s1 / s2;
    }
    module2.exports = evalrational;
  }
});

// node_modules/@stdlib/math-base-special-erfinv/lib/rational_p4q4.js
var require_rational_p4q4 = __commonJS({
  "node_modules/@stdlib/math-base-special-erfinv/lib/rational_p4q4.js"(exports2, module2) {
    "use strict";
    function evalrational(x) {
      var ax;
      var s1;
      var s2;
      if (x === 0) {
        return -0.0350353787183178;
      }
      if (x < 0) {
        ax = -x;
      } else {
        ax = x;
      }
      if (ax <= 1) {
        s1 = -0.0350353787183178 + x * (-0.0022242652921344794 + x * (0.018557330651423107 + x * (0.009508047013259196 + x * (0.0018712349281955923 + x * (15754461742496055e-20 + x * (460469890584318e-20 + x * (-2304047769118826e-25 + x * 26633922742578204e-28)))))));
        s2 = 1 + x * (1.3653349817554064 + x * (0.7620591645536234 + x * (0.22009110576413124 + x * (0.03415891436709477 + x * (0.00263861676657016 + x * (7646752923027944e-20 + x * (0 + x * 0)))))));
      } else {
        x = 1 / x;
        s1 = 26633922742578204e-28 + x * (-2304047769118826e-25 + x * (460469890584318e-20 + x * (15754461742496055e-20 + x * (0.0018712349281955923 + x * (0.009508047013259196 + x * (0.018557330651423107 + x * (-0.0022242652921344794 + x * -0.0350353787183178)))))));
        s2 = 0 + x * (0 + x * (7646752923027944e-20 + x * (0.00263861676657016 + x * (0.03415891436709477 + x * (0.22009110576413124 + x * (0.7620591645536234 + x * (1.3653349817554064 + x * 1)))))));
      }
      return s1 / s2;
    }
    module2.exports = evalrational;
  }
});

// node_modules/@stdlib/math-base-special-erfinv/lib/rational_p5q5.js
var require_rational_p5q5 = __commonJS({
  "node_modules/@stdlib/math-base-special-erfinv/lib/rational_p5q5.js"(exports2, module2) {
    "use strict";
    function evalrational(x) {
      var ax;
      var s1;
      var s2;
      if (x === 0) {
        return -0.016743100507663373;
      }
      if (x < 0) {
        ax = -x;
      } else {
        ax = x;
      }
      if (ax <= 1) {
        s1 = -0.016743100507663373 + x * (-0.0011295143874558028 + x * (0.001056288621524929 + x * (20938631748758808e-20 + x * (14962478375834237e-21 + x * (44969678992770644e-23 + x * (4625961635228786e-24 + x * (-2811287356288318e-29 + x * 9905570997331033e-32)))))));
        s2 = 1 + x * (0.5914293448864175 + x * (0.1381518657490833 + x * (0.016074608709367652 + x * (9640118070051656e-19 + x * (27533547476472603e-21 + x * (282243172016108e-21 + x * (0 + x * 0)))))));
      } else {
        x = 1 / x;
        s1 = 9905570997331033e-32 + x * (-2811287356288318e-29 + x * (4625961635228786e-24 + x * (44969678992770644e-23 + x * (14962478375834237e-21 + x * (20938631748758808e-20 + x * (0.001056288621524929 + x * (-0.0011295143874558028 + x * -0.016743100507663373)))))));
        s2 = 0 + x * (0 + x * (282243172016108e-21 + x * (27533547476472603e-21 + x * (9640118070051656e-19 + x * (0.016074608709367652 + x * (0.1381518657490833 + x * (0.5914293448864175 + x * 1)))))));
      }
      return s1 / s2;
    }
    module2.exports = evalrational;
  }
});

// node_modules/@stdlib/math-base-special-erfinv/lib/main.js
var require_main43 = __commonJS({
  "node_modules/@stdlib/math-base-special-erfinv/lib/main.js"(exports2, module2) {
    "use strict";
    var isnan = require_lib();
    var sqrt = require_lib54();
    var ln = require_lib56();
    var PINF = require_lib7();
    var NINF = require_lib6();
    var rationalFcnR1 = require_rational_p1q1();
    var rationalFcnR2 = require_rational_p2q2();
    var rationalFcnR3 = require_rational_p3q3();
    var rationalFcnR4 = require_rational_p4q4();
    var rationalFcnR5 = require_rational_p5q5();
    var Y1 = 0.08913147449493408;
    var Y2 = 2.249481201171875;
    var Y3 = 0.807220458984375;
    var Y4 = 0.9399557113647461;
    var Y5 = 0.9836282730102539;
    function erfinv(x) {
      var sign;
      var ax;
      var qs;
      var q;
      var g;
      var r;
      if (isnan(x)) {
        return NaN;
      }
      if (x === 1) {
        return PINF;
      }
      if (x === -1) {
        return NINF;
      }
      if (x === 0) {
        return x;
      }
      if (x > 1 || x < -1) {
        return NaN;
      }
      if (x < 0) {
        sign = -1;
        ax = -x;
      } else {
        sign = 1;
        ax = x;
      }
      q = 1 - ax;
      if (ax <= 0.5) {
        g = ax * (ax + 10);
        r = rationalFcnR1(ax);
        return sign * (g * Y1 + g * r);
      }
      if (q >= 0.25) {
        g = sqrt(-2 * ln(q));
        q -= 0.25;
        r = rationalFcnR2(q);
        return sign * (g / (Y2 + r));
      }
      q = sqrt(-ln(q));
      if (q < 3) {
        qs = q - 1.125;
        r = rationalFcnR3(qs);
        return sign * (Y3 * q + r * q);
      }
      if (q < 6) {
        qs = q - 3;
        r = rationalFcnR4(qs);
        return sign * (Y4 * q + r * q);
      }
      qs = q - 6;
      r = rationalFcnR5(qs);
      return sign * (Y5 * q + r * q);
    }
    module2.exports = erfinv;
  }
});

// node_modules/@stdlib/math-base-special-erfinv/lib/index.js
var require_lib57 = __commonJS({
  "node_modules/@stdlib/math-base-special-erfinv/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main43();
    module2.exports = main;
  }
});

// node_modules/@stdlib/stats-base-dists-normal-quantile/lib/main.js
var require_main44 = __commonJS({
  "node_modules/@stdlib/stats-base-dists-normal-quantile/lib/main.js"(exports2, module2) {
    "use strict";
    var erfinv = require_lib57();
    var isnan = require_lib();
    var sqrt = require_lib54();
    function quantile(p, mu, sigma) {
      var A;
      var B;
      if (isnan(mu) || isnan(sigma) || isnan(p) || sigma < 0 || p < 0 || p > 1) {
        return NaN;
      }
      if (sigma === 0) {
        return mu;
      }
      A = mu;
      B = sigma * sqrt(2);
      return A + B * erfinv(2 * p - 1);
    }
    module2.exports = quantile;
  }
});

// node_modules/@stdlib/utils-constant-function/lib/main.js
var require_main45 = __commonJS({
  "node_modules/@stdlib/utils-constant-function/lib/main.js"(exports2, module2) {
    "use strict";
    function wrap(value) {
      return constantFunction;
      function constantFunction() {
        return value;
      }
    }
    module2.exports = wrap;
  }
});

// node_modules/@stdlib/utils-constant-function/lib/index.js
var require_lib58 = __commonJS({
  "node_modules/@stdlib/utils-constant-function/lib/index.js"(exports2, module2) {
    "use strict";
    var main = require_main45();
    module2.exports = main;
  }
});

// node_modules/@stdlib/stats-base-dists-degenerate-quantile/lib/main.js
var require_main46 = __commonJS({
  "node_modules/@stdlib/stats-base-dists-degenerate-quantile/lib/main.js"(exports2, module2) {
    "use strict";
    var isnan = require_lib();
    function quantile(p, mu) {
      if (isnan(p) || p < 0 || p > 1) {
        return NaN;
      }
      return mu;
    }
    module2.exports = quantile;
  }
});

// node_modules/@stdlib/stats-base-dists-degenerate-quantile/lib/factory.js
var require_factory = __commonJS({
  "node_modules/@stdlib/stats-base-dists-degenerate-quantile/lib/factory.js"(exports2, module2) {
    "use strict";
    var constantFunction = require_lib58();
    var isnan = require_lib();
    function factory(mu) {
      if (isnan(mu)) {
        return constantFunction(NaN);
      }
      return quantile;
      function quantile(p) {
        if (isnan(p) || p < 0 || p > 1) {
          return NaN;
        }
        return mu;
      }
    }
    module2.exports = factory;
  }
});

// node_modules/@stdlib/stats-base-dists-degenerate-quantile/lib/index.js
var require_lib59 = __commonJS({
  "node_modules/@stdlib/stats-base-dists-degenerate-quantile/lib/index.js"(exports2, module2) {
    "use strict";
    var setReadOnly = require_lib19();
    var main = require_main46();
    var factory = require_factory();
    setReadOnly(main, "factory", factory);
    module2.exports = main;
  }
});

// node_modules/@stdlib/stats-base-dists-normal-quantile/lib/factory.js
var require_factory2 = __commonJS({
  "node_modules/@stdlib/stats-base-dists-normal-quantile/lib/factory.js"(exports2, module2) {
    "use strict";
    var constantFunction = require_lib58();
    var degenerate = require_lib59().factory;
    var erfinv = require_lib57();
    var isnan = require_lib();
    var sqrt = require_lib54();
    function factory(mu, sigma) {
      var A;
      var B;
      if (isnan(mu) || isnan(sigma) || sigma < 0) {
        return constantFunction(NaN);
      }
      if (sigma === 0) {
        degenerate(mu);
      }
      A = mu;
      B = sigma * sqrt(2);
      return quantile;
      function quantile(p) {
        if (isnan(p) || p < 0 || p > 1) {
          return NaN;
        }
        return A + B * erfinv(2 * p - 1);
      }
    }
    module2.exports = factory;
  }
});

// node_modules/@stdlib/stats-base-dists-normal-quantile/lib/index.js
var require_lib60 = __commonJS({
  "node_modules/@stdlib/stats-base-dists-normal-quantile/lib/index.js"(exports2, module2) {
    "use strict";
    var setReadOnly = require_lib19();
    var main = require_main44();
    var factory = require_factory2();
    setReadOnly(main, "factory", factory);
    module2.exports = main;
  }
});

// node_modules/openskill/dist/index.cjs
var require_dist2 = __commonJS({
  "node_modules/openskill/dist/index.cjs"(exports2, module2) {
    "use strict";
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __defProps = Object.defineProperties;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __getOwnPropSymbols = Object.getOwnPropertySymbols;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __propIsEnum = Object.prototype.propertyIsEnumerable;
    var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
    var __spreadValues = (a, b) => {
      for (var prop in b || (b = {}))
        if (__hasOwnProp.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      if (__getOwnPropSymbols)
        for (var prop of __getOwnPropSymbols(b)) {
          if (__propIsEnum.call(b, prop))
            __defNormalProp(a, prop, b[prop]);
        }
      return a;
    };
    var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var index_exports = {};
    __export(index_exports, {
      ordinal: () => ordinal_default,
      predictDraw: () => predict_draw_default,
      predictRank: () => predict_rank_default,
      predictWin: () => predict_win_default,
      rate: () => rate_default,
      rating: () => rating_default
    });
    module2.exports = __toCommonJS(index_exports);
    var builder = (options) => {
      const { z = 3, mu = 25, epsilon = 0.1, alpha = 1, target = 0 } = options;
      const { tau = 25 / 300, sigma = 25 / 3, beta = 25 / 6, limitSigma = false } = options;
      const { balance = false, kappa = 1e-4 } = options;
      const betaSq = beta ** 2;
      return {
        SIGMA: sigma,
        MU: mu,
        EPSILON: epsilon,
        TWOBETASQ: 2 * betaSq,
        BETA: beta,
        BETASQ: betaSq,
        Z: z,
        ALPHA: alpha,
        TARGET: target,
        TAU: tau,
        LIMIT_SIGMA: limitSigma,
        BALANCE: balance,
        KAPPA: kappa
      };
    };
    var constants_default = builder;
    var rating = (init, options = {}) => {
      const { MU: mu, SIGMA: sigma } = constants_default(__spreadValues(__spreadValues({}, options), init));
      return { mu, sigma };
    };
    var rating_default = rating;
    var import_ramda2 = require_src();
    var import_sort_unwind = require_dist();
    var marginAmp = (absDiff, margin) => Math.log1p(Math.max(0, absDiff - margin));
    var marginFactor = (scores, i, margin) => {
      const n = scores.length;
      if (n <= 1) return 1;
      const si = scores[i];
      const sum2 = scores.reduce((acc, sj, j) => j === i ? acc : acc + marginAmp(Math.abs(si - sj), margin), 0);
      return 1 + sum2 / (n - 1);
    };
    var import_ramda = require_src();
    var sum = (a, b) => a + b;
    var rankings = (teams, rank = []) => {
      const teamScores = teams.map((_, i) => {
        var _a;
        return (_a = rank[i]) != null ? _a : i;
      });
      const outRank = new Array(teams.length);
      let s = 0;
      for (let j = 0; j < teamScores.length; j += 1) {
        if (j > 0 && teamScores[j - 1] < teamScores[j]) {
          s = j;
        }
        outRank[j] = s;
      }
      return outRank;
    };
    var teamRating = (options) => (game) => {
      const { Z, ALPHA, TARGET, BALANCE, KAPPA } = constants_default(options);
      const rank = rankings(game, options.rank);
      return game.map((team, i) => {
        if (!BALANCE) {
          const { mu: muSum2, sigSq: sigSq2 } = team.reduce(
            (a, { mu, sigma }) => {
              a.mu += mu;
              a.sigSq += sigma * sigma;
              return a;
            },
            { mu: 0, sigSq: 0 }
          );
          return [muSum2, sigSq2, team, rank[i]];
        }
        const ordinals = team.map(({ mu, sigma }) => TARGET + ALPHA * (mu - Z * sigma));
        const maxOrdinal = Math.max(...ordinals);
        const denom = maxOrdinal + KAPPA;
        const { mu: muSum, sigSq } = team.reduce(
          (a, { mu, sigma }, j) => {
            const factor = 1 + (maxOrdinal - ordinals[j]) / denom;
            a.mu += mu * factor;
            const s = sigma * factor;
            a.sigSq += s * s;
            return a;
          },
          { mu: 0, sigSq: 0 }
        );
        return [muSum, sigSq, team, rank[i]];
      });
    };
    var utilC = (options) => {
      const { BETASQ } = constants_default(options);
      return (teamRatings) => Math.sqrt(teamRatings.map(([_teamMu, teamSigmaSq, _team, _rank]) => teamSigmaSq + BETASQ).reduce(sum, 0));
    };
    var utilSumQ = (teamRatings, c) => teamRatings.map(
      ([_qMu, _qSigmaSq, _qTeam, qRank]) => teamRatings.filter(([_iMu, _iSigmaSq, _iTeam, iRank]) => iRank >= qRank).map(([iMu, _iSigmaSq, _iTeam, _iRank]) => Math.exp(iMu / c)).reduce(sum, 0)
    );
    var utilA = (teamRatings) => teamRatings.map(
      ([_iMu, _iSigmaSq, _iTeam, iRank]) => teamRatings.filter(([_qMu, _qSigmaSq, _qTeam, qRank]) => iRank === qRank).length
    );
    var defaultGamma = (c, _k, _mu, sigmaSq, _team, _qRank) => Math.sqrt(sigmaSq) / c;
    var gamma = (options) => {
      var _a;
      return (_a = options.gamma) != null ? _a : defaultGamma;
    };
    var util_default = (options) => ({
      utilC: utilC(options),
      teamRating: teamRating(options),
      gamma: gamma(options)
    });
    var model = (game, options = {}) => {
      const { KAPPA } = constants_default(options);
      const { utilC: utilC2, teamRating: teamRating2, gamma: gamma2 } = util_default(options);
      const teamRatings = teamRating2(game);
      const c = utilC2(teamRatings);
      const sumQ = utilSumQ(teamRatings, c);
      const a = utilA(teamRatings);
      return teamRatings.map((iTeamRating, i) => {
        const [iMu, iSigmaSq, iTeam, iRank] = iTeamRating;
        const iMuOverCe = Math.exp(iMu / c);
        const { omega: omegaSum, delta: deltaSum } = teamRatings.reduce(
          (acc, [_qMu, _qSigmaSq, _qTeam, qRank], q) => {
            if (qRank > iRank) return acc;
            const quotient = iMuOverCe / sumQ[q];
            acc.omega += (i === q ? 1 - quotient : -quotient) / a[q];
            acc.delta += quotient * (1 - quotient) / a[q];
            return acc;
          },
          { omega: 0, delta: 0 }
        );
        const iGamma = gamma2(c, teamRatings.length, ...iTeamRating);
        const iOmega = omegaSum * (iSigmaSq / c);
        const iDelta = deltaSum * (iSigmaSq / c ** 2) * iGamma;
        return iTeam.map(({ mu, sigma }) => ({
          mu: mu + sigma ** 2 / iSigmaSq * iOmega,
          sigma: sigma * Math.sqrt(Math.max(1 - sigma ** 2 / iSigmaSq * iDelta, KAPPA))
        }));
      });
    };
    var plackett_luce_default = model;
    var import_math_base_special_erf = __toESM(require_lib53(), 1);
    var import_stats_base_dists_normal_quantile = __toESM(require_lib60(), 1);
    var SQRT_2 = Math.sqrt(2);
    var SQRT_TAU = Math.sqrt(2 * Math.PI);
    var phiMajor = (x) => 0.5 * (1 + (0, import_math_base_special_erf.default)(x / SQRT_2));
    var phiMajorInverse = (x) => (0, import_stats_base_dists_normal_quantile.default)(x, 0, 1);
    var rate = (teams, options = {}) => {
      var _a, _b, _c;
      const { LIMIT_SIGMA, TAU } = constants_default(options);
      const { model: model2 = plackett_luce_default } = options;
      const tauSquared = TAU * TAU;
      const processedTeams = teams.map(
        (team) => team.map((p) => __spreadProps(__spreadValues({}, p), {
          sigma: Math.sqrt(p.sigma * p.sigma + tauSquared)
        }))
      );
      const rank = (_c = (_b = options.rank) != null ? _b : (_a = options.score) == null ? void 0 : _a.map((points) => -points)) != null ? _c : (0, import_ramda2.range)(1, teams.length + 1);
      const [orderedTeams, tenet] = (0, import_sort_unwind.unwind)(rank, processedTeams);
      const newRatings = model2(orderedTeams, __spreadProps(__spreadValues({}, options), {
        rank: (0, import_ramda2.sortBy)(import_ramda2.identity, rank)
      }));
      let [reorderedTeams] = (0, import_sort_unwind.unwind)(tenet, newRatings);
      if (options.score && options.margin) {
        const scores = options.score;
        const margin = options.margin;
        reorderedTeams = reorderedTeams.map((team, i) => {
          const factor = marginFactor(scores, i, margin);
          return team.map((p, k) => {
            const priorMu = processedTeams[i][k].mu;
            return { mu: priorMu + factor * (p.mu - priorMu), sigma: p.sigma };
          });
        });
      }
      if (TAU && LIMIT_SIGMA) {
        reorderedTeams = reorderedTeams.map(
          (team, i) => team.map((p, j) => __spreadProps(__spreadValues({}, p), {
            sigma: Math.min(p.sigma, teams[i][j].sigma)
          }))
        );
      }
      return reorderedTeams;
    };
    var rate_default = rate;
    var ordinal = (rating2, options = {}) => {
      const { sigma, mu } = rating2;
      const { Z, ALPHA, TARGET } = constants_default(options);
      return TARGET + ALPHA * (mu - Z * sigma);
    };
    var ordinal_default = ordinal;
    var import_ramda3 = require_src();
    function* upperTrianglePairs(n) {
      for (let i = 0; i < n; i += 1) {
        for (let j = i + 1; j < n; j += 1) {
          yield [i, j];
        }
      }
    }
    var predictWin = (teams, options = {}) => {
      const { teamRating: teamRating2 } = util_default(options);
      const { BETASQ } = constants_default(options);
      const teamRatings = teamRating2(teams);
      const n = teams.length;
      const denom = n * (n - 1) / 2;
      const wins = (0, import_ramda3.reduce)(
        (acc, [i, j]) => {
          const [muA, sigmaSqA] = teamRatings[i];
          const [muB, sigmaSqB] = teamRatings[j];
          const p = phiMajor((muA - muB) / Math.sqrt(n * BETASQ + sigmaSqA + sigmaSqB));
          acc[i] += p;
          acc[j] += 1 - p;
          return acc;
        },
        new Array(n).fill(0),
        upperTrianglePairs(n)
      );
      return wins.map((w) => w / denom);
    };
    var predict_win_default = predictWin;
    var import_ramda4 = require_src();
    var predictDraw = (teams, options = {}) => {
      const { teamRating: teamRating2 } = util_default(options);
      const { BETASQ, BETA } = constants_default(options);
      const totalPlayerCount = (0, import_ramda4.reduce)((acc, t) => acc + t.length, 0, teams);
      const drawProbability = 1 / totalPlayerCount;
      const drawMargin = Math.sqrt(totalPlayerCount) * BETA * phiMajorInverse((1 + drawProbability) / 2);
      const teamRatings = (0, import_ramda4.map)((team) => (0, import_ramda4.head)(teamRating2([team])), teams);
      const idx = (0, import_ramda4.range)(0, teamRatings.length);
      const pairs = (0, import_ramda4.filter)(([i, j]) => i < j, (0, import_ramda4.xprod)(idx, idx));
      const { total, count } = (0, import_ramda4.reduce)(
        (acc, [i, j]) => {
          const [muA, sigmaSqA] = teamRatings[i];
          const [muB, sigmaSqB] = teamRatings[j];
          const sharedDenom = Math.sqrt(totalPlayerCount * BETASQ + sigmaSqA + sigmaSqB);
          acc.total += phiMajor((drawMargin - muA + muB) / sharedDenom) - phiMajor((muB - muA - drawMargin) / sharedDenom);
          acc.count += 1;
          return acc;
        },
        { total: 0, count: 0 },
        pairs
      );
      return total / count;
    };
    var predict_draw_default = predictDraw;
    var predictRank = (teams, options = {}) => {
      const winProbs = predict_win_default(teams, options);
      return winProbs.map((prob, _, all) => [1 + all.filter((q) => q > prob).length, prob]);
    };
    var predict_rank_default = predictRank;
  }
});

// node_modules/glicko2/glicko2.js
var require_glicko2 = __commonJS({
  "node_modules/glicko2/glicko2.js"(exports2) {
    (function(exports3) {
      var scalingFactor = 173.7178;
      function Race(results) {
        this.matches = this.computeMatches(results);
      }
      Race.prototype.getMatches = function() {
        return this.matches;
      };
      Race.prototype.computeMatches = function(results) {
        var players = [];
        var position = 0;
        results.forEach(function(rank) {
          position += 1;
          rank.forEach(function(player2) {
            players.push({ "player": player2, "position": position });
          });
        });
        function computeMatches(players2) {
          if (players2.length === 0) return [];
          var player1 = players2.shift();
          var player1_results = players2.map(function(player2) {
            return [player1.player, player2.player, player1.position < player2.position ? 1 : 0.5];
          });
          return player1_results.concat(computeMatches(players2));
        }
        return computeMatches(players);
      };
      Race.prototype.computeMatches_v2 = function(results) {
        var players = [];
        var position = 0;
        results.forEach(function(rank) {
          position += 1;
          rank.forEach(function(player2) {
            players.push({ "player": player2, "position": position });
          });
        });
        var matches = [];
        while (player = players.shift()) {
          if (players.length > 0) {
            matches.push([player.player, players[0].player, player.position < players[0].position ? 1 : 0.5]);
          }
        }
        return matches;
      };
      function Player(rating, rd, vol, tau, default_rating, volatility_algorithm, id) {
        this._tau = tau;
        this.defaultRating = default_rating;
        this.volatility_algorithm = volatility_algorithm;
        this.setRating(rating);
        this.setRd(rd);
        this.setVol(vol);
        this.id = id;
        this.adv_ranks = [];
        this.adv_rds = [];
        this.outcomes = [];
      }
      Player.prototype.getRating = function() {
        return this.__rating * scalingFactor + this.defaultRating;
      };
      Player.prototype.setRating = function(rating) {
        this.__rating = (rating - this.defaultRating) / scalingFactor;
      };
      Player.prototype.getRd = function() {
        return this.__rd * scalingFactor;
      };
      Player.prototype.setRd = function(rd) {
        this.__rd = rd / scalingFactor;
      };
      Player.prototype.getVol = function() {
        return this.__vol;
      };
      Player.prototype.setVol = function(vol) {
        this.__vol = vol;
      };
      Player.prototype.addResult = function(opponent, outcome) {
        this.adv_ranks.push(opponent.__rating);
        this.adv_rds.push(opponent.__rd);
        this.outcomes.push(outcome);
      };
      Player.prototype.update_rank = function() {
        if (!this.hasPlayed()) {
          this._preRatingRD();
          return;
        }
        var v = this._variance();
        var delta = this._delta(v);
        this.__vol = this.volatility_algorithm(v, delta);
        this._preRatingRD();
        this.__rd = 1 / Math.sqrt(1 / Math.pow(this.__rd, 2) + 1 / v);
        var tempSum = 0;
        for (var i = 0, len = this.adv_ranks.length; i < len; i++) {
          tempSum += this._g(this.adv_rds[i]) * (this.outcomes[i] - this._E(this.adv_ranks[i], this.adv_rds[i]));
        }
        this.__rating += Math.pow(this.__rd, 2) * tempSum;
      };
      Player.prototype.hasPlayed = function() {
        return this.outcomes.length > 0;
      };
      Player.prototype._preRatingRD = function() {
        this.__rd = Math.sqrt(Math.pow(this.__rd, 2) + Math.pow(this.__vol, 2));
      };
      Player.prototype._variance = function() {
        var tempSum = 0;
        for (var i = 0, len = this.adv_ranks.length; i < len; i++) {
          var tempE = this._E(this.adv_ranks[i], this.adv_rds[i]);
          tempSum += Math.pow(this._g(this.adv_rds[i]), 2) * tempE * (1 - tempE);
        }
        return 1 / tempSum;
      };
      Player.prototype._E = function(p2rating, p2RD) {
        return 1 / (1 + Math.exp(-1 * this._g(p2RD) * (this.__rating - p2rating)));
      };
      Player.prototype.predict = function(p2) {
        var diffRD = Math.sqrt(Math.pow(this.__rd, 2) + Math.pow(p2.__rd, 2));
        return 1 / (1 + Math.exp(-1 * this._g(diffRD) * (this.__rating - p2.__rating)));
      };
      Player.prototype._g = function(RD) {
        return 1 / Math.sqrt(1 + 3 * Math.pow(RD, 2) / Math.pow(Math.PI, 2));
      };
      Player.prototype._delta = function(v) {
        var tempSum = 0;
        for (var i = 0, len = this.adv_ranks.length; i < len; i++) {
          tempSum += this._g(this.adv_rds[i]) * (this.outcomes[i] - this._E(this.adv_ranks[i], this.adv_rds[i]));
        }
        return v * tempSum;
      };
      Player.prototype._makef = function(delta, v, a) {
        var pl = this;
        return function(x) {
          return Math.exp(x) * (Math.pow(delta, 2) - Math.pow(pl.__rd, 2) - v - Math.exp(x)) / (2 * Math.pow(Math.pow(pl.__rd, 2) + v + Math.exp(x), 2)) - (x - a) / Math.pow(pl._tau, 2);
        };
      };
      function Glicko2(settings) {
        settings = settings || {};
        this._tau = settings.tau || 0.5;
        this._default_rating = settings.rating || 1500;
        this._default_rd = settings.rd || 350;
        this._default_vol = settings.vol || 0.06;
        this._volatility_algorithm = volatility_algorithms[settings.volatility_algorithm || "newprocedure"];
        this.players = [];
        this.players_index = 0;
      }
      Glicko2.prototype.makeRace = function(results) {
        return new Race(results);
      };
      Glicko2.prototype.removePlayers = function() {
        this.players = [];
        this.players_index = 0;
      };
      Glicko2.prototype.getPlayers = function() {
        return this.players;
      };
      Glicko2.prototype.cleanPreviousMatches = function() {
        for (var i = 0, len = this.players.length; i < len; i++) {
          this.players[i].adv_ranks = [];
          this.players[i].adv_rds = [];
          this.players[i].outcomes = [];
        }
      };
      Glicko2.prototype.calculatePlayersRatings = function() {
        var keys = Object.keys(this.players);
        for (var i = 0, len = keys.length; i < len; i++) {
          this.players[keys[i]].update_rank();
        }
      };
      Glicko2.prototype.addMatch = function(player1, player2, outcome) {
        var pl1 = this._createInternalPlayer(player1.rating, player1.rd, player1.vol, player1.id);
        var pl2 = this._createInternalPlayer(player2.rating, player2.rd, player2.vol, player2.id);
        this.addResult(pl1, pl2, outcome);
        return { pl1, pl2 };
      };
      Glicko2.prototype.makePlayer = function(rating, rd, vol) {
        return this._createInternalPlayer(rating, rd, vol);
      };
      Glicko2.prototype._createInternalPlayer = function(rating, rd, vol, id) {
        if (id === void 0) {
          id = this.players_index;
          this.players_index = this.players_index + 1;
        } else {
          var candidate = this.players[id];
          if (candidate !== void 0) {
            return candidate;
          }
        }
        var player2 = new Player(
          rating || this._default_rating,
          rd || this._default_rd,
          vol || this._default_vol,
          this._tau,
          this._default_rating,
          this._volatility_algorithm,
          id
        );
        this.players[id] = player2;
        return player2;
      };
      Glicko2.prototype.addResult = function(player1, player2, outcome) {
        player1.addResult(player2, outcome);
        player2.addResult(player1, 1 - outcome);
      };
      Glicko2.prototype.updateRatings = function(matches) {
        if (matches instanceof Race) {
          matches = matches.getMatches();
        }
        if (typeof matches !== "undefined") {
          this.cleanPreviousMatches();
          for (var i = 0, len = matches.length; i < len; i++) {
            var match = matches[i];
            this.addResult(match[0], match[1], match[2]);
          }
        }
        this.calculatePlayersRatings();
      };
      Glicko2.prototype.predict = function(player1, player2) {
        return player1.predict(player2);
      };
      var volatility_algorithms = {
        oldprocedure: function(v, delta) {
          var sigma = this.__vol;
          var phi = this.__rd;
          var tau = this._tau;
          var a, x1, x2, x3, y1, y2, y3, upper;
          var result;
          upper = find_upper_falsep(phi, v, delta, tau);
          a = Math.log(Math.pow(sigma, 2));
          y1 = equation(phi, v, 0, a, tau, delta);
          if (y1 > 0) {
            result = upper;
          } else {
            x1 = 0;
            x2 = x1;
            y2 = y1;
            x1 = x1 - 1;
            y1 = equation(phi, v, x1, a, tau, delta);
            while (y1 < 0) {
              x2 = x1;
              y2 = y1;
              x1 = x1 - 1;
              y1 = equation(phi, v, x1, a, tau, delta);
            }
            for (var i = 0; i < 21; i++) {
              x3 = y1 * (x1 - x2) / (y2 - y1) + x1;
              y3 = equation(phi, v, x3, a, tau, delta);
              if (y3 > 0) {
                x1 = x3;
                y1 = y3;
              } else {
                x2 = x3;
                y2 = y3;
              }
            }
            if (Math.exp((y1 * (x1 - x2) / (y2 - y1) + x1) / 2) > upper) {
              result = upper;
            } else {
              result = Math.exp((y1 * (x1 - x2) / (y2 - y1) + x1) / 2);
            }
          }
          return result;
          function new_sigma(sigma2, phi2, v2, delta2, tau2) {
            var a2 = Math.log(Math.pow(sigma2, 2));
            var x = a2;
            var old_x = 0;
            while (x != old_x) {
              old_x = x;
              var d2 = Math.pow(phi2, 2) + v2 + Math.exp(old_x);
              var h1 = -(old_x - a2) / Math.pow(tau2, 2) - 0.5 * Math.exp(old_x) / d2 + 0.5 * Math.exp(old_x) * Math.pow(delta2 / d2, 2);
              var h2 = -1 / Math.pow(tau2, 2) - 0.5 * Math.exp(old_x) * (Math.pow(phi2, 2) + v2) / Math.pow(d2, 2) + 0.5 * Math.pow(delta2, 2) * Math.exp(old_x) * (Math.pow(phi2, 2) + v2 - Math.exp(old_x)) / Math.pow(d2, 3);
              x = old_x - h1 / h2;
            }
            return Math.exp(x / 2);
          }
          function equation(phi2, v2, x, a2, tau2, delta2) {
            var d2 = Math.pow(phi2, 2) + v2 + Math.exp(x);
            return -(x - a2) / Math.pow(tau2, 2) - 0.5 * Math.exp(x) / d2 + 0.5 * Math.exp(x) * Math.pow(delta2 / d2, 2);
          }
          function new_sigma_bisection(sigma2, phi2, v2, delta2, tau2) {
            var a2, x12, x22, x32;
            a2 = Math.log(Math.pow(sigma2, 2));
            if (equation(phi2, v2, 0, a2, tau2, delta2) < 0) {
              x12 = -1;
              while (equation(phi2, v2, x12, a2, tau2, delta2) < 0) {
                x12 = x12 - 1;
              }
              x22 = x12 + 1;
            } else {
              x22 = 1;
              while (equation(phi2, v2, x22, a2, tau2, delta2) > 0) {
                x22 = x22 + 1;
              }
              x12 = x22 - 1;
            }
            for (var i2 = 0; i2 < 27; i2++) {
              x32 = (x12 + x22) / 2;
              if (equation(phi2, v2, x32, a2, tau2, delta2) > 0) {
                x12 = x32;
              } else {
                x22 = x32;
              }
            }
            return Math.exp((x12 + x22) / 4);
          }
          function Dequation(phi2, v2, x, tau2, delta2) {
            d = Math.pow(phi2, 2) + v2 + Math.exp(x);
            return -1 / Math.pow(tau2, 2) - 0.5 * Math.exp(x) / d + 0.5 * Math.exp(x) * (Math.exp(x) + Math.pow(delta2, 2)) / Math.pow(d, 2) - Math.pow(Math.exp(x), 2) * Math.pow(delta2, 2) / Math.pow(d, 3);
          }
          function find_upper_falsep(phi2, v2, delta2, tau2) {
            var x12, x22, x32, y12, y22, y32;
            y12 = Dequation(phi2, v2, 0, tau2, delta2);
            if (y12 < 0) {
              return 1;
            } else {
              x12 = 0;
              x22 = x12;
              y22 = y12;
              x12 = x12 - 1;
              y12 = Dequation(phi2, v2, x12, tau2, delta2);
              while (y12 > 0) {
                x22 = x12;
                y22 = y12;
                x12 = x12 - 1;
                y12 = Dequation(phi2, v2, x12, tau2, delta2);
              }
              for (var i2 = 0; i2 < 21; i2++) {
                x32 = y12 * (x12 - x22) / (y22 - y12) + x12;
                y32 = Dequation(phi2, v2, x32, tau2, delta2);
                if (y32 > 0) {
                  x12 = x32;
                  y12 = y32;
                } else {
                  x22 = x32;
                  y22 = y32;
                }
              }
              return Math.exp((y12 * (x12 - x22) / (y22 - y12) + x12) / 2);
            }
          }
        },
        newprocedure: function(v, delta) {
          var A = Math.log(Math.pow(this.__vol, 2));
          var f = this._makef(delta, v, A);
          var epsilon = 1e-7;
          var B, k;
          if (Math.pow(delta, 2) > Math.pow(this.__rd, 2) + v) {
            B = Math.log(Math.pow(delta, 2) - Math.pow(this.__rd, 2) - v);
          } else {
            k = 1;
            while (f(A - k * this._tau) < 0) {
              k = k + 1;
            }
            B = A - k * this._tau;
          }
          var fA = f(A);
          var fB = f(B);
          var C, fC;
          while (Math.abs(B - A) > epsilon) {
            C = A + (A - B) * fA / (fB - fA);
            fC = f(C);
            if (fC * fB <= 0) {
              A = B;
              fA = fB;
            } else {
              fA = fA / 2;
            }
            B = C;
            fB = fC;
          }
          return Math.exp(A / 2);
        },
        newprocedure_mod: function(v, delta) {
          var A = Math.log(Math.pow(this.__vol, 2));
          var f = this._makef(delta, v, A);
          var epsilon = 1e-7;
          var B, k;
          if (delta > Math.pow(this.__rd, 2) + v) {
            B = Math.log(delta - Math.pow(this.__rd, 2) - v);
          } else {
            k = 1;
            while (f(A - k * this._tau) < 0) {
              k = k + 1;
            }
            B = A - k * this._tau;
          }
          var fA = f(A);
          var fB = f(B);
          var C, fC;
          while (Math.abs(B - A) > epsilon) {
            C = A + (A - B) * fA / (fB - fA);
            fC = f(C);
            if (fC * fB < 0) {
              A = B;
              fA = fB;
            } else {
              fA = fA / 2;
            }
            B = C;
            fB = fC;
          }
          return Math.exp(A / 2);
        },
        oldprocedure_simple: function(v, delta) {
          var i = 0;
          var a = Math.log(Math.pow(this.__vol, 2));
          var tau = this._tau;
          var x0 = a;
          var x1 = 0;
          var d2, h1, h2;
          while (Math.abs(x0 - x1) > 1e-8) {
            x0 = x1;
            d2 = Math.pow(this.__rating, 2) + v + Math.exp(x0);
            h1 = -(x0 - a) / Math.pow(tau, 2) - 0.5 * Math.exp(x0) / d2 + 0.5 * Math.exp(x0) * Math.pow(delta / d2, 2);
            h2 = -1 / Math.pow(tau, 2) - 0.5 * Math.exp(x0) * (Math.pow(this.__rating, 2) + v) / Math.pow(d2, 2) + 0.5 * Math.pow(delta, 2) * Math.exp(x0) * (Math.pow(this.__rating, 2) + v - Math.exp(x0)) / Math.pow(d2, 3);
            x1 = x0 - h1 / h2;
          }
          return Math.exp(x1 / 2);
        }
      };
      exports3.Glicko2 = Glicko2;
    })(typeof exports2 === "undefined" ? exports2["glicko2"] = {} : exports2);
  }
});

// entry.js
module.exports = { openskill: require_dist2(), Glicko2: require_glicko2() };
/*! Bundled license information:

@stdlib/math-base-assert-is-nan/lib/main.js:
@stdlib/math-base-assert-is-nan/lib/index.js:
@stdlib/math-base-special-floor/lib/main.js:
@stdlib/math-base-special-floor/lib/index.js:
@stdlib/math-base-special-ceil/lib/main.js:
@stdlib/math-base-special-ceil/lib/index.js:
@stdlib/math-base-special-trunc/lib/main.js:
@stdlib/math-base-special-trunc/lib/index.js:
@stdlib/number-ctor/lib/main.js:
@stdlib/number-ctor/lib/index.js:
@stdlib/constants-float64-ninf/lib/index.js:
@stdlib/constants-float64-pinf/lib/index.js:
@stdlib/constants-float64-exponent-bias/lib/index.js:
@stdlib/constants-float64-max-base2-exponent/lib/index.js:
@stdlib/constants-float64-max-base2-exponent-subnormal/lib/index.js:
@stdlib/constants-float64-min-base2-exponent-subnormal/lib/index.js:
@stdlib/math-base-assert-is-infinite/lib/main.js:
@stdlib/math-base-assert-is-infinite/lib/index.js:
@stdlib/utils-define-property/lib/builtin.js:
@stdlib/utils-define-property/lib/polyfill.js:
@stdlib/utils-define-property/lib/index.js:
@stdlib/utils-define-nonenumerable-read-only-property/lib/main.js:
@stdlib/utils-define-nonenumerable-read-only-property/lib/index.js:
@stdlib/assert-has-symbol-support/lib/main.js:
@stdlib/assert-has-symbol-support/lib/index.js:
@stdlib/assert-has-tostringtag-support/lib/main.js:
@stdlib/assert-has-tostringtag-support/lib/index.js:
@stdlib/utils-native-class/lib/tostring.js:
@stdlib/utils-native-class/lib/main.js:
@stdlib/assert-has-own-property/lib/main.js:
@stdlib/assert-has-own-property/lib/index.js:
@stdlib/symbol-ctor/lib/main.js:
@stdlib/symbol-ctor/lib/index.js:
@stdlib/utils-native-class/lib/tostringtag.js:
@stdlib/utils-native-class/lib/polyfill.js:
@stdlib/utils-native-class/lib/index.js:
@stdlib/assert-is-uint32array/lib/main.js:
@stdlib/assert-is-uint32array/lib/index.js:
@stdlib/constants-uint32-max/lib/index.js:
@stdlib/assert-has-uint32array-support/lib/uint32array.js:
@stdlib/assert-has-uint32array-support/lib/main.js:
@stdlib/assert-has-uint32array-support/lib/index.js:
@stdlib/array-uint32/lib/main.js:
@stdlib/array-uint32/lib/polyfill.js:
@stdlib/array-uint32/lib/index.js:
@stdlib/assert-is-float64array/lib/main.js:
@stdlib/assert-is-float64array/lib/index.js:
@stdlib/assert-has-float64array-support/lib/float64array.js:
@stdlib/assert-has-float64array-support/lib/main.js:
@stdlib/assert-has-float64array-support/lib/index.js:
@stdlib/array-float64/lib/main.js:
@stdlib/array-float64/lib/polyfill.js:
@stdlib/array-float64/lib/index.js:
@stdlib/assert-is-uint8array/lib/main.js:
@stdlib/assert-is-uint8array/lib/index.js:
@stdlib/constants-uint8-max/lib/index.js:
@stdlib/assert-has-uint8array-support/lib/uint8array.js:
@stdlib/assert-has-uint8array-support/lib/main.js:
@stdlib/assert-has-uint8array-support/lib/index.js:
@stdlib/array-uint8/lib/main.js:
@stdlib/array-uint8/lib/polyfill.js:
@stdlib/array-uint8/lib/index.js:
@stdlib/assert-is-uint16array/lib/main.js:
@stdlib/assert-is-uint16array/lib/index.js:
@stdlib/constants-uint16-max/lib/index.js:
@stdlib/assert-has-uint16array-support/lib/uint16array.js:
@stdlib/assert-has-uint16array-support/lib/main.js:
@stdlib/assert-has-uint16array-support/lib/index.js:
@stdlib/array-uint16/lib/main.js:
@stdlib/array-uint16/lib/polyfill.js:
@stdlib/array-uint16/lib/index.js:
@stdlib/assert-is-little-endian/lib/ctors.js:
@stdlib/assert-is-little-endian/lib/main.js:
@stdlib/assert-is-little-endian/lib/index.js:
@stdlib/number-float64-base-to-words/lib/indices.js:
@stdlib/number-float64-base-to-words/lib/assign.js:
@stdlib/number-float64-base-to-words/lib/main.js:
@stdlib/number-float64-base-to-words/lib/index.js:
@stdlib/number-float64-base-get-high-word/lib/high.js:
@stdlib/number-float64-base-get-high-word/lib/main.js:
@stdlib/number-float64-base-get-high-word/lib/index.js:
@stdlib/number-float64-base-from-words/lib/indices.js:
@stdlib/number-float64-base-from-words/lib/main.js:
@stdlib/number-float64-base-from-words/lib/index.js:
@stdlib/math-base-special-copysign/lib/main.js:
@stdlib/math-base-special-copysign/lib/index.js:
@stdlib/constants-float64-smallest-normal/lib/index.js:
@stdlib/math-base-special-abs/lib/index.js:
@stdlib/number-float64-base-normalize/lib/assign.js:
@stdlib/number-float64-base-normalize/lib/main.js:
@stdlib/number-float64-base-normalize/lib/index.js:
@stdlib/constants-float64-high-word-exponent-mask/lib/index.js:
@stdlib/number-float64-base-exponent/lib/main.js:
@stdlib/number-float64-base-exponent/lib/index.js:
@stdlib/math-base-special-ldexp/lib/main.js:
@stdlib/math-base-special-ldexp/lib/index.js:
@stdlib/math-base-special-exp/lib/index.js:
@stdlib/number-float64-base-set-low-word/lib/low.js:
@stdlib/number-float64-base-set-low-word/lib/main.js:
@stdlib/number-float64-base-set-low-word/lib/index.js:
@stdlib/math-base-special-erf/lib/index.js:
@stdlib/math-base-special-sqrt/lib/main.js:
@stdlib/math-base-special-sqrt/lib/index.js:
@stdlib/number-float64-base-set-high-word/lib/high.js:
@stdlib/number-float64-base-set-high-word/lib/main.js:
@stdlib/number-float64-base-set-high-word/lib/index.js:
@stdlib/math-base-special-ln/lib/index.js:
@stdlib/math-base-special-erfinv/lib/index.js:
@stdlib/stats-base-dists-normal-quantile/lib/main.js:
@stdlib/utils-constant-function/lib/main.js:
@stdlib/utils-constant-function/lib/index.js:
@stdlib/stats-base-dists-degenerate-quantile/lib/main.js:
@stdlib/stats-base-dists-degenerate-quantile/lib/factory.js:
@stdlib/stats-base-dists-degenerate-quantile/lib/index.js:
@stdlib/stats-base-dists-normal-quantile/lib/factory.js:
@stdlib/stats-base-dists-normal-quantile/lib/index.js:
  (**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *)

@stdlib/constants-float64-high-word-sign-mask/lib/index.js:
@stdlib/constants-float64-high-word-abs-mask/lib/index.js:
@stdlib/string-base-format-interpolate/lib/is_number.js:
@stdlib/string-base-format-interpolate/lib/zero_pad.js:
@stdlib/string-base-format-interpolate/lib/format_integer.js:
@stdlib/string-base-format-interpolate/lib/is_string.js:
@stdlib/string-base-format-interpolate/lib/format_double.js:
@stdlib/string-base-format-interpolate/lib/space_pad.js:
@stdlib/string-base-format-interpolate/lib/main.js:
@stdlib/string-base-format-interpolate/lib/index.js:
@stdlib/string-base-format-tokenize/lib/main.js:
@stdlib/string-base-format-tokenize/lib/index.js:
@stdlib/string-format/lib/is_string.js:
@stdlib/string-format/lib/main.js:
@stdlib/string-format/lib/index.js:
@stdlib/math-base-special-exp/lib/polyval_p.js:
@stdlib/math-base-special-erf/lib/polyval_pp.js:
@stdlib/math-base-special-erf/lib/polyval_qq.js:
@stdlib/math-base-special-erf/lib/polyval_pa.js:
@stdlib/math-base-special-erf/lib/polyval_qa.js:
@stdlib/math-base-special-erf/lib/polyval_ra.js:
@stdlib/math-base-special-erf/lib/polyval_sa.js:
@stdlib/math-base-special-erf/lib/polyval_rb.js:
@stdlib/math-base-special-erf/lib/polyval_sb.js:
@stdlib/math-base-special-ln/lib/polyval_p.js:
@stdlib/math-base-special-ln/lib/polyval_q.js:
@stdlib/math-base-special-erfinv/lib/rational_p1q1.js:
@stdlib/math-base-special-erfinv/lib/rational_p2q2.js:
@stdlib/math-base-special-erfinv/lib/rational_p3q3.js:
@stdlib/math-base-special-erfinv/lib/rational_p4q4.js:
@stdlib/math-base-special-erfinv/lib/rational_p5q5.js:
  (**
  * @license Apache-2.0
  *
  * Copyright (c) 2022 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *)

@stdlib/utils-define-property/lib/define_property.js:
@stdlib/utils-define-property/lib/has_define_property_support.js:
@stdlib/math-base-special-abs/lib/main.js:
  (**
  * @license Apache-2.0
  *
  * Copyright (c) 2021 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *)

@stdlib/math-base-special-exp/lib/expmulti.js:
@stdlib/math-base-special-exp/lib/main.js:
  (**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  *
  * ## Notice
  *
  * The following copyrights, licenses, and long comment were part of the original implementation available as part of [Go]{@link https://github.com/golang/go/blob/cb07765045aed5104a3df31507564ac99e6ddce8/src/math/exp.go}, which in turn was based on an implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_exp.c}. The implementation follows the original, but has been modified for JavaScript.
  *
  * ```text
  * Copyright (c) 2009 The Go Authors. All rights reserved.
  *
  * Redistribution and use in source and binary forms, with or without
  * modification, are permitted provided that the following conditions are
  * met:
  *
  *    * Redistributions of source code must retain the above copyright
  * notice, this list of conditions and the following disclaimer.
  *    * Redistributions in binary form must reproduce the above
  * copyright notice, this list of conditions and the following disclaimer
  * in the documentation and/or other materials provided with the
  * distribution.
  *    * Neither the name of Google Inc. nor the names of its
  * contributors may be used to endorse or promote products derived from
  * this software without specific prior written permission.
  *
  * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
  * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
  * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
  * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
  * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
  * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
  * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
  * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
  * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  * ```
  *
  * ```text
  * Copyright (C) 2004 by Sun Microsystems, Inc. All rights reserved.
  *
  * Developed at SunPro, a Sun Microsystems, Inc. business.
  * Permission to use, copy, modify, and distribute this
  * software is freely granted, provided that this notice
  * is preserved.
  * ```
  *)

@stdlib/math-base-special-erf/lib/main.js:
  (**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  *
  * ## Notice
  *
  * The following copyright, license, and long comment were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/s_erf.c}. The implementation follows the original, but has been modified for JavaScript.
  *
  * ```text
  * Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
  *
  * Developed at SunPro, a Sun Microsystems, Inc. business.
  * Permission to use, copy, modify, and distribute this
  * software is freely granted, provided that this notice
  * is preserved.
  * ```
  *)

@stdlib/math-base-special-ln/lib/main.js:
  (**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  *
  * ## Notice
  *
  * The following copyright and license were part of the original implementation available as part of [FreeBSD]{@link https://svnweb.freebsd.org/base/release/9.3.0/lib/msun/src/e_log.c}. The implementation follows the original, but has been modified for JavaScript.
  *
  * ```text
  * Copyright (C) 1993 by Sun Microsystems, Inc. All rights reserved.
  *
  * Developed at SunPro, a Sun Microsystems, Inc. business.
  * Permission to use, copy, modify, and distribute this
  * software is freely granted, provided that this notice
  * is preserved.
  * ```
  *)

@stdlib/math-base-special-erfinv/lib/main.js:
  (**
  * @license Apache-2.0
  *
  * Copyright (c) 2018 The Stdlib Authors.
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *    http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  *
  * ## Notice
  *
  * The original C++ code and copyright notice are from the [Boost library]{@link http://www.boost.org/doc/libs/1_48_0/boost/math/special_functions/detail/erf_inv.hpp}. This implementation follows the original, but has been modified for JavaScript.
  *
  * ```text
  * (C) Copyright John Maddock 2006.
  *
  * Use, modification and distribution are subject to the
  * Boost Software License, Version 1.0. (See accompanying file
  * LICENSE or copy at http://www.boost.org/LICENSE_1_0.txt)
  * ```
  *)
*/
