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

export { createElement, getCookie, debounce, request };
