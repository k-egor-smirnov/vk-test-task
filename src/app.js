import {
  createElement,
  getCookie,
  throttle,
  debounce,
  request,
  translit,
  getQueryVariable,
  getPersonElement,
  getDecl
} from "./helpers";

import {
  localSearch,
  serverSearch,
  indexFriends,
  localSearchResults
} from "./search";

const search = debounce(serverSearch, 650);
const loadSearchResults = debounce(serverSearch, 1200);

let rendered = [];
let offset = 0;
let searchString = "";
let noMore = false;
let fetching = false;
let friends = JSON.parse(sessionStorage.getItem("allFriends")) || [];
let friendsEl;
let total;

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

    if (response.items.length <= 0) noMore = true;

    friends.push(...response.items);
    toggleLoad(false);

    for (const person of friends) {
      addPerson(person);
    }

    sessionStorage.setItem("allFriends", JSON.stringify(friends));
    indexFriends(friends);
    // toggleLoad(false);
    offset = newOffset;
  } else {
    const arr = friends.slice(newOffset, newOffset + 20);

    for (const person of arr) {
      addPerson(person);
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

    const personEl = getPersonElement(person, searchString);

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

  searchEl.addEventListener("input", async function(e) {
    window.scrollTo(0, 0);
    offset = 0;
    searchString = e.srcElement.value.toLowerCase().trim();

    if (searchString) {
      const data = localSearch(searchString, 0).slice(0, 20);

      clearFriends(data);

      const throttled = await search(searchString, rendered.length, res => {
        const parsedResponse = JSON.parse(res.response);

        total = parsedResponse.count;

        if (rendered.length === 0 && (!parsedResponse.count || total <= 0)) {
          toggleLoad(false);

          return document
            .getElementsByClassName("error--notfound")[0]
            .setAttribute("style", "display: block");
        }

        toggleLoad(false);
        if (!res) return;

        if (
          translit(getQueryVariable(res.responseURL, "q")) ===
          localSearchResults.q
        ) {
          if (parsedResponse.items && parsedResponse.items.length > 0) {
            for (const person of parsedResponse.items) {
              addPerson(person);
            }
          }

          if (rendered.length === total) noMore = true;
        }
      });

      if (throttled) return toggleLoad(false);
    } else {
      offset = 0;

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
    scroll + 600 + document.documentElement.clientHeight >= // 600 – offset for user-friendly load
    document.body.offsetHeight
  ) {
    if (searchString) {
      toggleLoad(true);

      loadSearchResults(searchString, rendered.length, res => {
        toggleLoad(false);
        if (!res) return;
        const parsedResponse = JSON.parse(res.response);

        const people = parsedResponse.items;

        if (!people) return;

        if (people.length > 0) {
          for (const person of people) {
            addPerson(person);
          }
        }

        if (rendered.length === total) noMore = true;

        offset += res.response.length;
      });
    } else {
      loadFriends(offset + 20);
    }
  }
}
