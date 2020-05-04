import { Reducer, combineReducers } from "redux";

import { AllActions } from "../state/actions";
import { WorldState } from "../state/world";
import { worldReducer } from "../state/worldreducer";

export interface AllState {
  world: WorldState;
}

export const rootReducer: Reducer<AllState, AllActions> = combineReducers({
  world: worldReducer
});
