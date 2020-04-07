import _ from "lodash";
import React from "react";
import { connect } from "react-redux";

import { AllState } from "../state/states";
import { Processor } from "../robot/processor";
import { Actor, hero } from "../levels/levelstate";
import { GameMap } from "../components/GameMap";

import "./RobotStatus.css";

interface RobotStatusParams {
  cpu: Processor;
  robot: Actor;
}

export const RobotStatus = connect((s: AllState) => ({
  cpu: s.cpu,
  robot: hero(s.game)
}))(({ cpu, robot }: RobotStatusParams) => {
  const frame = cpu.stack.length > 0 && cpu.stack[cpu.stack.length - 1];
  return (
    <div className="RobotStatus-container">
      <div className="RobotStatus-facts">
        <div className="RobotStatus-label">Registers:</div>
        <div className="RobotStatus-registers">
          {_.toPairs(cpu.registers).map(([name, state]) => {
            return (
              <span
                key={`register-${name}-status`}
                className="RobotStatus-registers__unit"
              >
                <input type="checkbox" readOnly checked={state} />
                {name}
              </span>
            );
          })}
        </div>{" "}
        <div className="RobotStatus-label">Orientation:</div>
        <div className="RobotStatus-orientation">{robot.orientation}</div>{" "}
        <div className="RobotStatus-label">Running Job:</div>
        <div className="RobotStatus-jobname">
          {frame ? frame.jobname : "(idle)"}
        </div>
      </div>
      {/* /RobotStatus-facts */}
      <div className="RobotStatus-map">
        <GameMap width={168} />
      </div>
    </div>
  );
});
