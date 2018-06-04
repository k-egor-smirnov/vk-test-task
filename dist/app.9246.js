/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/app.js":
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./src/helpers.js");


let offset = 0;
let searchString = "";
// const friends = [];

async function loadFriends(newOffset) {
  let savedResults = sessionStorage.getItem("allFriends" + newOffset);

  if (!savedResults) {
    console.log("load friends from api");

    const data = await Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["request"])("get.php?offset=" + newOffset);
    const response = JSON.parse(data.response);

    if (response.length > 0) {
      for (let i = 0; i < response.length; i++) {
        addPerson(response[i]);
      }

      sessionStorage.setItem(
        "allFriends" + newOffset,
        JSON.stringify(response)
      );
      offset += newOffset;
    }
  } else {
    console.log("load friends from storage");
    savedResults = JSON.parse(savedResults);

    if (savedResults.length > 0) {
      for (let i = 0; i < savedResults.length; i++) {
        addPerson(savedResults[i]);
      }

      offset += newOffset;
    }
  }
}

async function search(newOffset) {
  let savedResults = sessionStorage.getItem(
    "search" + searchString + newOffset
  );

  if (!savedResults) {
    console.log("seacrh friends from api with query " + searchString);

    //TODO: Проверить, что строка поиска и переданный поиск в xhr совпадают
    const { responseURL, response } = await Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["request"])(
      "get.php?offset=" + newOffset + "&q=" + searchString
    );

    const data = JSON.parse(response);

    if (data.length > 0) {
      newOffset === 0 && clearFriends();

      for (let i = 0; i < data.length; i++) {
        addPerson(data[i]);
      }

      sessionStorage.setItem(
        "search" + searchString + newOffset,
        JSON.stringify(data)
      );

      offset += newOffset;
    }
  } else {
    console.log("seacrh friends from storage with query " + searchString);
    savedResults = JSON.parse(savedResults);

    if (savedResults.length > 0) {
      newOffset === 0 && clearFriends();
      clearFriends();

      for (let i = 0; i < savedResults.length; i++) {
        addPerson(savedResults[i]);
      }

      offset += newOffset;
    }
  }
}

function handleScroll() {
  let scroll;

  if (document.documentElement.scrollTop) {
    scroll = document.documentElement.scrollTop;
  } else {
    scroll = document.body.scrollTop;
  }

  if (
    scroll + document.documentElement.clientHeight >=
    document.body.offsetHeight
  ) {
    if (searchString) {
      search(offset + 20);
    } else {
      loadFriends(offset + 20);
    }
  }
}

function addPerson(person) {
  const friendsEl = document.getElementsByClassName("friends")[0];
  const personEl = getPersonElement(person);

  friendsEl.appendChild(personEl);
}

function getPersonElement(person) {
  const el = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["createElement"])("div", "person");

  const avatarEl = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["createElement"])("img", "person__avatar", {
    src: person.photo_100
  });

  const informationEl = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["createElement"])("div", "person__information");

  const nameEl = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["createElement"])("span", "person__name", {
    innerText: person.first_name + " " + person.last_name
  });

  const additionalEl = Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["createElement"])("span", "person__additional", {
    innerText: (() => {
      if (person.university_name) return person.university_name;
      if (person.mutual > 0) return person.mutual + " общих друзей";

      return "";
    })()
  });

  el.appendChild(avatarEl);

  informationEl.appendChild(nameEl);
  informationEl.appendChild(additionalEl);

  el.appendChild(informationEl);

  return el;
}

function onReady() {
  if (!Object(_helpers__WEBPACK_IMPORTED_MODULE_0__["getCookie"])("access_token")) {
    sessionStorage.clear();
    document.getElementsByClassName("auth")[0].style.display = "block";
  }

  const searchEl = document.getElementsByClassName("search__input")[0];

  searchEl.addEventListener("input", function(e) {
    clearFriends();
    offset = 0;
    searchString = e.srcElement.value;

    if (searchString) {
      search(offset);
    } else {
      loadFriends(offset);
    }

    //Если пустая строка, достать из кэша первый результат, стоит сохранить в SessionStorage
  });

  document.addEventListener("scroll", handleScroll);

  loadFriends(offset);
}

function clearFriends() {
  const friendsEl = document.getElementsByClassName("friends")[0];
  friendsEl.innerHTML = "";
}

document.addEventListener("DOMContentLoaded", onReady);


/***/ }),

/***/ "./src/helpers.js":
/*!************************!*\
  !*** ./src/helpers.js ***!
  \************************/
/*! exports provided: createElement, getCookie, debounce, request */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createElement", function() { return createElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCookie", function() { return getCookie; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "debounce", function() { return debounce; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "request", function() { return request; });
function createElement(tag, className, options) {
  const el = document.createElement(tag);
  el.className = className;

  options &&
    Object.keys(options).forEach(key => {
      el[key] = options[key];
    });

  return el;
}

function getCookie(name) {
  var matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function request(url, cb) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.send();

  return new Promise((resolve, reject) => {
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;

      resolve(xhr);
    };
  });
}

function debounce(f, ms) {
  let timer = null;

  return function(...args) {
    const onComplete = () => {
      f.apply(this, args);
      timer = null;
    };

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(onComplete, ms);
  };
}




/***/ }),

/***/ "./src/index.html":
/*!************************!*\
  !*** ./src/index.html ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n<html lang=\"en\">\n\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\n  <link rel=\"stylesheet\" href=\"src/style.css\">\n  <title>VK Friends</title>\n</head>\n\n<body>\n  <header class=\"header\">\n    <div class=\"header__content\">\n      <div class=\"search\">\n        <input type=\"text\" class=\"search__input\" placeholder=\"Поиск\">\n      </div>\n    </div>\n  </header>\n  <div class=\"content\">\n    <div class=\"auth\" style=\"display: none;\">\n      <a href=\"/login.php\" class=\"auth__button\">Войти через ВКонтакте</a>\n    </div>\n    <div class=\"friends\">\n    </div>\n  </div>\n</body>\n\n</html>";

/***/ }),

/***/ 0:
/*!*******************************************!*\
  !*** multi ./src/index.html ./src/app.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! /Users/egor/php/src/index.html */"./src/index.html");
module.exports = __webpack_require__(/*! /Users/egor/php/src/app.js */"./src/app.js");


/***/ })

/******/ });
//# sourceMappingURL=app.9246.js.map