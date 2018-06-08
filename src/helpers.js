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
  var arr = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ж: "g",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    ы: "i",
    э: "e",
    А: "A",
    Б: "B",
    В: "V",
    Г: "G",
    Д: "D",
    Е: "E",
    Ж: "G",
    З: "Z",
    И: "I",
    Й: "Y",
    К: "K",
    Л: "L",
    М: "M",
    Н: "N",
    О: "O",
    П: "P",
    Р: "R",
    С: "S",
    Т: "T",
    У: "U",
    Ф: "F",
    Ы: "I",
    Э: "E",
    ё: "yo",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ъ: "",
    ь: "",
    ю: "yu",
    я: "ya",
    Ё: "YO",
    Х: "H",
    Ц: "TS",
    Ч: "CH",
    Ш: "SH",
    Щ: "SHCH",
    Ъ: "",
    Ь: "",
    Ю: "YU",
    Я: "YA"
  };
  var replacer = function(a) {
    return arr[a] || a;
  };
  return str.replace(/[А-яёЁ]/g, replacer);
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

export {
  createElement,
  getCookie,
  debounce,
  request,
  translit,
  getQueryVariable,
  getPersonElement,
  getDecl,
  searchPerson
};
