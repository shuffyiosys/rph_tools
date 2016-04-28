// ==UserScript==
// @name       RPH Tools
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Tools
// @version    2.3.2a
// @description Adds extended settings to RPH
// @match      http://chat.rphaven.com/
// @copyright  (c)2014 shuffyiosys@github
// @grant      none
// @license    MIT license (https://en.wikipedia.org/wiki/MIT_License)
// ==/UserScript==
/*jshint multistr: true */
/*jshint bitwise: false*/
/*global $:false */

var RPHT_AUTO_JOIN = 1;
var RPHT_PING_BOLD = 2;
var RPHT_PING_ITALICS = 4;
var RPHT_PING_EXACT_MATCH = 8;
var RPHT_PING_CASE_SENSE = 16;
var RPHT_NO_PM_ICONS = 32;
var RPHT_SHOW_NAMES = 64;
var RPHT_NO_ROOM_ICONS = 128;
var RPHT_CLEANUP_RECONNECT = 256;
var RPHT_DIE_MIN = 1;
var RPHT_DIE_MAX = 10;
var RPHT_DIE_SIDE_MIN = 2;
var RPHT_DIE_SIDE_MAX = 100;
var RPHT_RNG_NUM_MIN = -4294967296;
var RPHT_RNG_NUM_MAX = 4294967296;

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
var scriptSettings = {
  "pings"     : "",
  "ping_url"  : "http://chat.rphaven.com/sounds/boop.mp3",
  "color"     : "#000",
  "highlight" : "#FFA",
  "flags"     : 0,
  "pmPingUrl" : "http://chat.rphaven.com/sounds/imsound.mp3",
  "favRooms"  : [],
};

var blockedUsers = [];

/* Object for dialog box */
var settingsDialog = {};

var validSettings = true;

var settingsChanged = false;

var pingSound = null;

var awayMessages = {};

var roomNamePairs = {};

var autoJoinTimer = null;

var versString = 'RPH Tools 2.3.2a';

var html =
  '<style>' +
    '.rpht_headers{cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;}' +
    '.rpht_textarea{background: rgb(255, 255, 255); height: 80px; width: 403px;}' +
    '.rpht-block {text-align: right; margin-top: 10px;}' +
    '.rpht-block label { display: inline-block; font-size: 1em; margin-right: 10px; }' +
    '.rpht-block input[type=checkbox] { width: 14px; margin-right: 286px;}' +
  '</style>' +
  '<div id="settingsBox" style="display: none; position: absolute; top: 35px; z-index: 9999999; height: 500px; width: 450px; border-radius: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.7); right: 85px; background: url(&quot;http://www.rphaven.com/css/img/aero-bg.png&quot;) repeat scroll 0px 0px transparent; padding: 5px;" left="">' +
    '<h3 style="text-align: center; color:#000;">RPH Tools</h3>' +
    '<div id="settingsContainer" style="height: 470px; width: 100%; overflow: auto; background: rgb(51, 51, 51); padding: 10px; border-radius: 5px; font-size: 0.8em;">' +
      '<h3 class="rpht_headers" id="chatSettingsHeader">Chat room</h3>' +
      /* Chat Settings */
      '<div id="chatSettingsForm" style="display:none;">' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>User text color</strong>&nbsp;</span>' +
        '</p>' +
        '<div class="rpht-block"><label>Username:</label><select  style="width: 300px;" id="userColorDroplist"></select></div>'+
        '<div class="rpht-block"><label>Text color:</label><input style="width: 300px;" type="text" id="userNameTextColor" name="userNameTextColor" value="#111"></div>' +
        '<div class="rpht-block"><button type="button" id="userNameTextColorButton">Set color</button></div>' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>Pings</strong>&nbsp;</span>' +
        '</p><br />' +
        '<p>Names to be pinged (comma separated)</p>' +
        '<textarea id="pingNames" class="rpht_textarea" name="pingNames"> </textarea>' +
        '<br /><br />' +
        '<div class="rpht-block"><label>Ping URL:   </label><input style="width: 370px;" type="text" id="pingURL" name="pingURL"></div>' +
        '<div class="rpht-block"><label>Text Color: </label><input style="width: 370px;" type="text" id="pingTextColor" name="pingTextColor" value="#000"></div>' +
        '<div class="rpht-block"><label>Highlight:  </label><input style="width: 370px;" type="text" id="pingHighlightColor" name="pingHighlightColor" value="#FFA"></div>' +
        '<br>' +
        '<p>Matching options</p> <br/>' +
        '<input style="width: 40px;" type="checkbox" id="pingBoldEnable" name="pingBoldEnable"><strong>Bold</strong>' +
        '<input style="width: 40px;" type="checkbox" id="pingItalicsEnable" name="pingItalicsEnable"><em>Italics</em>' +
        '<input style="width: 40px;" type="checkbox" id="pingExactMatch" name="pingExactMatch">Exact match' +
        '<input style="width: 40px;" type="checkbox" id="pingCaseSense" name="pingCaseSense">Case sensitive' +
        '<br /><br />' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>Auto Join Favorite Rooms</strong>&nbsp; </span>' +
        '</p>' +
        '<div class="rpht-block"><label>Enable Auto Join:   </label><input type="checkbox" id="favEnable" name="favEnable"></div>' +
        '<div class="rpht-block"><label>Username: </label><select style="width: 300px;" id="favUserList"></select></div>'+
        '<div class="rpht-block"><label>Room:     </label><input style="width: 370px;" type="text" id="favRoom" name="favRoom"></div>' +
        '<div class="rpht-block"><label>Password: </label><input style="width: 370px;" type="text" id="favRoomPw" name="favRoomPw"></div>' +
        '<div class="rpht-block"><button type="button" id="favAdd">Add</button></div>'+
        '<p>Favorite rooms</p>' +
        '<select style="width: 403px;" id="favRoomsList" size="5"></select><br><br>' +
        '<div class="rpht-block"><button type="button" id="favRemove">Remove</button></div>'+
        '<br>' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>Other Settings</strong>&nbsp; </span>' +
        '</p><br />' +
        '<div class="rpht-block"><label>Chat history: </label><input style="width: 300px;" type="number" id="chatHistory" name="chatHistory" max="65535" min="10" value="300"><br /><br /></div>' +
        '<div class="rpht-block"><label>No image icons in chat</label><input style="margin-right: 10px;" type="checkbox" id="imgIconDisable" name="imgIconDisable"></div>' +
        '<div class="rpht-block"><label>Show username in tabs & textbox (requires rejoin)</label><input style="margin-right: 10px;" type="checkbox" id="showUsername" name="showUsername"></div>' +
        /*'<div class="rpht-block"><label>Cleanup on reconnect</label><input style="margin-right: 10px;" type="checkbox" id="cleanupOnReconnect" name="cleanupOnReconnect"></div>' +*/
      '</div>' +
      '<br />' +
      /* PM Settings */
      '<h3 class="rpht_headers" id="pmSettingsHeader">PM</h3>' +
      '<div id="pmSettingsForm" style="display:none;">'+
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>PM Away System</strong>&nbsp; </span>' +
        '</p><br />' +
        '<p>Username</p>' +
        '<select style="width: 403px;" id="pmNamesDroplist" size="5"></select><br><br>' +
        '<div class="rpht-block"><label>Away Message: </label><input style="width: 300px;" type="text" id="awayMessageTextbox" name="awayMessageTextbox" maxlength="300" placeholder="Away message..."></div>' +
        '<div class="rpht-block"><button type="button" id="setAwayButton">Enable</button> <button type="button" id="removeAwayButton">Disable</button></div>' +
        '<br /><br />' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>Other Settings</strong>&nbsp; </span>' +
        '</p><br />' +
        '<div class="rpht-block"><label>PM Sound:   </label><input style="width: 300px;" type="text" id="pmPingURL" name="pmPingURL"></div><br />' +
        '<div class="rpht-block"><label>Mute PMs:   </label><input type="checkbox" id="pmMute" name="pmMute"></div><br />' +
        '<div class="rpht-block"><label>No Image Icons: </label><input type="checkbox" id="pmIconsDisable" name="pmIconsDisable"></div>' +
      '</div>' +
      '<br />' +
      /* RNG */
      '<h3 class="rpht_headers" id="rngHeader">Random Number Generators</h3>' +
      '<div id="rngForm" style="display:none;">' +
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
          '<div class="rpht-block"><label>Number of die </label><input style="width: 300px;" type="number" id="diceNum" name="diceNum" max="10" min="1" value="2"></div>'+
          '<div class="rpht-block"><label>Sides </label><input style="width: 300px;" type="number" id="diceSides" name="diceSides" max="100" min="2" value="6"></div>'+
          '<div class="rpht-block"><label>Show Totals:</label><input type="checkbox" id="showRollTotals" name="showRollTotals"></div>' +
        '</div>' +
        '<div id="rngOptions" style="display: none;">' +
          '<div class="rpht-block"><label>Minimum: </label><input style="width: 300px;" type="number" id="rngMinNumber" name="rngMinNumber" max="4294967295" min="-4294967296" value="0"></div>' +
          '<div class="rpht-block"><label>Maximum: </label><input style="width: 300px;" type="number" id="rngMaxNumber" name="rngMaxNumber" max="4294967295" min="-4294967296" value="10"></div>' +
        '</div>' +
        '<div class="rpht-block"><button type="button" id="rngButton">Let\'s roll!</button></div>' +
      '</div>' +
      '<br />' +
      '<h3 class="rpht_headers" id="blockHeader">Blocking</h3>' +
      '<div id="blockForm" style="display:none;">' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>Block</strong>&nbsp;</span>' +
        '</p>' +
        '<div class="rpht-block"><label>User:</label><input style="width: 400px;" type="text" id="nameCheckTextbox" name="nameCheckTextbox" placeholder="User to block"></div>' +
        '<div class="rpht-block"><button style="margin-left: 357px;" type="button" id="blockButton">Block</button></div></ br>' +
        '<br />' +
        '<p>Blocked users</p>' +
        '<select style="width: 100%;" size="5" id="blockedDropList"></select>' +
        '<div class="rpht-block"><button style="margin-left: 341px;" type="button" id="unblockButton">Unblock</button></div>' +
      '</div>' +
      '<br />' +
      /* Modding */
      '<h3 class="rpht_headers" id="moddingHeader">Modding</h3>' +
      '<div id="moddingForm" style="display:none;">' +
        '<p style="border-bottom: 2px solid #EEE;">' +
          '<span style="background: #333; position: relative; top: 0.7em;"><strong>Mod Commands</strong>&nbsp;</span>' +
        '</p><br />' +
        '<p>This will only work if you\'re actually a mod and you own the user name.</p>' +
        '<br />' +
        '<div class="rpht-block"><label>Room-Name pair</label> <select style="width: 300px;" id="roomModSelect">' +
          '<option value=""></option>' +
        '</select></div>' +
        '<div class="rpht-block"><label>Room:</label><input style="width: 300px;" type="text" id="modRoomTextInput" placeholder="Room"></div>' +
        '<div class="rpht-block"><label>Mod name:</label><input style="width: 300px;" type="text" id="modFromTextInput" placeholder="Your mod name"></div>' +
        '<div class="rpht-block"><label>Message:</label><input style="width: 300px;" type="text" id="modMessageTextInput" placeholder="Message"></div>' +
        '<br/><br/>' +
        '<p>Perform action on these users (semicolon separated with no space between): </p>' +
        '<textarea name="modTargetTextInput" id="modTargetTextInput" class="rpht_textarea"></textarea>' +
        '<br />' +
        '<div class="rpht-block">' +
        '<button type="button" id="resetPassword">Reset PW</button>' +
        '<button style="margin-left: 30px;" type="button" id="kickButton">Kick</button>' +
        '<button style="margin-left: 30px;" type="button" id="banButton">Ban</button>' +
        '<button style="margin-left: 6px;" type="button" id="unbanButton">Unban</button>' +
        '<button style="margin-left: 30px;" type="button" id="modButton">Mod</button>' +
        '<button style="margin-left: 6px;" type="button" id="unmodButton">Unmod</button></div>' +
      '</div>' +
      '<br />' +
      /* Script settings */
      '<h3 class="rpht_headers" id="importExportHeader">Script Settings</h3>' +
      '<div id="importExportForm" style="display:none;">' +
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
          /*'<button type="button" id="printSettingsButton">Print settings</button> (open console to see settings) <br /><br />' +*/
          '<button type="button" id="deleteSettingsButton">Delete settings</button>' +
        '<br /><br/>' +
      '</div>' +
      '<br />' +
      /* About */
      '<h3 class="rpht_headers" id="aboutHeader">About</h3>' +
      '<div id="aboutHelpForm" style="display:none;">' +
        '<br><p>Click on the "Settings" button again to save your settings!</p>' +
        '<p>You may need to refresh the chat for the settings to take effect.</p>' +
        '<br><p><a href="http://www.rphaven.com/topics.php?id=1#topic=1883&page=1" target="_blank">Report a problem</a> |' +
        '<a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Tools#troubleshooting" target=_blank">Troubleshooting Tips</a> | '+ versString +'</p><br>' +
        '<br>' +
      '</div>' +
      '<br />' +
    '</div>' +
  '</div>';

/* If this doesn't print, something happened with the global vars */
console.log('RPH Tools start');

/****************************************************************************
 *                          MAIN FUNCTIONS
 ****************************************************************************/
/***************************************************************************
 * @brief: Called when connection to chat is established. If it is, it will
 *         inject the ping settings form to the chat and restore any saved
 *         settings
 ***************************************************************************/
$(function() {
  scriptSettings.flags = RPHT_SHOW_NAMES;

  _on('accounts', function() {
    ProcessAccountEvt(account);
  });

  _on('ignores', function(data) {
    ProcessIngoresEvt(data);
  });

  chatSocket.on('confirm-room-join', function(data) {
    RoomJoinSetup(data);
  });

  _on('pm', function(data) {
    HandleIncomingPm(data);
  });

  _on('outgoing-pm', function(data) {
    HandleOutgoingPm(data);
  });

  chatSocket.on('user-kicked', function(data){
    for(var i=0; i < account.users.length; i++){
      if (data.targetid == account.users[i]){
        $('<div class="inner"><p>You were kicked from '+data.room+'.<br />'+ ' Reason: '+ data.msg + '.</p></div>').dialog().dialog('open');
      }
    }
	});

  chatSocket.on('user-banned', function(data){
    for(var i=0; i < account.users.length; i++){
      if (data.targetid == account.users[i]){
        $('<div class="inner"><p>You were banned from '+data.room+'.<br />'+ ' Reason: '+ data.msg + '.</p></div>').dialog().dialog('open');
      }
    }
	});

  InitRphTools();
});

/*****************************************************************************
 * @brief: Further initialize the script after receiving an account data blob.
 ***************************************************************************/
function InitRphTools(){
  /* Set up HTML injection. */
  $('#random-quote').hide();
  $('a.settings').hide();
  $('#top p.right').prepend('<a class="pings settings">Settings</a>');
  $('body').append(html);

  InitSettingsDialog();
  LoadSettings();

  console.log('RPH Tools[InitRphTools]: Init complete, setting up dialog box');
  SetUpToolsDialog();
}

/****************************************************************************
* 2. GUI SETUP FUNCTION
****************************************************************************/
/****************************************************************************
* @brief: Sets up all the ping dialog box GUI handling.
****************************************************************************/
function SetUpToolsDialog() {
  ChatSettingsSetup();
  PmSettingsSetup();
  DiceRollSetup();
  BlockingSetup();
  ModdingSetup();
  ImportExportSetup();
  AboutFormSetup();

  PopulateSettingsDialog();
  setTimeout(ReblockList, 60*1000);

  if (GetFlagState(RPHT_AUTO_JOIN) === true){
    autoJoinTimer = setInterval(JoinFavoriteRooms, 5*1000);
  }
  console.log('RPH Tools[SetUpToolsDialog]: Dialog box setup complete. RPH Tools is now ready.');
}

/****************************************************************************
 * @brief Sets up the chat settings group.
 *
 * @note  Anything that deals with flags is listed by bit order for sanity's
 *        sake
 ****************************************************************************/
function ChatSettingsSetup() {
  settingsDialog.chat.button.click(function() {
    if (settingsDialog.chat.state === true) {
      settingsDialog.chat.form.hide();
      settingsDialog.chat.state = false;
    }
    else{
      settingsDialog.chat.form.show();
      settingsDialog.chat.state = true;
    }
  });

  $('#pingNames').blur(function() {
    scriptSettings.pings = $('#pingNames').val().replace('\n','').replace('\r','');
    settingsChanged = true;
  });

  $('#pingURL').blur(function() {
    UpdateChatPmSetting('pingURL', 'ping_url');
  });

  $('#pingTextColor').blur(function() {
    UpdateChatPmSetting('pingTextColor', 'color');
  });

  $('#pingHighlightColor').blur(function() {
    UpdateChatPmSetting('pingHighlightColor', 'highlight');
  });

  $('#pingBoldEnable').change(function() {
    ToggleFlag(RPHT_PING_BOLD);
  });

  $('#pingItalicsEnable').change(function() {
    ToggleFlag(RPHT_PING_ITALICS);
  });

  $('#pingExactMatch').change(function() {
    ToggleFlag(RPHT_PING_EXACT_MATCH);
  });

  $('#pingCaseSense').change(function() {
    ToggleFlag(RPHT_PING_CASE_SENSE);
  });

  $('#showUsername').change(function() {
    ToggleFlag(RPHT_SHOW_NAMES);
  });

  $('#imgIconDisable').change(function() {
    ToggleFlag(RPHT_NO_ROOM_ICONS);
  });

  $('#favEnable').click(function(){
    ToggleFlag(RPHT_AUTO_JOIN);
    SaveChatSettings();
  });

  $('#favAdd').click(function(){
    AddFavoriteRoom();
  });

  $('#favRemove').click(function(){
    RemoveFavoriteRoom();
  });

  $('#userNameTextColorButton').click(function() {
    ChangeTextColor();
  });

  $('#chatHistory').change(function() {
    rph.setSetting('maxHistory', parseInt($(this).val()) );
  });
}

/****************************************************************************
 * @brief Sets up PM settings dialog
 *
 * @note  Anything that deals with flags is listed by bit order for sanity's
 *        sake
 ****************************************************************************/
function PmSettingsSetup() {
  settingsDialog.pm.button.click(function() {
    if (settingsDialog.pm.state === true) {
      settingsDialog.pm.form.hide();
      settingsDialog.pm.state = false;
    }
    else{
      settingsDialog.pm.form.show();
      settingsDialog.pm.state = true;
    }
  });

  $('#pmPingURL').change(function(){
    UpdateChatPmSetting('pmPingURL', 'pmPingUrl');
  });

  $('#pmMute').change(function(){
    if ($('#pmMute').is(":checked")){
      $('#im-sound').children("audio").attr('src', '');
    }
    else {
      $('#im-sound').children("audio").attr('src', scriptSettings.pmPingUrl);
    }
  });

  $('#pmIconsDisable').change(function() {
    ToggleFlag(RPHT_NO_PM_ICONS);
  });

  $('#pmNamesDroplist').change(function() {
    var userId = $('#pmNamesDroplist option:selected').val();
    var message = '';

    if (awayMessages[userId] !== undefined) {
      message = awayMessages[userId].message;
    }
    $('input#awayMessageTextbox').val(message);
  });

  $('#setAwayButton').click(function() {
    SetPmAway();
  });

  $('#removeAwayButton').click(function() {
    RemovePmAway();
  });
}

/****************************************************************************
* @brief:    Sets up the GUI callbacks and behavior for the RNGs.
****************************************************************************/
function DiceRollSetup() {
  settingsDialog.rng.button.click(function() {
    if (settingsDialog.rng.state === true) {
      settingsDialog.rng.form.hide();
      settingsDialog.rng.state = false;
    }
    else{
      settingsDialog.rng.form.show();
      settingsDialog.rng.state = true;
    }
  });

  $('#diceNum').blur(function() {
    var dieNum = parseInt($('#diceNum').val());
    if (dieNum < RPHT_DIE_MIN) {
      $('#diceNum').val(RPHT_DIE_MIN);
    }
    else if (RPHT_DIE_MAX < dieNum) {
      $('#diceNum').val(RPHT_DIE_MAX);
    }
  });

  $('#diceSides').blur(function() {
    var dieSides = parseInt($('#diceSides').val());
    if (dieSides < RPHT_DIE_SIDE_MIN) {
      $('#diceSides').val(RPHT_DIE_SIDE_MIN);
    }
    else if (RPHT_DIE_SIDE_MAX < dieSides) {
      $('#diceSides').val(RPHT_DIE_SIDE_MAX);
    }
  });

  $('#rngMinNumber').blur(function() {
    var minNum = parseInt($('#rngMinNumber').val());
    if (minNum < RPHT_RNG_NUM_MIN) {
      $('#rngMinNumber').val(RPHT_RNG_NUM_MIN);
    }
    else if (RPHT_RNG_NUM_MAX < minNum) {
      $('#rngMinNumber').val(RPHT_RNG_NUM_MAX);
    }
  });

  $('#rngMaxNumber').blur(function() {
    var maxNum = parseInt($('#rngMaxNumber').val());
    if (maxNum < RPHT_RNG_NUM_MIN) {
      $('#rngMaxNumber').val(RPHT_RNG_NUM_MIN);
    }
    else if (RPHT_RNG_NUM_MAX < maxNum) {
      $('#rngMaxNumber').val(RPHT_RNG_NUM_MAX);
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
    ChangeRngDisplay('coin');
  });
  $('#diceRadio').change(function() {
    ChangeRngDisplay('dice');
  });
  $('#rngRadio').change(function() {
    ChangeRngDisplay('rng');
  });

}

/****************************************************************************
* @brief:    Sets up the GUI callbacks and behavior for blocking
****************************************************************************/
function BlockingSetup() {
  settingsDialog.blocking.button.click(function() {
    if (settingsDialog.blocking.state === true) {
      settingsDialog.blocking.form.hide();
      settingsDialog.blocking.state = false;
    }
    else{
      settingsDialog.blocking.form.show();
      settingsDialog.blocking.state = true;
    }
  });

  $('#blockButton').click(function() {
    var userName = $('#nameCheckTextbox').val();
    BlockUserByName(userName);
  });

  $('#unblockButton').click(function() {
    RemoveFromBlockList();
  });
}

/****************************************************************************
* @brief:    Sets up the GUI callbacks and behavior for modding functions
****************************************************************************/
function ModdingSetup() {
  settingsDialog.modding.button.click(function() {
    if (settingsDialog.modding.state === true) {
      settingsDialog.modding.form.hide();
      settingsDialog.modding.state = false;
    }
    else{
      settingsDialog.modding.form.show();
      settingsDialog.modding.state = true;
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

  $('#resetPassword').click(function(){
    var room = $('input#modRoomTextInput').val();
    var user = $('input#modFromTextInput').val();
    getUserByName($('input#modFromTextInput').val(), function(User) {
      var userId = User.props.id;
      chatSocket.emit('modify', {room:room, userid:userId, props:{pw:false}});
    });
  });

  $('#kickButton').click(function() {
    ModAction('kick');
  });

  $('#banButton').click(function() {
    ModAction('ban');
  });

  $('#unbanButton').click(function() {
    ModAction('unban');
  });

  $('#modButton').click(function() {
    ModAction('add-mod');
  });

  $('#unmodButton').click(function() {
    ModAction('remove-mod');
  });
}

/****************************************************************************
 * @brief:    Sets up callback functions for importing/exporting settings
 ****************************************************************************/
function ImportExportSetup() {
  settingsDialog.importExport.button.click(function() {
    if (settingsDialog.importExport.state === true) {
      settingsDialog.importExport.form.hide();
      settingsDialog.importExport.state = false;
    }
    else{
      settingsDialog.importExport.form.show();
      settingsDialog.importExport.state = true;
    }
  });

  $('#importButton').click(function() {
    ImportSettings();
  });

  $('#exportButton').click(function() {
    ExportSettings();
  });

  $('#printSettingsButton').click(function() {
    PrintSettings();
  });

  $('#deleteSettingsButton').click(function(){
    DeleteSettings();
  });
}

/****************************************************************************
* @brief:    Sets up callback functions for the about area
****************************************************************************/
function AboutFormSetup(){
  settingsDialog.about.button.click(function() {
    if (settingsDialog.about.state === true) {
      settingsDialog.about.form.hide();
      settingsDialog.about.state = false;
    }
    else{
      settingsDialog.about.form.show();
      settingsDialog.about.state = true;
    }
  });
}

/****************************************************************************
* @brief Populates the dialog with settings from the gathered settings.
*
* @param user_id - ID of username
****************************************************************************/
function PopulateSettingsDialog() {
  $('#pingNames').val(scriptSettings.pings);
  $('#pingURL').val(scriptSettings.ping_url);
  $('#pingTextColor').val(scriptSettings.color);
  $('#pingHighlightColor').val(scriptSettings.highlight);
  $('#pmPingURL').val(scriptSettings.pmPingUrl);

  $('input#favEnable').prop("checked", GetFlagState(RPHT_AUTO_JOIN));
  $('input#pingBoldEnable').prop("checked", GetFlagState(RPHT_PING_BOLD));
  $('input#pingItalicsEnable').prop("checked", GetFlagState(RPHT_PING_ITALICS));
  $('input#pingExactMatch').prop("checked", GetFlagState(RPHT_PING_EXACT_MATCH));
  $('input#pingCaseSense').prop("checked", GetFlagState(RPHT_PING_CASE_SENSE));
  $('input#pmIconsDisable').prop("checked", GetFlagState(RPHT_NO_PM_ICONS));
  $('input#showUsername').prop("checked", GetFlagState(RPHT_SHOW_NAMES));
  $('inputimgIconDisable').prop("checked", GetFlagState(RPHT_NO_ROOM_ICONS));

  for(var i = 0; i < scriptSettings.favRooms.length; i++){
    var favRoomObj = scriptSettings.favRooms[i];
    $('#favRoomsList').append(
      '<option value="' + favRoomObj._id + '">' +
      favRoomObj.user + ": " + favRoomObj.room + '</option>'
    );
  }

  if (scriptSettings.favRooms.length >= 10){
    $('#favAdd').text("Favorites Full");
    $('#favAdd')[0].disabled = true;
  }

  // Prevents populating the dialogue from counting as a change.
  settingsChanged = false;
}

/****************************************************************************
 * @brief Changes the character's text color.
 *
 ****************************************************************************/
function ChangeTextColor(){
  var text_color = $('input#userNameTextColor').val();
  if (ValidateColor(text_color) === false ||
    ValidateColorRange(text_color) === false) {
    MarkProblem('userNameTextColor', true);
  }
  else{
    var userId = $('#userColorDroplist option:selected').val();

    text_color = text_color.substring(1,text_color.length);
    getUserById(userId, function(User) {
      MarkProblem('userNameTextColor', false);
      sendToSocket('modify', {userid:User.props.id, color:text_color});
    });
  }
}

/****************************************************************************
 * @brief Adds a room and user to the favorite's list
 *
 ****************************************************************************/
function AddFavoriteRoom(){
  var room =  getRoom($('#favRoom').val());

  if (room === undefined){
    MarkProblem('favRoom', true);
    return;
  }

  if (scriptSettings.favRooms.length < 10){
    var favExists = false;
    var hashStr = $('#favRoom').val() + $('#favUserList option:selected').html();
    var favRoomObj = {
        _id: hashStr.hashCode(),
        user : $('#favUserList option:selected').html(),
        userId: parseInt($('#favUserList option:selected').val()),
        room : $('#favRoom').val(),
        roomPw : $('#favRoomPw').val()
      };

    MarkProblem('favRoom', false);
    if (ArrayObjectIndexOf(scriptSettings.favRooms, "_id", favRoomObj._id) === -1){
      $('#favRoomsList').append(
        '<option value="' + favRoomObj._id + '">' +
        favRoomObj.user + ": " + favRoomObj.room + '</option>'
      );
      scriptSettings.favRooms.push(favRoomObj);
      console.log('RPH Tools[AddFavoriteRoom]: Added favorite room', favRoomObj);
    }

    if (scriptSettings.favRooms.length >= 10){
      $('#favAdd').text("Favorites Full");
      $('#favAdd')[0].disabled = true;
    }
  }
  SaveChatSettings();
}

/****************************************************************************
 * @brief Removes a room and user to the favorite's list
 *
 ****************************************************************************/
function RemoveFavoriteRoom(){
  var favItem = document.getElementById("favRoomsList");
  var favItemId = $('#favRoomsList option:selected').val();
  favItem.remove(favItem.selectedIndex);

  for(var favs_i = 0; favs_i < scriptSettings.favRooms.length; favs_i++){
    if (scriptSettings.favRooms[favs_i]._id == favItemId){
      scriptSettings.favRooms.splice(favs_i, 1);
      break;
    }
  }

  if (scriptSettings.favRooms.length < 10){
    $('#favAdd').text("Add");
    $('#favAdd')[0].disabled = false;
  }

  SaveChatSettings();
}

/****************************************************************************
* @brief      Automatically joins rooms in the saved list.
*
****************************************************************************/
function JoinFavoriteRooms(){
  if (roomnames.length > 10){
    for(var i = 0; i < scriptSettings.favRooms.length; i++){
      var favRoom = scriptSettings.favRooms[i];
      chatSocket.emit('join', {name:favRoom.room, userid:favRoom.userId, pw:favRoom.roomPw});
    }

    if (autoJoinTimer !== null){
      clearTimeout(autoJoinTimer);
    }
  }
}

/****************************************************************************
PM functions
****************************************************************************/
/****************************************************************************
* @brief:    Sets up PM Away Messages
****************************************************************************/
function SetPmAway(){
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

    console.log('RPH Tools[ChatSettingsSetup]: Setting away message for', name, 'with message', awayMessages[userId].message);
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
}

/****************************************************************************
* @brief:    Removes PM away message
****************************************************************************/
function RemovePmAway(){
  var userId = $('#pmNamesDroplist option:selected').val();

  if (awayMessages[userId] !== undefined) {
    if (awayMessages[userId].enabled === true) {
      var name = $("#pmNamesDroplist option:selected").html();

      awayMessages[userId].enabled = false;
      $("#pmNamesDroplist option:selected").html(name.substring(6,name.length));
      $("#pmNamesDroplist option:selected").css("background-color", "");
      $('input#awayMessageTextbox').val("");
      console.log('RPH Tools[ChatSettingsSetup]: Remove away message for', name);
    }
  }
}

/****************************************************************************
RNG functions
****************************************************************************/
/****************************************************************************
* @brief:    Changes the RNG options being displayed
* @param:    "option", option to be displayed ("coin", "dice", "rng")
****************************************************************************/
function ChangeRngDisplay(option) {
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
  var outcomeMsg = '';

  /* Populate room name based on if showing usernames is checked. */
  if (GetFlagState(RPHT_SHOW_NAMES)) {
    room_name = $('li.active').find("span:first").text();
  }
  else {
    room_name = $('li.active')[0].textContent.slice(0,-1);
  }

  this_room = getRoom(room_name);

  if (action == "coin") {
    outcomeMsg = Rng_flipCoin();
  }
  else if (action == "dice") {
    outcomeMsg = Rng_rollDice();
  }
  else if (action == "rng") {
    outcomeMsg = Rng_randomNumber();
  }

  outcomeMsg += '\u200b';
  this_room.sendMessage(outcomeMsg, userID);
  DisableRngButtons(action);
}

/****************************************************************************
* @brief:    Generates a coin toss
****************************************************************************/
function Rng_flipCoin(){
  var coinMsg = '(( Coin toss: ';
  if (Math.ceil(Math.random() * 2) == 2) {
    coinMsg += '**heads!**))';
  }
  else{
    coinMsg += '**tails!**))';
  }

  return coinMsg;
}

/****************************************************************************
* @brief:    Generates a dice roll.
****************************************************************************/
function Rng_rollDice(){
  var totals = 0;
  var dieNum = parseInt($('#diceNum').val());
  var dieSides =  parseInt($('#diceSides').val());
  var dieMsg = '/me rolled ' + dieNum + 'd' + dieSides + ':';

  for(i = 0; i < dieNum; i++) {
    var result = Math.ceil(Math.random() * dieSides);
    if ($('#showRollTotals')[0].checked) {
      totals += result;
    }
    dieMsg += ' ';
    dieMsg += result;
  }

  if ($('#showRollTotals')[0].checked) {
    dieMsg += " (Total amount: " + totals + ")";
  }

  return dieMsg;
}

/****************************************************************************
* @brief:    Generates a random number
****************************************************************************/
function Rng_randomNumber(){
  var minNum = parseInt($('#rngMinNumber').val());
  var maxNum =  parseInt($('#rngMaxNumber').val());
  var ranNumMsg = '(( Random number generated (' + minNum + ' to ' + maxNum + '): **';

  ranNumMsg += Math.floor((Math.random() * (maxNum - minNum) + minNum)) + '** ))';

  return ranNumMsg;
}

/****************************************************************************
 * @brief:    Disables the RNG buttons for three seconds.
 ****************************************************************************/
function DisableRngButtons(action) {
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
    ChangeRngDisplay(action);
  }, 3000);
}

/****************************************************************************
Blocking Functions
****************************************************************************/
/****************************************************************************
 * @brief:    Adds a user to the internal and dialog block list.
 * @param:    User - User object for the username being blocked
 ****************************************************************************/
function AddToBlockList(User) {
  /* Check if this user is already in the list. */
  var inList = false;

  for (var i=0; i < blockedUsers.length; i++) {
    if (User.props.id == blockedUsers[i].id) {
      inList = true;
    }
  }

  if (inList === false) {
    blockedUsers.push({id:User.props.id, name:User.props.name});
    $('#blockedDropList').append('<option value="' + User.props.id + '">' +
                                  User.props.name + '</option>');
  }

  console.log('RPH Tools[BlockUser]: Blocking user', User.props.name);
  User.blocked = true;
}

/****************************************************************************
* @brief:    Removes a user from the internal and dialog block list.
****************************************************************************/
function RemoveFromBlockList(){
  var names = document.getElementById("blockedDropList");
  var userId = $('#blockedDropList option:selected').val();
  UnblockUser(userId);
  names.remove(names.selectedIndex);
  blockedUsers.splice(blockedUsers.indexOf(userId),1);
  SaveBlockSettings();
}

/****************************************************************************
* @brief:   Blocks everyone on the list. Used to refresh blocking.
****************************************************************************/
function ReblockList(){
  console.log('RPH Tools[ReblockList]: reblocking everyone');
  for(var i = 0; i < blockedUsers.length; i++){
    BlockUser(blockedUsers[i].id);
  }
}

/****************************************************************************
* @brief:    Sets the blocked flag to true for a user.
* @param:    UserId - ID of the user whose ignore settings are being changed
****************************************************************************/
function BlockUser(UserId) {
  getUserById(UserId, function(User) {
    User.blocked = true;
  });
}

/****************************************************************************
* @brief:    Sets the blocked flag to false for a user.
* @param:    UserId - ID of the user whose ignore settings are being changed
****************************************************************************/
function UnblockUser(UserId){
  getUserById(UserId, function(User) {
    User.blocked = false;
  });
}

/****************************************************************************
* @brief:    Blocks a user by their ID
* @param:    userID - ID of the using being blocked
****************************************************************************/
function BlockUserById(userID) {
  if (userID !== undefined){
    getUserById(userID, function(User) {
      AddToBlockList(User);
      SaveBlockSettings();
    });
  }
}

/****************************************************************************
* @brief:    Blocks a user by their name
* @param:    username - username of the using being blocked
****************************************************************************/
function BlockUserByName(username){
  if (username !== undefined){
    getUserByName(username, function(user){
      AddToBlockList(user);
      SaveBlockSettings();
    });
  }
}

/****************************************************************************
Modding Functions
****************************************************************************/
/****************************************************************************
* @brief:    Performs a modding action
* @param:    action - string command that has the action.
****************************************************************************/
function ModAction(action) {
  var targets = $('#modTargetTextInput').val().replace('\n','').replace('\r','');
  targets = targets.split(';');
  console.log('RPH Tools[ModAction]: Performing', action, 'on', targets);

  for(var i = 0; i < targets.length; i++) {
    EmitModAction(action, targets[i]);
  }
}

/****************************************************************************
* @brief:    Sends off the mod action
* @param:    action - string command that has the action.
* @param:    targetName - user name that the action is meant for.
****************************************************************************/
function EmitModAction(action, targetName) {
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
    console.log('RPH Tools[EmitModAction]:', modMessage);
  });
}

/****************************************************************************
Script settings functions
****************************************************************************/
/****************************************************************************
* @brief:    Imports settings from the textarea.
****************************************************************************/
function ImportSettings() {
  var settings_str = $('textarea#importExportTextarea').val();
  var chatSettings_str = '';
  var blockedUsers_str = '';
  var temp_scriptSettings;
  var temp_blockedUsers;
  var delimiter = settings_str.indexOf("|");

  try{
    chatSettings_str = settings_str.substring(0, delimiter);
    blockedUsers_str = settings_str.substring(delimiter+1, settings_str.length);
    temp_scriptSettings = JSON.parse(chatSettings_str);
    temp_blockedUsers = JSON.parse(blockedUsers_str);

    /* Time to do a lot of checking here. */
    if ( chatSettings_str === '' || blockedUsers_str === '' ||
        temp_scriptSettings === undefined || temp_blockedUsers === undefined )
    {
      MarkProblem("importExportTextarea", true);
    }
    else{
      ExtractChatPmSettings(temp_scriptSettings);
      ExtractBlockSettings(temp_blockedUsers);
      SaveChatSettings(scriptSettings);

      console.log("RPH Tools[ImportSettings]: Importing blocked list", blockedUsers);
      MarkProblem("importExportTextarea", false);
      PopulateSettingsDialog();
    }
  }
  catch (err) {
    console.log('RPH Tools[ImportSettings]: Error importing settings');
    MarkProblem("importExportTextarea", true);
  }
}

/****************************************************************************
* @brief:    Prints out the settings into the main textbox for exporting.
****************************************************************************/
function ExportSettings(){
  var chatSettings_str = JSON.stringify(scriptSettings);
  var blockedUsers_str = JSON.stringify(blockedUsers);
  $('textarea#importExportTextarea').val(chatSettings_str + "|" + blockedUsers_str);
  MarkProblem("importExportTextarea", false);
}

/****************************************************************************
* @brief:    Prints out settings in the console.
****************************************************************************/
function PrintSettings(){
  console.log('RPH Tools[SetUpToolsDialog]: Chat settings', scriptSettings);
  console.log('RPH Tools[SetUpToolsDialog]: Blocked users', blockedUsers);
}

/****************************************************************************
* @brief:     Deletes settings.
* @note:      The user has to press the button twice to delete.
****************************************************************************/
function DeleteSettings(){
  if (settingsDialog.importExport.deleteConfirm === false){
    $('#deleteSettingsButton').text('Press again to delete');
    settingsDialog.importExport.deleteConfirm = true;
  }
  else if (settingsDialog.importExport.deleteConfirm === true){
    $('#deleteSettingsButton').text('Delete Settings');
    settingsDialog.importExport.deleteConfirm = false;
    localStorage.removeItem("chatSettings");
    localStorage.removeItem("blockedUsers");

    scriptSettings = {
      "pings"     : "",
      "ping_url"  : "http://chat.rphaven.com/sounds/boop.mp3",
      "color"     : "#000",
      "highlight" : "#FFA",
      "flags"     : 0,
      "pmPingUrl" : "http://chat.rphaven.com/sounds/imsound.mp3",
      "favRooms"  : []
    };
    PopulateSettingsDialog();
  }
}

/****************************************************************************
PM processing functions
****************************************************************************/
/****************************************************************************
* @brief Handles incoming PMs.
*
* @param data - Data containing the PM.
****************************************************************************/
function HandleIncomingPm(data){
  getUserById(data.to, function(fromUser) {
    /* Send away message. */
    if (awayMessages[data.from] !== undefined) {
      if (awayMessages[data.from].enabled === true) {
        var awayMsg = awayMessages[data.from].message;
        awayMessages[data.from].usedPmAwayMsg = true;
        sendToSocket('pm', {'from':data.from, 'to':data.to, 'msg':awayMsg, 'target':'all'});
      }
    }
  });
}

/****************************************************************************
* @brief Handles outgoing PMs.
*
* @param data - Data containing the PM.
****************************************************************************/
function HandleOutgoingPm(data){
  getUserById(data.from, function(fromUser) {
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
}

/****************************************************************************
Chat message processing functions
****************************************************************************/
 /****************************************************************************
 * @brief:    When user joins a room, do the following:
 *            - Set up the .onMessage function for pinging
 *            - Add the user's name to the chat tab and textarea
 *            - Create a room-pair name for the Modding section
 * @param:    room - Room that the user has joined
 ****************************************************************************/
function RoomJoinSetup(room) {
  var thisRoom = getRoom(room.room);
  var userId = GetIdFromChatTab(thisRoom);

  thisRoom.onMessage = function (data) {
    var thisRoom = this;
    if ( account.ignores.indexOf(data.userid) !== -1 ) {
      return;
    }
    PostMessage(thisRoom, data);
  };

  if (GetFlagState(RPHT_SHOW_NAMES)) {
    AddNameToUI(thisRoom, userId);
  }
  AddModFeatures(thisRoom, userId);
}

/****************************************************************************
* @brief:    Takes a message received in the chat and modifies it if it has
*            a match for pinging
* @param:    thisRoom - The room that the message is for.
* @param:    data - The message for the room
****************************************************************************/
function PostMessage(thisRoom, data) {
  getUserById(data.userid, function(User) {
    var timestamp = makeTimestamp(data.time);
    var msg = parseMsg(data.msg);
    var classes = '';
    var $el = '';
    var msgHtml = '';

    if ( User.blocked ) {
      return;
    }

    classes = GetClasses(User, thisRoom);

    /* Check if this is a valid RNG */
    if (msg[msg.length-1] === '\u200b'){
      msg += '&nbsp;<span style="background:#4A4; color: #000;">☑</span>';
    }

    /* Add pinging higlights */
    try{
      var testRegex = null;
      testRegex = MatchPing(msg);

      if (testRegex !== null) {
        msg = HighlightPing(msg, testRegex);
        HighlightRoom(thisRoom);
        if (pingSound !== null) {
            pingSound.play();
          }
      }
    }
    catch (err) {
      console.log('RPH Tools[PostMessage]: I tried pinging D:', err);
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


    if (GetFlagState(RPHT_NO_ROOM_ICONS)) {
      $el = AppendMessageTextOnly(msgHtml, thisRoom).addClass(classes);
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
function GetClasses(User, thisRoom) {
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
function MatchPing(msg) {
  var pingNames = scriptSettings.pings.split(',');
  var pingFlags = scriptSettings.flags;
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
      if (IsInLink(pingNames[i], msg) === false) {
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
function HighlightPing(msg, testRegex) {
  var pingFlags = scriptSettings.flags;
  var pingColor = scriptSettings.color;
  var pingHighlight =  scriptSettings.highlight;
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
function HighlightRoom(thisRoom) {
  //Don't highlight chat tab if the chat is marked as active.
  var testRegex = new RegExp('active', 'im');
  var className = thisRoom.$tabs[0][0].className;
  var pingColor = scriptSettings.color;
  var pingHighlight =  scriptSettings.highlight;

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
function AddNameToUI(thisRoom, userId) {
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
    classes = GetClasses(User, thisRoom);
    console.log('RPH Tools[AddNameToUI]: User class:,', User.props.name, classes);
  });
}

/****************************************************************************
 * @brief:  Initializes extra features if user is a mod of the room.
 * @param:  thisRoom - Room that was entered
 * @param:  userId - ID of the user that entered
 ****************************************************************************/
function AddModFeatures(thisRoom, userId) {
  getUserById(userId, function(User) {
    var classes = GetClasses(User, thisRoom);
    if (classes.indexOf("mod") > -1 ||
        classes.indexOf("owner") > -1 ) {
      var roomNamePair = thisRoom.props.name + ': ' + userName;
      var roomNameValue = thisRoom.props.name + '.' + userId;
      var roomNameObj = {
        'room': thisRoom.props.name,
        'modName': userName,
        'modId': userId
      };

      if (roomNamePairs[roomNameValue] === undefined) {
        roomNamePairs[roomNameValue] = roomNameObj;
        $('#roomModSelect').append('<option value="' + roomNameValue + '">' + roomNamePair + '</option>');
        console.log("RPH Tools[AddModFeatures]: Added room mod pair", roomNamePairs);
      }
    }
  });
}

/****************************************************************************
*                          UTILITY FUNCTIONS
****************************************************************************/
/****************************************************************************
* @brief Initializes the data structures and initial event handlers for the
*        main dialog.
****************************************************************************/
function InitSettingsDialog(){
 settingsDialog.dialog = {
   button: $('#top a.pings'),
   form: $('#settingsBox'),
   state: false
 };

 settingsDialog.chat = {
   button: $('#chatSettingsHeader'),
   form: $('#chatSettingsForm'),
   state: false
 };

 settingsDialog.pm = {
   button: $('#pmSettingsHeader'),
   form: $('#pmSettingsForm'),
   state: false
 };

 settingsDialog.rng = {
   button: $('#rngHeader'),
   form: $('#rngForm'),
   state: false
 };

 settingsDialog.blocking = {
   button: $('#blockHeader'),
   form: $('#blockForm'),
   state: false
 };

 settingsDialog.modding = {
   button: $('#moddingHeader'),
   form: $('#moddingForm'),
   state: false
 };

 settingsDialog.importExport = {
   button: $('#importExportHeader'),
   form: $('#importExportForm'),
   state: false,
   deleteConfirm: false
 };

 settingsDialog.about = {
   button: $('#aboutHeader'),
   form: $('#aboutHelpForm'),
   state: false
 };

 settingsDialog.dialog.button.click(function() {
   if (settingsDialog.dialog.state === false)
   {
     settingsDialog.dialog.form.show();
     settingsDialog.dialog.state = true;
     ReblockList();
   }
   else
   {
     if (settingsChanged === true) {
       console.log('RPH Tools[SetUpToolsDialog]: Chat settings were changed', scriptSettings);
       settingsChanged = false;
       if (validSettings === true) {
         SaveChatSettings(scriptSettings);
       }
     }
     else{
       console.log('RPH Tools[SetUpToolsDialog]: No chat settings were changed');
     }
     settingsDialog.dialog.form.hide();
     settingsDialog.dialog.state = false;
     $('#deleteSettingsButton').text('Delete Settings');
     settingsDialog.importExport.deleteConfirm = false;
   }
 });
}

/****************************************************************************
* @brief Processes account events.
*
* @param account - Data blob countaining the user's account.
****************************************************************************/
function ProcessAccountEvt(account){
  var users = account.users;
  ClearUsersDropLists();
  for(i = 0; i < users.length; i++) {
    AddUserToDroplist(users[i]);
  }
  console.log('RPH Tools[_on.accounts]: Account data blob received, adding users', users);
}

/****************************************************************************
* @brief Processes ignores events.
*
* @param data - Data containing the user being ignored.
****************************************************************************/
function ProcessIngoresEvt(data){
  console.log("RPH Tools[_on.ignores]: Blocking user from ignore button", data.ids[0]);
  if (data.ids[0] !== undefined){
    BlockUserById(data.ids[0]);
  }
}

/****************************************************************************
* @brief Toggles one of the settings flags.
*
* @param flag - Flag mask to toggle.
****************************************************************************/
function ToggleFlag(flag){
 scriptSettings.flags ^= flag;
 settingsChanged = true;
}

/****************************************************************************
* @brief Get the state of the flag
*
* @param flag - Flag mask to check.
****************************************************************************/
function GetFlagState(flag){
  return ((scriptSettings.flags & flag) > 0);
}

/****************************************************************************
* @brief Tests the ping URL to make sure it ends in .wav, otherwise use
*        the default ping URL (not sure if .mp3 and the like are supported)
*
* @param PingURL - URL to test
****************************************************************************/
function ValidateUrl(PingURL) {
  var match = false;
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  var pingExt = PingURL.slice( (PingURL.length-4), (PingURL.length));

  if (PingURL === '') {
    match = true;
  }
  else if (regexp.test(PingURL) === true) {
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
function ValidateColor(HighlightColor) {
  var pattern = new RegExp(/(^#[0-9A-Fa-f]{6}$)|(^#[0-9A-Fa-f]{3}$)/i);
  return pattern.test(HighlightColor);
}

/****************************************************************************
* @brief:    Tests the color range of the color to ensure its valid
* @param:    TextColor - String representation of the color.
*
* @return:   True if the color is within range, false otherwise.
****************************************************************************/
function ValidateColorRange(TextColor) {
  var rawHex = TextColor.substring(1,TextColor.length);
  var red = 255;
  var green = 255;
  var blue = 255;

  /* If the color text is 3 characters, limit it to #DDD */
  if (rawHex.length == 3) {
    red = parseInt(rawHex.substring(0,1), 16);
    green = parseInt(rawHex.substring(1,2), 16);
    blue = parseInt(rawHex.substring(2,3), 16);

    if ((red <= 13) && (green <= 13) && (blue <= 13)) {
      return true;
    }
  }
  /* If the color text is 6 characters, limit it to #D2D2D2 */
  else if (rawHex.length == 6) {
    red = parseInt(rawHex.substring(0,2), 16);
    green = parseInt(rawHex.substring(2,4), 16);
    blue = parseInt(rawHex.substring(4,6), 16);
    if ((red <= 210) && (green <= 210) && (blue <= 210)) {
      return true;
    }
  }

  console.log('RPH Tools[ValidateColorRange]: Color check failed', rawHex, red, green, blue);
  return false;
}

/****************************************************************************
* @brief Adds usernames to droplists.
* @param user_id - ID of username
****************************************************************************/
function AddUserToDroplist(user_id) {
  getUserById(user_id, function(User) {
    $('#pmNamesDroplist').append('<option value="' + user_id + '">' +
      User.props.name + '</option>');
    $('#userColorDroplist').append('<option value="' + user_id + '">' +
      User.props.name + '</option>');
    $('#favUserList').append('<option value="' + user_id + '">' +
      User.props.name + '</option>');
  });
}

/****************************************************************************
* @brief Clears droplists.
****************************************************************************/
function ClearUsersDropLists(){
  $('#pmNamesDroplist').empty();
  $('#userColorDroplist').empty();
  $('#favUserList').empty();
}

/****************************************************************************
 * @brief:    Marks if there's a problem or not.
 * @param:    element - element ID that has the problem
 * @param:    mark - true or false if it has a problem
 ****************************************************************************/
function MarkProblem(element, mark) {
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
function IsInLink(searchTerm, msg) {
  var regexp = new RegExp('href=".*?' + searchTerm + '.*?"', '');
  return regexp.test(msg);
}

/****************************************************************************
* @brief:    Gets the user's ID from the chat tab (it's in the class)
* @param:    thisRoom - Room to get the ID from
****************************************************************************/
function GetIdFromChatTab(thisRoom) {
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
function AppendMessageTextOnly(html, thisRoom) {
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

/****************************************************************************
* @brief      In an array of object, return the first instance where a key
*             matches a value.
*
* @param      objArray - Array of objects
* @param      key - Key to look for
* @param      value - Value of the key to match
* @return     Index of the first instance where the key matches the value, -1
*             otherwise.
****************************************************************************/
function ArrayObjectIndexOf (objArray, key, value) {
  for(var i = 0; i < objArray.length; i++){
    if (objArray[i][key] === value){
      return i;
    }
  }
  return -1;
}

/****************************************************************************
Chat room and PM settings functions
****************************************************************************/
/****************************************************************************
* @brief:   Updates a chat or PM setting.
* @param:   settingId - ID of which setting this
* @param:   pingSetting - Name of setting in scriptSettings to update.
****************************************************************************/
function UpdateChatPmSetting(settingId, pingSetting){
  var validInput = false;
  var input = $('#'+settingId).val();

  switch(pingSetting){
    case "ping_url":
    case "pmPingUrl":
      validInput = ValidateUrl(input);
      break;

    case "color":
    case "highlight":
      validInput = ValidateColor(input);
      break;
  }

  if (validInput === true){
    scriptSettings[pingSetting] = input;

    switch (pingSetting){
      case "ping_url":
        pingSound = new Audio(scriptSettings.ping_url);
        break;
      case "pmPingUrl":
        $('#im-sound').children("audio").attr('src', input);
        break;
    }

    MarkProblem(settingId, false);
    settingsChanged = true;
    validSettings = true;
  }
  else {
    MarkProblem(settingId, true);
    validSettings = false;
  }
}

/****************************************************************************
* @brief:   Extracts the data from locally stored settings.
* @param:   settingsObj - Object that holds the stored settings.
****************************************************************************/
function ExtractChatPmSettings(settingsObj){
  for(var setting in scriptSettings){
    if (settingsObj[setting] !== undefined){
      scriptSettings[setting] = settingsObj[setting];
    }
  }

  pingSound = new Audio(scriptSettings.ping_url);
  $('#im-sound').children("audio").attr('src', scriptSettings.pmPingUrl);
  console.log("RPH Tools[InitRphTools]: Loaded chat settings: ", scriptSettings);
}

/****************************************************************************
* @brief:   Extracts the data from locally stored block users list.
* @param:   blockedUsersStorage - Object that holds the stored list.
****************************************************************************/
function ExtractBlockSettings(blockedUsersStorage){
  console.log("RPH Tools[InitRphTools]: Loaded blocked users: ", blockedUsers);

  for (var i = 0; i < blockedUsersStorage.length; i++) {
    console.log("RPH Tools[InitRphTools]: Blocking user ", blockedUsersStorage[i]);
    if (blockedUsersStorage[i] !== "") {
      var user = blockedUsersStorage[i];
      BlockUserById(user.id);
    }
  }
}

/****************************************************************************
* @brief:    Saves the chat and PM settings into local storage
****************************************************************************/
function SaveChatSettings() {
  localStorage.setItem("chatSettings", JSON.stringify(scriptSettings));
  console.log("RPH Tools[SaveChatSettings]: Saving chat settings... ", localStorage.getItem("chatSettings"));
}

/****************************************************************************
* @brief:   Loads the settings from local storage.
****************************************************************************/
function LoadSettings(){
  if (typeof(storage) != "undefined") {
    if (localStorage.getItem("chatSettings") !== null) {
      var storedSettings = JSON.parse(localStorage.getItem("chatSettings"));
      ExtractChatPmSettings(storedSettings);
    }

    if (localStorage.getItem("blockedUsers") !== null) {
      var blockedUsers = JSON.parse(localStorage.getItem("blockedUsers"));
      ExtractBlockSettings(blockedUsers);
    }
  }
}

/****************************************************************************
* @brief:   Saves the blocked users list into local storage.
****************************************************************************/
function SaveBlockSettings() {
  localStorage.setItem("blockedUsers", JSON.stringify(blockedUsers));
  console.log("RPH Tools[SaveBlockSettings]: Saving blocked users (storage, session)",
               localStorage.getItem("blockedUsers"), blockedUsers);
}
/****************************************************************************
 * @brief     Generates a hash value for a string
 *
 * @note      This was modified from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 ****************************************************************************/
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 31) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

/****************************************************************************
 * @brief:  Creating a new prototype for PM messaging, to make image icons
 *          not show up if desired.
 ****************************************************************************/
Pm.prototype.appendMsg = function(html){
  var $el = $(html);
  this.$msgs.append($el);
  if( this.$typing ){
    $el.insertBefore( this.$typing );
  }
  this.$msgs.animate({scrollTop: '+='+($el.outerHeight()+18)}, 250);

  if (GetFlagState(RPHT_NO_PM_ICONS) === false){
    $el.find('.img-wrapper').each(function(){
      var $this = $(this);
      var url = $this.attr('href');
      var $checker = $('<img src="'+url+'"/>').hide().appendTo('body');
      $checker.load(function(){
        if( $checker.height() <= 90 && $checker.width() <= 120 ){
          $this.replaceWith('<img src="'+url+'" class="smily" />');
        } else {
          $this.before($('<a href="#" />').text('Open in dialog box').bind('click', function(ev){
              ev.preventDefault();
              var matched = html.match(/([http|https]+:\/\/\S*\.(jpg|jpeg|png|gif))/i)[0];
              $('<div class="innerbg smallBorders" style="padding:0 2px;height:100%;"><img src="'+matched+'" /></div>').dialog({
                bgiframe: true, title: 'Image', width: $checker.width()
              });
            }).add(
              $('<span />').text(' - ')
            )
          );
        }
      });
    });
  }
};
