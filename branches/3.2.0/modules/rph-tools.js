
/*****************************************************************************
 * Main RPH Tools module
 ****************************************************************************/
var rphToolsModule = (function () {
  var modules = [];

  var style =
  '<style>' +
  '.rpht_headers{cursor: pointer; padding-left: 5px; background: #43698D;' + 
  'width: 99%; border-radius: 3px; color:#FFF;}' +
  '.rpht_textarea{background: rgb(255, 255, 255); height: 80px; width: 403px;}' +
  '.rpht-block {text-align: right; margin-top: 10px;}' +
  '.rpht-block label { display: inline-block; font-size: 1em; margin-right: 10px; }' +
  '.rpht-block input[type=checkbox] { width: 14px; margin-right: 286px;}' +
  '</style>';

var html =
  style +
  '<div id="settingsBox" style="display: none; position: absolute; top: 35px; z-index: 9999999; '+ 
  'height: 500px; width: 450px; border-radius: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.7); right: 85px; ' + 
  'background: url(&quot;http://www.rphaven.com/css/img/aero-bg.png&quot;) repeat scroll 0px 0px transparent; padding: 5px;" left="">' +
  '<h3 style="text-align: center; color:#000;">RPH Tools</h3>' +
  '<div id="settingsContainer" style="height: 470px; width: 100%; overflow: auto; background: rgb(51, 51, 51); padding: 10px; border-radius: 5px; font-size: 0.8em;">';

var rpht_css = '<style>' +
  '.rpht_chat_tab {' +
  'position: absolute;' +
  'bottom: 40px;' +
  'height: 40px;' +
  'overflow-x: auto;' +
  'overflow-y: hidden;' +
  'white-space: nowrap;' +
  '}' +

  '.rpht_chat_tab_scroll {' +
  '   height: 60px;' +
  '}' +
  '</style>';

  /****************************************************************************
   * Initializes the modules and the HTML elements it handles.
   * @param addonModules - Modules to add into the system.
   ***************************************************************************/
  var init = function (addonModules) {
    var i;
    modules = addonModules;
    modules.forEach(function(module, index){
      if (module.getHtml) {
        html += module.getHtml();
      }
    });

    html += '</div></div>';
    $('#random-quote').hide();
    $('a.settings').hide();
    $('#top p.right').prepend('<a class="rph-tools settings">Settings</a>');
    $('body').append(html);
    $('head').append(rpht_css);

    settingsDialog.dialog = createDialog('#top a.rph-tools', '#settingsBox');
    settingsDialog.dialog.button.click({
      dialog: settingsDialog.dialog,
      onClose: dialogCloseEvt
    }, dialogToggle);

    for (i = 0; i < modules.length; i++) {
      modules[i].init();
    }

    _on('accounts', function () {
      var users = account.users;
      processAccountEvt(account);
      console.log('RPH Tools[_on.accounts]: Account data blob received', users);
    });
  }

  /****************************************************************************
   * Handler for what happens when the main RPH Tools window closes.
   ***************************************************************************/
  var dialogCloseEvt = function () {
    modules.forEach(function(module, index){
      if (module.saveSettings) {
        module.saveSettings();
      }
    });
  };

  /****************************************************************************
   * Handler for processing the event when account data comes in.
   ***************************************************************************/
  var processAccountEvt = function (account) {
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].processAccountEvt !== undefined) {
        modules[i].processAccountEvt(account);
      }
    }
  };

  /****************************************************************************
   * Initializes the modules and the HTML elements it handles.
   ***************************************************************************/
  var getModule = function (name) {
    var module = null;
    for (var i = 0; i < modules.length && module !== null; i++) {
      if (modules[i].toString() === name) {
        module = modules[i];
      }
    }
    return module;
  };

  /****************************************************************************
   * Prints out the settings into the main textbox for exporting.
   ****************************************************************************/
  var printSettings = function(){
    modules.forEach(function(module, index){
      if (modules[i].getSettings) {
        console.log(modules[i].toString(), modules[i].getSettings);
      }
    });
  }

  /****************************************************************************
   * Imports settings using an object
   ****************************************************************************/
  var importSettings = function (settings) {
    var module = getModule(settings.name);

    if (module !== null) {
      module.loadSettings(settings.settings);
    }
  };

  /****************************************************************************
   * Exports all settings into a JSON string
   ***************************************************************************/
  var exportSettings = function () {
    var settingsString = "";
    modules.forEach(function(module, index){
      if (module.getSettings) {
        var modSettings = {
          name: module.toString(),
          settings: module.getSettings(),
        };
        settingsString += JSON.stringify(modSettings) + "|";
      }
    });
    return settingsString;
  };

  /****************************************************************************
   * Invokes deleting saved settings in modules that can save data.
   ***************************************************************************/
  var deleteSettings = function () {
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].deleteSettings !== undefined) {
        modules[i].deleteSettings();
      }
    }
  };

  /****************************************************************************
   * Public members of the module
   ***************************************************************************/
  return {
    init: init,

    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'RPH Tools Module';
    },

    getModule: getModule,
    exportSettings: exportSettings,
    importSettings: importSettings,
    deleteSettings: deleteSettings
  };
}());
