import _ from "lodash";
import React from "react";
import { connect } from "react-redux";
import classNames from "classnames/bind";

import { AllState } from "../state/states";
import { Processor } from "../robot/processor";
import { Actor, hero } from "../levels/levelstate";
import { GameMap } from "../components/GameMap";

import "./RobotStatus.css";

interface RobotStatusParams {
  cpu: Processor;
  robot?: Actor;
}

export const RobotStatus = connect((s: AllState) => ({
  cpu: s.cpu,
  robot: "level" in s.game ? hero(s.game.level) : undefined
}))(({ cpu, robot }: RobotStatusParams) => {
  if (!robot) {
    return null;
  }

  const depth = cpu.stack.length;
  let job = "(idle)";
  if (depth) {
    const frame = cpu.stack[cpu.stack.length - 1];
    if ("jobname" in frame) {
      job = frame.jobname;
    }
  }

  return (
    <div className="RobotStatus-container">
      <div className="RobotStatus-facts">
        <div className="RobotStatus-facts__contents">
          <div className="RobotStatus-registers RobotStatus-facts__fact">
            {_.toPairs(cpu.registers)
              .filter(([name]) => name !== "no")
              .map(([name, state]) => {
                return (
                  <div
                    className="RobotStatus-registers__unit"
                    key={`register-${name}-status`}
                  >
                    <div
                      title={name}
                      className={classNames("RobotStatus-registers__light", {
                        "RobotStatus-registers__light--enabled": state
                      })}
                    ></div>
                  </div>
                );
              })}
          </div>
          <div className="RobotStatus-orientation RobotStatus-facts__fact">
            <div
              className={classNames(
                "RobotStatus-orientation__compass",
                `RobotStatus-orientation__compass--${robot.orientation}`
              )}
            ></div>
          </div>
          <div className="RobotStatus-jobname RobotStatus-facts__fact">{`[${depth}] ${job}`}</div>
        </div>
      </div>
      {/* /RobotStatus-facts */}
      <div className="RobotStatus-map">
        <GameMap width={168} />
      </div>
    </div>
  );
});
