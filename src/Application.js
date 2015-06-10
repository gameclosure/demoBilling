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
import amplitude;


var ITEMS = {
  'testpurchase10': {price: .99, quantity: 1},
  'testpurchase50': {price: 1.99, quantity: 1}
};

// the google store does not allow localizing more
// than 20 items at once - this demonstrates that
// billing correctly auto-batches these requests
var MANY_ITEMS = {
  'testpurchase10': {price: .99, quantity: 1}
};
for (var i = 0; i < 50; i++) {
  MANY_ITEMS['many_items_test_'+i] = {
    price: 1.00,
    quantity: 1
  }
};
MANY_ITEMS['testpurchase50'] = {price: 1.99, quantity: 1};

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

    this.localizeButton = new ButtonView({
      superview: this.view,
      x: buttonPadding,
      y: this.purchaseButtonFail.style.y + 100,
      width: buttonWidth,
      height: 50,
      title: "Localize Purchases",
      onClick: bind(this, function () {
        this.localizePurchases();
      })
    });

    this.localizeManyButton = new ButtonView({
      superview: this.view,
      x: buttonPadding + buttonWidth + buttonPadding,
      y: this.localizeButton.style.y,
      width: buttonWidth,
      height: 50,
      title: "Localize Many Purchases",
      onClick: bind(this, function () {
        this.localizeManyPurchases();
      })
    });

    this.restoreButton = new ButtonView({
      superview: this.view,
      x: buttonPadding + buttonWidth + buttonPadding,
      y: this.localizeManyButton.style.y + 100,
      width: buttonWidth,
      height: 50,
      title: "Restore Purchases",
      onClick: bind(this, function () {
        this.restorePurchases();
      })
    });

    var logViewY = this.restoreButton.style.y +
      this.restoreButton.style.height +
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

    // listen for localization events
    billing.on("PurchasesLocalized", bind(this, function (data) {
      logger.log("billing.PurchasesLocalized", data);
      var itemIds = Object.keys(data.purchases);
      for (var i = 0; i < itemIds.length; i++) {
        var itemId = itemIds[i];
        var item = data.purchases[itemId];
        this.log('localized item "' + item.title + '"' +
                 " price: " + item.currencyCode + ' ' + item.displayPrice);
        logger.log(item.displayPrice, item.title, item.description);
      }
    }));

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
  this.onPurchase = function (itemName, transactionInfo) {
    this.log("Purchase Successful! Item: " + itemName);

    // if no transactionInfo, use empty object
    transactionInfo = transactionInfo || {};

    console.log("Sending transaction data to amplitude", transactionInfo);


    // find item in our various purchase lists
    var item;
    if (itemName in ITEMS) {
      item = ITEMS[itemName];
    } else if (itemName in MANY_ITEMS) {
      item = MANY_ITEMS[itemName];
    }

    // send to amplitude for tracking and validation
    amplitude.trackRevenue(
      itemName,
      item.price,
      item.quantity,
      transactionInfo.signature,
      transactionInfo.purchaseData
    );

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

  // send a restore event
  this.restorePurchases = function () {
    this.log("restoring purchases");
    billing.restore(bind(this, this.onRestore));
  };

  // send all the purchases to the store for localization
  this.localizePurchases = function () {
    this.log("localizing purchases");
    billing.getLocalizedPurchases(Object.keys(ITEMS));
  };

  // send giant list of purchases to the store for localization
  this.localizeManyPurchases = function () {
    this.log("localizing many purchases");
    billing.getLocalizedPurchases(Object.keys(MANY_ITEMS));
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
