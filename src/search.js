import {
  request,
  debounce,
  changeKeyboardLayout,
  translit,
  intersection,
  toggleLoad
} from "./helpers";

const index = {};
let localSearchResults = { q: false, items: [] };

function indexFriends(list) {
  list.forEach((person, order) => {
    createIndex(order, person.first_name, person);
    createIndex(order, person.last_name, person);
  });
}

function createIndex(order, str, obj) {
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

      curNode.items.push({ ...obj, order });
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

function localSearch(originalStr) {
  let results = [];

  const str = translit(originalStr).toLowerCase();
  const str2 = changeKeyboardLayout(originalStr);
  const str3 = translit(changeKeyboardLayout(originalStr, false));

  find(str);
  find(str2);
  find(str3);

  function find(str) {
    str.split(" ").forEach((name, i) => {
      let curNode = index[name[0]];

      for (let j = 1; j < name.length; j++) {
        if (!curNode) {
          !results[i] && (results[i] = []);
        } else {
          curNode = curNode[name[j]];
        }
      }

      if (!results[i]) results[i] = [];

      results[i].push(...(curNode ? getChildren(curNode) : []));
    });
  }

  if (results.length > 1) {
    const arrays = results.map(arr =>
      arr.reduce((acc, value) => {
        acc[value.id] = value;
        return acc;
      }, {})
    );

    const result = intersection(...arrays);

    localSearchResults.q = str;
    localSearchResults.items = sort(result);

    return result;
  } else {
    localSearchResults.q = str;
    localSearchResults.items = sort(results[0]);

    return localSearchResults.items;
  }

  function sort(arr) {
    return arr.sort((a, b) => {
      if (a.order < b.order) return -1;
      if (a.order > b.order) return 1;

      return 0;
    });
  }
}

async function serverSearch(q, offset, cb) {
  const response = await request(`get.php?offset=${offset}&q=${q}`);

  if (cb) return cb(response);

  return response;
}

export { indexFriends, localSearch, serverSearch, search, localSearchResults };
