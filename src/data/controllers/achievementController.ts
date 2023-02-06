import md5 from "md5";
import { set } from "../../util/localStorage";
import { getAchievements } from "../achievement";
import { Achievement } from "../achievement/achievement";
import { GameEvent } from "../events";
import EventSystem from "../eventSystem";

class AchievementController {
  private achievements: Achievement[];

  constructor() {
    this.achievements = getAchievements();

    this.achievements.forEach((achievement) => achievement.register());

    EventSystem.Instance.addEventListener(GameEvent.Lose, () =>
      this.unRegister()
    );
  }

  unRegister() {
    const data: Record<string, number> = {};

    this.achievements.forEach((achievement) => {
      data[md5(achievement.description)] = achievement.internalProgress;

      achievement.unRegister();
    });

    set("achievements", data, true);
  }
}

export default AchievementController;
