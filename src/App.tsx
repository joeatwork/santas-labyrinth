import React from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";

import { rootReducer } from "./state/rootreducer";
import { Actions } from "./state/actions";

import { Controls } from "./components/Controls";
import { RobotStatus } from "./components/RobotStatus";
import { GameScreen } from "./components/GameScreen";

import "./App.css";

const store = createStore(rootReducer);

const millisPerTick = 50;
setInterval(() => {
  store.dispatch({
    type: Actions.tick
  });
}, millisPerTick);

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <header className="App-header-container">
          <h1 className="App-header">Santa's Labyrinth</h1>
        </header>
        <main>
          <div className="App-universe">
            <div className="App-controls">
              <Controls />
            </div>
            <div className="App-feedback">
              <GameScreen />
              <RobotStatus />
            </div>
          </div>
        </main>
      </Provider>
    </div>
  );
}

export default App;
