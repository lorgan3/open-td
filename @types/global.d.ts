declare global {
  namespace jest {
    interface Matchers<R> {
      toApproximate(actual: number): CustomMatcherResult;
    }
  }
}

export {};
