# Introduction

Graphomic = graph + atomic, simple and fast graph library for node.js.
Library allows to store mixed graphs (with directed or undirected edges, or both), graphs cannot have multiple edges between pairs of the same nodes.

# Currently implemented features

- Interchangeable storage system (memory, mongodb - work in progress).
- Easy way of implementing new storage systems.
- Flexible and simple API
- Provides only minimal and necessary set of methods, allowing for easy implementation of own application-specific functions.
- Nodes can hold data.
- Implemented in asynchronous way, so even big graph won't block application.
- Minimal dependencies.
- Unittested - work in progress.

# Planned for the future

- Improve edges so they can hold data.
- Optional constrain for the graph, forcing graph to by only (un)directed.
- Mongo and Redis store.
- Client-side build of the library using browserify (with `MemoryStore` only).
- Better documentation.

# Design decisions

* Every graph object must contain configured storage system

```js
    // ...
    var s = new MemoryStore(); 
    // connection options for the given store, MemoryStore doesn't need any options so it can be null;
    var connOpts = null;
    // every store sytem must implement this method
    s.connect(connOpts, function (err) {
        if (err) return callback(err);
        // use this store for the new graph.
        var g = new Graph(s);    
    });
```
    
- Node object should be never created by application, only by classes implementing Storage itself.
- Every method on `Graph` and `Node` objects is asynchronous, except `Node#getData`.
- `Node#getData` is synchronous because when node is created, or fetched from the store, we already should have data in it. For example lets say that you have MySQL store that keeps every node as one row in the table, when you get node, this operation is asynchronous (ex. `Graph#findFirst`), but data for this node should be already present in the Node object, because it is in the same row, so there is no point for `Node#getData` to be asynchronous.
- `Graph` class contains only basic manipulation methods (add/remove/connect/disconnect) and basic query methods (find, neighbors, traverse* etc.). The idea is to keep this class reasonably small and flexible. Client application should implement specific functions (finding shortest path, or finding set of connected nodes meeting some data criteria etc.) using `Graph` methods.
- API is asynchronous but doesn't use any helper library (`async`, `when.js` etc.) it's writen using standard node.js callback functions. This way user can choose the most convinent, for him, way to use this library (raw callback, promises, async module). It's strongly recomended to use some kind of helper module (`async`, `when.js` etc.) when using this library, to avoid 'callback hell' if your application is not trivial. You can find example usage of `async` and `bluebird` modules in unittests.


# API Reference

- [Store] (#store)
    - [`new Store()`](#new-store)
    - [`.connect(options, callback)`](#store-connect)
    - [`.disconnect(callback)`](#store-disconnect)
    - [`.addNode(data, callback)`](#store-add-node)
    - [`.removeNode(id, callback)`](#store-remove-node)
    - [`.removeAllNodes(callback)`](#store-remove-all-nodes)
    - [`.node(id, callback)`](#store-node)
    - [`.nodes(callback)`](#store-nodes)
    - [`.setNodeData(id, data, callback)`](#store-set-node-data)
    - [`.getNodeData(id, callback)`](#store-get-node-data)
    - [`.updateNodeData(id, data, callback)`](#store-update-node-data)
    - [`.addEdge(id1, id2, callback)`](#store-add-edge)
    - [`.addDirEdge(id1, id2, callback)`](#store-add-dir-edge)
    - [`.removeEdge(id1, id2, callback)`](#store-remove-edge)
    - [`.removeAllEdges(callback)`](#store-remove-all-edges)
    - [`.find(comparator, callback)`](#store-find)
    - [`.findFirst(comparator, callback)`](#store-find-first)
    - [`.adjacent(id1, id2, callback)`](#store-adjacent)
    - [`.neighbors(node, excludeId, callback)`](#store-neigbors)
    
- [Node](#node) 
    - [`new Node()`](#new-node)
    - [`.id`](#node-id)
    - [`.setData(data, callback)`](#node-set-data)
    - [`.getData(callback)`](#node-get-data)
    - [`.neighbors(excludeId, callback)`](#node-neigbors)
    - [`.neighborsIds(callback)`](#node-neigbors-ids)
          
- [Graph](#graph)
    - [`new Graph(store)`](#new-graph)
    - [`.addNode(data, callback)`](#graph-add-node)
    - [`.removeNode(id, callback)`](#graph-remove-node)
    - [`.removeAllNodes(callback)`](#graph-remove-all-nodes)
    - [`.getNode(id, callback)`](#graph-get-node)
    - [`.setNodeData(id, data, callback)`](#graph-set-node-data)
    - [`.getNodeData(id, callback)`](#graph-get-node-data)
    - [`.addEdge(id1, id2, callback)`](#graph-add-edge)
    - [`.addDirEdge(id1, id2, callback)`](#graph-add-dir-edge)
    - [`.removeEdge(id1, id2, callback)`](#graph-remove-edge)
    - [`.removeAllEdges(callback)`](#graph-remove-all-edges)
    - [`.find(comparator, callback)`](#graph-find)
    - [`.findFirst(comparator, callback)`](#graph-find-first)
    - [`.adjacent(id1, id2, callback)`](#graph-adjacent)
    - [`.neighbors(node, excludeId,, callback)`](#graph-neighbors)
    - [`.traverse(start, _filter, _progress, _finish, isDFS, callback)`](#graph-traverse)
    - [`.traverseBFS(start, _filter, _progress, _finish, callback)`](#graph-traverse-bfs)
    - [`.traverseDFS(start, _filter, _progress, _finish, callback)`](#graph-traverse-dfs)
   
- [adjacency](#adjacency)
    - [`.undirected(graph, obj, callback)`](#adjacency-undirected)
    - [`.directed(graph, obj, callback)`](#adjacency-directed)
    - [`.toAdjacencyList(graph, callback)`](#to-adjacency-list)
    
    
## Callbacks

All asynchronous methods receive as last argument callback function. First argument of this function is always an error, if no error occured first argument is `null`. Second argument is result of the method, for example list of nodes.
   
## Store

Interface that must be implemented by storage class. Module includes one implementation:
- [`MemoryStore`](#memory-store)

##### `new Store()`

Construct new store.

##### `.connect(options, callback)`

Connect store to the backend (for example database) for MemoryStore do nothing (just call callback).

##### `.disconnect(options, callback)`

Disconnect store from the backend (for example database) for MemoryStore do nothing (just call callback).

##### `.addNode(data, callback)`

Add new node with data as first argument.

##### `.removeNode(id, callback)`

Remove node with given id.

##### `.removeAllNodes(callback)`

Remove all nodes from the store

##### `.node(id, callback)`

Get node with given id.

##### `.nodes(callback)`

Get all nodes of the graph.

##### `.getNodeData(id, callback)`

Return data for node with given id.

##### `.setNodeData(id, data, callback)`

Set node data.

##### `.updateNodeData(id, data, callback)`

Updates node data. Merges current data with data supplied in `data` argument.

##### `.find(comparator, callback)`

Find nodes for which comparator function returns `true`.
Comparator function receives as it's only argument instance of `Node` object.

##### `.findFirst(comparator, callback)`

Find first node for which comparator function returns `true`.
Comparator function receives as it's only argument instance of `Node` object.

##### `.addEdge(id1, id2, callback)`

Add undirected edge between two nodes with ids given as two first arguments.

##### `.addDirEdge(id1, id2, callback)`

Add directed edge between two nodes with ids given as two first arguments. The direction is from first node to second node.

##### `.removeEdge(id1, id2, callback)`

Remove edge between nodes with given ids.

##### `.removeAllEdges(callback)`

Remove all edges from the store.

##### `.adjacent(id1, id2, callback)`

Tells if nodes with given ids are connected by edge.

##### `.neighbors(node, excludeId, callback)`

Returns list of all neighbors for given node.
`excludeId` - node id which should be excluded in resulted list, if `null` doesn't exclude anything. Convenient when implementing some algorithms.

## Node

Class that should be used by `Store` objects for representing nodes of the graph. Implementation might be specific for given store. It shouldn't be constructed outside of `Store` class. It should expose only those methods/properties.

##### `.id`

Id of the node, should be read-only string.

##### `.setData(data, callback)`

Set data for the node.

##### `.getData() -> obj`

Get data associated with the node.

##### `.setData() -> obj`

Set data associated with the node.

## Graph

Graph class, it should be used to interact with graph dataset. Application code shouldn't use any `Store` objects directly. `Store` should be only created, connected add provided to the `Graph` object. All other operations on graph should be performed throught `Graph` object instance. `Graph` has the same methods as `Store` excluding `connect` and `disconnect`. The only diffrenece in common method is that where `Store` accepts node id, `Graph` methods accept node id or node object itself, the only exception is `Graph#node` method (which gets node with given id from the graph, so there is no point in calling it when we already have the node). `Graph` class introduces a few new methods:

##### `new Graph(Store)`

Constructor, the only argument is instance of `Store`. Remember that `Store` must be connected before using `Graph`.

##### `.traverse(start, filter, progress, finish, isDFS, callback)`

Traverse the graph.
- `start` function that finds first node, if return `true`  given `Node` is an first node. If this function returns `true` for more than one node in the graph, first node is taken and other are ignored (it uses `Store#findFirst`). It's application responsibility to have graph and start function which makes sense.
- `filter` function that can be used to exclude nodes from traversing process. It receives list of adjacent nodes for the current node. It must return list of nodes that won't be excluded in current step. Remember that this function must always returns list, if you want to exclude all nodes but one, return list with one node. The node found by `start` function won't be supplied to the `filter` function. If this argument is `null`, filtering process wont take a place, and all nodes will be traversed. Parameters received by this function:
  - `neighbors` - list of nodes to filter.
  - `depth` - current depth of traversing process.
  - `parentNode` - parent node for the `neighbors` nodes.
- `progress` helper function that can be used to gather result nodes, this function receives arguments:
  - `node` - current node.
  - `depth` - current depth of traversing process.
  - `parentNode` - parent node for the current `node`.
- `finish` function that tells if traverse should finish, if returns `true` current node will be the last and traverse process will end. If this function is `null` traverse will end when all nodes were visited. Parameters received by this function:
  - `node` - current node.
  - `depth` - current depth of traversing process.
  - `parentNode` - parent node for the current `node`.
- `isDFS` if `true` use DFS algorithm otherwise use BFS.
- `callback` called with last node

##### `.traverseBFS(start, filter, progress, finish, callback)`

Traverse the graph using BFS.
- `start` function that finds first node, if return `true`  given `Node` is an first node. If this function returns `true` for more than one node in the graph, first node is taken and other are ignored (it uses `Store#findFirst`). It's application responsibility to have graph and start function which makes sense.
- `filter` function that can be used to exclude nodes from traversing process. It receives list of adjacent nodes for the current node. It must return list of nodes that wont be excluded in current step. Remember that this function must always returns list, if you want to exclude all nodes but one, return list with one node. The node found by `start` function won't be supplied to the `filter` function. If this argument is `null`, filtering process wont take a place, and all nodes will be traversed. Parameters received by this function:
  - `neighbors` - list of nodes to filter.
  - `depth` - current depth of traversing process.
  - `parentNode` - parent node for the `neighbors` nodes.
- `progress` helper function that can be used to gather result nodes, this function receives arguments:
  - `node` - current node.
  - `depth` - current depth of traversing process.
  - `parentNode` - parent node for the current `node`.
- `finish` function that tells if traverse should finish, if returns `true` current node will be the last and traverse process will end. If this function is `null` traverse will end when all nodes were visited. Parameters received by this function:
  - `node` - current node.
  - `depth` - current depth of traversing process.
  - `parentNode` - parent node for the current `node`.
- `callback` called with last node

##### `.traverseDFS(start, filter, progress, finish, callback)`

Traverse the graph using DFS.
- `start` function that finds first node, if return `true`  given `Node` is an first node. If this function returns `true` for more than one node in the graph, first node is taken and other are ignored (it uses `Store#findFirst`). It's application responsibility to have graph and start function which makes sense.
- `filter` function that can be used to exclude nodes from traversing process. It receives list of adjacent nodes for the current node. It must return list of nodes that wont be excluded in current step. Remember that this function must always returns list, if you want to exclude all nodes but one, return list with one node. The node found by `start` function won't be supplied to the `filter` function. If this argument is `null`, filtering process wont take a place, and all nodes will be traversed. Parameters received by this function:
  - `neighbors` - list of nodes to filter.
  - `depth` - current depth of traversing process.
  - `parentNode` - parent node for the `neighbors` nodes.
- `progress` helper function that can be used to gather result nodes, this function receives arguments:
  - `node` - current node.
  - `depth` - current depth of traversing process.
  - `parentNode` - parent node for the current `node`.
- `finish` function that tells if traverse should finish, if returns `true` current node will be the last and traverse process will end. If this function is `null` traverse will end when all nodes were visited. Parameters received by this function:
  - `node` - current node.
  - `depth` - current depth of traversing process.
  - `parentNode` - parent node for the current `node`.
- `callback` called with last node

#### traverse example

Let's say you want to find all nodes that are direct and undirect neighbours of node with data equal `start`, and you want to exclude nodes with data equal `null`.

```js
var result = [];
graph.traverseBFS(
  // start with node containing data that is equal string 'start'
  function (node) {
    return node.getData === 'start'
  },
  // exlude nodes with data being null
  function (neighbors) {
    return neighbors.filter(function (node) { return node.getData() !== null });
  },
  // add traversed node id to the result array
  function (node) {
    reults.push(node.id);
  },
  // finish function is null, so traverse until all nodes are visited
  null,
  // when traverse finishes display result array.
  function (err, lastNode) {
    if (err) throw err;
    console.log(result);
  }
);
```

## adjacency

Module that helps creating graphs from adjacency list. Its main purpose is to make easy and fast way of creating graph used in applications. It exposes three functions.

##### `.undirected(graph, obj, callback)`

Add undirected graph defined by `obj` to existing graph.
- `graph` existing graph, which will receive new nodes and edges.
- `obj` adjacency list - object that defines new edges and connections between them.
- `callback` called with object mapping ids from provided adjacency list with ids of newly created nodes. When defining adjacency list is convenient to add short meaningful ids (for example `"a"`, `"b"`) but real ids on graph are created by implementation of the `Store` class, which (in most cases) is impossible to predict. That,s why this functions returns this mapping, it may help reference freshly added nodes.

##### `.directed(graph, obj, callback)`

Add directed graph defined by `obj` to existing graph.
- `graph` existing graph, which will receive new nodes and edges.
- `obj` adjacency list - object that defines new edges and connections between them.
- `callback` called with object mapping ids from provided adjacency list with ids of newly created nodes. When defining adjacency list is convenient to add short meaningful ids (for example `"a"`, `"b"`) but real ids on graph are created by implementation of the `Store` class, which (in most cases) is impossible to predict. That's why this functions returns this mapping, it may help reference freshly added nodes.

##### `.toAdjacencyList(graph, callback)`

Converts provided graph to adjacency list object.


##### Adjacency list example:

```js
var aList = {
    "a" : {
        "data": {"start":true, "payload": {}},
        "neighbors": ["b","c"],
    },
    "b" : {
        "data": {"payload": {"w":1}},
        "neighbors": ["d"]
    },
    "c" : {
        "data": {"payload": {"w"2}},
        "neighbors": ["d"]
    },
    "d" : {
        "data": {"stop": true}
    }
};
```


##### Application specific logic example:

Lets say you have graph like that on diagram below, and you want to find shortest path from 'start; to 'end' node. The numbers in the other nodes are 'cost' of moving to this node.

```
                    -----          -----
                   /     \        /     \
                  /       \      /       \
      +---------->+  10   +----->+  15   +------------+
      |           \       /      \       /            |
      |            \     /        \     /             |
      |             -----          -----              |
      |                                               |
      |                                              \|/
    --+--                   -----                   --+--
   /     \                 /     \                 /     \
  /       \               /       \               /       \
  |'start'+-------------->+  20   +-------------->+ 'end' |
  \       /               \       /               \       /
   \     /                 \     /                 \     /
    --+--                   -----                   --+--
      |                                              /|\
      |            -----           -----              |
      |           /     \         /     \             |
      |          /       \       /       \            |
      +--------->+  25   +------>+  5    +------------+
                 \       /       \       /
                  \     /         \     /
                   -----           -----

```

Naive implemetation would use `traverseBFS` method and choose node with lowest 'cost' on every step:

```js
  var result = [];
  graph.traverseBFS(
    function (node) {
      return node.getData() === "start";
    },
    function (neighbors, depth, parentNode) {
      // from all neighbors choose the one with lowest cost.
      return [neighbors.reduce(function (prevNode, currNode) {
        return currNode.getData() < prevNode.getData() ? currNode : prevNode; 
      })];
    },
    function (node, depth, parentNode) {
      // add all not filteredout nodes
      result.push(node);
    },
    function (node, depth, parentNode) {
      return node.getData() === "end";
    },
    function (err, lastNode) {
      if (err) throw err;
      console.log(result);
    }
  )
```
