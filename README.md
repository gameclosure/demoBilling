demoBilling
=================

##DevKit Billing Module Demo

Showcases using the billing module to make in app purchases on both the apple
app store and the google play store, including sending purchase validation
information to a third party analytics plugin
([amplitude](https://github.com/gameclosure/amplitude)).

See the [billing module](https://github.com/gameclosure/billing) for api details
and instructions.

![billing
demo](http://storage.googleapis.com/devkit-modules/billing/billing_screenshot.png)


##Usage
Create your own applications on the app store and play store to test real
purchases.


###iOS - App Store
1. create a new application on the app store
1. update the ios section of the manifest to match your
   new application
1. add in app purchases to your application for `testpurchase10` and
   `testpurchase50`

![App Store In App
Purchases](http://storage.googleapis.com/devkit-modules/billing/billing_appstore_purchases.png)


###Android - Google Play Store
1. create a new application on the play store
1. create a release build (`devkit release native-android`) and upload it as an
   alpha release
1. add in app purchases (products) to your application for `testpurchase10` and
   `testpurchase50`
1. publish your application (this requires you to add a bunch of images and
   check a bunch of boxes).
1. (optional) add accounts as testers on your play store account

![Play Store In App
Purchases](http://storage.googleapis.com/devkit-modules/billing/billing_playstore_purchases.png)
