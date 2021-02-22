module.exports = class Button {
  _doubleClicks = [];
  _clicks = [];
  _longClicks = [];

  constructor(input, options) {
    const opt = {
      doubleClickThreshold: 300,
      longClickThreshold: 1000,
      ...options,
    }
    const isPulledUp = input.isPulledUp();
    let lastChange; let timer; let isDouble; let longClickTimer;
    input.onChange((value) => {
      // Invert value if input is pulled up
      value = isPulledUp ? !value : value;
      let diff = 0;
      if (lastChange) {
        diff = (new Date()).getTime() - lastChange;
      }
      // filter debouncing
      if (diff && diff < 20) {
        return;
      }
      if (value) {
        // validate double click, if pause between click is less then doubleClickThreshold
        if (diff && diff < opt.doubleClickThreshold && this._doubleClicks.length) {
          isDouble = true;
          timer && clearTimeout(timer);
          timer = undefined;
        } else {
          // set up timeout to control holding button
          longClickTimer = setTimeout(() => {
            this._invoke(this._longClicks);
            longClickTimer && clearTimeout(longClickTimer);
            longClickTimer = undefined;
          }, opt.longClickThreshold);
        }
      } else {
        // release timer if button was released before time longClickThreshold is reached
        if (longClickTimer) {
          longClickTimer && clearTimeout(longClickTimer);
          longClickTimer = undefined;
        }
        if (isDouble) {
          this._invoke(this._doubleClicks);
          isDouble = false;
        } else if (diff < opt.longClickThreshold) { // Don't execute click if long click has been occurred
          // if double click is expected, let's wait second click, otherwise execute immediately
          if (this._doubleClicks.length) {
            timer = setTimeout(() => {
              this._invoke(this._clicks);
            }, opt.doubleClickThreshold + 1)
          } else {
            this._invoke(this._clicks);
          }
        }
      }
      lastChange = new Date().getTime();
    })
  }

  _invoke(callbacks) {
    callbacks.map((callback) => callback())
  }

  onDoubleClick(callback) {
    this._doubleClicks.push(callback);
  }

  onLongClick(callback) {
    this._longClicks.push(callback);
  }

  onClick(callback) {
    this._clicks.push(callback);
  }

}
