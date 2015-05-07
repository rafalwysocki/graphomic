/*global require, module, setImmediate*/


var Graph = function(store) {
    this.store = store;
};
module.exports.Graph = Graph;


var _getId = function (idOrNode) {
    return typeof idOrNode !== 'object' ? idOrNode : idOrNode.id;
};


/**
 * Add new node to the graph.
 * 
 * @param {*} data of the new node.
 * @param {function(?object, *)} function called when node was added, or when error ocured.
 */
Graph.prototype.addNode = function(data, callback) {
    this.store.addNode(data, callback);
};

/**
 * Fetches node with given id.
 * 
 * @param {string} id 
 * @param {function(?object, Node)} first parameter is an error or null, second parameter is Node object or null.
 */
Graph.prototype.node = function (_id, callback) {
    this.store.node(_id, callback);
};

/**
 * Returns all nodes of the graph.
 *
 * @param {function(?object, Node)} first parameter is an error or null, second parameter is list of Nodes.
 */
Graph.prototype.nodes = function (callback) {
    this.store.nodes(callback);
};

/**
 * Set data for the given node
 * 
 * @param {string} id of the node or node object
 * @param {*} data to set
 * @param {function(?object, *)} function called when object is set, first parameter is an error or null, second parameter is data that was set.
 */
Graph.prototype.setNodeData = function(_id, data, callback) {
    this.store.setNodeData(_getId(_id), data, callback); 
};

/**
 * Updates node data. Iterates over keys of node data and supplied object, replaces existing and adds new keys values pairs.
 *
 * @param {string} id of the node or node object to update.
 * @param {object} object to update with.
 * @param {function(?object, *)} called when data is updated, first parameter is an error or null, second is nev data value.
 */
Graph.prototype.updateNodeData = function(_id, data, callback) {
    this.store.updateNodeData(_getId(_id), data, callback); 
};
/**
 * Find nodes for which comparator function returns true.
 *
 * @param {function(Node)} find function that decides if given node should be included in result list.
 * @param {function(?object, Array.<Node>)} function called when all nodes were found, first parameter is an error or null, second is list of nodes.
 */
Graph.prototype.find = function(_filter, callback) {
    this.store.find(_filter, callback);
};

/**
 * Find first node for which comparator function returns true.
 *
 * @param {function(Node)} comparator function that decides if given node is an result node.
 * @param {function(?object, Node)} function called when node was found, first parameter is an error or null, second is an node.
 */
Graph.prototype.findFirst = function(_filter, callback) {
    this.store.findFirst(_filter, callback);
};


Graph.prototype.removeNode = function(_id, callback) {
    this.store.removeNode(_getId(_id), callback);
};

Graph.prototype.addEdge = function(node1Id, node2Id, callback) {
    this.store.addEdge(_getId(node1Id), _getId(node2Id), callback);
};

Graph.prototype.addDirEdge = function(node1Id, node2Id, callback) {
    this.store.addDirEdge(_getId(node1Id), _getId(node2Id), callback);
};

Graph.prototype.removeEdge = function(node1Id, node2Id, callback) {
    this.store.removeEdge(_getId(node1Id), _getId(node2Id), callback);
};

Graph.prototype.removeAllEdges = function(_id, callback) {
    this.store.removeAllEdges(_getId(_id), callback);
};

Graph.prototype.data = function(_id, callback) {
    return this.store.getNodeData(_getId(_id), callback);
};

Graph.prototype.adjacent = function (nodeId1, nodeId2, callback) {
    return this.store.adjacent(_getId(nodeId1), _getId(nodeId2), callback);
};

Graph.prototype.neighbors = function (node, excludeId, callback) {
    if (typeof node === 'object') {
        this.store.neighbors(node, _getId(excludeId), callback);
    } else {
        this.node(node, function (err, node) {
            if (err) return callback(err);
            this.store.neighbors(node, _getId(excludeId), callback);
        }.bind(this));
    }
};

var _pathNotTaken = function (paths, nodeId1, nodeId2) {
    var result = false;
    if (!paths[nodeId1]) {
        paths[nodeId1] = {};
        paths[nodeId1][nodeId2] = true;
        //return true;
        result = true;
    } else if (!paths[nodeId1][nodeId2]) {
        paths[nodeId1][nodeId2] = true;
        result = true;
    }
    if (!paths[nodeId2]) {
        paths[nodeId2] = {};
        paths[nodeId2][nodeId1] = true;
        result = true;
    } else if (!paths[nodeId2][nodeId1]) {
        paths[nodeId2][nodeId1] = true;
        result = true;
    }
    return result;
};

Graph.prototype._traverse = function (queue, _filter, _progress, _finish, queueFunc, pathTaken, callback) {
    var depth = 0;
    var _process = function () {
        var e = queueFunc.call(queue);
        var parentNode = e.parentNode;
        var parentNodeId = parentNode !== null ? parentNode.id : null;
        var node = e.node;
        var depth = e.depth;
        if (_progress) _progress(node, depth, parentNode);
        if (_finish && _finish(node, depth, parentNode)) {
            return callback(null, node);
        }
        this.store.neighbors(node, parentNodeId, function (err, neighbors) {
            if (err) return callback(err);
            neighbors = neighbors.filter(function (n) {
                return _pathNotTaken(pathTaken, node.id, n.id);
            });
            //neighbors = _filter ? neighbors.filter(function (n, index, array) {return _filter(n, array, depth+1, node);}) : neighbors;
            neighbors = _filter ? _filter(neighbors, depth+1, node) : neighbors;
            if (queue.length === 0 && neighbors.length === 0) return callback(null, node);
            neighbors = neighbors.map(function (n) { return {parentNode:node, node:n, depth:depth+1};});
            Array.prototype.push.apply(queue, neighbors);
            if (queue.length > 0) setImmediate(_process);
        }.bind(this));
    }.bind(this);
    setImmediate(_process);
};


/**
 * Traverse graph.
 *
 * @param {?function(Node)} comparator function that decides if given node is an start node.
 * @param {?function(Node)} filter function that decides if given node should take part in the traverse process.
 * @param {?function(Node)} progress function that should be used to gather result nodes (if any).
 * @param {?function(Node)} finish function that decides if current node should be the last and traversing process should end.
 * @param {boolean} if true use DFS alghoritm, otherwise use BFS alghorimt.
 * @param {function(?object, Node)} callback called when traverse finishes, first parameter is an error or null if there is no error, second is the last node.
 */
Graph.prototype.traverse = function (start, _filter, _progress, _finish, isDFS, callback) {
    this.store.findFirst(start, function (err, node) {
        if (err) return callback(err);
        if (!node) return callback(null, null);
        // if (_filter && !_filter(node, [], 0)) return callback(null, null);
        var queue = [{parentNode:null, "node":node, "depth":0}];
        if (isDFS) {
            this._traverse(queue, _filter, _progress, _finish, Array.prototype.pop, {}, callback);
        } else {
            this._traverse(queue, _filter, _progress, _finish, Array.prototype.shift, {}, callback);
        }
    }.bind(this));
};

/**
 * Traverse graph using BFS alghoritm.
 *
 * @param {?function(Node)} comparator function that decides if given node is an start node.
 * @param {?function(Node)} filter function that decides if given node should take part in the traverse process.
 * @param {?function(Node)} progress function that should be used to gather result nodes (if any).
 * @param {?function(Node)} finish function that decides if current node should be the last and traversing process should end.
 * @param {function(?object, Node)} callback called when traverse finishes, first parameter is an error or null if there is no error, second is the last node.
 */
Graph.prototype.traverseBFS = function (start, _filter, _progress, _finish, callback) {
    this.traverse(start, _filter, _progress, _finish, false, callback);
};

/**
 * Traverse graph using DFS alghoritm.
 *
 * @param {?function(Node)} comparator function that decides if given node is an start node.
 * @param {?function(Node)} filter function that decides if given node should take part in the traverse process.
 * @param {?function(Node)} progress function that should be used to gather result nodes (if any).
 * @param {?function(Node)} finish function that decides if current node should be the last and traversing process should end.
 * @param {function(?object, Node)} callback called when traverse finishes, first parameter is an error or null if there is no error, second is the last node.
 */
Graph.prototype.traverseDFS = function (start, _filter, _progress, _finish, callback) {
    this.traverse(start, _filter, _progress, _finish, true, callback);
};

