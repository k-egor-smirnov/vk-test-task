import { request, debounce, translit, intersection } from "./helpers";

const index = {};

function indexFriends(list) {
  list.forEach(person => {
    createIndex(person.first_name, person);
    createIndex(person.last_name, person);
  });
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
      }

      curNode.items.push(obj);
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
  let results = [];
  str = translit(str).toLowerCase();

  str.split(" ").forEach((name, i) => {
    let curNode = index[name[0]];

    for (let j = 1; j < name.length; j++) {
      if (!curNode) {
        results[i] = [];

        return;
      }

      curNode = curNode[name[j]];
    }

    results[i] = curNode ? getChildren(curNode) : [];
  });

  if (results.length > 1) {
    const arrays = results.map(arr =>
      arr.reduce((acc, value) => {
        acc[value.id] = value;
        return acc;
      }, {})
    );

    return intersection(...arrays);
  } else {
    return results[0];
  }
}

export { indexFriends, search };
