var fs = require('fs'),
    util = require('util'),
    _ = require('lodash'),
    esprima = require('esprima'),
    esdispatch = require('esdispatch'),
    dispatcher = new esdispatch(),

    fileName = process.argv[2],
    source = fs.readFileSync(fileName, 'utf8'),
    ast = esprima.parse(source);

var bemKeys = [
    'block',
    'elem',
    'elems',
    'mods'
];

var shouldDeps = [];

function generateMods(ast) {
    var mods = {};
    ast.forEach(function(item) {
        var val = item.value;
        mods[item.key.name] = val.type === 'Literal' ? val.value : generateArray(val);
    });

    return mods;
}

function generateArray(ast) {
    return ast.elements.map(function(item) {
        return item.value;
    });
}

function getBlockByContext(ast) {
    var block;

    ast = ast.filter(function(item) {
        return item.type === 'ObjectExpression';
    });

    for (var i = 0, len = ast.length; i < len; i++) {
        var node = ast[i],
            props = node.properties;

        for (var j = 0, propsLen = props.length; j < propsLen; j++) {
            if (props[j].key.name === 'block') return props[j].value.value;
        }
    }
}

dispatcher.on('ObjectExpression', function(node, ancestors) {
    var entity = {};

    node.properties.forEach(function(prop) {
        var key = prop.key.name;
        if (bemKeys.indexOf(key) < 0) return;

        var val = key === 'mods' ? generateMods(prop.value.properties) : prop.value.value;

        entity[key] = val;

    });

    if (!Object.keys(entity).length) return;

    if (!entity.block) {
        var block = getBlockByContext(ancestors);
        block && (entity.block = block);
    }

    Object.keys(entity).length && shouldDeps.push(entity);
});

function normalizeDeps(deps) {
    var newDeps = [],
        elem = [];

    deps.forEach(function(item) {
        if (Object.keys(item).length === 1) {
            if (item.block) {
                newDeps.indexOf(item.block) < 0 && newDeps.push(item.block);
                return;
            }

            if (item.elem) {
                elem.indexOf(item.elem) < 0 && elem.push(item.elem);
                return;
            }
            _.find(newDeps, item) || newDeps.push(item);
            return;
        } else {
            _.find(newDeps, item) || newDeps.push(item);
        }
    });

    elem.length && newDeps.push({ elem: elem });

    return newDeps;
}

dispatcher.observe(ast, function() {
    console.log('{ shouldDeps: ', util.inspect(normalizeDeps(shouldDeps), { depth: null }), ' }');
});
