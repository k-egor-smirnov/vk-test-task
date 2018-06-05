import {
  createElement,
  getCookie,
  debounce,
  request,
  translit,
  getQueryVariable
} from "./helpers";

let people = [];
let rendered = [];
let offset = 0;
let searchString = "";
// const friends = [];

async function loadFriends(newOffset) {
  let savedResults = sessionStorage.getItem("allFriends" + newOffset);

  if (!savedResults) {
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
      offset = newOffset;
    }
  } else {
    savedResults = JSON.parse(savedResults);

    if (savedResults.length > 0) {
      for (let i = 0; i < savedResults.length; i++) {
        addPerson(savedResults[i]);
      }

      offset = newOffset;
    }
  }
}

async function search(newOffset) {
  let savedResults = sessionStorage.getItem(
    "search" + searchString + newOffset
  );

  people.forEach(friend => {
    if (
      friend.first_name.toLowerCase().startsWith(searchString) ||
      friend.last_name.toLowerCase().startsWith(searchString) ||
      `${friend.first_name} ${friend.last_name}`
        .toLowerCase()
        .startsWith(searchString) ||
      friend.first_name.toLowerCase().startsWith(translit(searchString)) ||
      friend.last_name.toLowerCase().startsWith(translit(searchString)) ||
      `${friend.first_name} ${friend.last_name}`
        .toLowerCase()
        .startsWith(translit(searchString))
    ) {
      addPerson(friend);
    }
  });

  if (!savedResults) {
    const { responseURL, response } = await request(
      "get.php?offset=" + newOffset + "&q=" + searchString
    );

    if (searchString !== getQueryVariable(responseURL, "q")) return;

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

      offset = newOffset;
    }
  } else {
    savedResults = JSON.parse(savedResults);

    if (savedResults.length > 0) {
      newOffset === 0 && clearFriends();

      for (let i = 0; i < savedResults.length; i++) {
        addPerson(savedResults[i]);
      }

      offset = newOffset;
    }
  }
}

function addPerson(person) {
  if (people.indexOf(person.id) === -1) people.push(person);

  if (rendered.indexOf(person.id) > -1) {
    return;
  } else {
    rendered.push(person.id);

    const friendsEl = document.getElementsByClassName("friends")[0];
    const personEl = getPersonElement(person);

    friendsEl.appendChild(personEl);
  }
}

function clearFriends() {
  const friendsEl = document.getElementsByClassName("friends")[0];
  friendsEl.innerHTML = "";
  rendered = [];
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
    searchString = e.srcElement.value.toLowerCase().trim();

    if (searchString) {
      search(offset);
    } else {
      loadFriends(offset);
    }
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
