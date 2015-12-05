// ==UserScript==
// @name       RPH Tools
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Tools
// @version    2.1.0
// @description Adds extended settings to RPH
// @match      http://chat.rphaven.com/
// @copyright  (c)2014 shuffyiosys@github
// @grant      none
// @license    MIT license (https://en.wikipedia.org/wiki/MIT_License)
// ==/UserScript==
/*jshint multistr: true */
/*jshint bitwise: false*/
/*global $:false */

/*****************************************************************************
 * Variables for persistent storage
 /***************************************************************************/
/****************************************************************************
Array that holds all of the user name settings. The settings itself are
 stored in a JSON object.
 "pings":       Names/Words/etc. to use for pinging
 "ping_url":    URL to the audio source for pinging
 "color":       Text color to use when a match is found
 "highlight":   background color to use when a match is found
 "flags":       Bitmask of option flags.
                0 - Settings have been modified
                1 - Bold text
                2 - Italicize text
                3 - Use exact matching
                4 - Case sensitive matching
                5 - Remove room links in chat.
                6 - Show names in chat tabs and textbox
                7 - Remove icons in chat
*****************************************************************************/
var pingSettings = {
  "pings"     : "",
  "ping_url"  : "http://www.storiesinflight.com/html5/audio/flute_c_long_01.wav",
  "color"     : "#000",
  "highlight" : "#FFA",
  "flags"     : 0};

var blockedUsers = [];

/*****************************************************************************
* Variables for session storage
/****************************************************************************/

/* Object for dialog box */
var settingsTool = {state: false};
var pingTool = {state: false};
var diceTool = {state: false};
var blockTool = {state: false};
var modTool = {state: false};
var importExport = {state: false};
var aboutHelpTool = {state: false};

var validSettings = true;

/* Object to hold the audio. */
var snd = null;

/*****************************************************************************
  Stores away messages. Indices are by character ID.
/****************************************************************************/
var awayMessages = {};

/*****************************************************************************
  Flags to store temp settings.
  0 - Autokicking is enabled.
  1 - Ban instead of kick
  2 - Clone detecting is enabled
  3 - Ban clones instead of kick
/****************************************************************************/
var tempSettings = 0;

var roomTracking = {};

var roomNamePairs = {};

var accountFound = false;

// HTML code to be injected into the chat.
var html =
  '<style>' +
    '.rpht_headers{cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;}' +
    '.rpht_textarea{background: rgb(255, 255, 255); height: 80px; width: 403px;}' +
  '</style>' +
  '<div id="settingsBox" style="display: none; position: absolute; top: 35px; z-index: 9999999; height: 500px; width: 450px; border-radius: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.7); right: 85px; background: url(&quot;http://www.rphaven.com/css/img/aero-bg.png&quot;) repeat scroll 0px 0px transparent; padding: 5px;" left="">' +
    '<h3 style="text-align: center; color:#000;">RPH Tools</h3>' +
    '<div id="settingsContainer" style="height: 470px; width: 100%; overflow: auto; background: rgb(51, 51, 51); padding: 10px; border-radius: 5px; font-size: 0.8em;">' +
      '<h3 class="rpht_headers" id="pingHeader">Chat room and PM options</h3>' +
      '<div id="ping_form" style="display:none;">' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>User text color</strong>&nbsp;</span>' +
        '</p><br />' +
        '<p>Username: <select  style="width: 300px; margin-left: 37px;" id="userColorDroplist"></select><br><br>' +
        '<p>Text color: <input style="width: 300px;  margin-left: 40px;" type="text" id="userNameTextColor" name="userNameTextColor" value="#111"></p><br/>' +
        '<button style="margin-left: 338px;" type="button" id="userNameTextColorButton">Set color</button>' +
        '<br />' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>Ping Options</strong>&nbsp;</span>' +
        '</p><br />' +
        '<p>Names to be pinged (comma separated)</p>' +
        '<textarea id="pingNames" class="rpht_textarea" name="pingNames"> </textarea>' +
        '<br /><br />' +
        '<p>Ping URL: <input style="width: 370px; margin-left: 44px;" type="text" id="pingURL" name="pingURL"></p>' +
        '<p>Text Color: <input style="width: 370px; margin-left: 37px;" type="text" id="pingTextColor" name="pingTextColor" value="#000"></p>' +
        '<p>Highlight: <input style="width: 370px; margin-left: 45px;" type="text" id="pingHighlightColor" name="pingHighlightColor" value="#FFA"></p>' +
        '<br>' +
        '<p>Matching options</p>' +
        '<input style="width: 40px;" type="checkbox" id="pingBoldEnable" name="pingBoldEnable"><strong>Bold</strong>' +
        '<input style="width: 40px;" type="checkbox" id="pingItalicsEnable" name="pingItalicsEnable"><em>Italics</em>' +
        '<input style="width: 40px;" type="checkbox" id="pingExactMatch" name="pingExactMatch">Exact match' +
        '<input style="width: 40px;" type="checkbox" id="pingCaseSense" name="pingCaseSense">Case sensitive' +
        '<br>' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>PM Away Messaging</strong>&nbsp; </span>' +
        '</p><br />' +
        '<p>Username: </p>' +
        '<select style="width: 403px;" id="pmNamesDroplist" size="5"></select><br><br>' +
        '<p>Away Message: <input style="margin-left: 14px; width: 300px;" type="text" id="awayMessageTextbox" name="awayMessageTextbox" maxlength="300" placeholder="Away message..."></p>' +
        '<br>' +
        '<p style="margin-left: 285px;"><button type="button" id="setAwayButton">Enable</button> <button type="button" id="removeAwayButton">Disable</button></p>' +
        '<p style="border-bottom: 2px solid #EEE;"><span style="background: #333; position: relative; top: 0.7em;">' +
          '<strong>Extra Options</strong>&nbsp;' +
        '</span></p> <br />' +
        '<input style="width: 40px;" type="checkbox" id="roomLinksDisable" name="roomLinksDisable" checked>No room links' +
        '<input style="width: 40px;" type="checkbox" id="imgIconDisable" name="imgIconDisable">No image icons (in chat)<br>' +
        '<input style="width: 40px;" type="checkbox" id="showUsername" name="showUsername">Show username in tabs & textbox (requires rejoin)' +
        '<br /><br />' +
        '<p>Chat history: <input style="margin-left: 27px; width: 300px;" type="text" id="chatHistory" name="chatHistory" value="300"><br /><br /></p>' +
      '</div>' +
      '<br />' +
     '<h3 class="rpht_headers" id="diceHeader">Random Number Generators</h3>' +
     '<div id="diceForm" style="display:none;">' +
       '<p style="border-bottom: 2px solid #EEE;">' +
         '<span style="background: #333; position: relative; top: 0.7em;"><strong>Type</strong>&nbsp;</span>' +
        '</p> <br />' +
        '<form>' +
          '<input style="width: 50px;" type="radio" name="rng" value="coin" id="coinRadio"> Coin tosser' +
          '<input style="width: 50px;" type="radio" name="rng" value="dice" id="diceRadio" checked> Dice roller' +
          '<input style="width: 50px;" type="radio" name="rng" value="rng" id="rngRadio"> General RNG' +
        '</form>' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>Options</strong>&nbsp;</span>' +
        '</p> <br />' +
        '<div id="diceOptions">' +
          '<p>Number of die  <input style="width: 300px; margin-left: 20px;" type="number" id="diceNum" name="diceNum" max="10" min="1" value="2"></p>' +
          '<p>Sides <input style="width: 300px; margin-left: 69px;" type="number" id="diceSides" name="diceSides" max="100" min="2" value="6"></p><br />' +
          '<input style="width: 40px;" type="checkbox" id="showRollTotals" name="showRollTotals">Show totals <br />' +
        '</div>' +
        '<div id="rngOptions" style="display: none;">' +
          '<p>Minimum: <input style="width: 300px; margin-left: 43px;" type="number" id="rngMinNumber" name="rngMinNumber" max="4294967295" min="-4294967296" value="0"></p>' +
          '<p>Maximum: <input style="width: 300px; margin-left: 39px;" type="number" id="rngMaxNumber" name="rngMaxNumber" max="4294967295" min="-4294967296" value="10"></p>' +
        '</div>' +
        '<button type="button" id="rngButton">Let\'s roll!</button>' +
      '</div>' +
      '<br />' +
      '<h3 class="rpht_headers" id="blockHeader">Blocking</h3>' +
      '<div id="blockForm" style="display:none;">' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>Block</strong>&nbsp;</span>' +
        '</p> <br />' +
        '<p>User: <input style="width: 400px; margin-left: 69px;" type="text" id="nameCheckTextbox" name="nameCheckTextbox" placeholder="User to block"></p>' +
        '<button style="margin-left: 357px;" type="button" id="blockButton">Block</button><br>' +
        '<br />' +
        '<p>Blocked users</p>' +
        '<select style="width: 100%;" size="5" id="blockedDropList"></select>' +
        '<br />' +
        '<button style="margin-left: 341px;" type="button" id="unblockButton">Unblock</button>' +
      '</div>' +
      '<br />' +
      '<h3 class="rpht_headers" id="moddingHeader">Modding</h3>' +
      '<div id="moddingForm" style="display:none;">' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>Mod Commands</strong>&nbsp;</span>' +
        '</p><br />' +
        '<p>This will only work if you\'re actually a mod and you own the user name.</p>' +
        '<br />' +
        '<p>Room-Name pair <select style="width: 300px; margin-left: 4px;" id="roomModSelect"></p>' +
        '<option value=""></option>' +
        '</select><br /><br />' +
        '<p>Room:  <input style="width: 300px; margin-left: 61px;" type="text" id="modRoomTextInput" placeholder="Room"></p>' +
        '<br /><br />' +
        '<p>Mod name: <input style="width: 300px; margin-left: 35px;" type="text" id="modFromTextInput" placeholder="Your mod name"></p>' +
        '<br />' +
        '<p>Message: <input style="width: 300px; margin-left: 45px;" type="text" id="modMessageTextInput" placeholder="Message"></p>' +
        '<br />' +
        '<p>Perform action on these users (semicolon separated with no space between): </p>' +
        '<textarea name="modTargetTextInput" id="modTargetTextInput" class="rpht_textarea"></textarea>' +
        '<br />' +
        '<button type="button" id="kickButton">Kick</button>' +
        '<button style="margin-left: 30px;" type="button" id="banButton">Ban</button>' +
        '<button type="button" id="unbanButton">Unban</button>' +
        '<button style="margin-left: 30px;"type="button" id="modButton">Mod</button>' +
        '<button type="button" id="unmodButton">Unmod</button>' +
        '<br /><br />' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>Flood Detection</strong>&nbsp;</span>' +
        '</p><br />' +
        '<input style="width: 40px;" type="checkbox" id="floodDetectEnable" name="floodDetectEnable">Enable flood detection' +
        '<input style="width: 40px;" type="checkbox" id="floodDetectBan" name="floodDetectBan">Ban instead of kick' +
        '<br /><br />' +
        '<p>Message: <input style="width: 300px; margin-left: 45px;" type="text" id="floodDetectMsg" placeholder="Message"></p>' +
        '<br />' +
        '<p style="border-bottom: 2px solid #EEE;"><span style="background: #333; position: relative; top: 0.7em;">' +
          '<strong>Clone Detection</strong>&nbsp;' +
        '</span></p><br />' +
        '<input style="width: 40px;" type="checkbox" id="cloneDetectEnable" name="cloneDetectEnable">Enable clone detection' +
        '<input style="width: 40px;" type="checkbox" id="cloneDetectBan" name="cloneDetectBan" checked>Ban instead of kick' +
        '<br /><br />' +
        '<p>Message: <input style="width: 300px; margin-left: 45px;" type="text" id="cloneDetectMsg" placeholder="Message"></p><br><br>' +
      '</div>' +
      '<br />' +
      '<h3 class="rpht_headers" id="importExportHeader">Import/Export Settings</h3>' +
      '<div id="importExportForm" style="display:none;">' +
        '<br />' +
        '<p>Press "Export" to export savable settings. To import settings, past them into the text box and press "Import".</p><br />' +
        '<textarea name="importExportText" id="importExportTextarea" class="rpht_textarea" ></textarea>' +
        '<br />' +
        '<button type="button" id="exportButton">Export</button>' +
        '<button style="margin-left: 298px;" type="button" id="importButton">Import</button>' +
        '<br>' +
      '</div>' +
      '<br />' +
      '<h3 class="rpht_headers" id="aboutHelpHeader">About/Help</h3>' +
      '<div id="aboutHelpForm" style="display:none;">' +
        '<br><p>Click on the "More Settings" button again to save your settings!</p>' +
        '<p>You may need to refresh the chat for the settings to take effect.</p>' +
        '<br><p><a href="http://www.rphaven.com/topics.php?id=1#topic=1883&page=1" target="_blank">Report a problem</a> |' +
        '<a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Tools#troubleshooting" target=_blank">Troubleshooting Tips</a> | RPH Tools 2.1.0</p><br>' +
        '<p><button type="button" id="settingsButton">Print settings</button> (open console to see settings)</p>' +
        '<br>' +
      '</div>' +
    '</div>' +
  '</div>';

/* If this doesn't print, something happened with the global vars */
console.log('RPH Tools script start');

/****************************************************************************
 *                          MAIN FUNCTIONS
 ****************************************************************************/
/***************************************************************************
 * @brief: Called when connection to chat is established. If it is, it will
 *         inject the ping settings form to the chat and restore any saved
 *         settings
 ***************************************************************************/
$(function() {
  pingSettings.flags = 96;
  tempSettings = 8;

  _on('accounts', function() {
    if (accountFound === false) {
      var users = account.users;
      for(i = 0; i < users.length; i++) {
        addUserToDroplist(users[i]);
      }
      accountFound = true;
    }
  });

  chatSocket.on('room-users', function(data) {
		var Room = getRoom(data.room);
		_.each(data.users, function(userid) {
      getUserById(userid, function(User) {
        if ((tempSettings & 4) > 0) {
          console.log('RPH Tools - Checking for clones');
          checkForClones(User, Room);
        }
      });
		});
	});

  _on('ignores', function(data) {
    blockUserById(data.ids[0]);
    saveBlockSettings();
  });

  _on('remove-ignore', function(data) {
    var names = document.getElementById("blockedDropList");
    UserChangeIgnore(data.id, false);

    for (var i=0; i<names.length; i++) {
      if (names.options[i].value == data.id )
      names.remove(i);
    }
    blockedUsers.splice(blockedUsers.indexOf(data.id),1);
    saveBlockSettings();
  });

  chatSocket.on('confirm-room-join', function(data) {
    doRoomJoinSetup(data);
  });

  setupPMFunctions();

  /* Set up HTML injection. */
  $('#random-quote').hide();
  $('a.settings').hide();
  $('#top p.right').prepend('<a class="pings settings">Settings</a>');
  $('body').append(html);
  settingsTool.box = $('#settingsBox');
  settingsTool.button = $('#top a.pings');

  /* Load settings. */
  if (typeof(storage) != "undefined") {
    if (localStorage.getItem("chatSettings") !== null) {
      pingSettings = JSON.parse(localStorage.getItem("chatSettings"));
      snd = new Audio(pingSettings.ping_url);
      console.log("RPH Tools - Laoded chat settings: ", pingSettings);
    }

    if (localStorage.getItem("blockedUsers") !== null) {
      var temp_blockedUsers = JSON.parse(localStorage.getItem("blockedUsers"));
      console.log("RPH Tools - Loaded blocked users: ", temp_blockedUsers);

      for (var i = 0; i < temp_blockedUsers.length; i++) {
        if (temp_blockedUsers[i] !== "") {
          blockUserById(parseInt(temp_blockedUsers[i]));
        }
      }
    }
  }

  console.log('RPH Tools - Init complete, setting up dialog box');
  SetUpToolsDialog();
});

/****************************************************************************
 * @brief: Sets up all the ping dialog box GUI handling.
 ****************************************************************************/
function SetUpToolsDialog() {
  settingsTool.button.click(function() {
    if (settingsTool.state === false)
    {
      settingsTool.state = true;
      settingsTool.box.show();
    }
    else
    {
      if ((pingSettings.flags & 1) > 0) {
        console.log('RPH Tools - Chat settings were changed', pingSettings);
        pingSettings.flags &= ~1;
        if (validSettings === true) {
          saveChatSettings(pingSettings);
        }
      }
      else{
        console.log('RPH Tools - No chat settings were changed');
      }
      settingsTool.box.hide();
      settingsTool.state = false;
    }
  });

  ChatSettingsSetup();
  DiceRollSetup();
  BlockingSetup();
  ModdingSetup();
  ImportExportSetup();

  $('#aboutHelpHeader').click(function() {
    if (aboutHelpTool.state === true) {
      $('#aboutHelpForm').hide();
      aboutHelpTool.state = false;
    }
    else{
      $('#aboutHelpForm').show();
      aboutHelpTool.state = true;
    }
  });

  $('#settingsButton').click(function() {
    console.log('RPH Tools - Chat settings', pingSettings);
    console.log('RPH Tools - Blocked users', blockedUsers);
    console.log('RPH Tools - Temp settings', tempSettings);
  });

  console.log('RPH Tools - Dialog box setup complete. RPH Tools is now ready.');
}

/****************************************************************************
 *                  CHAT ROOM AND PM SETTINGS FUNCTIONS
 ****************************************************************************/
/****************************************************************************
 * @brief Sets up the chat settings group.
 *
 * @note  Anything that deals with flags is listed by bit order for sanity's
 *        sake
 ****************************************************************************/
function ChatSettingsSetup() {
  $('#pingHeader').click(function() {
    if (pingTool.state === true) {
      $('#ping_form').hide();
      pingTool.state = false;
    }
    else{
      $('#ping_form').show();
      pingTool.state = true;
      populateSettingsDialog();
    }
  });

  $('#pingNames').blur(function() {
    pingSettings.pings = $('#pingNames').val().replace('\n','').replace('\r','');
    pingSettings.flags |= 1;
  });

  $('#pingURL').blur(function() {
    var ping_url = $('input#pingURL').val();
    if (testPingURL(ping_url) === false) {
      mark_problem('pingURL', true);
      validSettings = false;
    }
    else{
      pingSettings.ping_url = ping_url;
      snd = new Audio(pingSettings.ping_url);
      pingSettings.flags |= 1;
      mark_problem('pingURL', false);
      validSettings = true;
    }
  });

  $('#pingTextColor').blur(function() {
    var ping_color = $('input#pingTextColor').val();
    if (testPingColor(ping_color) === false) {
      mark_problem('pingTextColor', true);
      validSettings = false;
    }
    else{
      pingSettings.color = ping_color;
      pingSettings.flags |= 1;
      mark_problem('pingTextColor', false);
      validSettings = true;
    }
  });

  $('#pingHighlightColor').blur(function() {
    var ping_highlight = $('input#pingHighlightColor').val();
    if (testPingColor(ping_highlight) === false) {
      mark_problem('pingHighlightColor', true);
      validSettings = false;
    }
    else{
      pingSettings.highlight = ping_highlight;
      pingSettings.flags |= 1;
      mark_problem('pingHighlightColor', false);
      validSettings = true;
    }
  });

  $('#pingBoldEnable').change(function() {
    pingSettings.flags ^= 2;
    pingSettings.flags |= 1;
  });

  $('#pingItalicsEnable').change(function() {
    pingSettings.flags ^= 4;
    pingSettings.flags |= 1;
  });

  $('#pingExactMatch').change(function() {
    pingSettings.flags ^= 8;
    pingSettings.flags |= 1;
  });

  $('#pingCaseSense').change(function() {
    pingSettings.flags ^= 16;
    pingSettings.flags |= 1;
  });

  $('#roomLinksDisable').change(function() {
    pingSettings.flags ^= 32;
    pingSettings.flags |= 1;
  });

  $('#showUsername').change(function() {
    pingSettings.flags ^= 64;
    pingSettings.flags |= 1;
  });

  $('#imgIconDisable').change(function() {
    pingSettings.flags ^= 128;
    pingSettings.flags |= 1;
  });

  $('#userNameTextColorButton').click(function() {
    var text_color = $('input#userNameTextColor').val();
    if (testPingColor(text_color) === false ||
      testTextColorRange(text_color) === false) {
      mark_problem('userNameTextColor', true);
    }
    else{
      var userId = $('#userColorDroplist option:selected').val();

      text_color = text_color.substring(1,text_color.length);
      getUserById(userId, function(User) {
        userToEdit = User;
        console.log('Editing color: ', userToEdit , text_color);
        mark_problem('userNameTextColor', false);
        sendToSocket('modify', {userid:userToEdit.props.id, color:text_color});
      });
    }
  });

  $('#pmNamesDroplist').change(function() {
    var userId = $('#pmNamesDroplist option:selected').val();
    var message = '';

    if (awayMessages[userId] !== undefined) {
      message = awayMessages[userId].message;
    }
    document.getElementById("awayMessageTextbox").value = message;
  });

  $('#setAwayButton').click(function() {
    var userId = $('#pmNamesDroplist option:selected').val();
    var name = $("#pmNamesDroplist option:selected").html();
    if (awayMessages[userId] !== undefined) {
      if (awayMessages[userId].enabled === false){
        $("#pmNamesDroplist option:selected").html("[Away]" + name);
      }

      awayMessages[userId].enabled = true;
      awayMessages[userId].message = $('input#awayMessageTextbox').val();
      $("#pmNamesDroplist option:selected").css("background-color", "#FFD800");
      $("#pmNamesDroplist option:selected").prop("selected", false);

    }
    else{
      var awayMsgObj = {
        "usedPmAwayMsg" : false,
        "message"       : "",
        "enabled"       : true
      };
      awayMsgObj.message = $('input#awayMessageTextbox').val();
      awayMessages[userId] = awayMsgObj;

      $("#pmNamesDroplist option:selected").html("[Away]" + name);
      $("#pmNamesDroplist option:selected").css("background-color", "#FFD800");
      $("#pmNamesDroplist option:selected").prop("selected", false);
    }
  });

  $('#removeAwayButton').click(function() {
    var userId = $('#pmNamesDroplist option:selected').val();

    if (awayMessages[userId] !== undefined) {
      if (awayMessages[userId].enabled === true) {
        var name = $("#pmNamesDroplist option:selected").html();

        awayMessages[userId].enabled = false;
        $("#pmNamesDroplist option:selected").html(name.substring(6,name.length));
        $("#pmNamesDroplist option:selected").css("background-color", "");
        $('input#awayMessageTextbox').val("");
      }
    }
  });

  $('#chatHistory').change(function() {
    rph.setSetting('maxHistory', parseInt($(this).val()) );
  });
}

/****************************************************************************
 * @brief Populates the dialog with settings from the gathered settings.
 *
 * @param user_id - ID of username
 ****************************************************************************/
function populateSettingsDialog() {
  $('textarea#pingNames').val(pingSettings.pings);
  $('input#pingURL').val(pingSettings.ping_url);
  $('input#pingTextColor').val(pingSettings.color);
  $('input#pingHighlightColor').val(pingSettings.highlight);

  $('input#pingBoldEnable').prop("checked", (pingSettings.flags & 2) > 0);
  $('input#pingItalicsEnable').prop("checked", (pingSettings.flags & 4) > 0);
  $('input#pingExactMatch').prop("checked", (pingSettings.flags & 8) > 0);
  $('input#pingCaseSense').prop("checked", (pingSettings.flags & 16) > 0);
  $('input#roomLinksDisable').prop("checked", (pingSettings.flags & 32) > 0);
  $('input#showUsername').prop("checked", (pingSettings.flags & 64) > 0);
  $('inputimgIconDisable').prop("checked", (pingSettings.flags & 128) > 0);

  // Prevents populating the dialogue from counting as a change.
  pingSettings.flags &= ~1;
}

/****************************************************************************
 * @brief Tests the ping URL to make sure it ends in .wav, otherwise use
 *        the default ping URL (not sure if .mp3 and the like are supported)
 *
 * @param PingURL - URL to test
 ****************************************************************************/
function testPingURL(PingURL) {
    var match = false;
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    var pingExt = PingURL.slice( (PingURL.length-4), (PingURL.length));

    if (PingURL === '')
    {
      match = true;
    }
    else if (regexp.test(PingURL) === true)
    {
      if (pingExt == ".wav" || pingExt == ".ogg" || pingExt == ".mp3") {
        match = true;
      }
    }
    return match;
}

/****************************************************************************
 * @brief:    Tests the highlight color to make sure it's valid
 * @param:    HighlightColor - String representation of the color.
 *
 * @return:   Returns boolean if the color matches the regex pattern.
 ****************************************************************************/
function testPingColor(HighlightColor) {
  var pattern = new RegExp(/(^#[0-9A-Fa-f]{6}$)|(^#[0-9A-Fa-f]{3}$)/i);
  return pattern.test(HighlightColor);
}

/****************************************************************************
 * @brief:    Tests the color range of the color to ensure its valid
 * @param:    TextColor - String representation of the color.
 *
 * @return:   True if the color is within range, false otherwise.
 ****************************************************************************/
function testTextColorRange(TextColor) {
  var rawHex = TextColor.substring(1,TextColor.length);
  var red = 255;
  var green = 255;
  var blue = 255;

  if (rawHex.length == 3) {
    red = parseInt(rawHex.substring(0,1), 16);
    green = parseInt(rawHex.substring(1,2), 16);
    blue = parseInt(rawHex.substring(2,3), 16);

    if ((red <= 13) && (green <= 13) && (blue <= 13)) {
      return true;
    }
  }
  else if (rawHex.length == 6) {
    red = parseInt(rawHex.substring(0,2), 16);
    green = parseInt(rawHex.substring(2,4), 16);
    blue = parseInt(rawHex.substring(4,6), 16);
    if ((red <= 210) && (green <= 210) && (blue <= 210)) {
      return true;
    }
  }

  console.log('RPH Tools - Text color check failed', rawHex, red, green, blue);
  return false;
}
/****************************************************************************
 * @brief:    Saves the chat and PM settings into local storage
 ****************************************************************************/
function saveChatSettings() {
  localStorage.removeItem("chatSettings");
  localStorage.setItem("chatSettings", JSON.stringify(pingSettings));
  console.log("RPH Tools - Saving chat settings... ", localStorage.getItem("chatSettings"));
}

/****************************************************************************
 * @brief Adds usernames to droplists.
 * @param user_id - ID of username
 ****************************************************************************/
function addUserToDroplist(user_id) {
  getUserById(user_id, function(User) {
    $('#pmNamesDroplist').append('<option value="' + user_id + '">' +
       User.props.name + '</option>');
    $('#userColorDroplist').append('<option value="' + user_id + '">' +
      User.props.name + '</option>');
  });
}
/****************************************************************************
 *                   RANDOM NUMBER GENERATOR FUNCTIONS
 ****************************************************************************/

/****************************************************************************
 * @brief:    Sets up the GUI callbacks and behavior for the RNGs.
 ****************************************************************************/
function DiceRollSetup() {
  $('#diceHeader').click(function() {
    if (diceTool.state === true) {
      $('#diceForm').hide();
      diceTool.state = false;
    }
    else{
      $('#diceForm').show();
      diceTool.state = true;
    }
  });

  $('#diceNum').blur(function() {
    var dieNum = parseInt($('#diceNum').val());
    if (dieNum < 1) {
      $('#diceNum').val(1);
    }
    else if (10 < dieNum) {
      $('#diceNum').val(10);
    }
  });

  $('#diceSides').blur(function() {
    var dieSides = parseInt($('#diceSides').val());
    if (dieSides < 2) {
      $('#diceSides').val(2);
    }
    else if (100 < dieSides) {
      $('#diceSides').val(100);
    }
  });

  $('#rngMinNumber').blur(function() {
    var minNum = parseInt($('#rngMinNumber').val());
    if (minNum < -4294967296) {
      $('#rngMinNumber').val(-4294967296);
    }
    else if (4294967296 < minNum) {
      $('#rngMinNumber').val(4294967296);
    }
  });

  $('#rngMaxNumber').blur(function() {
    var maxNum = parseInt($('#rngMaxNumber').val());
    if (maxNum < -4294967296) {
      $('#rngMaxNumber').val(-4294967296);
    }
    else if (4294967295 < maxNum) {
      $('#rngMaxNumber').val(4294967296);
    }
  });

  $('#rngButton').click(function() {
    if ($('#coinRadio')[0].checked) {
      RunRNG('coin');
    }
    else if ($('#diceRadio')[0].checked) {
      RunRNG('dice');
    }
    else if ($('#rngRadio')[0].checked) {
      RunRNG('rng');
    }
  });

  $('#coinRadio').change(function() {
    DisplayRNG('coin');
  });
  $('#diceRadio').change(function() {
    DisplayRNG('dice');
  });
  $('#rngRadio').change(function() {
    DisplayRNG('rng');
  });

}
/****************************************************************************
 * @brief:    Changes the RNG options being displayed
 * @param:    "option", option to be displayed ("coin", "dice", "rng")
 ****************************************************************************/
function DisplayRNG(option) {
  if (option === 'coin')
  {
    $('#diceOptions').hide();
    $('#rngOptions').hide();
    $('#rngButton').text('Flip it!');
  }
  else if (option === 'dice') {
    $('#diceOptions').show();
    $('#rngOptions').hide();
    $('#rngButton').text('Let\'s roll!');
  }
  else if (option === 'rng') {
    $('#diceOptions').hide();
    $('#rngOptions').show();
    $('#rngButton').text('Randomize!');
  }
}

/****************************************************************************
 * @brief:    Performs an RNG action
 * @param:    "action", Which RNG action to perform ('coin', 'dice', 'rng')
 ****************************************************************************/
function RunRNG(action) {
  var class_name = $('li.active')[0].className.split(" ");
  var room_name = "";
  var this_room = null;
  var userID = parseInt(class_name[2].substring(0,6));
  var new_msg = '';

  /* Populate room name based on if showing usernames is checked. */
  if ((pingSettings.flags & 64) > 0) {
    room_name = $('li.active').find("span:first").text();
  }
  else {
    room_name = $('li.active')[0].textContent.slice(0,-1);
  }
  console.log(room_name);
  this_room = getRoom(room_name);

  if (action == "coin") {
    new_msg = '(( Coin toss: ';
    if (Math.ceil(Math.random() * 2) == 2) {
      new_msg += '**heads!**))';
    }
    else{
      new_msg += '**tails!**))';
    }
  }
  else if (action == "dice") {
    var totals = 0;
    var dieNum = parseInt($('#diceNum').val());
    var dieSides =  parseInt($('#diceSides').val());
    new_msg = '/me rolled ' + dieNum + 'd' + dieSides + ':';

    for(i = 0; i < dieNum; i++) {
      var result = Math.ceil(Math.random() * dieSides);
      if ($('#showRollTotals')[0].checked) {
        totals += result;
      }
      new_msg += ' ';
      new_msg += result;
    }

    if ($('#showRollTotals')[0].checked) {
      new_msg += " (Total amount: " + totals + ")";
    }
  }
  else if (action == "rng") {
    var minNum = parseInt($('#rngMinNumber').val());
    var maxNum =  parseInt($('#rngMaxNumber').val());
    new_msg = '(( Random number generated: **';

    new_msg += Math.floor((Math.random() * (maxNum - minNum) + minNum)) + '** ))';
  }

  this_room.sendMessage(new_msg, userID);
  DisableButtons(action);
}

/****************************************************************************
 * @brief:    Disables the RNG buttons for three seconds.
 ****************************************************************************/
function DisableButtons(action) {
  $('#rngButton').text('Wait...');
  $('#rngRadio')[0].disabled = true;
  $('#diceRadio')[0].disabled = true;
  $('#coinRadio')[0].disabled = true;
  $('#rngButton')[0].disabled = true;

  setTimeout(function() {
    $('#rngRadio')[0].disabled = false;
    $('#diceRadio')[0].disabled = false;
    $('#coinRadio')[0].disabled = false;
    $('#rngButton')[0].disabled = false;
    DisplayRNG(action);
  }, 3000);
}
/****************************************************************************
 *                          BLOCKING FUNCTIONS
 ****************************************************************************/
/****************************************************************************
 * @brief:    Sets up the GUI callbacks and behavior for blocking
 ****************************************************************************/
function BlockingSetup() {
  $('#blockHeader').click(function() {
    if (blockTool.state === true) {
      $('#blockForm').hide();
      blockTool.state = false;
    }
    else{
      $('#blockForm').show();
      blockTool.state = true;
    }
  });

  $('#blockButton').click(function() {
    var userToBlock = null;
    var userName = $('#nameCheckTextbox').val();
    getUserByName(userName, function(User) {
      userToBlock = User;
    });

    if (userToBlock !== null) {
      blockUser(userToBlock);
      saveBlockSettings();
      mark_problem('nameCheckTextbox', false);
    }
    else{
      mark_problem('nameCheckTextbox', true);
    }
  });

  $('#unblockButton').click(function() {
    var names = document.getElementById("blockedDropList");
    var userId = names.options[names.selectedIndex].value;
    UserChangeIgnore(userId, false);
    names.remove(names.selectedIndex);
    blockedUsers.splice(blockedUsers.indexOf(userId),1);
    saveBlockSettings();
  });
}

/****************************************************************************
 * @brief:    Changes the ignore settings for a user
 * @param:    UserId - ID of the user whose ignore settings are being changed
 * @param:    Ignore - Ignore value to set to (true/false)
 ****************************************************************************/
function UserChangeIgnore(UserId, Ignore) {
  getUserById(UserId, function(User) {
    User.blocked = Ignore;
  });
}

/****************************************************************************
 * @brief:    Sets the "block" flag for a user
 * @param:    User - User object for the username being blocked
 ****************************************************************************/
function blockUser(User) {
  /* Check if this user is already in the list. */
  var inList = false;

  for (var i=0; i < blockedUsers.length; i++) {
    if (User.props.id == blockedUsers[i]) {
      inList = true;
    }
  }

  if (inList === false) {
    blockedUsers.push(User.props.id);
    $('#blockedDropList').append('<option value="' + User.props.id + '">' +
                                  User.props.name + '</option>');
    UserChangeIgnore(User.props.id, true);
  }
}

/****************************************************************************
 * @brief:    Blocks a user by their ID
 * @param:    userID - ID of the using being blocked
 *
 * @note:     This is defined here to make lint tools happy about not defining
 *            a function in a loop.
 ****************************************************************************/
function blockUserById(userID) {
  getUserById(userID, function(User) {
    blockUser(User);
  });
}

/****************************************************************************
 * @brief:   Saves the blocked users list into a cookie.
 ****************************************************************************/
function saveBlockSettings() {
  localStorage.removeItem("blockedUsers");
  localStorage.setItem("blockedUsers", JSON.stringify(blockedUsers));
  console.log("RPH Tools - Saving blocked users (storage, session)",
               localStorage.getItem("blockedUsers"), blockedUsers);
}

/****************************************************************************
 *                      MODDING TOOLS FUNCTIONS
 ****************************************************************************/
/****************************************************************************
 * @brief:    Sets up the GUI callbacks and behavior for modding functions
 ****************************************************************************/
function ModdingSetup() {
  $('#moddingHeader').click(function() {
    if (modTool.state === true) {
      $('#moddingForm').hide();
      modTool.state = false;
    }
    else{
      $('#moddingForm').show();
      modTool.state = true;
    }
  });

  $('#roomModSelect').change(function() {
    var roomModPair_sel = document.getElementById("roomModSelect");
    var roomModVal = roomModPair_sel.options[roomModPair_sel.selectedIndex].value;
    if (roomNamePairs[roomModVal] !== undefined) {
      $('input#modRoomTextInput').val(roomNamePairs[roomModVal].room);
      $('input#modFromTextInput').val(roomNamePairs[roomModVal].modName);
    }
    else{
      $('input#modRoomTextInput').val("");
      $('input#modFromTextInput').val("");
    }
  });

  $('#kickButton').click(function() {
    modAction('kick');
  });

  $('#banButton').click(function() {
    modAction('ban');
  });

  $('#unbanButton').click(function() {
    modAction('unban');
  });

  $('#modButton').click(function() {
    modAction('add-mod');
  });

  $('#unmodButton').click(function() {
    modAction('remove-mod');
  });

  $('#floodDetectEnable').change(function() {
    tempSettings ^= 1;
  });
  $('#floodDetectBan').change(function() {
    tempSettings ^= 2;
  });

  $('#cloneDetectEnable').change(function() {
    tempSettings ^= 4;
  });
  $('#cloneDetectBan').change(function() {
    tempSettings ^= 8;
  });

  $('#textFilterEnable').change(function() {
    tempSettings ^= 16;
  });
}

/****************************************************************************
 * @brief:    Performs a modding action
 * @param:    action - string command that has the action.
 ****************************************************************************/
function modAction(action) {
  var targets = $('#modTargetTextInput').val().replace('\n','').replace('\r','');
  targets = targets.split(';');
  console.log('RPH Tools - Target list ', targets);

  for(var i = 0; i < targets.length; i++) {
    emitModAction(action, targets[i]);
  }
}

/****************************************************************************
 * @brief:    Sends off the mod action
 * @param:    action - string command that has the action.
 * @param:    targetName - user name that the action is meant for.
 ****************************************************************************/
function emitModAction(action, targetName) {
  var room = $('input#modRoomTextInput').val();
  var user = $('input#modFromTextInput').val();
  var userId = 0;
  var targetId = 0;
  var target = '';
  var modMessage = ' ';

  getUserByName(targetName, function(Target) {
    targetId = Target.props.id;
    target = Target.props.name;
  });

  getUserByName($('input#modFromTextInput').val(), function(User) {
    userId = User.props.id;
    modMessage += $("input#modMessageTextInput").val();

    if (action === 'add-mod' || action === 'remove-mod') {
      modMessage = '';
    }
    chatSocket.emit(action, {room:room, userid:userId, targetid:targetId, msg:modMessage});

    if (action === 'ban') {
      modMessage = "Banning: " + target + " by: " + user + " In room: " + room;
    }
    else if (action === 'unban') {
      modMessage = "Unbanning: " + target + " by: " + user + " In room: " + room;
    }
    else if (action === 'add-mod') {
      modMessage = "Modding: " + target + " by: " + user + " In room: " + room;
    }
    else if (action === 'remove-mod') {
      modMessage = "Unmodding: " + target + " by: " + user + " In room: " + room;
    }
    else if (action === 'kick') {
      modMessage = "Kicking: " + target + " by: " + user + " In room: " + room;
    }
    console.log('RPH Tools - ', modMessage);
  });
}

/****************************************************************************
 * @brief:    Checks is a username has already entered the room.
 * @param:    User - User that entered the room
 * @param:    Room - Room to check
 ****************************************************************************/
function checkForClones(User, Room) {
  var cloneCount = 0;
  for(var i = 0; i < Room.users.length; i++) {
    if (User.props.id === Room.users[i]) {
      cloneCount ++;
    }
  }

  if (cloneCount >= 5) {
    if (roomTracking[Room.props.name] !== undefined) {
      var kickMsg = $('#cloneDetectMsg')[0].value;
      var action = "kick";

      if ((tempSettings & 8) > 0) {
        action = "ban";
      }
      chatSocket.emit(action,
        {room:Room.props.name,
        userid:roomTracking[Room.props.name]['!mod'],
        targetid:User.props.id, msg:kickMsg});
      console.log("RPH Tools - Kicking the cloner ", User.props.name, "from room", Room.props.name);
    }
  }
}

/****************************************************************************
 *                        IMPORT/EXPORT FUNCTIONS
 ****************************************************************************/
/****************************************************************************
 * @brief:    Sets up callback functions for importing/exporting settings
 ****************************************************************************/
function ImportExportSetup() {
  $('#importExportHeader').click(function() {
    if (importExport.state === true) {
      $('#importExportForm').hide();
      importExport.state = false;
    }
    else{
      $('#importExportForm').show();
      importExport.state = true;
    }
  });

  $('#importButton').click(function() {
    ImportSettings();
  });

  $('#exportButton').click(function() {
    var chatSettings_str = JSON.stringify(pingSettings);
    var blockedUsers_str = JSON.stringify(blockedUsers);
    $('textarea#importExportTextarea').val(chatSettings_str + "|" + blockedUsers_str);
  });
}

/****************************************************************************
 * @brief:    Imports settings from the textarea.
 ****************************************************************************/
function ImportSettings() {
  var settings_str = $('textarea#importExportTextarea').val();
  var chatSettings_str = '';
  var blockedUsers_str = '';
  var temp_pingSettings;
  var temp_blockedUsers;
  var delimiter = settings_str.indexOf("|");

  try{
    chatSettings_str = settings_str.substring(0, delimiter);
    blockedUsers_str = settings_str.substring(delimiter+1, settings_str.length);
    temp_pingSettings = JSON.parse(chatSettings_str);
    temp_blockedUsers = JSON.parse(blockedUsers_str);
  }
  catch (err) {
    console.log('RPH Tools - Error importing settings');
  }

  /* Time to do a lot of checking here. */
  if ( chatSettings_str === '' || blockedUsers_str === '' ||
      temp_pingSettings === undefined || temp_blockedUsers === undefined )
  {
    mark_problem("importExportTextarea", true);
  }
  else{
    pingSettings = temp_pingSettings;
    blockedUsers = [];
    populateSettingsDialog();
    saveChatSettings(pingSettings);

    $('#blockedDropList').find('option').remove().end();
    for (var i = 0; i < temp_blockedUsers.length; i++) {
      if (temp_blockedUsers[i] !== "")
      {
        blockUserById(temp_blockedUsers[i]);
      }
    }
    console.log("RPH Tools - blocked list from import", blockedUsers);
    mark_problem("importExportTextarea", false);
  }
}

/****************************************************************************
 *                              PM FUNCTIONS
 ****************************************************************************/
/****************************************************************************
 * @brief:    Sets up PM callback functions for PM actions
 ****************************************************************************/
function setupPMFunctions() {
  _on('pm', function(data) {
    getUserById(data.to, function(fromUser) {
      /* Remove links */
      if (pingSettings.flags & 32) {
        removeRoomLinksInPM();
      }

      /* Send away message. */
      if (awayMessages[data.from] !== undefined) {
        if (awayMessages[data.from].enabled === true) {
          var awayMsg = awayMessages[data.from].message;
          awayMessages[data.from].usedPmAwayMsg = true;
          sendToSocket('pm', {'from':data.from, 'to':data.to, 'msg':awayMsg, 'target':'all'});
        }
      }
    });
  });

  _on('outgoing-pm', function(data) {
    getUserById(data.from, function(fromUser) {
      /* Remove links */
      if (pingSettings.flags & 32) {
        removeRoomLinksInPM();
      }

      if (awayMessages[data.from] !== undefined) {
        if (awayMessages[data.from].usedPmAwayMsg === false) {
          awayMessages[data.from].enabled = false;
          $('#pmNamesDroplist option').filter(function() {
            return this.value == data.from;
          }).css("background-color", "");
        }
        awayMessages[data.from].usedPmAwayMsg = false;
      }
    });
  });
}

/****************************************************************************
 *                       CHAT MESSAGE OUT FUNCTIONS
 ****************************************************************************/
 /****************************************************************************
 * @brief:    When user joins a room, do the following:
 *            - Set up the .onMessage function for flood detection and pinging
 *            - Add the user's name to the chat tab and textarea
 *            - Set up room tracking for initing flood detection
 *            - Create a room-pair name for the Modding section
 * @param:    room - Room that the user has joined
 ****************************************************************************/
function doRoomJoinSetup(room) {
  var thisRoom = getRoom(room.room);
  var userId = getIdFromChatTab(thisRoom);

  thisRoom.onMessage = function (data) {
    var thisRoom = this;
    if ( account.ignores.indexOf(data.userid) !== -1 ) {
      return;
    }
    postMessage(thisRoom, data);
  };

  if ((pingSettings.flags & 64) > 0) {
    addNameToUI(thisRoom, userId);
  }
  addModFeatures(thisRoom, userId);
}

/****************************************************************************
 * @brief:    Takes a message received in the chat and modifies it if it has
 *            a match for pinging
 * @param:    thisRoom - The room that the message is for.
 * @param:    data - The message for the room
 ****************************************************************************/
function postMessage(thisRoom, data) {
  getUserById(data.userid, function(User) {
    var timestamp = makeTimestamp(data.time);
    var msg = parseMsg(data.msg);
    var classes = '';
    var $el = '';
    var msgHtml = '';

    if ( User.blocked ) {
      return;
    }

    classes = getClasses(User, thisRoom);

    /* Remove any room links. */
    if (pingSettings.flags & 32) {
      var linkMatches = [];

      linkMatches = msg.match(new RegExp('<a class="room-link">(.*?)<\/a>','g'));
      if (linkMatches !== null) {
        for(i = 0; i < linkMatches.length; i++) {
          var prunedMsg = msg.match(new RegExp('>(.*?)<', ''))[1];
          msg = msg.replace(linkMatches[i], prunedMsg);
        }
      }
    }

    /* Detect flooding. Evil multi-nested variable checking. */
    if ( (tempSettings & 0x01) > 0 &&                           /* 1. Is this setting even enabled?*/
          classes.indexOf("mod") === -1 &&                      /* 2. Is the name not a mod? */
          classes.indexOf("owner") === -1  &&                   /* 3. Is the name not an owner? */
          roomTracking[thisRoom.props.name] !== undefined &&    /* 4. Has a tracker been created? */
         (Date.now()/1000 - data.time) < 60                     /* 5. Is the message within a minute of now? */
      ) {
      if (roomTracking[thisRoom.props.name][User.props.id] === undefined) {
        var entry = {
          "rate"      : 0,
          "start_time": data.time,
          "last_time" : data.time
        };
        roomTracking[thisRoom.props.name][User.props.id] = entry;
        console.log("RPH Tools - Adding user to room tracking, ", User.props.name, roomTracking[thisRoom.props.name][User.props.id]);
      }
      else{
        var floodDetected = false;
        var timeDiff = data.time - roomTracking[thisRoom.props.name][User.props.id].last_time;
        roomTracking[thisRoom.props.name][User.props.id].last_time = data.time;

        if (timeDiff <= 1) {
          roomTracking[thisRoom.props.name][User.props.id].rate += 1;
        }
        else if (timeDiff > 1) {
          if (roomTracking[thisRoom.props.name][User.props.id].rate > 0) {
            roomTracking[thisRoom.props.name][User.props.id].rate -= 1;
          }
        }

        if ((data.time - roomTracking[thisRoom.props.name][User.props.id].start_time) > 5) {
          roomTracking[thisRoom.props.name][User.props.id].start_time = data.time;
          roomTracking[thisRoom.props.name][User.props.id].rate = 0;
        }

        if (roomTracking[thisRoom.props.name][User.props.id].rate >= 4) {
          floodDetected = true;
          console.log('RPH Tools - Flood detected.');
        }

        if (floodDetected === true) {
          var kickMsg = $('#floodDetectMsg')[0].value;
          var action = "kick";

          if ((tempSettings & 2) > 0) {
            action = "ban";
          }
          chatSocket.emit(action, {room:thisRoom.props.name, userid:roomTracking[thisRoom.props.name]['!mod'], targetid:User.props.id, msg:kickMsg});
          floodDetected = false;
        }
      }
    }

    /* Add pinging higlights */
    try{
      var testRegex = null;
      testRegex = matchPing(msg);

      if (testRegex !== null) {
        msg = highlightPing(msg, testRegex);
        highlightRoom(thisRoom);
        if (snd !== null) {
            snd.play();
          }
      }
    }
    catch (err) {
      console.log('RPH Tools - I tried pinging D:', err);
      msg = parseMsg(data.msg);
    }

    if ( msg.charAt(0) === '/' && msg.slice(1,3) === 'me') {
      classes += 'action ';
      msg = msg.slice(3);
      msgHtml = '<span class="first">[' + timestamp +
            ']</span>\n<span style="color:#' + User.props.color +
            '"><a class="name" title="[' + timestamp +
            ']" style="color:#' + User.props.color +
            '">'+ User.props.name + '</a>' + msg + '</span>';
    } else {
      msgHtml = '<span class="first">[' + timestamp + ']<a class="name" title="[' +
            timestamp + ']" style="color:#' + User.props.color + '">' +
            User.props.name +
            '<span class="colon">:</span></a></span>\n<span style="color:#' +
            User.props.color+'">' + msg +'</span>';
    }


    if ((pingSettings.flags & 128) > 0) {
      $el = appendMessageTextOnly(msgHtml, thisRoom).addClass(classes);
    }
    else{
      $el = thisRoom.appendMessage(msgHtml).addClass(classes);
    }
    $el.find('br:gt(7)').remove();
  });
}

/****************************************************************************
 * @brief:    Gets the user name's classes that are applicable to it
 * @param:    User - User of the message
 * @param:    thisRoom - Room that the message is being sent to
 ****************************************************************************/
function getClasses(User, thisRoom) {
  var classes = '';
  if ( User.friendOf ) {
    classes += 'friend ';
  }
  if ( isOwnUser(User) ) {
    classes += 'self ';
  }
  if ( isOwnerOf(thisRoom, User) ) {
    classes += 'owner ';
  } else if ( isModOf(thisRoom, User) ) {
    classes += 'mod ';
  }
  if ( isInGroup(thisRoom, User) ) {
    classes += 'group-member ';
  }

  return classes;
}

/****************************************************************************
 * @brief:    Checks if the message has any ping terms
 * @param:    msg - The message for the chat as a string.
 *
 * @return:   Returns the match or null
 ****************************************************************************/
function matchPing(msg) {
  var pingNames = pingSettings.pings.split(',');
  var pingFlags = pingSettings.flags;
  var regexParam = "m";

  if ((pingFlags & 16) === 0) {
    regexParam = 'im';
  }

  for(i = 0; i < pingNames.length; i++) {
    if (pingNames[i] !== "") {
      var regexPattern = pingNames[i].trim();
      if ((pingFlags & 8) > 0) {
        regexPattern = "\\b" + pingNames[i].trim() + "\\b";
      }

      /* Check if search term is not in a link. */
      if (isInLink(pingNames[i], msg) === false) {
        var testRegex = new RegExp(regexPattern, regexParam);
        if (msg.match(testRegex)) {
          return testRegex;
        }
      }
    }
  }

  return null;
}

/****************************************************************************
 * @brief:    Adds highlights to the ping term
 * @param:    msg - Message to be sent to the chat.
 * @param:    testRegex - Regular expression to use to match the term.
 *
 * @param:    Modified msg.
 ****************************************************************************/
function highlightPing(msg, testRegex) {
  var pingFlags = pingSettings.flags;
  var pingColor = pingSettings.color;
  var pingHighlight =  pingSettings.highlight;
  var boldEnabled = "";
  var italicsEnabled = "";

  if ((pingFlags & 2) > 0) {
    boldEnabled = "font-weight: bold; ";
  }

  if ((pingFlags & 4) > 0) {
    italicsEnabled = "font-style:italic; ";
  }
  msg = msg.replace(testRegex, '<span style="color: ' + pingColor +
                    '; background: ' + pingHighlight +'; ' + boldEnabled +
                    italicsEnabled + '">' + msg.match(testRegex) + '</span>');

  return msg;
}

/****************************************************************************
 * @brief:  Adds a highlight to the room's tab
 * @param:  thisRoom - Room where the ping happened.
 ****************************************************************************/
function highlightRoom(thisRoom) {
  //Don't highlight chat tab if the chat is marked as active.
  var testRegex = new RegExp('active', 'im');
  var className = thisRoom.$tabs[0][0].className;
  var pingColor = pingSettings.color;
  var pingHighlight =  pingSettings.highlight;

  if (className.search(testRegex) == -1) {
    thisRoom.$tabs[0].css('background-color', pingHighlight);
    thisRoom.$tabs[0].css('color', pingColor);

    thisRoom.$tabs[0].click(function() {
      thisRoom.$tabs[0].css('background-color', '#333');
      thisRoom.$tabs[0].css('color', '#6F9FB9');

      thisRoom.$tabs[0].hover(
        function() {
         thisRoom.$tabs[0].css('background-color', '#6F9FB9');
         thisRoom.$tabs[0].css('color', '#333');
      },
        function() {
         thisRoom.$tabs[0].css('background-color', '#333');
         thisRoom.$tabs[0].css('color', '#6F9FB9');
      });
    });
  }
}

/****************************************************************************
 * @brief:  Adds user name to chat tab and chat textarea
 * @param:  thisRoom - Room that was entered
 * @param:  userId - ID of the user that entered
 ****************************************************************************/
function addNameToUI(thisRoom, userId) {
  getUserById(userId, function(User) {
    var tabsLen = thisRoom.$tabs.length;
    var idRoomName = thisRoom.$tabs[tabsLen-1][0].className.split(' ')[2];
    var newTabHtml = '<span>' + thisRoom.props.name + '</span><p style="font-size: x-small; position: absolute; top: 12px;">' + User.props.name + '</p>';
    thisRoom.$tabs[tabsLen-1].html(newTabHtml);
    $('<a class="close ui-corner-all">x</a>').on('click', function(ev) {
      ev.stopPropagation();
      chatSocket.emit('leave', {userid:User.props.id, name:thisRoom.props.name});
    }).appendTo( thisRoom.$tabs[tabsLen-1] );
    $('textarea.' + idRoomName).prop('placeholder', 'Post as ' + User.props.name);
    $('textarea.' + idRoomName).css('color', "#" + User.props.color);

    userId = User.props.id;
    userName = User.props.name;
    classes = getClasses(User, thisRoom);
    console.log('RPH Tools - User class:,', User.props.name, classes);
  });
}

/****************************************************************************
 * @brief:  Initializes extra features if user is a mod of the room.
 * @param:  thisRoom - Room that was entered
 * @param:  userId - ID of the user that entered
 ****************************************************************************/
function addModFeatures(thisRoom, userId) {
  getUserById(userId, function(User) {
    var classes = getClasses(User, thisRoom);
    if (classes.indexOf("mod") > -1 ||
        classes.indexOf("owner") > -1 ) {
      var roomNamePair = thisRoom.props.name + ': ' + userName;
      var roomNameValue = thisRoom.props.name + '.' + userId;
      var roomNameObj = {
        'room': thisRoom.props.name,
        'modName': userName,
        'modId': userId
      };

      roomTracking[thisRoom.props.name] = {};
      roomTracking[thisRoom.props.name]['!mod'] = userId;
      console.log("RPH Tools - Room Tracking", roomTracking);

      if (roomNamePairs[roomNameValue] === undefined) {
        roomNamePairs[roomNameValue] = roomNameObj;
        $('#roomModSelect').append('<option value="' + roomNameValue + '">' + roomNamePair + '</option>');
        console.log("RPH Tools - added room mod pair", roomNamePairs);
      }
    }
  });
}
/****************************************************************************
 *                          UTILITY FUNCTIONS
 ****************************************************************************/
/****************************************************************************
 * @brief:    Marks if there's a problem or not.
 * @param:    element - element ID that has the problem
 * @param:    mark - true or false if it has a problem
 ****************************************************************************/
function mark_problem(element, mark) {
  if (mark === true) {
    $("#"+element).css('background', '#FF7F7F');
  }
  else{
    $("#"+element).css('background', '#FFF');
  }
}

/****************************************************************************
 * @brief:    Checks if a search term is in an <a href=...> tag.
 * @param:    searchTerm - String to look for
 * @param:    msg - msg being searched.
 *
 * @return:   True or false if there's a match.
 ****************************************************************************/
function isInLink(searchTerm, msg) {
  var regexp = new RegExp('href=".*?' + searchTerm + '.*?"', '');
  return regexp.test(msg);
}

/****************************************************************************
 * @brief:    Removes links in an incoming PM
 * @note:     This only works on the bottom-most <p> tag.
 ****************************************************************************/
function removeRoomLinksInPM() {
  var messages = $('div#pm-msgs.inner').find('p');
  var linkMatches = [];

  /* Since this covers all of the p tags in the PM window, limit the amount
     of searching done to the last 50 */
  if (messages.length > 50) {
    messages = messages.slice(messages.length-51,messages.length);
  }

  for(msg_idx = 0; msg_idx < messages.length; msg_idx++) {
    var html = messages[msg_idx].innerHTML;

    linkMatches = html.match(new RegExp('<a class="room-link">(.*?)<\/a>','g'));
    if (linkMatches !== null) {
      for(i = 0; i < linkMatches.length; i++) {
        var prunedMsg = linkMatches[i].match(new RegExp('>(.*?)<', ''))[1];
        html = html.replace(linkMatches[i], prunedMsg);
      }

      messages[msg_idx].innerHTML = html;
    }
  }
}

/****************************************************************************
 * @brief:    Gets the user's ID from the chat tab (it's in the class)
 * @param:    thisRoom - Room to get the ID from
 ****************************************************************************/
function getIdFromChatTab(thisRoom) {
  var tabsLen = thisRoom.$tabs.length;
  var className = thisRoom.$tabs[tabsLen-1][0].className;
  var charID = className.match(new RegExp(' [0-9]+', ''))[0];
  charID = charID.substring(1,charID.length);
  return parseInt(charID);
}

/****************************************************************************
 * @brief     Appends message to a room without adding an image icon
 * @param     html - HTML to add to the room.
 * @param     thisRoom - Object to the room receiving the message.
 *
 * @note      This was modified from RPH's original code, which is not covered
 *            by this license.
 ****************************************************************************/
function appendMessageTextOnly(html, thisRoom) {
  var $el = $('<div>\n'+html+'\n</div>').appendTo( thisRoom.$el );
  var extra = 5; //add more if near the bottom
  if ( thisRoom.$el[0].scrollHeight - thisRoom.$el.scrollTop() < 50 ) {
    extra = 60;
  }
  thisRoom.$el.animate({scrollTop: '+='+($el.outerHeight()+extra)}, 180);

  if ( thisRoom.$el.children('div').length > account.settings.maxHistory ) {
    thisRoom.$el.children('div:not(.sys):lt(3)').remove();
  }

  return $el;
}
