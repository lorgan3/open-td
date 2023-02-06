import md5 from "md5";
import { get } from "../../util/localStorage";
import { Achievement } from "./achievement";
import { achievements } from "./definitions";

export const getAchievements = () => {
  const achievementData = get("achievements");

  return achievements
    .map(
      (definition) =>
        new Achievement(
          definition,
          achievementData?.[md5(definition.description)] ?? 0
        )
    )
    .sort((a, b) => b.percentage - a.percentage);
};
