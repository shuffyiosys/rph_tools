/******************************************************************************
 * This module handles the importing and exporting of settings in RPH Tools.
 *****************************************************************************/
var settingsModule = (function () {
  var html =
    '<h3 class="rpht_headers" id="settingsHeader">Script Settings</h3>' +
    '<div id="settingsForm" style="display:none;">' +
    '<br />' +
    '<p>Press "Export" to export savable settings.</p>' +
    '<p>To import settings, paste them into the text box and press "Import".</p><br />' +
    '<textarea name="importExportText" id="importExportTextarea" class="rpht_textarea" ></textarea>' +
    '<div class="rpht-block">' +
    '<button style="float: left;" type="button" id="exportButton">Export</button>' +
    '<button style="float: right;"type="button" id="importButton">Import</button>' +
    '</div>' +
    '<br />' +
    '<p style="border-bottom: 2px solid #EEE;">' +
    '<span style="background: #333; position: relative; top: 0.7em;"></span>' +
    '</p><br />' +
    '<button type="button" id="deleteSettingsButton">Delete settings</button>' +
    '<br /><br/>' +
    '</div>' +
    '<br />';
  var confirmDelete = false;

  /****************************************************************************
   * Initializes the modules and the HTML elements it handles.
   ***************************************************************************/
  var init = function () {
    settingsDialog.settings = createDialog('#settingsHeader', '#settingsForm');
    settingsDialog.settings.button.click({
      dialog: settingsDialog.settings
    }, dialogToggle);

    $('#importButton').click(function () {
      settings = $('textarea#importExportTextarea').val().split("|");
      try {
        for (var i = 0; i < settings.length - 1; i++) {
          var settingsJson = JSON.parse(settings[i]);
          console.log('RPHT [Setting Module]: Importing...', settingsJson);
          rphToolsModule.importSettings(settingsJson);
        }
      } catch (err) {
        console.log('RPH Tools[importSettings]: Error importing settings', err);
        markProblem("importExportTextarea", true);
      }
    });

    $('#exportButton').click(function () {
      $('textarea#importExportTextarea').val(rphToolsModule.exportSettings());
    });


    $('#printSettingsButton').click(function () {
      rphToolsModule.printSettings();
    });

    $('#deleteSettingsButton').click(function () {
      if (confirmDelete === false) {
        $('#deleteSettingsButton').text('Press again to delete');
        confirmDelete = true;
      } else if (confirmDelete === true) {
        console.log('RPH Tools[Settings Module]: Deleting settings');
        $('#deleteSettingsButton').text('Delete Settings');
        confirmDelete = false;
        rphToolsModule.deleteSettings();
      }
    });
  }

  /****************************************************************************
   * Public members of the module
   ***************************************************************************/
  return {
    init: init,

    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'Settings Module';
    },
  };
}());
