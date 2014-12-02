import ui.View as View;
import ui.TextView as TextView;
import animate;

exports = Class(View, function (supr) {
  this.init = function (opts) {

    this.fullOpacity = opts.opacity || .8;

    opts = merge(opts, {
      backgroundColor: 'black',
      opacity: 0
    });
    supr(this, 'init', [opts]);
    this.setHandleEvents(false, true);

    this.padding = 10;
    this.label = new TextView({
      superview: this,
      x: this.padding,
      y: this.style.height * .25,
      width: this.style.width - this.padding - this.padding,
      height: 100,
      color: "white",
      text: opts.text
    });

    this.label2 = new TextView({
      superview: this,
      x: this.padding,
      y: this.label.style.y + this.label.style.height + this.padding,
      width: this.style.width - this.padding - this.padding,
      height: 70,
      color: "white",
      text: opts.text2 || "Please Wait"
    });
  };

  this.setText = function (text) {
    this.label.setText(text);
  };

  this.show = function (text) {
    animate(this).now({ opacity: this.fullOpacity }, 500);
    if (text) {
      this.setText(text);
    }
  };

  this.hide = function () {
    animate(this).now({ opacity: 0 }, 500);
  };
});
