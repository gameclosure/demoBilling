import ui.View as View;
import ui.ImageView as ImageView;
import ui.TextView as TextView;

exports = Class(View, function (supr) {
  this.init = function (opts) {

    supr(this, 'init', [opts]);

    this.onImage = 'resources/images/ui/toggle_on.png';
    this.offImage = 'resources/images/ui/toggle_off.png';

    // scale checkbox to height
    var scale = this.style.height / 22; // hardcoded to image height

    this.checkbox = new ImageView({
      superview: this,
      width: 22 * scale,
      height: this.style.height,
      x: 0,
      y: 0,
      image: this.offImage
    });

    this.padding = 15;
    this.label = new TextView({
      superview: this,
      x: this.checkbox.style.width + this.padding,
      width: this.style.width - this.checkbox.style.width - this.padding,
      height: this.style.height,
      color: "black",
      text: opts.text
    });

    // maintain state
    this.checked = false;

    // handle click events
    this.on('InputSelect', this.toggle);

    // save callback
    this.onChange = opts.onChange;
  };


  this.toggle = function () {
    this.checked = !this.checked;
    this._update();
    this.onChange && this.onChange(this.checked);
  };

  this.setChecked = function (on) {
    this.checked = !!on;
    this._update();
  };

  this.isChecked = function () {
    return this.checked;
  };

  this._update = function () {
    this.checkbox.setImage(this.checked ? this.onImage : this.offImage);
  }
});
