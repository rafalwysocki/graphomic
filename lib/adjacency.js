/*global module */


module.exports.directed = function (graph, aList, callback) {
    return _build(graph, aList, true, callback);
};

module.exports.undirected = function (graph, aList, callback) {
    return _build(graph, aList, false, callback);
};

module.exports.toAdjacencyList = function (graph, callback) {
    var aList = {};
    graph.nodes(function (err, nodes) {
        if (err) return callback(err);
        nodes.forEach(function (node) {
            var n = {};
            n.data = node.getData();
            node.neighborsIds(function (err, neighborsIds) {
                if (err) return callback(err);
                n.neighbors = neighborsIds;
                aList[node.id] = n;
            });
        });
    });
    return callback(null, aList);
};

var _build = function (graph, aList, directed, callback) {
    var ids = {};
    var nodes = {};
    var neigbors = [];
    
    var _addEdge = directed ? graph.addDirEdge.bind(graph) : graph.addEdge.bind(graph);
    
    Object.keys(aList).forEach(function (k) {
        var node = aList[k];
        nodes[k] = node.data;
        
        if (node.neighbors) {
            node.neighbors.forEach(function (neighbor) {
                neigbors.push([k, neighbor]);
                if (nodes[neighbor] === undefined) {
                    nodes[neighbor] = {};
                }
            });
        }
    });
        
    var _addNode = function (id, data, cb) {
        graph.addNode(data, function (err, nodeId) {
            if (err) return cb(err);
            ids[id] = nodeId;
            cb();
        });
    };  
    
    var _maybeNextStep = function (counter, nextStep) {
        if (counter === 0) nextStep(null, ids);
    };

    var connectNeighbors = function () {
        var counter = neigbors.length;
        _maybeNextStep(counter, callback);
        neigbors.forEach(function (neigbor) {
            var n1 = neigbor[0];
            var n2 = neigbor[1];
            _addEdge(ids[n1], ids[n2], function (err) {
                if (err) return callback(err);
                counter--;
                _maybeNextStep(counter, callback);
            });
        });
    };
    
    var counter = Object.keys(nodes).length;
    Object.keys(nodes).forEach(function (id) {
        _addNode(id, nodes[id], function (err) {
            if (err) return callback(err);
            counter--;
            _maybeNextStep(counter, connectNeighbors);
        });
    });
};
