# bem-deps-parser

Automagically generate deps.js for you

WIP! Consider current state as a proof of concept.

### Installation
```sh
git clone https://github.com/tadatuta/bem-deps-parser.git
cd bem-deps-parser
npm i
```

### Usage
```sh
node index.js path/to/bemtree-or-bemhtml-template
```

### Example
```js
// test.js
block('bla').content()(function() {
    return [
        {
            block: 'b1',
            elem: 'e2'
        },
        {
            block: 'button',
            mods: { theme: 'islands', size: ['s', 'm', 'l'], view: 'action' },
            text: '123',
            name: 'bla'
        },
        {
            elem: 'trololo',
            mix: [{
                block: 'b4'
            }],
            content: [
                {
                    block: 'b5'
                }
            ]
        }
    ];
});
```

```
$ node index.js test.js

{ shouldDeps:  [ { block: 'b1', elem: 'e2' },
  { block: 'button',
    mods: { theme: 'islands', size: [ 's', 'm', 'l' ], view: 'action' } },
  'b4',
  'b5',
  { elem: [ 'trololo' ] } ]  }
```
