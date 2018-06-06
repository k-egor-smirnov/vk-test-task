import {
  createElement,
  getCookie,
  debounce,
  request,
  translit,
  getQueryVariable,
  getPersonElement,
  getMutualDecl
} from "./helpers";

let people = [];
let rendered = [];
let offset = 0;
let searchString = "";
search = debounce(search, 100);
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

  const toRender = [];

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
      toRender.push(friend);
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
        toRender.push(data[i]);
      }

      sessionStorage.setItem(
        "search" + searchString + newOffset,
        JSON.stringify(data)
      );

      offset = newOffset;
      clearFriends(toRender);
    } else {
      document
        .getElementsByClassName("error--notfound")[0]
        .setAttribute("style", "display: block");
    }
  } else {
    savedResults = JSON.parse(savedResults);

    if (savedResults.length > 0) {
      newOffset === 0 && clearFriends();

      for (let i = 0; i < savedResults.length; i++) {
        toRender.push(savedResults[i]);
      }

      offset = newOffset;
      clearFriends(toRender);
    }
  }
}

function addPerson(person, el) {
  if (people.indexOf(person.id) === -1) people.push(person);

  if (rendered.indexOf(person.id) > -1) {
    return;
  } else {
    rendered.push(person.id);

    const defaultEl = document.getElementsByClassName("friends")[0];
    const personEl = getPersonElement(person);

    if (el) {
      el.appendChild(personEl);
    } else {
      defaultEl.appendChild(personEl);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!getCookie("access_token")) {
    sessionStorage.clear();
    document.getElementsByClassName("auth")[0].style.display = "block";

    return;
  }

  const searchEl = document.getElementsByClassName("search__input")[0];

  searchEl.addEventListener("input", function(e) {
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

function clearFriends(ignore = []) {
  document
    .getElementsByClassName("error--notfound")[0]
    .setAttribute("style", "display: none");

  const friendsEl = document.getElementsByClassName("friends")[0];

  const newFriendsEl = createElement("div", "friends");

  rendered = [];

  ignore.forEach(person => {
    addPerson(person, newFriendsEl);
  });

  friendsEl.innerHTML = newFriendsEl.innerHTML;
}

function handleScroll() {
  let scroll;

  if (document.documentElement.scrollTop) {
    scroll = document.documentElement.scrollTop;
  } else {
    scroll = document.body.scrollTop;
  }

  if (
    scroll + 400 + document.documentElement.clientHeight >= // 400 – offset for user-friendly load
    document.body.offsetHeight
  ) {
    if (searchString) {
      search(offset + 20);
    } else {
      loadFriends(offset + 20);
    }
  }
}
