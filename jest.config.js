/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  setupFilesAfterEnv: ["./setupJestAfterEnv.ts"],
  testEnvironment: "jsdom",
};
