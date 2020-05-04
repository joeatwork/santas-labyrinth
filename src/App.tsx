import React from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";

import { costumesLoaded } from "./images/costumes";
import { rootReducer } from "./state/rootreducer";
import { Actions } from "./state/actions";
import { Stage } from "./components/Stage";

import "./App.css";

const store = createStore(rootReducer);

const millisPerTick = 50;
setInterval(() => {
  store.dispatch({
    type: Actions.tick
  });
}, millisPerTick);

costumesLoaded.then(() => {
  store.dispatch({
    type: Actions.loaded
  });
});

function App() {
  return (
    <div className="App-container">
      <Provider store={store}>
        <header className="App-header-container">
          <h1 className="App-header">Santa's Labyrinth</h1>
        </header>
        <main>
          <Stage />
        </main>
      </Provider>
    </div>
  );
}

export default App;
