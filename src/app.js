import {
  createElement,
  getCookie,
  debounce,
  request,
  translit
} from "./helpers";

let rendered = [];
let offset = 0;
let searchString = "";
// const friends = [];

async function loadFriends(newOffset) {
  let savedResults = sessionStorage.getItem("allFriends" + newOffset);

  if (!savedResults) {
    console.log("load friends from api");

    const data = await request("get.php?offset=" + newOffset);
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

  let i = 0;
  while (true) {
    let friends = JSON.parse(sessionStorage.getItem("allFriends" + i));
    if (!friends) break;

    friends.forEach(friend => {
      const name = `${friend.first_name} ${friend.first_name}`;

      if (new RegExp(searchString).test(name.toLowerCase())) addPerson(friend);
    });

    i += 20;
  }

  if (!savedResults) {
    console.log("seacrh friends from api with query " + searchString);

    const { responseURL, response } = await request(
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

function addPerson(person) {
  if (rendered.includes[person.id]) return;
  rendered.push(person.id);

  const friendsEl = document.getElementsByClassName("friends")[0];
  const personEl = getPersonElement(person);

  friendsEl.appendChild(personEl);
}

function clearFriends() {
  const friendsEl = document.getElementsByClassName("friends")[0];
  friendsEl.innerHTML = "";
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
      if (person.mutual > 0) return person.mutual + " общих друзей";

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

document.addEventListener("DOMContentLoaded", () => {
  if (!getCookie("access_token")) {
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
});

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