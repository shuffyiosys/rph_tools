// ==UserScript==
// @name       RPH Tools
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Tools
// @version    1.2.6
// @description Adds extended settings to RPH
// @match      http://chat.rphaven.com/
// @copyright  (c)2014 shuffyiosys@github
// @grant      none
// @license    MIT license (https://en.wikipedia.org/wiki/MIT_License)
// ==/UserScript==
/*jshint multistr: true */
/*jshint bitwise: false*/
/*global $:false */

// ==/UserScript==
/*jshint multistr: true */
/*jshint bitwise: false*/
/*global $:false */

/*****************************************************************************
 * Variables for persistent storage
 /***************************************************************************/
// Array that holds all of the user name settings. The settings itself are
// stored in a JSON like object.
// "id":          ID number of the user name
// "name":        User name itself
// "pings":       Names/Words/etc. to use for pinging
// "ping_url":    URL to the audio source for pinging
// "color":       Text color to use when a match is found
// "highlight":   background color to use when a match is found
// "flags":       Bitmask of option flags.
//                0 - Settings have been modified
//                1 - Bold text
//                2 - Italicize text
//                3 - Use exact matching
//                4 - Case sensitive matching
//                5 - Remove room links in chat.
//                6 - Available
//                7 - Remove icons in chat
var pingSettings = {
  "pings"     : "",
  "ping_url"  : "http://www.storiesinflight.com/html5/audio/flute_c_long_01.wav",
  "color"     : "#000",
  "highlight" : "#FFA",
  "flags"     : 32};

var blockedUsers = [];

/*****************************************************************************
 * Variables for session storage
 /***************************************************************************/

// Object for dialog box
var settingsTool = {state: false};
var pingTool = {state: false};
var diceTool = {state: false};
var blockTool = {state: false};
var modTool = {state: false};
var importExport = {state: false};
var aboutHelpTool = {state: false};

var validSettings = true;

// Object to hold the audio.
var snd = null;

var awayMessages = {};

// HTML code to be injected into the chat.
var html = '\
  <div id="settingsBox" style="display: none; position: absolute; top: 35px; z-index: 9999999; height: 500px; width: 480px; border-radius: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.7); right: 85px; background: url(&quot;http://www.rphaven.com/css/img/aero-bg.png&quot;) repeat scroll 0px 0px transparent; padding: 5px;" left="">\
    <h3 style="text-align: center; color:#000;">RPH Tools</h3>\
    <div id="settingsContainer" style="height: 470px; width: 100%; overflow: auto; background: rgb(51, 51, 51); padding: 10px; border-radius: 5px; font-size: 0.8em;">\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="pingHeader">Chat room and PM options</h3>\
      <div id="ping_form" style="display:none;">\
        <p><strong>User text color</strong></p>\
        <p>Enter a user name and text color (RGB hex value with hashtag):</p>\
        <p>Value for each channel cannot exceed D2 for 6 characters or D for 3.</p>\
        <input style="width: 260px;" type="text" id="userNameTextbox" name="userNameTextbox" placeholder="Username">\
        <input style="width: 80px;" type="text" id="userNameTextColor" name="userNameTextColor" value="#111">\
        <button type="button" id="userNameTextColorButton">Set color</button>\
        <br /><br />\
        <p><strong>Ping settings</strong></p>\
        <p>\
          Enter names you want to be pinged. Split them with commas.<br>\
          e.g. Character Name,Example,John Smith\
        </p>\
        <textarea name="pingNames" id="pingNames" style="background: rgb(255, 255, 255); height: 250px; width: 390px;"> </textarea>\
        <br>\
        <p>Ping URL (must be WAV, MP3, or OGG file):</p>\
        <input style="width: 370px;" type="text" id="pingURL" name="pingURL"><br>\
        <p>Text Color (RGB hex value with hashtag, E.g., #ABCDEF):</p>\
        <input style="width: 370px;"type="text" id="pingTextColor" name="pingTextColor" value="#000"><br>\
        <p>Highlight Color (RGB hex value with hashtag, E.g., #ABCDEF):</p>\
        <input style="width: 370px;" type="text" id="pingHighlightColor" name="pingHighlightColor" value="#FFA"><br>\
        <p>Matching options</p>\
        <input style="width: 40px;" type="checkbox" id="pingBoldEnable" name="pingBoldEnable"><strong>Bold</strong>\
        <input style="width: 40px;" type="checkbox" id="pingItalicsEnable" name="pingItalicsEnable"><em>Italics</em>\
        <input style="width: 40px;" type="checkbox" id="pingExactMatch" name="pingExactMatch">Exact match\
        <input style="width: 40px;" type="checkbox" id="pingCaseSense" name="pingCaseSense">Case sensitive\
        <br><br><hr>\
        <p><strong>PM options</strong></p><br />\
        <p>Away message:</p>\
        <p>Select a name to be away, set its away message, then press "Enable". To\
           turn off away messages for that name, select it and press "Disable". Names\
           that are away will be marked.</p>\
        <select style="width: 300px;" id="pmNamesDroplist" size="5"></select><br><br>\
        <input style="width: 400px;" type="text" id="awayMessageTextbox" name="awayMessageTextbox" maxlength="300" placeholder="Away message...">\
        <button type="button" id="setAwayButton">Enable</button>\
        <button type="button" id="removeAwayButton">Disable</button>\
        <br><br><hr>\
        <p><strong>Extra options</strong></p><br />\
        <input style="width: 40px;" type="checkbox" id="roomLinksDisable" name="roomLinksDisable" checked>No room links\
        <input style="width: 40px;" type="checkbox" id="imgIconDisable" name="imgIconDisable">No image icons (in chat)\
      </div>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="diceHeader">Random Number Generators</h3>\
      <div id="diceForm" style="display:none;">\
        <p><strong>Coin tosser</strong></p>\
        <br />\
        <button type="button" id="coinTossButton">Flip it!</button>\
        <hr>\
        <p><strong>Dice roller</strong></p>\
        <br />\
        <p>Number of die <span style="margin-left: 100px;">Sides</span></p>\
        <input style="width: 80px;" type="number" id="diceNum" name="diceNum" max="10" min="1" value="2">\
        <input style="width: 80px; margin-left: 100px;" type="number" id="diceSides" name="diceSides" max="100" min="2" value="6">\
        <br />\
        <button type="button" id="diceButton">Let\'s Roll!</button>\
        <hr>\
        <p><strong>General RNG</strong></p>\
        <br />\
        <p>Minimum (inclusive)</p>\
        <input style="width: 200px;" type="number" id="rngMinNumber" name="rngMinNumber" max="4294967295" min="-4294967296" value="0">\
        <br />\
        <p>Maximum (exclusive)</p>\
        <input style="width: 200px;" type="number" id="rngMaxNumber" name="rngMaxNumber" max="4294967295" min="-4294967296" value="10">\
        <br />\
        <button type="button" id="rngButton">Randomize!</button>\
      </div>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="blockHeader">Friends/Blocking</h3>\
      <div id="blockForm" style="display:none;">\
        <br>\
        <p>Enter user name to block.</p>\
        <input style="width: 400px;" type="text" id="nameCheckTextbox" name="nameCheckTextbox" placeholder="User to block">\
        <button type="button" id="blockButton">Block</button><br>\
        <br />\
        <p>Blocked users</p>\
        <select style="width: 100%;" size="5" id="blockedDropList"></select>\
        <br />\
        <button type="button" id="unblockButton">Unblock</button>\
      </div>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="moddingHeader">Mod Commands</h3>\
      <div id="moddingForm" style="display:none;">\
        <br>\
        <p>This will only work if you\'re actually a mod and you own the user name.</p>\
        <br />\
        <p>Room</p>\
        <input style="width: 100%;" type="text" id="modRoomTextInput" placeholder="Room">\
        <br />\
        <p>Your username that\'s a mod</p>\
        <input style="width: 100%;" type="text" id="modFromTextInput" placeholder="Your username">\
        <br />\
        <p id="modMessageLabel">Message</p>\
        <input style="width: 100%;" type="text" id="modMessageTextInput" placeholder="Message">\
        <br />\
        <p>Perform action on these users (separate each name with a semi-colon, no space between names): </p>\
        <textarea name="modTargetTextInput" id="modTargetTextInput" style="background: rgb(255, 255, 255); height: 100px; width: 390px;"></textarea>\
        <br />\
        <button type="button" id="kickButton">Kick</button>\
        <button style="margin-left: 30px;" type="button" id="banButton">Ban</button>\
        <button type="button" id="unbanButton">Unban</button>\
        <button style="margin-left: 30px;"type="button" id="modButton">Mod</button>\
        <button type="button" id="unmodButton">Unmod</button>\
      </div>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="importExportHeader">Import/Export Settings</h3>\
      <div id="importExportForm" style="display:none;">\
        <br />\
        <p>Press "Export" to export savable settings. To import settings, past them into the text box and press "Import".</p><br />\
        <textarea name="importExportText" id="importExportTextarea" style="background: rgb(255, 255, 255); height: 250px; width: 390px;"></textarea>\
        <button type="button" id="exportButton">Export</button>\
        <button style="margin-left: 288px;" type="button" id="importButton">Import</button>\
        <br>\
      </div>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="aboutHelpHeader">About/Help</h3>\
      <div id="aboutHelpForm" style="display:none;">\
        <br><p>Click on the "More Settings" button again to save your settings!</p>\
        <p>You may need to refresh the chat for the settings to take effect.</p>\
        <br><p><a href="http://www.rphaven.com/topics.php?id=1" target="_blank">Report a problem</a> |\
        <a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Tools#troubleshooting" target=_blank">Troubleshooting Tips</a> | RPH Tools 1.2.6</p>\
        <br>\
      </div>\
    </div>\
  </div>';

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
$(function(){
  _on('accounts', function(){
    var users = account.users;

    for(i = 0; i < users.length; i++){
      getUserName(users[i]);
    }
  });

  _on('ignores', function(data){
    console.log('RPH Tools: Blocking user', data.ids);
    blockUserById(data.ids[0]);
  });

  _on('remove-ignore', function(data){
    var names = document.getElementById("blockedDropList");
    UserChangeIgnore(data.id, false);
    console.log('RPH Tools: Unblocking user', data.id);

    for (var i=0; i<names.length; i++){
      if (names.options[i].value == data.id )
      names.remove(i);
    }
    blockedUsers.splice(blockedUsers.indexOf(data.id),1);
    saveBlockSettings();
  });

  chatSocket.on('confirm-room-join', function(data){
    doRoomJoinSetup(data);
  });
  setupPMFunctions();

  /* Set up HTML injection. */
  $('#random-quote').hide();
  $('#top p.right').prepend('<a class="pings settings">More Settings</a>|');
  $('body').append(html);
  settingsTool.box = $('#settingsBox');
  settingsTool.button = $('#top a.pings');

  /* Load settings. */

  if (typeof(storage) != "undefined"){

    if (localStorage.getItem("chatSettings") !== null){
      pingSettings = JSON.parse(localStorage.getItem("chatSettings"));
      console.log("RPH Tools - Chat settings: ", pingSettings);
    }
    else{ /* Fallback to cookies */
      loadChatSettings();
    }

    if (localStorage.getItem("blockedUsers") !== null){
      var temp_blockedUsers = JSON.parse(localStorage.getItem("blockedUsers"));
      console.log("RPH Tools - Blocked users: ", temp_blockedUsers);

      for (var i = 0; i < temp_blockedUsers.length; i++){
        if(temp_blockedUsers[i] !== "")
        {
          blockUserById(parseInt(temp_blockedUsers[i]));
        }
      }
    }
    else{ /* Fallback to cookies */
      console.log("RPH Tools - No blocked users in localStorage, grabbing cookie.");
      loadBlockSettings();
    }
  }

  console.log('RPH Tools - Init complete, setting up dialog box');
  SetUpToolsDialog();
});

/****************************************************************************
 * @brief: Sets up all the ping dialog box GUI handling.
 ****************************************************************************/
function SetUpToolsDialog(){

  settingsTool.button.click(function(){
    if(settingsTool.state === false)
    {
      settingsTool.state = true;
      settingsTool.box.show();
    }
    else
    {
      if((pingSettings.flags & 1) > 0){
        console.log('RPH Tools - Ping settings were changed');
        pingSettings.flags &= ~1;
        if(validSettings === true){
          saveChatSettings(pingSettings);
        }
      }
      else{
        console.log('RPH Tools - No ping settings were changed');
      }
      settingsTool.box.hide();
      settingsTool.state = false;
      console.log('RPH Tools - Ping settings', pingSettings);
    }
  });

  ChatSettingsSetup();
  DiceRollSetup();
  BlockingSetup();
  ModdingSetup();
  ImportExportSetup();

  $('#aboutHelpHeader').click(function(){
    if(aboutHelpTool.state === true){
      $('#aboutHelpForm').hide();
      aboutHelpTool.state = false;
    }
    else{
      $('#aboutHelpForm').show();
      aboutHelpTool.state = true;
    }
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
function ChatSettingsSetup(){
  $('#pingHeader').click(function(){
    if(pingTool.state === true){
      $('#ping_form').hide();
      pingTool.state = false;
    }
    else{
      $('#ping_form').show();
      pingTool.state = true;
      populateSettingsDialog();
    }
  });

  $('#pingNames').blur(function(){
    pingSettings.pings = $('#pingNames').val().replace('\n','').replace('\r','');
    pingSettings.flags |= 1;
  });

  $('#pingURL').blur(function(){
    var ping_url = document.getElementById('pingURL').value;
    if(testPingURL(ping_url) === false){
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

  $('#pingTextColor').blur(function(){
    var ping_color = document.getElementById('pingTextColor').value;
    if(testPingColor(ping_color) === false){
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

  $('#pingHighlightColor').blur(function(){
    var ping_highlight = document.getElementById('pingHighlightColor').value;
    if(testPingColor(ping_highlight) === false){
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

  $('#pingBoldEnable').change(function(){
    pingSettings.flags ^= 2;
    pingSettings.flags |= 1;
  });

  $('#pingItalicsEnable').change(function(){
    pingSettings.flags ^= 4;
    pingSettings.flags |= 1;
  });

  $('#pingExactMatch').change(function(){
    pingSettings.flags ^= 8;
    pingSettings.flags |= 1;
  });

  $('#pingCaseSense').change(function(){
    pingSettings.flags ^= 16;
    pingSettings.flags |= 1;
  });

  $('#userNameTextColorButton').click(function(){
    var text_color = document.getElementById('userNameTextColor').value;
    if(testPingColor(text_color) === false ||
       testTextColorRange(text_color) === false){

      console.log("RPH Tools - Bad text color", text_color);
      mark_problem('userNameTextColor', true);
    }
    else{
      var userName = document.getElementById('userNameTextbox').value;
      var userToEdit = null;
      mark_problem('userNameTextColor', false);

      text_color = text_color.substring(1,text_color.length);
      getUserByName(userName, function(User){
        userToEdit = User;
      });

      if(userToEdit !== null){
        mark_problem('userNameTextbox', false);
        sendToSocket('modify', {userid:userToEdit.props.id, color:text_color});
      }
      else{
        mark_problem('userNameTextbox', true);
      }
    }
  });

  $('#roomLinksDisable').change(function(){
    pingSettings.flags ^= 32;
    pingSettings.flags |= 1;
  });

  $('#imgIconDisable').change(function(){
    pingSettings.flags ^= 128;
    pingSettings.flags |= 1;
  });

  $('#pmNamesDroplist').change(function(){
    var userId = $('#pmNamesDroplist option:selected').val();

    if (awayMessages[userId] !== undefined){
      var message = awayMessages[userId].message;
      document.getElementById("awayMessageTextbox").value = message;
    }
    else{
      document.getElementById("awayMessageTextbox").value = "";
    }
  });

  $('#setAwayButton').click(function(){
    var userId = $('#pmNamesDroplist option:selected').val();
    var name = $("#pmNamesDroplist option:selected").html();

    if (awayMessages[userId] !== undefined){
      if(awayMessages[userId].enabled === true){
        awayMessages[userId].message = document.getElementById('awayMessageTextbox').value;
      }
    }
    else{
      var awayMsgObj = {
        "usedPmAwayMsg" : false,
        "message"       : "",
        "enabled"       : true
      };
      awayMsgObj.message = document.getElementById('awayMessageTextbox').value;
      awayMessages[userId] = awayMsgObj;

      $("#pmNamesDroplist option:selected").html("[Away]" + name);
      $("#pmNamesDroplist option:selected").css("background-color", "#FFD800");
      $("#pmNamesDroplist option:selected").prop("selected", false);
    }
  });

  $('#removeAwayButton').click(function(){
    var userId = $('#pmNamesDroplist option:selected').val();

    if (awayMessages[userId] !== undefined){
      if(awayMessages[userId].enabled === true){
        var name = $("#pmNamesDroplist option:selected").html();

        awayMessages[userId].enabled = false;
        $("#pmNamesDroplist option:selected").html(name.substring(6,name.length));
        $("#pmNamesDroplist option:selected").css("background-color", "");
        document.getElementById("awayMessageTextbox").value = "";
      }
    }
  });
}

/****************************************************************************
 * @brief Populates the dialog with settings from the gathered settings.
 *
 * @param user_id - ID of username
 ****************************************************************************/
function populateSettingsDialog(){
  document.getElementById("pingNames").value = pingSettings.pings;
  document.getElementById("pingURL").value = pingSettings.ping_url;
  document.getElementById("pingTextColor").value = pingSettings.color;
  document.getElementById("pingHighlightColor").value = pingSettings.highlight;

  document.getElementById("pingBoldEnable").checked = false;
  document.getElementById("pingItalicsEnable").checked = false;
  document.getElementById("pingExactMatch").checked = false;
  document.getElementById("pingCaseSense").checked = false;
  document.getElementById("roomLinksDisable").checked = false;
  document.getElementById("imgIconDisable").checked = false;

  if( (pingSettings.flags & 2) > 0 ){
    document.getElementById("pingBoldEnable").checked = true;
  }

  if( (pingSettings.flags & 4) > 0 ){
    document.getElementById("pingItalicsEnable").checked = true;
  }

  if( (pingSettings.flags & 8) > 0 ){
    document.getElementById("pingExactMatch").checked = true;
  }

  if( (pingSettings.flags & 16) > 0 ){
    document.getElementById("pingCaseSense").checked = true;
  }

  if( (pingSettings.flags & 32) > 0 ){
    document.getElementById("roomLinksDisable").checked = true;
  }

  if( (pingSettings.flags & 128) > 0){
    document.getElementById("imgIconDisable").checked = true;
  }

  // Prevents populating the dialogue from counting as a change.
  pingSettings.flags &= ~1;
}

/****************************************************************************
 * @brief Tests the ping URL to make sure it ends in .wav, otherwise use
 *        the default ping URL (not sure if .mp3 and the like are supported)
 *
 * @param PingURL - URL to test
 ****************************************************************************/
function testPingURL(PingURL){
    var match = false;
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    var pingExt = PingURL.slice( (PingURL.length-4), (PingURL.length));

    if(PingURL === '')
    {
      match = true;
    }
    else if(regexp.test(PingURL) === true)
    {
      if(pingExt == ".wav" || pingExt == ".ogg" || pingExt == ".mp3"){
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
function testPingColor(HighlightColor){
  var pattern = new RegExp(/(^#[0-9A-Fa-f]{6}$)|(^#[0-9A-Fa-f]{3}$)/i);
  return pattern.test(HighlightColor);
}

/****************************************************************************
 * @brief:    Tests the color range of the color to ensure its valid
 * @param:    TextColor - String representation of the color.
 *
 * @return:   True if the color is within range, false otherwise.
 ****************************************************************************/
function testTextColorRange(TextColor){
  var rawHex = TextColor.substring(1,TextColor.length);
  var red = 255;
  var green = 255;
  var blue = 255;

  if (rawHex.length == 3){
    red = parseInt(rawHex.substring(0,1), 16);
    green = parseInt(rawHex.substring(1,2), 16);
    blue = parseInt(rawHex.substring(2,3), 16);

    if ((red <= 13) && (green <= 13) && (blue <= 13)) {
      return true;
    }
  }
  else{
    red = parseInt(rawHex.substring(0,2), 16);
    green = parseInt(rawHex.substring(2,4), 16);
    blue = parseInt(rawHex.substring(4,6), 16);
    if ((red <= 210) && (green <= 210) && (blue <= 210)){
      return true;
    }
  }

  console.log('RPH Tools - Text color check failed', rawHex, red, green, blue);
  return false;
}

/****************************************************************************
 * @brief:    Loads chat settings from the cookie.
 ****************************************************************************/
function loadChatSettings(){
  var cookie_name = 'rphTools_PingSettings';
  var pingSettings_cookieData = getCookie(cookie_name);

  // Non legacy data overrides legacy data. Check it first.
  if(pingSettings_cookieData !== undefined){
    var keys = [];
    var i = 0;
    var settings_array = pingSettings_cookieData.split('|');
    for (var key in pingSettings){
      if(pingSettings.hasOwnProperty(key)){
        keys.push(key);
      }
    }

    for( i = 0; i < keys.length; i++){
      pingSettings[keys[i]] = settings_array[i];
    }
    console.log('RPH Tools - Ping cookie found for', cookie_name);

    //Refresh the cookie
    saveChatSettings(pingSettings);
    console.log('RPH Tools - Refreshing ping settings cookie');

    //Initiate snd variable
    snd = new Audio(pingSettings.ping_url);
  }
  else{
    console.log('RPH Tools - No cookie found for', cookie_name);
  }
}

/****************************************************************************
 * @brief:    Saves the chat and PM settings into a cookie
 ****************************************************************************/

function saveChatSettings(){
  localStorage.removeItem("chatSettings");
  localStorage.setItem("chatSettings", JSON.stringify(pingSettings));
  console.log("RPH Tools - Saving chat settings... ", localStorage.getItem("chatSettings"));
}

/****************************************************************************
 * @brief Requests the server to get a username based on the ID
 * @param user_id - ID of username
 ****************************************************************************/
function getUserName(user_id){
  getUserById(user_id, function(User){
    $('#pmNamesDroplist').append('<option value="' + user_id + '">' +
       User.props.name + '</option>');
  });
}
/****************************************************************************
 *                   RANDOM NUMBER GENERATOR FUNCTIONS
 ****************************************************************************/

/****************************************************************************
 * @brief:    Sets up the GUI callbacks and behavior for the RNGs.
 ****************************************************************************/
function DiceRollSetup(){
  $('#diceHeader').click(function(){
    if(diceTool.state === true){
      $('#diceForm').hide();
      diceTool.state = false;
    }
    else{
      $('#diceForm').show();
      diceTool.state = true;
    }
  });

  $('#diceNum').blur(function(){
    var dieNum = parseInt($('#diceNum').val());
    if (dieNum < 1){
      document.getElementById("diceNum").value = 1;
    }
    else if (10 < dieNum){
      document.getElementById("diceNum").value = 10;
    }
  });

  $('#diceSides').blur(function(){
    var dieSides = parseInt($('#diceSides').val());
    if (dieSides < 2){
      document.getElementById("diceSides").value = 2;
    }
    else if (100 < dieSides){
      document.getElementById("diceSides").value = 100;
    }
  });

  $('#rngMinNumber').blur(function(){
    var minNum = parseInt($('#rngMinNumber').val());
    if (minNum < -4294967296){
      document.getElementById("rngMinNumber").value = -4294967296;
    }
    else if (4294967295 < minNum){
      document.getElementById("rngMinNumber").value = 4294967295;
    }
  });

  $('#rngMaxNumber').blur(function(){
    var maxNum = parseInt($('#rngMaxNumber').val());
    if (maxNum < -4294967296){
      document.getElementById("rngMaxNumber").value = -4294967296;
    }
    else if (4294967295 < maxNum){
      document.getElementById("rngMaxNumber").value = 4294967295;
    }
  });

  $('#coinTossButton').click(function(){
    TossCoin();
  });

  $('#diceButton').click(function(){
    RollDice();
  });

  $('#rngButton').click(function(){
    GetRandomNum();
  });
}

/****************************************************************************
 * @brief:    Generates and posts a random coin toss
 ****************************************************************************/
function TossCoin(){
  var class_name = $('li.active')[0].className.split(" ");
  var room_name = $('li.active').find("span:first").text();
  var this_room = getRoom(room_name);
  var userID = parseInt(class_name[2].substring(0,6));
  var new_msg = '(( Coin toss: ';

  if(Math.ceil(Math.random() * 2) == 2){
    new_msg += '**heads!**))';
  }
  else{
    new_msg += '**tails!**))';
  }

  this_room.sendMessage(new_msg, userID);
  DisableButtons();
}

/****************************************************************************
 * @brief:    Generates and posts a random dice roll
 ****************************************************************************/
function RollDice(){
  var class_name = $('li.active')[0].className.split(" ");
  var room_name = $('li.active').find("span:first").text();
  var this_room = getRoom(room_name);
  var userID = parseInt(class_name[2].substring(0,6));
  var dieNum = parseInt($('#diceNum').val());
  var dieSides =  parseInt($('#diceSides').val());
  var new_msg = '/me rolled ' + dieNum + 'd' + dieSides + ': ';

  for(i = 0; i < dieNum; i++){
    new_msg += Math.ceil(Math.random() * dieSides);
    new_msg += ' ';
  }
  this_room.sendMessage(new_msg, userID);
  DisableButtons();
}

/****************************************************************************
 * @brief:    Generates and posts a random number.
 ****************************************************************************/
function GetRandomNum(){
  var class_name = $('li.active')[0].className.split(" ");
  var room_name = $('li.active').find("span:first").text();
  var this_room = getRoom(room_name);
  var userID = parseInt(class_name[2].substring(0,6));
  var minNum = parseInt($('#rngMinNumber').val());
  var maxNum =  parseInt($('#rngMaxNumber').val());
  var new_msg = '(( Random number generated: **';

  new_msg += Math.floor((Math.random() * (maxNum - minNum) + minNum)) + '** ))';

  this_room.sendMessage(new_msg, userID);
  DisableButtons();
}

/****************************************************************************
 * @brief:    Disables the RNG buttons for three seconds.
 ****************************************************************************/
function DisableButtons(){
  document.getElementById("coinTossButton").value = "Wait...";
  document.getElementById("diceButton").value = "Wait...";
  document.getElementById("rngButton").value = "Wait...";

  document.getElementById("coinTossButton").disabled = true;
  document.getElementById("diceButton").disabled = true;
  document.getElementById("rngButton").disabled = true;

  setTimeout(function(){
      document.getElementById("coinTossButton").value = "Flip it!";
      document.getElementById("diceButton").value = "Let's roll!";
      document.getElementById("rngButton").value = "Let's roll!";

      document.getElementById("diceButton").disabled = false;
      document.getElementById("coinTossButton").disabled = false;
      document.getElementById("rngButton").disabled = false;
    }, 3000);
}
/****************************************************************************
 *                          BLOCKING FUNCTIONS
 ****************************************************************************/
/****************************************************************************
 * @brief:    Sets up the GUI callbacks and behavior for blocking
 ****************************************************************************/
function BlockingSetup(){
  $('#blockHeader').click(function(){
    if(blockTool.state === true){
      $('#blockForm').hide();
      blockTool.state = false;
    }
    else{
      $('#blockForm').show();
      blockTool.state = true;
    }
  });

  $('#blockButton').click(function(){
    var userToBlock = null;
    var userName = $('#nameCheckTextbox').val();
    getUserByName(userName, function(User){
      userToBlock = User;
    });

    if (userToBlock !== null){
      blockUser(userToBlock);
      saveBlockSettings();
      mark_problem('nameCheckTextbox', false);
    }
    else{
      mark_problem('nameCheckTextbox', true);
    }
  });

  $('#unblockButton').click(function(){
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
function UserChangeIgnore(UserId, Ignore){
  getUserById(UserId, function(User){
    User.blocked = Ignore;
  });
}

/****************************************************************************
 * @brief:    Sets the "block" flag for a user
 * @param:    User - User object for the username being blocked
 ****************************************************************************/
function blockUser(User){
  /* Check if this user is already in the list. */
  var inList = false;

  for (var i=0; i < blockedUsers.length; i++){
    if (User.props.id == blockedUsers[i]){
      inList = true;
    }
  }

  if (inList === false){
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
function blockUserById(userID){
  getUserById(userID, function(User){
    blockUser(User);
  });
}

/****************************************************************************
 * @brief:   Saves the blocked users list into a cookie.
 ****************************************************************************/
function saveBlockSettings(){
  localStorage.removeItem("blockedUsers");
  localStorage.setItem("blockedUsers", JSON.stringify(blockedUsers));
  console.log("RPH Tools - Blocked users", localStorage.getItem("blockedUsers"));
  console.log("RPH Tools - Blocked users locally", blockedUsers);
}

/****************************************************************************
 * @brief:    Loads the blocked users list from a cookie
 ****************************************************************************/
function loadBlockSettings(){
  var cookie_name = 'rphTools_IgnoreSettings';
  var blockedIds_cookieData = getCookie(cookie_name);

  if(blockedIds_cookieData !== undefined){
    var blockedArray = blockedIds_cookieData.split(',');
    console.log('RPH Tools - Blocked IDs found');
    for (var i = 0; i < blockedArray.length; i++){
      if(blockedArray[i] !== "")
      {
        blockUserById(parseInt(blockedArray[i]));
      }
    }
  }
  else{
    console.log('RPH Tools - No cookie found for', cookie_name);
  }

  saveBlockSettings();
}
/****************************************************************************
 *                      MODDING TOOLS FUNCTIONS
 ****************************************************************************/
/****************************************************************************
 * @brief:    Sets up the GUI callbacks and behavior for modding functions
 ****************************************************************************/
function ModdingSetup(){
  $('#moddingHeader').click(function(){
    if(modTool.state === true){
      $('#moddingForm').hide();
      modTool.state = false;
    }
    else{
      $('#moddingForm').show();
      modTool.state = true;
    }
  });

  $('#kickButton').click(function(){
    modAction('kick');
  });

  $('#banButton').click(function(){
    modAction('ban');
  });

  $('#unbanButton').click(function(){
    modAction('unban');
  });

  $('#modButton').click(function(){
    modAction('add-mod');
  });

  $('#unmodButton').click(function(){
    modAction('remove-mod');
  });
}

/****************************************************************************
 * @brief:    Performs a modding action
 * @param:    action - string command that has the action.
 ****************************************************************************/
function modAction(action){
  var targets = $('#modTargetTextInput').val().replace('\n','').replace('\r','');
  targets = targets.split(';');
  console.log('RPH Tools - Target list ', targets);

  for(var i = 0; i < targets.length; i++){
    emitModAction(action, targets[i]);
  }
}

function emitModAction(action, targetName){
  var room = document.getElementById("modRoomTextInput").value;
  var user = document.getElementById("modFromTextInput").value;
  var userId = 0;
  var targetId = 0;
  var target = '';
  var modMessage = ' ';

  getUserByName(targetName, function(Target){
    targetId = Target.props.id;
    target = Target.props.name;
  });

  getUserByName(document.getElementById("modFromTextInput").value, function(User){
    userId = User.props.id;
    modMessage += document.getElementById("modMessageTextInput").value;

    if (action === 'add-mod' || action === 'remove-mod'){
      modMessage = '';
    }
    chatSocket.emit(action, {room:room, userid:userId, targetid:targetId, msg:modMessage});
  });

  if(action === 'ban'){
    modMessage = "Banning: " + target + " by: " + user + " In room: " + room;
    console.log('RPH Tools - ', modMessage);
  }
  else if (action === 'unban'){
    modMessage = "Unbanning: " + target + " by: " + user + " In room: " + room;
    console.log('RPH Tools - ', modMessage);
  }
  else if (action === 'add-mod'){
    modMessage = "Modding: " + target + " by: " + user + " In room: " + room;
    console.log('RPH Tools - ', modMessage);
  }
  else if (action === 'remove-mod'){
    modMessage = "Unmodding: " + target + " by: " + user + " In room: " + room;
    console.log('RPH Tools - ', modMessage);
  }
  else if (action === 'kick'){
    modMessage = "Kicking: " + target + " by: " + user + " In room: " + room;
    console.log('RPH Tools - ', modMessage);
  }
}

/****************************************************************************
 *                        IMPORT/EXPORT FUNCTIONS
 ****************************************************************************/
/****************************************************************************
 * @brief:    Sets up callback functions for importing/exporting settings
 ****************************************************************************/
function ImportExportSetup(){
  $('#importExportHeader').click(function(){
    if(importExport.state === true){
      $('#importExportForm').hide();
      importExport.state = false;
    }
    else{
      $('#importExportForm').show();
      importExport.state = true;
    }
  });

  $('#importButton').click(function(){
    ImportSettings();
  });

  $('#exportButton').click(function(){
    var chatSettings_str = JSON.stringify(pingSettings);
    var blockedUsers_str = JSON.stringify(blockedUsers);
    document.getElementById("importExportTextarea").value = chatSettings_str + "|" + blockedUsers_str;
  });
}

/****************************************************************************
 * @brief:    Imports settings from the textarea.
 ****************************************************************************/
function ImportSettings(){
  var settings_str = document.getElementById("importExportTextarea").value;
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
  catch (err){
    console.log('RPH Tools - Error importing settings');
  }

  /* Time to do a lot of checking here. */
  if( chatSettings_str === '' || blockedUsers_str === '' ||
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
    for (var i = 0; i < temp_blockedUsers.length; i++){
      if(temp_blockedUsers[i] !== "")
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
function setupPMFunctions(){
  _on('pm', function(data){
    getUserById(data.to, function(fromUser){
      if( fromUser.blocked ){
        return;
      }

      /* Remove links */
      if (pingSettings.flags & 32){
        removeRoomLinksInPM();
      }

      /* Send away message. */
      if(awayMessages[data.from] !== undefined){
        if(awayMessages[data.from].enabled === true){
          var awayMsg = awayMessages[data.from].message;
          awayMessages[data.from].usedPmAwayMsg = true;
          sendToSocket('pm', {'from':data.from, 'to':data.to, 'msg':awayMsg, 'target':'all'});
        }
      }
    });
  });

  _on('outgoing-pm', function(data){
    getUserById(data.from, function(fromUser){
      /* Remove links */
      if (pingSettings.flags & 32){
        removeRoomLinksInPM();
      }

      if(awayMessages[data.from] !== undefined){
        if(awayMessages[data.from].usedPmAwayMsg === false){
          awayMessages[data.from].enabled = false;
          $('#pmNamesDroplist option').filter(function(){
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
 * @brief:    Takes messages received from the chat and figures out if it needs
 *            to ping the user.
 * @param:    room - Room that the user has joined
 ****************************************************************************/
function doRoomJoinSetup(room){
  var thisRoom = getRoom(room.room);
  var tabsLen = thisRoom.$tabs.length;
  var className = thisRoom.$tabs[tabsLen-1][0].className;

  thisRoom.onMessage = function (data){
    var thisRoom = this;
    if( account.ignores.indexOf(data.userid) !== -1 ){
      return;
    }
    postMessage(thisRoom, data);
  };

  /* Add the user's name below the room name to differentiate who's in it. */
  var idRoomName = thisRoom.$tabs[tabsLen-1][0].className.split(' ')[2];
  var regex = new RegExp(' [0-9]+', '');
  var charID = className.match(regex)[0];

  charID = charID.substring(1,charID.length);
  getUserById(charID, function(User){
    var newTabHtml = '<span>' + room.room + '</span><p style="font-size: x-small; position: absolute; top: 12px;">' + User.props.name + '</p>';
    thisRoom.$tabs[tabsLen-1].html(newTabHtml);
    $('<a class="close ui-corner-all">x</a>').on('click', function(ev){
      ev.stopPropagation();
      chatSocket.emit('leave', {userid:User.props.id, name:thisRoom.props.name});
    }).appendTo( thisRoom.$tabs[tabsLen-1] );
    $('textarea.' + idRoomName).prop('placeholder', 'Post as ' + User.props.name);
    $('textarea.' + idRoomName).css('color', "#" + User.props.color);
  });
}

/****************************************************************************
 * @brief:    Takes a message received in the chat and modifies it if it has
 *            a match for pinging
 * @param:    thisRoom - The room that the message is for.
 * @param:    data - The message for the room
 ****************************************************************************/
function postMessage(thisRoom, data){
  getUserById(data.userid, function(User){
    var timestamp = makeTimestamp(data.time);
    var msg = parseMsg(data.msg);
    var classes = '';
    var $el = '';
    var msgHtml = '';

    if( User.blocked ){
      return;
    }

    classes = getClasses(User, thisRoom);

    /* Remove any room links. */
    if (pingSettings.flags & 32){
      var linkMatches = [];

      linkMatches = msg.match(new RegExp('<a class="room-link">(.*?)<\/a>','g'));
      if(linkMatches !== null){
        for(i = 0; i < linkMatches.length; i++){
          var prunedMsg = msg.match(new RegExp('>(.*?)<', ''))[1];
          msg = msg.replace(linkMatches[i], prunedMsg);
        }
      }
    }

    /* Add pinging higlights */
    try{
      var testRegex = null;
      testRegex = matchPing(msg);

      if (testRegex !== null){
        msg = highlightPing(msg, testRegex);
        highlightRoom(thisRoom);
        if (snd !== null){
            snd.play();
          }
      }
    }
    catch (err){
      console.log('RPH Tools - I tried D:', err);
      msg = parseMsg(data.msg);
    }

    if( msg.charAt(0) === '/' && msg.slice(1,3) === 'me'){
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


    if((pingSettings.flags & 128) > 0){
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
function getClasses(User, thisRoom){
  var classes = '';
  if( User.friendOf ){
    classes += 'friend ';
  }
  if( isOwnUser(User) ){
    classes += 'self ';
  }
  if( isOwnerOf(thisRoom, User) ){
    classes += 'owner ';
  } else if( isModOf(thisRoom, User) ){
    classes += 'mod ';
  }
  if( isInGroup(thisRoom, User) ){
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
function matchPing(msg){
  var pingNames = pingSettings.pings.split(',');
  var pingFlags = pingSettings.flags;
  var regexParam = "m";

  if((pingFlags & 16) === 0){
    regexParam = 'im';
  }

  for(i = 0; i < pingNames.length; i++){
    if(pingNames[i] !== ""){
      var regexPattern = pingNames[i].trim();
      if((pingFlags & 8) > 0){
        regexPattern = "\\b" + pingNames[i].trim() + "\\b";
      }

      /* Check if search term is not in a link. */
      if (isInLink(pingNames[i], msg) === false){
        var testRegex = new RegExp(regexPattern, regexParam);
        if(msg.match(testRegex)){
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
function highlightPing(msg, testRegex){
  var pingFlags = pingSettings.flags;
  var pingColor = pingSettings.color;
  var pingHighlight =  pingSettings.highlight;
  var boldEnabled = "";
  var italicsEnabled = "";

  if((pingFlags & 2) > 0){
    boldEnabled = "font-weight: bold; ";
  }

  if((pingFlags & 4) > 0){
    italicsEnabled = "font-style:italic; ";
  }
  msg = msg.replace(testRegex, '<span style="color: ' + pingColor +
                    '; background: ' + pingHighlight +'; ' + boldEnabled +
                    italicsEnabled + '">' + msg.match(testRegex) + '</span>');

  return msg;
}

/****************************************************************************
 * @brief:
 * @param:
 ****************************************************************************/
function highlightRoom(thisRoom){
  //Don't highlight chat tab if the chat is marked as active.
  var testRegex = new RegExp('active', 'im');
  var className = thisRoom.$tabs[0][0].className;
  var pingColor = pingSettings.color;
  var pingHighlight =  pingSettings.highlight;

  if(className.search(testRegex) == -1){
    thisRoom.$tabs[0].css('background-color', pingHighlight);
    thisRoom.$tabs[0].css('color', pingColor);

    thisRoom.$tabs[0].click(function(){
      thisRoom.$tabs[0].css('background-color', '#333');
      thisRoom.$tabs[0].css('color', '#6F9FB9');

      thisRoom.$tabs[0].hover(
        function(){
         thisRoom.$tabs[0].css('background-color', '#6F9FB9');
         thisRoom.$tabs[0].css('color', '#333');
      },
        function(){
         thisRoom.$tabs[0].css('background-color', '#333');
         thisRoom.$tabs[0].css('color', '#6F9FB9');
      });
    });
  }
}

/****************************************************************************
 *                          UTILITY FUNCTIONS
 ****************************************************************************/
/****************************************************************************
 * @brief:   Saves entry in a cookie for storage
 * @param:   c_name - Cookie's name
 * @param:   value - Value of the cookie
 * @param:   exdays - Days until expiration
 ****************************************************************************/
function setCookie(c_name,value,exdays) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays===null) ? "" : ";     expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}

/****************************************************************************
 * @brief:    Gets an entry from a cookie
 * @param:    c_name - Cookie's name
 ****************************************************************************/
function getCookie(c_name) {
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++) {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x==c_name) {
            return unescape(y);
        }
    }
}

/****************************************************************************
 * @brief:    Marks if there's a problem or not.
 * @param:    element - element ID that has the problem
 * @param:    mark - true or false if it has a problem
 ****************************************************************************/
function mark_problem(element, mark){
  if (mark === true){
    document.getElementById(element).style.background="#FF7F7F";
  }
  else{
    document.getElementById(element).style.background="#FFF";
  }
}

/****************************************************************************
 * @brief:    Checks if a search term is in an <a href=...> tag.
 * @param:    searchTerm - String to look for
 * @param:    msg - msg being searched.
 *
 * @return:   True or false if there's a match.
 ****************************************************************************/
function isInLink(searchTerm, msg){
    var match = false;
    var regexp = new RegExp('href=".*?' + searchTerm + '.*?"', '');

    if(regexp.test(msg) === true)
    {
      match = true;
    }

    return match;
}

/****************************************************************************
 * @brief:    Removes links in an incoming PM
 *
 * @note:     This only works on the bottom-most <p> tag.
 ****************************************************************************/
function removeRoomLinksInPM(){
  var fullMessage = $('div#pm-msgs.inner').find('p');
  var links = $('div#pm-msgs.inner').find('a');
  fullMessage = fullMessage[fullMessage.length-1];

  for(var i = 0; i < links.length; i++)
  {
    fullMessage.innerHTML = fullMessage.innerHTML.replace(new RegExp(links[i].outerHTML, 'g'),
                                                          links[i].innerHTML);
  }
}

/****************************************************************************
 * @brief     Appends message to a room without adding an image icon
 * @param     html - HTML to add to the room.
 * @param     thisRoom - Object to the room receiving the message.
 *
 * @note      This was modified from RPH's original code, which is not covered
 *            by this license.
 ****************************************************************************/
function appendMessageTextOnly(html, thisRoom){
  var $el = $('<div>\n'+html+'\n</div>').appendTo( thisRoom.$el );
  var extra = 5; //add more if near the bottom
  if( thisRoom.$el[0].scrollHeight - thisRoom.$el.scrollTop() < 50 ){
    extra = 60;
  }
  thisRoom.$el.animate({scrollTop: '+='+($el.outerHeight()+extra)}, 180);

  if( thisRoom.$el.children('div').length > account.settings.maxHistory ){
    thisRoom.$el.children('div:not(.sys):lt(3)').remove();
  }

  return $el;
}
