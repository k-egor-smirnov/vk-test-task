import { request, debounce, translit } from "./helpers";

const index = {};

function localSearch() {}

function apiSearch() {}

function indexFriends(list) {
  list.forEach(person => {
    createIndex(person.first_name, person);
    createIndex(person.last_name, person);
  });

  console.log("new index", index);
}

function createIndex(str, obj) {
  str = translit(str).toLowerCase();
  let curNode;

  if (!index[str[0]]) {
    index[str[0]] = {};
  }

  curNode = index[str[0]];

  for (let i = 1; i <= str.length; i++) {
    if (!curNode[str[i]]) {
      if (str[i]) curNode[str[i]] = {};
    }

    if (i === str.length) {
      if (!curNode.items) {
        curNode.items = [];
        curNode.items.push(obj);
      }
    } else {
      curNode = curNode[str[i]];
    }
  }

  return index;
}

function getChildren(index) {
  const children = [];

  (function get(node) {
    Object.keys(node).forEach(key => {
      if (key === "items") {
        node[key].forEach(person => {
          children.push(person);
        });
      } else {
        get(node[key]);
      }
    });
  })(index);

  return children;
}

function search(str) {
  let result = [];
  str = translit(str).toLowerCase();

  (function find(node, str, i) {
    // console.log(node);
    if (!node) return;

    // console.log(getChildren(node));
    result = [];
    Object.keys(node).forEach(key => {
      result = getChildren(node);
      find(node[str[i + 1]], str, i + 1);
    });
  })(index, str, -1);

  return result;
}

export { indexFriends, search };
