# React SSR POC

## About

Here we builing Proof of Concept for React Server Side Rendereing with create-react-app (preferably without using of eject) and Typescript

## Demo app

https://ssr-example-test.herokuapp.com/

## Process

### Project setup

Creating an empty create-react-app project with typescript:
```shell
npx create-react-app my-app --template typescript
```

Temporarily downgrading React to version 18 due to issue when running client (https://github.com/vercel/next.js/discussions/35773)
```shell
npm i react@17.0.2 react-dom@17.0.2 @types/react@17.0.2 @types/react-dom@17.0.2 -S
```

Adding project depencencies:
```shell
npm i app-root-path -S
npm i ts-loader -D 
npm i cross-env -S
npm i concurrently -D // runs concurrently several tasks during `npm start`
```

### Template update

Remove `logo.svg`, `App.css`, `App.test.tsx`, `index.css` created by create-react-app template and add `Counter` component. 
```jsx
import React from 'react';

export interface CounterState {
  counter: number;
}

export class Counter extends React.Component<{}, CounterState> {

  constructor(props: any) {
    super(props);
    this.state = { counter: 0 };
  }

  incrementCounter() {
    this.setState({ counter: this.state.counter + 1 });
  }

  render() {
    return (
      <div>
        <h1>counter at: {this.state.counter}</h1>
        <button
          onClick={() => this.incrementCounter()}
        >+</button>
      </div>
    );
  }
}
```

Make sure `App` imports and renders it.
```jsx
import React from 'react';
import { Counter } from './Counter';

function App() {
  return (
    <div>
      <header>
        <Counter />
      </header>
    </div>
  );
}

export default App;
```

### Server setup and configuration

Create file for server code `server/index.ts`
```jsx
import path from 'path';
import fs from 'fs';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import express from 'express';

import App from '../src/App';

const PORT = process.env.PORT || 3006;
const app = express();

app.get('/', (req, res) => {
    console.log("> / accessed")

    const app = ReactDOMServer.renderToString(<App />);
    const indexFile = path.resolve('./build/index.html');
  
    fs.readFile(indexFile, 'utf8', (err, data) => {
      if (err) {
        console.error('Something went wrong:', err);
        return res.status(500).send('Oops, better luck next time!');
      }
  
      console.log("> returning compiled")
      return res.send(
        data.replace('<div id="root"></div>', `<div id="root">${app}</div>`)
      );
    });
  });
  
  app.use(express.static('./build'));
  
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
```

Create file for server config `webpack.server.config.js`
```javascript
const root = require('app-root-path').path;
module.exports = {
    entry: `${root}/server/index.tsx`,
    target: 'node',
    node: {
        __filename: true,
        __dirname: true
    },
    externals: [
        /^[a-z\-0-9]+$/ // Ignore node_modules folder,
    ],
    output: {
        filename: 'compiled', // output file
        path: `${root}/build_server`,
        libraryTarget: "commonjs"
    },
    resolve: {
        modules: [`${root}/node_modules`],
        // Add in `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.config.js', '.web.js', '.ts', '.tsx', '.js'],
    },
    module: {
        rules: [{
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            test: /\.(ts|tsx)$/,
            exclude: [/node_modules/],
            use: [
                {
                    loader: 'ts-loader'
                }
            ]
        }]
    }
};
```

Updating package.json scripts section:
```json
"start:server": "cross-env NODE_ENV=development node build_server/compiled",
"build:server": "node node_modules/webpack/bin/webpack.js --config webpack.server.config.js",
```

*Important!* In `tsconfig.json` rule `"noEmit": true` should be removed as it creates no emit error duing server build

### Running server

Build project (creates build/index.html referenced in server files):
```shell
npm run build
```

And then:
```shell
npm run build:server
npm run start:server
```

### Finalizing

After adding following commands to `package.json`:
```json
"start": "concurrently \"npm run build && npm run start:server\" \"react-scripts-ts start\"",
"build": "npm run build:client && npm run build:server",
```

The app could be started with:
```shell
npm start
```

## Deploy to Heroku
Install Heroku CLI, then login into it:
```shell
heroku login
```

*Important!* Make sure that Heroku config production mode is set to `false`, otherwise devDependencies from `package.json` won't be installed:
```shell
heroku config:set NPM_CONFIG_PRODUCTION=false
```

Push project to Heroku Git:
```shell
heroku git:remote -a ssr-example-test
```

Push to Heroku Git triggers `npm start` and runs the app:
```shell
git push heroku master
```

## Used materials

* https://github.com/haukurk/cra-ssr-ts-recipe (has more complex configs incl. routing)
* https://www.digitalocean.com/community/tutorials/react-server-side-rendering (full example didn't work)
* https://github.com/reactwg/react-18/discussions/5
* https://betterprogramming.pub/how-to-deploy-your-react-app-to-heroku-aedc28b218ae

## Issues

* Still having issue with React 18. There is an open issue for that

