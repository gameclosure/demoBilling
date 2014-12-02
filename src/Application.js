/**
 * Demo for the GameClosure DevKit Billing Module
 * https://github.com/gameclosure/billing
 *
 */

import ui.TextView as TextView;
import src.views.LogView as LogView;
import src.views.ToggleView as ToggleView;
import src.views.ButtonView as ButtonView;
import src.views.Overlay as Overlay;
import device;

import billing;


exports = Class(GC.Application, function () {

  this.initUI = function () {

    this.view.style.backgroundColor = 'white';

    this.marketStatus = new TextView({
      superview: this.view,
      text: "Market Status: Unknown",
      color: "black",
      x: 0,
      y: 100,
      width: this.view.style.width,
      height: 100
    });

    var buttonPadding = 25;
    var buttonWidth = (this.view.style.width - (buttonPadding * 3)) / 2;

    // if in browser, billing is always mock
    this.mockBilling = 'simulate';
    if (device.isSimulator) {
      this.mockText = new TextView({
        superview: this.view,
        x: buttonPadding,
        y: 200,
        width: this.view.style.width - (buttonPadding * 2),
        height: 22 * 2,
        text: "In Simulator - Always Mock Billing"
      });
    } else {
      this.mockToggle = new ToggleView({
        superview: this.view,
        x: buttonPadding,
        y: 200,
        width: 400,
        height: 22 * 2,
        text: "Use Mock Purchases",
        onChange: bind(this, function (mockBilling) {
          if (mockBilling) {
            this.log("Switching to mock billing");
          } else {
            this.log("Enabling Real Billing");
          }
          this.mockBilling = mockBilling && 'simulate' || void 0;
        })
      });
      this.mockBilling = void 0;
    }

    this.handlersToggle = new ToggleView({
      superview: this.view,
      x: buttonPadding,
      y: 300,
      width: 400,
      height: 22 * 2,
      text: "Purchase Handlers Enabled",
      onChange: bind(this, function (enabled) {
        if (enabled) {
          this.log("Enabling Purchase Handlers");
          this.enablePurchaseHandlers();
        } else {
          this.log("Disabling Purchase Handlers");
          this.disablePurchaseHandlers();
        }
      })
    });
    this.handlersToggle.setChecked(true);
    this.enablePurchaseHandlers();

    this.purchaseButton10 = new ButtonView({
      superview: this.view,
      x: buttonPadding,
      y: 400,
      width: buttonWidth,
      height: 50,
      title: "Purchase 10 Gems",
      onClick: bind(this, function () {
        this.purchase('testpurchase10', this.mockBilling);
      })
    });
    this.purchaseButton50 = new ButtonView({
      superview: this.view,
      x: buttonPadding + buttonWidth + buttonPadding,
      y: this.purchaseButton10.style.y,
      width: buttonWidth,
      height: 50,
      title: "Purchase 50 Gems",
      onClick: bind(this, function () {
        this.purchase('testpurchase50', this.mockBilling);
      })
    });
    this.purchaseButtonFail = new ButtonView({
      superview: this.view,
      x: buttonPadding,
      y: this.purchaseButton10.style.y + 100,
      width: buttonWidth,
      height: 50,
      title: "Simulate Purchase Failure",
      onClick: bind(this, function () {
        this.purchase('fail', 'failure');
      })
    });
    this.purchaseButtonCancel = new ButtonView({
      superview: this.view,
      x: buttonPadding + buttonWidth + buttonPadding,
      y: this.purchaseButtonFail.style.y,
      width: buttonWidth,
      height: 50,
      title: "Simulate Purchase Cancel",
      onClick: bind(this, function () {
        this.purchase('fail', 'cancel');
      })
    });

    var logViewY = this.purchaseButton50.style.y +
      this.purchaseButton50.style.height +
      250;

    this.logView = new LogView({
      superview: this.view,
      x: 0,
      y: logViewY,
      width: this.view.style.width,
      height: this.view.style.height - logViewY
    });

    this.overlay = new Overlay({
      superview: this.view,
      x: 0,
      y: 0,
      width: this.view.style.width,
      height: this.view.style.height,
    });

    // listen for market available events
    billing.on('MarketAvailable', bind(this, function (available) {
      logger.log("billing.MarketAvailable", available);
      this.setMarketStatus(available && 'Available' || 'Unavailable');
    }));

    // check if market is available
    this.setMarketStatus(
      billing.isMarketAvailable  && 'Available' || 'Unavailable'
    );

    // restore managed purchases
    // TODO: billing.restore is currently broken
    // billing.restore(this.onRestore);

    // listen for purchases with receipt events
    billing.on('purchaseWithReceipt', bind(this, this.onPurchaseWithReceipt));
  };

  // called to initiate a purchase
  this.purchase = function (itemName, simulate) {
    var logMessage = "Purchasing " + itemName;
    if (simulate === 'simulate') {
      logMessage += " (simulating)";
    } else if (simulate !== void 0) {
      logMessage += " (simulating failure)";
    }
    this.log(logMessage);

    // if purchase handlers enabled
    if (this.handlersToggle.isChecked()) {
      this.overlay.show("Purchasing " + itemName);
    }

    billing.purchase(itemName, simulate);
  };

  // called when a purchase succeeds
  this.onPurchase = function (itemName) {
    this.log("Purchase Successful! Item: " + itemName);
    this.overlay.hide();
  };

  // called when a purchase fails for any reason
  this.onFailure = function (reason, itemName) {
    this.log("Purchase Failed! Item: " + itemName + " Reason: " + reason);
    this.overlay.hide();
  };

  // called after all old purchases are restored
  this.onRestore = function (err) {
    if (err) {
      this.log("Unable to restore purchases: " + err);
    } else {
      this.log("Finished restoring purchases!");
    }
  };

  // called after a purchase - includes the app store specific 'signature'
  // for validating the purchase from an external server
  this.onPurchaseWithReceipt = function (info) {
    this.log("--testgame-- PURCHASE WITH RECEIPT! Item: " + info.sku + " Signature: " + info.signature);
  };

  // helper function to wrap up all the demo logging
  this.log = function (text, success) {
    logger.log(text);
    this.logView.log(text, success);
  };

  // set the market status text
  this.setMarketStatus = function (status) {
    this.log("Market Status Updated: " + status);
    this.marketStatus.setText("Market Status: " + status);
  };

  // remove purchase handlers
  this.disablePurchaseHandlers = function () {
    billing.onPurchase = void 0;
    billing.onFailure = void 0;
  };

  // add purchase handlers
  this.enablePurchaseHandlers = function () {
    billing.onPurchase = bind(this, this.onPurchase);
    billing.onFailure = bind(this, this.onFailure)
  };

});
