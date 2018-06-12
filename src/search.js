import {
  request,
  debounce,
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

function localSearch(str) {
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

// async function search(q, offset, useServer = true) {
//   let results = localSearchResults.items.slice(offset, offset + 20);

//   if (q === localSearchResults.q) {
//     if (results.length < 20) {
//       const data = await serverSearch(q, results.length + offset);
//       results.push(...JSON.parse(data.response));
//     }
//   } else {
//     localSearchResults.items = localSearch(q);
//     localSearchResults.q = q;

//     results.push(...localSearchResults.items.slice(offset, offset + 20));
//   }

//   if (q === localSearchResults.q || !localSearchResults.q) {
//     return results;
//   }
// }

export { indexFriends, localSearch, serverSearch, search, localSearchResults };
