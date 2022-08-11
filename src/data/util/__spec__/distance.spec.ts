import { getRayDistance } from "../distance";

describe("distance", () => {
  const table = [
    {
      rayX: 1,
      rayY: 1,
      rayDirection: 0,
      pointX: 3,
      pointY: 1,
      result: 0,
    },
    {
      rayX: 1,
      rayY: 1,
      rayDirection: 0,
      pointX: 1,
      pointY: 3,
      result: 2,
    },
    {
      rayX: 1,
      rayY: 1,
      rayDirection: 0,
      pointX: 3,
      pointY: 0,
      result: 1,
    },
    {
      rayX: 1,
      rayY: 1,
      rayDirection: 0,
      pointX: 3,
      pointY: 2,
      result: 1,
    },
    {
      rayX: 1,
      rayY: 1,
      rayDirection: Math.PI / 2,
      pointX: 3,
      pointY: 2,
      result: 2,
    },
    {
      rayX: 1,
      rayY: 1,
      rayDirection: -Math.PI / 4,
      pointX: 3,
      pointY: 2,
      result: 2.1213203435596424,
    },
    {
      rayX: 1,
      rayY: 1,
      rayDirection: Math.PI / 2,
      pointX: 1,
      pointY: 0,
      result: Number.POSITIVE_INFINITY,
    },
    {
      rayX: 5,
      rayY: 1,
      rayDirection: Math.PI,
      pointX: 7,
      pointY: 1,
      result: Number.POSITIVE_INFINITY,
    },
    {
      rayX: 5,
      rayY: 1,
      rayDirection: Math.PI,
      pointX: 3,
      pointY: 2,
      result: 1,
    },
  ];

  it.each(table)(
    "returns the distance for line [$rayX, $rayY, $rayDirection] to point [$pointX, $pointY]",
    ({ rayX, rayY, rayDirection, pointX, pointY, result }) => {
      expect(
        getRayDistance(rayX, rayY, rayDirection, pointX, pointY)
      ).toApproximate(result);
    }
  );
});
