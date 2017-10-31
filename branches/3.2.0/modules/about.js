/******************************************************************************
 * This module handles the "About" section for information on RPH Tools.
 *****************************************************************************/
var aboutModule = (function () {
  var html =
    '<h3 class="rpht_headers" id="aboutHeader">About</h3>' +
    '<div id="aboutHelpForm" style="display:none;">' +
    '<br><p>Click on the "Settings" button again to save your settings!</p>' +
    '<p>You may need to refresh the chat for the settings to take effect.</p>' +
    '<br><p><a href="http://www.rphaven.com/topics.php?id=1#topic=1883&page=1" target="_blank">Report a problem</a> |' +
    '<a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Tools#troubleshooting" target="_blank">Troubleshooting Tips</a> | ' + VERSION_STRING + '</p><br>' +
    '<a href="https://openuserjs.org/install/shuffyiosys/RPH_Tools.user.js" target="_blank">Install latest version</a>' +
    '<br>' +
    '</div>' +
    '<br />';

  var init = function () {
    settingsDialog.about = createDialog('#aboutHeader', '#aboutHelpForm');
    settingsDialog.about.button.click({
        dialog: settingsDialog.about
      },
      dialogToggle);
  };

  return {
    init: init,
    
    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'About Module';
    },
  };
}());
