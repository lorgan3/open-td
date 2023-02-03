import { getAssets } from ".";

class AssetsContainer {
  assets?: Record<string, any>;

  private callback?: () => void;

  constructor() {
    getAssets().then((assets) => {
      this.assets = assets;
      if (this.callback) {
        this.callback();
      }
    });
  }

  onComplete(callback: () => void) {
    if (this.assets) {
      callback();
    }
  }

  get loading() {
    return this.assets === undefined;
  }
}

export { AssetsContainer };
