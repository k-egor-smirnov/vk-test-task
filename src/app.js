import {
  createElement,
  getCookie,
  debounce,
  request,
  translit,
  getQueryVariable,
  getPersonElement,
  getDecl
} from "./helpers";

import { search, indexFriends } from "./search";

let rendered = [];
let offset = 0;
let searchString = "";
let noMore = false;
let fetching = false;
let friends = JSON.parse(sessionStorage.getItem("allFriends")) || [];
let searchResults = [];
let friendsEl;
// search = debounce(search, 1000 / 3); // 3 api request per second for user
// handleScroll = debounce(handleScroll, 1000 / 3);
// const friends = [];

async function loadFriends(newOffset) {
  if (newOffset === 0) {
    clearFriends();
  }

  toggleLoad(true);

  if (friends.length <= 0) {
    sessionStorage.setItem("allFriends", "[]");
  }

  if (friends.length - newOffset <= newOffset) {
    const data = await request("get.php?offset=" + newOffset);
    const response = JSON.parse(data.response);

    if (response.length <= 0) noMore = true;

    friends.push(...response);
    toggleLoad(false);

    for (let i = 0; i < friends.length; i++) {
      addPerson(friends[i]);
    }

    sessionStorage.setItem("allFriends", JSON.stringify(friends));
    indexFriends(friends);
    // toggleLoad(false);
    offset = newOffset;
  } else {
    const arr = friends.slice(newOffset, newOffset + 20);

    for (let i = 0; i < arr.length; i++) {
      if (arr[i]) {
        addPerson(arr[i]);
      }
    }

    // console.log(newOffset, arr[0]);
    toggleLoad(false);
    offset = newOffset;
  }
}

function addPerson(person, el) {
  if (rendered.indexOf(person.id) > -1) {
    return;
  } else {
    rendered.push(person.id);

    const personEl = getPersonElement(person);

    if (el) {
      el.appendChild(personEl);
    } else {
      friendsEl.appendChild(personEl);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!getCookie("access_token")) {
    sessionStorage.clear();
    document.getElementsByClassName("auth")[0].style.display = "block";

    return;
  }

  indexFriends(friends);

  const searchEl = document.getElementsByClassName("search__input")[0];
  friendsEl = document.getElementsByClassName("friends")[0];

  searchEl.addEventListener("input", function(e) {
    offset = 0;
    searchString = e.srcElement.value.toLowerCase().trim();

    if (searchString) {
      toggleLoad(true);
      searchResults = search(searchString);
      toggleLoad(false);

      clearFriends(searchResults.slice(0, 20));
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

  noMore = false;
  rendered = [];

  if (!ignore) {
    friendsEl.innerHTML = "";
  } else {
    const newFriendsEl = createElement("div", "friends");

    ignore.forEach(person => {
      addPerson(person, newFriendsEl);
    });

    friendsEl.innerHTML = newFriendsEl.innerHTML;
    newFriendsEl.innerHTML = "";
  }
}

function toggleLoad(status) {
  fetching = status;

  document
    .getElementsByClassName("indicator--loading")[0]
    .setAttribute("style", `display: ${status} ? 'block' : 'none'`);
}

async function handleScroll() {
  let scroll;

  if (document.documentElement.scrollTop) {
    scroll = document.documentElement.scrollTop;
  } else {
    scroll = document.body.scrollTop;
  }

  if (noMore || fetching) return;

  if (
    scroll + 400 + document.documentElement.clientHeight >= // 400 – offset for user-friendly load
    document.body.offsetHeight
  ) {
    if (searchString) {
      toggleLoad(true);
      let searchArr = searchResults.slice(offset + 20, offset + 40);

      for (let i = 0; i < searchArr.length; i++) {
        if (searchArr[i]) {
          addPerson(searchArr[i]);
        }
      }
    } else {
      loadFriends(offset + 20);
    }
  }
}
