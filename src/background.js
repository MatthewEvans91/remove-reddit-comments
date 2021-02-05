/*
When the plugin icon is clicked, this code will run.

It injects the "removeComments.js" code into the current page.  This is why the user must be logged in & navivated to a reddit.com page for this to work.
*/
chrome.browserAction.onClicked.addListener(function (tab) {
  // for the current tab, inject the "inject.js" file & execute it
  chrome.tabs.executeScript(tab.ib, {
    file: "removeComments.js",
  });
});
