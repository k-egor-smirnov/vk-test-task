import {
  createElement,
  getCookie,
  debounce,
  request,
  translit,
  getQueryVariable,
  getPersonElement,
  getDecl,
  searchPerson
} from "./helpers";

import { indexFriends, search } from "./search";

let people = [];
let rendered = [];
let offset = 0;
let searchString = "";
let noMore = false;
let fetching = false;

// search = debounce(search, 1000 / 3); // 3 api request per second for user
// handleScroll = debounce(handleScroll, 1000 / 3);
// const friends = [];

async function loadFriends(newOffset) {
  if (newOffset === 0) clearFriends();

  let savedResults = sessionStorage.getItem("allFriends" + newOffset);

  if (!savedResults) {
    const data = await request("get.php?offset=" + newOffset);
    const response = JSON.parse(data.response);

    if (response.length > 0) {
      indexFriends(response);

      for (let i = 0; i < response.length; i++) {
        addPerson(response[i]);
      }

      sessionStorage.setItem(
        "allFriends" + newOffset,
        JSON.stringify(response)
      );

      fetching = false;
      offset = newOffset;
    } else {
      noMore = true;
    }
  } else {
    savedResults = JSON.parse(savedResults);

    if (savedResults.length > 0) {
      indexFriends(savedResults);

      for (let i = 0; i < savedResults.length; i++) {
        addPerson(savedResults[i]);
      }

      fetching = false;
      offset = newOffset;
    }
  }
}

// async function search(newOffset) {
//   let savedResults = sessionStorage.getItem(
//     "search" + searchString + newOffset
//   );

//   const toRender = [];

//   people.forEach(friend => {
//     if (searchPerson(friend, searchString)) {
//       toRender.push(friend);
//     }
//   });

//   clearFriends(toRender);

//   // if (!savedResults) {
//   //   const { responseURL, response } = await request(
//   //     "get.php?offset=" + newOffset + "&q=" + searchString
//   //   );

//   //   if (searchString !== getQueryVariable(responseURL, "q")) return;

//   //   const data = JSON.parse(response);

//   //   if (data.length > 0) {
//   //     newOffset === 0 && clearFriends();

//   //     for (let i = 0; i < data.length; i++) {
//   //       toRender.push(data[i]);
//   //     }

//   //     sessionStorage.setItem(
//   //       "search" + searchString + newOffset,
//   //       JSON.stringify(data)
//   //     );

//   //     offset = newOffset;
//   //     fetching = false;

//   //     clearFriends(toRender);
//   //   } else {
//   //     if (rendered.length === 0) {
//   //       clearFriends();

//   //       document
//   //         .getElementsByClassName("error--notfound")[0]
//   //         .setAttribute("style", "display: block");
//   //     } else {
//   //       noMore = true;
//   //     }
//   //   }
//   // } else {
//   //   savedResults = JSON.parse(savedResults);

//   //   if (savedResults.length > 0) {
//   //     newOffset === 0 && clearFriends();

//   //     for (let i = 0; i < savedResults.length; i++) {
//   //       toRender.push(savedResults[i]);
//   //     }

//   //     offset = newOffset;
//   //     fetching = false;

//   //     clearFriends(toRender);
//   //   }
//   // }
// }

function addPerson(person, el) {
  const found = people.find(foundPerson => {
    return foundPerson.id === person.id;
  });

  if (found) return;

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
      const result = search(searchString, offset);

      clearFriends(result);
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
    fetching = true;

    if (searchString) {
      search(offset + 20);
    } else {
      loadFriends(offset + 20);
    }
  }
}
