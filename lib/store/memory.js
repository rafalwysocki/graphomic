/*global require, module, setImmediate*/

var uuid = require("node-uuid");


/**
 * Node object constructor, shouldn't be used outside of this module. 
 *
 * @param {string} id
 * @param {object} data
 * @param {object} edges
 */
var Node = function (id, data, edges, store) {
    this._id = id;
    this._data = data;
    this._edges = edges;
    this._store = store;
};

Object.defineProperty(Node.prototype, 'id', {
    enumerable: true,
    get: function () {return this._id;}
});

/**
 * Get data object associated with this node.

 * @return {*}
 */
Node.prototype.getData = function () {
    return this._data;
};

/**
 * Set data associated with this node.
 *
 * @param {*} node data.
 * @param {function(?object, *)} function called when object is set, first parameter is an error or null, second parameter is data that was set.
 */
Node.prototype.setData = function (data, callback) {
    this._data = data;
    if (callback) return callback(null, data);
};

/**
 * Get all neighbors of the node.
 *
 * @param {string=} optional parameter, id of the node to exclude from neighbors list.
 * @param {function(?object, Array.<Node>)} function called when all nodes were found, first parameter is an error or null, second is list of adjacent nodes.
 */
Node.prototype.neighbors = function (excludeId, callback) {
    return this._store.neighbors(this, excludeId, callback);
};

/**
 * Get all neighbors ids of the node.
 *
 * @param {function(?object, Array.<Node>)}f irst parameter is an error or null, second is list of adjacent nodes ids.
 */
Node.prototype.neighborsIds = function (callback) {
    return callback(null, Object.keys(this._edges));
};

/**
 * Storage class that keeps everything in memory (in dictionaries).
 * It's fast but all data is lost when app restarts.
 */
var MemoryStore = function () {
    this._nodes = {};
    this._id = 0;
};
module.exports.Store = MemoryStore;

/**
 * Connecton to the storage system. For memory store do nothing.
 * 
 * @param {object} connection options, depends on the storage system.
 * @param {function(?object)} function called when connection is made, first parameter is an error or null.
 */
MemoryStore.prototype.connect = function (options, callback) {
    return callback(null);
};

/**
 * Disconnecton from the storage system. For memory store do nothing.
 *
 * @param {function(?object)} function called when store is disconnected, first parameter is an error or null.
 */
MemoryStore.prototype.disconnect = function (callback) {
    return callback(null);
};

/**
 * Add new node to the graph.
 * 
 * @param {*} data of the new node.
 * @param {function(?object, *)} function called when node was added, first parameter is an error or null, second is new node id.
 */
MemoryStore.prototype.addNode = function (data, callback) {
    var id = uuid.v1();
    this._nodes[id] = new Node(id, data, {}, this);
    if (callback) callback(null, id);
};

/**
 * Remove node with given id from the graph.
 *
 * @param {string} id of the node to remove.
 * @param {function(?object)} function called when node was removed, first parameter is an error or null.
 */
MemoryStore.prototype.removeNode = function (nodeId, callback) {
    var node = this._nodes[nodeId];
    var _edges = Object.keys(node._edges);
    var _iter = function () {
        if (_edges.length < 1) return callback(null);
        var nodeId2 = _edges.pop();
        var node2 = this._nodes[nodeId2];
        delete node2._edges[nodeId];
        setImmediate(_iter);
        
    }.bind(this);
    delete this._nodes[nodeId];
    setImmediate(_iter);
};

/**
 * Removes all nodes form the graph.
 *
 * @param {function(?object)} function called when nodes were removed, first parameter is an error or null.
 */
MemoryStore.prototype.removeAllNodes = function (callback) {
    this._nodes = {};
    if (callback) callback(null);
};

/**
 * Get node with given id.
 *
 * @param {function(?object, Node)} first parameter is an error or null, second parameter is Node object or null.
 */
MemoryStore.prototype.node = function (_id, callback) {
    if (callback) callback(null, this._nodes[_id]);
};

/**
 * Return all nodes of the graph.
 *
 * @param {function(?object, Node)} first parameter is an error or null, second parameter is list of Nodes.
 */
MemoryStore.prototype.nodes = function (callback) {
    if (callback) callback(null, Object.keys(this._nodes).map(function (k) {return this._nodes[k];}.bind(this)));
};

/**
 * Get data from node with given id.
 *
 * @param {string} id of the node.
 * @param {function(?object, *)} first parameter is an error or null, second parameter is node data.
 */
MemoryStore.prototype.getNodeData = function (_id, callback) {
    if (callback) callback(null, this._nodes[_id].data);
};

/**
 * Set data for node with given id.
 *
 * @param {string} id of the node.
 * @param {*} new data for the node.
 * @param {function(?object, *)} function called when object is set, first parameter is an error or null, second parameter is data that was set.
 */
MemoryStore.prototype.setNodeData = function (_id, data, callback) {
    this._nodes[_id].setData(data, callback);
};

/**
 * Updates node data. Iterates over keys of node data and supplied object, replaces existing and adds new keys values pairs.
 *
 * @param {string} id of the node to update.
 * @param {object} object to update with.
 * @param {function(?object, *)} called when data is updated, first parameter is an error or null, second is nev data value.
 */
MemoryStore.prototype.updateNodeData = function (_id, data, callback) {
    var _data = this._nodes[_id].getData();
    Object.keys(data).forEach(function (key) {
        _data[key] = data[key];
    });
    this._nodes[_id].setData(_data, callback);
};

/**
 * Find nodes for which comparator function returns true.
 *
 * @param {function(Node)} find function that decides if given node should be included in result list.
 * @param {function(?object, Array.<Node>)} function called when all nodes were found, first parameter is an error or null, second is list of nodes.
 */
MemoryStore.prototype.find = function (_filter, callback) {
    var keys = Object.keys(this._nodes);
    var result = [];
    
    var _iter = function () {
        if (keys.length === 0) return callback (null, result);
        var k = keys.pop();
        var node = this._nodes[k];
        if (_filter) {
            if (_filter(node)) {
                result.push(
                    node
                );
            }
        } else {
            result.push(
                node
            );
        }
        setImmediate(_iter);
    }.bind(this);
    
    setImmediate(_iter);
};

/**
 * Find first node for which comparator function returns true.
 *
 * @param {function(Node)} comparator function that decides if given node is an result node.
 * @param {function(?object, Node)} function called when node was found, first parameter is an error or null, second is an node.
 */
MemoryStore.prototype.findFirst = function (_cmp, callback) {
    var keys = Object.keys(this._nodes);
    
    var _iter = function () {
        if (keys.length === 0) return callback (null, null);
        var k = keys.pop();
        var node = this._nodes[k];
        if (_cmp) {
            if (_cmp(node)) {
                return callback(null, node);
            }
        } else {
            return callback(null, node);
        }
        setImmediate(_iter);
    }.bind(this);
    
    _iter();
};

/**
 * Add undirected edge between nodes.
 *
 * @param {string} id of the first node.
 * @param {string} id of the second node.
 * @param {function(?object)} function called when edge was added, first parameter is an error or null.
 */
MemoryStore.prototype.addEdge = function (nodeId1, nodeId2, callback) {
    var node1 = this._nodes[nodeId1];
    var node2 = this._nodes[nodeId2];
    // data = data === undefined ? null: data;
    node1._edges[nodeId2] = {connected: true};
    node2._edges[nodeId1] = {connected: true};
    if (callback) callback(null);
};

/**
 * Add directed edge between nodes.
 *
 * @param {string} id of the first node.
 * @param {string} id of the second node.
 * @param {function(?object)} function called when edge was added, first parameter is an error or null.
 */
MemoryStore.prototype.addDirEdge = function (nodeId1, nodeId2, callback) {
    var node1 = this._nodes[nodeId1];
    var node2 = this._nodes[nodeId2];
    node1._edges[nodeId2] = {connected: true};
    node2._edges[nodeId1] = {connected: false};
    if (callback) callback(null);
};

/**
 * Remove edge between nodes.
 *
 * @param {string} id of the first node.
 * @param {string} id of the second node.
 * @param {function(?object, *)} function called when edge was removed, first parameter is an error or null.
 */
MemoryStore.prototype.removeEdge = function (nodeId1, nodeId2, callback) {
    var node1 = this._nodes[nodeId1];
    var node2 = this._nodes[nodeId2];
    delete node1._edges[nodeId2];
    delete node2._edges[nodeId1];
    if (callback) callback(null);
};

/**
 * Removes all edges of the node.
 *
 * @param {string} id the first node.
 * @param {function(?object, *)} function called when all edges were removed, first parameter is an error or null.
 */
MemoryStore.prototype.removeAllEdges = function (nodeId, callback) {
    var node = this._nodes[nodeId];
    var _edges = Object.keys(node._edges);
    var _iter = function () {
        if (_edges.length < 1) {
            node._edges = {}; 
            return callback(null);
        }
        var nodeId = _edges.pop();
        var edge = node._edges[nodeId];
        delete this._nodes[edge.neigborId]._edges[nodeId];
        setImmediate(_iter);
    }.bind(this);
    setImmediate(_iter);
};


/**
 * Check if nodes with given ids are adjacent.
 *
 * @param {string} id of the first node.
 * @param {string} id of the second node.
 * @param {function(?object, boolean)} first parameter is an error or null, second boolean value telling if nodes are adjacent.
 */
MemoryStore.prototype.adjacent = function (nodeId1, nodeId2, callback) {
    var node1 = this._nodes[nodeId1];
    if (node1 === undefined) return callback("No node with id: " + nodeId1);
    var edge = node1._edges[nodeId2];
    return callback(null, edge !== undefined && edge.connected);
};

/**
 * Get all neighbors of node with given id.
 *
 * @param {string|Node} id of the node or Node object.
 * @param {string|null} id of the node to exclude if null dont exclude any node.
 * @param {function(?object, Array.<Node>)} function called when all nodes were found, first parameter is an error or null, second is list of adjacent nodes.
 */
MemoryStore.prototype.neighbors = function (node, excludeId, callback) {
    if (!callback) {
        callback = excludeId;
        excludeId = null;
    }

    var result = [];
    var keys = Object.keys(node._edges);
    var _iter = function () {
        if (keys.length === 0) return callback(null, result);
        var _id = keys.pop();
        if (!node._edges[_id].connected) return setImmediate(_iter);
        if (excludeId && excludeId === _id) return setImmediate(_iter);
        var neighbor = this._nodes[_id];
        result.push(neighbor);
        setImmediate(_iter);
    }.bind(this);
    
    setImmediate(_iter);

};

