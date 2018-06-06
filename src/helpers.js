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

// Only for new people loading
function request(url, cb) {
  document
    .getElementsByClassName("indicator--loading")[0]
    .setAttribute("style", "display: block");

  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.send();

  return new Promise((resolve, reject) => {
    xhr.onreadystatechange = function() {
      if (xhr.readyState != 4) return;

      document
        .getElementsByClassName("indicator--loading")[0]
        .setAttribute("style", "display: none");

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

function translit(str) {
  const replacer = {
    q: "й",
    w: "ц",
    e: "у",
    r: "к",
    t: "е",
    y: "н",
    u: "г",
    i: "ш",
    o: "щ",
    p: "з",
    "[": "х",
    "]": "ъ",
    a: "ф",
    s: "ы",
    d: "в",
    f: "а",
    g: "п",
    h: "р",
    j: "о",
    k: "л",
    l: "д",
    ";": "ж",
    "'": "э",
    z: "я",
    x: "ч",
    c: "с",
    v: "м",
    b: "и",
    n: "т",
    m: "ь",
    ",": "б",
    ".": "ю",
    "/": "."
  };

  return str.replace(/[A-z/,.;\'\]\[]/g, function(x) {
    return x == x.toLowerCase()
      ? replacer[x]
      : replacer[x.toLowerCase()].toUpperCase();
  });
}

function getQueryVariable(url, variable) {
  const qs = url.split("?")[1];
  const vars = qs.split("&");
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=");
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
}
function getPersonElement(person) {
  const el = createElement("div", "person");

  const avatarEl = createElement("div", "avatar");

  const imgEl = createElement("img", "avatar__img", {
    src: person.photo_100
  });

  const informationEl = createElement("div", "person__information");

  const nameEl = createElement("span", "person__name", {
    innerText: person.first_name + " " + person.last_name
  });

  const additionalEl = createElement("span", "person__additional", {
    innerText: (() => {
      if (person.university_name) return person.university_name;
      if (person.mutual > 0) {
        return getDecl(person.mutual, {
          nominative: "общий друг",
          genitive: "общих друзей",
          accusative: "общих друга"
        });
      }

      return "";
    })()
  });

  avatarEl.appendChild(imgEl);

  person.online === 1 && avatarEl.classList.add("online");
  person.online === 2 && avatarEl.classList.add("online--mobile");

  el.appendChild(avatarEl);

  informationEl.appendChild(nameEl);
  informationEl.appendChild(additionalEl);

  el.appendChild(informationEl);

  return el;
}

function getDecl(num, forms) {
  const _num = num % 100;

  if (_num > 10 && _num < 20) {
    return `${num} ${forms.genitive}`;
  }

  if (_num % 10 > 1 && _num % 10 < 5) {
    return `${num} ${forms.accusative}`;
  }

  if (_num % 10 === 1) {
    return `${num} ${forms.nominative}`;
  }

  return `${num} ${forms.genitive}`;
}

export {
  createElement,
  getCookie,
  debounce,
  request,
  translit,
  getQueryVariable,
  getPersonElement,
  getMutualDecl
};
