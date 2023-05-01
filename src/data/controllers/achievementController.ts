import md5 from "md5";
import { set } from "../../util/localStorage";
import { getAchievements } from "../achievement";
import { Achievement } from "../achievement/achievement";

class AchievementController {
  private static instance: AchievementController;
  private achievements: Achievement[];

  constructor() {
    AchievementController.instance = this;
    this.achievements = getAchievements();

    this.achievements.forEach((achievement) => achievement.register());

    window.addEventListener("beforeunload", this.unRegister);
  }

  unRegister = () => {
    const data: Record<string, number> = {};

    this.achievements.forEach((achievement) => {
      data[md5(achievement.description)] = achievement.internalProgress;

      achievement.unRegister();
    });

    set("achievements", data, true);
  };

  cleanup() {
    window.removeEventListener("beforeunload", this.unRegister);
    AchievementController.instance = null!;
  }

  static get Instance() {
    return this.instance;
  }
}

export default AchievementController;
