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
  const cyrilic = {
    А: "A",
    а: "a",
    Б: "B",
    б: "b",
    В: "V",
    в: "v",
    Г: "G",
    г: "g",
    Д: "D",
    д: "d",
    Е: "E",
    е: "e",
    Ё: "Yo",
    ё: "yo",
    Ж: "Zh",
    ж: "zh",
    З: "Z",
    з: "z",
    И: "I",
    и: "i",
    Й: "Y",
    й: "y",
    К: "K",
    к: "k",
    Л: "L",
    л: "l",
    М: "M",
    м: "m",
    Н: "N",
    н: "n",
    О: "O",
    о: "o",
    П: "P",
    п: "p",
    Р: "R",
    р: "r",
    С: "S",
    с: "s",
    Т: "T",
    т: "t",
    У: "U",
    у: "u",
    Ф: "F",
    ф: "f",
    Х: "Kh",
    х: "kh",
    Ц: "Ts",
    ц: "ts",
    Ч: "Ch",
    ч: "ch",
    Ш: "Sh",
    ш: "sh",
    Щ: "Sch",
    щ: "sch",
    Ъ: '"',
    ъ: '"',
    Ы: "Y",
    ы: "y",
    Ь: "'",
    ь: "'",
    Э: "E",
    э: "e",
    Ю: "Yu",
    ю: "yu",
    Я: "Ya",
    я: "ya"
  };

  return str.replace(/[А-я]/g, function(a, b) {
    return cyrilic[a] || "";
  });
}

function getQueryVariable(url, variable) {
  if (!url) return;

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

function searchPerson(person, searchString) {
  if (
    person.first_name.toLowerCase().startsWith(searchString) ||
    person.last_name.toLowerCase().startsWith(searchString) ||
    `${person.first_name} ${person.last_name}`
      .toLowerCase()
      .startsWith(searchString) ||
    person.first_name.toLowerCase().startsWith(translit(searchString)) ||
    person.last_name.toLowerCase().startsWith(translit(searchString)) ||
    `${person.first_name} ${person.last_name}`
      .toLowerCase()
      .startsWith(translit(searchString))
  ) {
    return true;
  }

  return false;
}

function intersection() {
  const result = [];
  let lists;

  if (arguments.length === 1) {
    return arguments[0];
  } else {
    lists = Array.prototype.slice.call(arguments);
  }

  for (let i = 0; i < lists.length; i++) {
    let currentList = Object.keys(lists[i]);
    for (let y = 0; y < currentList.length; y++) {
      let currentValue = currentList[y];
      if (result.indexOf(currentValue) === -1) {
        if (
          lists.filter(function(obj) {
            return Object.keys(obj).indexOf(currentValue) == -1;
          }).length == 0
        ) {
          result.push(currentValue);
        }
      }
    }
  }

  return result.map(id => {
    return lists[0][id];
  });
}

export {
  createElement,
  getCookie,
  debounce,
  request,
  translit,
  getQueryVariable,
  getPersonElement,
  getDecl,
  searchPerson,
  intersection
};
