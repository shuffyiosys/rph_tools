// ==UserScript==
// @name       RPH Tools
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Tools
// @version    0.0.6
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

// Object to hold the audio.
var snd = null;

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
var pingSettings = { 
  "pings"     : "",
  "ping_url"  : "http://www.storiesinflight.com/html5/audio/flute_c_long_01.wav",
  "color"     : "#000",
  "highlight" : "#FFA",
  "flags"     : 0};

// Object for dialog box
var settingsTool = {state: false};
var pingTool = {state: false};
var diceTool = {state: false};
var blockTool = {state: false};
var modTool = {state: false};
var aboutHelpTool = {state: false};

var validSettings = false;
  
var flood_detect_users = {};
var repeat_detect_users = {};
  
// HTML code to be injected into the chat.
var html = '\
  <div id="settingsBox" style="display: none; position: absolute; top: 35px; z-index: 9999999; height: 360px; width: 480px; border-radius: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.7); right: 85px; background: url(&quot;http://www.rphaven.com/css/img/aero-bg.png&quot;) repeat scroll 0px 0px transparent; padding: 5px;" left="">\
    <h3 style="text-align: center; color:#000;">RPH Tools</h3>\
    <div id="settingsContainer" style="height: 330px; width: 100%; overflow: auto; background: rgb(51, 51, 51); padding: 10px; border-radius: 5px; font-size: 0.8em;">\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="pingHeader">Chat room options</h3>\
      <form id="ping_form" style="display:none;">\
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
        <input style="width: 370px;"type="text" id="pingTextColor" name="pingTextColor"\
                 value="#000"><br>\
        <p>Highlight Color (RGB hex value with hashtag, E.g., #ABCDEF):</p>\
        <input style="width: 370px;" type="text" id="pingHighlightColor" name="pingHighlightColor"\
                 value="#FFA"><br>\
        <p>Matching options</p>\
        <input style="width: 40px;" type="checkbox" id="pingBoldEnable" name="pingBoldEnable"><strong>Bold</strong>\
        <input style="width: 40px;" type="checkbox" id="pingItalicsEnable" name="pingItalicsEnable"><em>Italics</em>\
        <input style="width: 40px;" type="checkbox" id="pingExactMatch" name="pingExactMatch">Exact match\
        <input style="width: 40px;" type="checkbox" id="pingCaseSense" name="pingCaseSense">Case sensitive\
        <br><br><hr>\
        <p><strong>Other options</strong></p>\
        <input style="width: 40px;" type="checkbox" id="roomLinksDisable" name="roomLinksDisable" checked>No room links in chat\
      </form>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="diceHeader">Random Number Generators</h3>\
      <form id="diceForm" style="display:none;">\
        <p><strong>Coin tosser</strong></p>\
        <br />\
        <button type="button" id="coinTossButton">Flip it!</button>\
        <hr>\
        <p><strong>Dice roller</strong></p>\
        <br />\
        <label style="font-size: small;">Number of die</label>\
        <input style="width: 80px;" type="number" id="diceNum" name="diceNum" max="10" min="1" value="2">\
        <label style="font-size: small;">Sides</label>\
        <input style="width: 80px;" type="number" id="diceSides" name="diceSides" max="100" min="2" value="6">\
        <br />\
        <button type="button" id="diceButton">Let\'s Roll!</button>\
        <hr>\
        <p><strong>General RNG</strong></p>\
        <br />\
        <label style="font-size: small;">Minimum (inclusive) &nbsp;</label>\
        <input style="width: 200px;" type="number" id="rngMinNumber" name="rngMinNumber" max="10" min="0" value="0">\
        <br />\
        <label style="font-size: small;">Maximum (exclusive)</label>\
        <input style="width: 200px;" type="number" id="rngMaxNumber" name="rngMaxNumber" max="10" min="0" value="10">\
        <br />\
        <button type="button" id="rngButton">Randomize!</button>\
      </form>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="blockHeader">Friends/Blocking</h3>\
      <form id="blockForm" style="display:none;">\
        <br>\
        <p>Enter user name to block, press Enter to submit.</p>\
        <label style="font-size: small;">User to block:</label>\
        <input style="width: 400px;" type="text" id="nameCheckTextbox" name="nameCheckTextbox"><input style="display: none; width: 0px;"type="text"><br>\
        <br />\
        <p>Blocked users</p>\
        <select style="width: 100%;" id="blockedDropList"></select>\
        <br />\
        <button type="button" id="unblockButton">Unblock</button>\
      </form>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="moddingHeader">Modding</h3>\
      <form id="moddingForm" style="display:none;">\
        <br>\
        <p>This will only work if you\'re actually a mod of the room.</p>\
        <br />\
        <p>Room</p>\
        <input style="width: 100%;" type="text" id="banRoomTextInput">\
        <br />\
        <p>Your username that\'s a mod</p>\
        <input style="width: 100%;" type="text" id="banFromTextInput">\
        <br />\
        <p>User to ban</p>\
        <input style="width: 100%;" type="text" id="banTargetTextInput">\
        <br />\
        <p id="banMessageLabel">Message</p>\
        <input style="width: 100%;" type="text" id="banMessageTextInput" value="You have been banned">\
        <br />\
        <p id="banMessage">&nbsp;</p>\
        <br />\
        <button type="button" id="banButton">Ban</button>\
        <button type="button" id="unbanButton">Unban</button>\
      </form>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="aboutHelpHeader">About/Help</h3>\
      <form id="aboutHelpForm" style="display:none;">\
        <br><p>Click on the "More Settings" button again to save your settings!</p>\
        <p>You may need to refresh the chat for the settings to take effect.</p>\
        <br><p><a href="http://www.rphaven.com/topics.php?id=1" target="_blank">Report a problem</a> |\
        <a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Pings#troubleshooting" target=_blank">Troubleshooting Tips</a> | RPH Tools 0.0.6</p>\
        <br>\
      </form>\
    </div>\
  </div>';

var blockedUsers = [];

//If this doesn't print, something happened with the global vars
console.log('RPH tools start'); 

/////////////////////////////////////////////////////////////////////////////
// @brief: Called when connection to chat is established. If it is, it will
//         inject the ping settings form to the chat and restore any saved
//         settings
//
$(function(){
  chatSocket.on('confirm-room-join', function(data){
    doRoomJoinSetup(data);
  }); 

  $('#top p.right').prepend('<a class="pings settings">More Settings</a>|');
  $('body').append(html);
  settingsTool.box = $('#settingsBox');
  settingsTool.button = $('#top a.pings');
  
  loadChatSettings();
  loadBlockSettings();
  document.getElementById("rngMinNumber").min = -Math.pow(2, 32)-1;
  document.getElementById("rngMinNumber").max = Math.pow(2, 32)-1;;
  document.getElementById("rngMaxNumber").min = -Math.pow(2, 32)-1;
  document.getElementById("rngMaxNumber").max = Math.pow(2, 32)-1;;
  
  console.log('RPH Tools - Init complete, setting up dialog box');
  SetUpToolsDialog();
});

/****************************************************************************
 * @brief: Sets up all the ping dialog box GUI handling.
 **/
function SetUpToolsDialog(){

  settingsTool.button.click(function(){
    if(settingsTool.state === false)
    {
      console.log('RPH Tools - Showing dialog');
      settingsTool.state = true;
      settingsTool.box.show();
    }
    else
    {
      if(validSettings === true)
      {
        return;
      }
      console.log('RPH Tools - Hiding dialog');
      if((pingSettings.flags & 1) > 0){
        console.log('RPH Tools - Ping settings were changed');
        pingSettings.flags &= ~1;
        saveChatSettings(pingSettings);
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
}

// PING FUNCTIONS
/****************************************************************************
* @brief Sets up the chat settings group.
*
*/
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
    console.log("RPH Tools - Ping names changed.");
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
      console.log("RPH Tools - Ping URL changed.");
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
      console.log("RPH Tools - Ping text color changed.");
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
      console.log("RPH Tools - Ping highlight color changed");
    }
  });
  
  $('#pingBoldEnable').change(function(){
    pingSettings.flags ^= 2;
    pingSettings.flags |= 1;
    console.log("RPH Tools - Ping text bold changed. Flags are now: ", 
                pingSettings.flags);
  });
  
  $('#pingItalicsEnable').change(function(){
    pingSettings.flags ^= 4;
    pingSettings.flags |= 1;
    console.log("RPH Tools - Ping Text italicize changed. Flags are now: ", 
                pingSettings.flags);
  });
  
  $('#pingExactMatch').change(function(){
    pingSettings.flags ^= 8;
    pingSettings.flags |= 1;
    console.log("RPH Tools - Ping Exact match changed. Flags are now: ", 
                pingSettings.flags);
  });
  
  $('#pingCaseSense').change(function(){
    pingSettings.flags ^= 16;
    pingSettings.flags |= 1;
    console.log("RPH Tools - Ping Case sensitivity changed. Flags are now: ", 
                pingSettings.flags);
  });
  
  $('#roomLinksDisable').change(function(){
    pingSettings.flags ^= 32;
    pingSettings.flags |= 1;
    console.log("RPH Tools - Room linking option changed. Flags are now: ", 
                pingSettings.flags);
  });
}

/****************************************************************************
 * @brief Populates the dialog with settings from the gathered settings.
 * @param user_id - ID of username
 **/
function populateSettingsDialog(){
  document.getElementById("pingNames").value = pingSettings.pings;
  document.getElementById("pingURL").value = pingSettings.ping_url;
  document.getElementById("pingTextColor").value = pingSettings.color;
  document.getElementById("pingHighlightColor").value = pingSettings.highlight;
  
  document.getElementById("pingBoldEnable").checked = false;
  document.getElementById("pingItalicsEnable").checked = false;
  document.getElementById("pingExactMatch").checked = false;
  document.getElementById("pingCaseSense").checked = false;
  
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
  
  // Prevents populating the dialogue from counting as a change.
  pingSettings.flags &= ~1;
}

/****************************************************************************
 * @brief Tests the ping URL to make sure it ends in .wav, otherwise use
 *        the default ping URL (not sure if .mp3 and the like are supported)
 * @param PingURL - URL to test
 **/
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
      console.log('url ext ' + pingExt );
      if(pingExt == ".wav" || pingExt == ".ogg" || pingExt == ".mp3"){
        console.log('RPH Tools - Ping URL is good.');
        match = true;
      }
    }
    else
    {
      console.log('RPH Tools - Ping URL is bad');
    }
    return match;
}

/****************************************************************************
* @brief: Tests the highlight color to make sure it's valid
*/
function testPingColor(HighlightColor){
    var pattern = new RegExp(/(^#[0-9A-Fa-f]{6}$)|(^#[0-9A-Fa-f]{3}$)/i);
    return pattern.test(HighlightColor);
}

/****************************************************************************
* @brief: Loads the chat settings from a cookie.
*/
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
 * @brief: Saves the chat settings to a cookie.
 **/

function saveChatSettings(){
  var settings_array = [];
  var settings_joined = "";
  var cookie_name = "rphTools_PingSettings";
  console.log('RPH Tools - Saving ping settings');
  for ( var key in pingSettings){
    if(pingSettings.hasOwnProperty(key)){
      settings_array.push(pingSettings[key]);
    }
  }
  settings_joined = settings_array.join('|');
  setCookie(cookie_name, settings_joined, 30);
  console.log('Cookie name: ', cookie_name);
  console.log('As an array: ', settings_array);
  console.log('As seen in cookie: ', settings_array.join('|'));
}

/****************************************************************************
* Dice functions
*****************************************************************************/
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
 * @brief Generates a random coin toss and posts it up on the chat.
 **/
function TossCoin(){
  var class_name = $('li.active')[0].className.split(" ");
  var room_name = $('li.active')[0].textContent.slice(0,-1);
  var this_room = getRoom(room_name);
  var userID = parseInt(class_name[2].substring(0,6));
  var new_msg = '/me flipped a coin. It came up ';
  
  console.log('Flipping a coin now');
 
  if(Math.ceil(Math.random() * 2) == 2){
    new_msg += '**heads**!';
  }
  else{
    new_msg += '**tails!**';
  }
  
  console.log(new_msg);
  this_room.sendMessage(new_msg, userID);
  DisableButtons();
}

/****************************************************************************
 * @brief Generates a random dice roll and posts it up on the chat.
 **/
function RollDice(){
  var class_name = $('li.active')[0].className.split(" ");
  var room_name = $('li.active')[0].textContent.slice(0,-1);
  var this_room = getRoom(room_name);
  var userID = parseInt(class_name[2].substring(0,6));
  var dieNum = parseInt($('#diceNum').val());
  var dieSides =  parseInt($('#diceSides').val());
  var new_msg = '/me rolled ' + dieNum + 'd' + dieSides + ': ';
  
  if(document.getElementById("diceNum").min < dieNum &&
     dieNum < document.getElementById("diceNum").max &&
     document.getElementById("diceSides").min < dieSides &&
     dieSides < document.getElementById("diceSides").max)
  {
    for(i = 0; i < dieNum; i++){
      new_msg += Math.ceil(Math.random() * dieSides);
      new_msg += ' ';
    }
    this_room.sendMessage(new_msg, userID);
    DisableButtons();
  }
}

/****************************************************************************
 * @brief Generates a random number and puts it up on the chat
 **/
function GetRandomNum(){
  var class_name = $('li.active')[0].className.split(" ");
  var room_name = $('li.active')[0].textContent.slice(0,-1);
  var this_room = getRoom(room_name);
  var userID = parseInt(class_name[2].substring(0,6));
  var minNum = parseInt($('#rngMinNumber').val());
  var maxNum =  parseInt($('#rngMaxNumber').val());
  var new_msg = '/me thought of a number between ' + minNum + ' and ' + maxNum + '. ';
  
  if(document.getElementById("rngMinNumber").min < minNum &&
     minNum < document.getElementById("rngMinNumber").max &&
     document.getElementById("rngMaxNumber").min < maxNum &&
     maxNum < document.getElementById("rngMaxNumber").max)
  {
    new_msg += 'It was **';
    new_msg += Math.floor((Math.random() * (maxNum - minNum) + minNum)) + '**!';

    this_room.sendMessage(new_msg, userID);
    DisableButtons();
  }
}

/****************************************************************************
 * @brief Disables the RNG buttons for 3 seconds.
 **/
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
* Blocking functions
*****************************************************************************/
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
 
  $('#nameCheckTextbox').keypress(function(ev){
   if (ev.keyCode === 13){
      var userToBlock = null;
      var userName = $('#nameCheckTextbox').val();
      getUserByName(userName, function(User){
        userToBlock = User;
      });
      
      console.log('RPH Tools - ', userToBlock);
      if (userToBlock !== null){
        blockUser(userToBlock);
        mark_problem('nameCheckTextbox', false);
        saveBlockSettings();
      }
      else{
        mark_problem('nameCheckTextbox', true);
      }
    }
  });
    
  $('#unblockButton').click(function(){
    var names = document.getElementById("blockedDropList");
    var userId = names.options[names.selectedIndex].value;
    UserChangeIgnore(userId, false);
    names.remove(names.selectedIndex);
    blockedUsers.splice(blockedUsers.indexOf(userId),1);
    saveBlockSettings();
    
    console.log('RPH Tools - Unblocking user', userId);
    console.log('RPH Tools - Blocked users', blockedUsers);
  });
}


function UserChangeIgnore(UserId, Ignore){
  getUserById(UserId, function(User){
    User.blocked = Ignore;
  });
  console.log('RPH Tools - Changing ignore settings', UserId, Ignore);
}

function blockUser(User){
  blockedUsers.push(User.props.id);
  $('#blockedDropList').append('<option value="' + User.props.id + '">' + User.props.name + '</option>');
  UserChangeIgnore(User.props.id, true);
  console.log('RPH Tools - Blocking user', User.props.name);
  console.log('RPH Tools - Blocked users', blockedUsers);
}

function saveBlockSettings(){
  var blockedUsersJoined = "";
  var cookie_name = "rphTools_IgnoreSettings";
  console.log('RPH Tools - Saving ignore settings');
  blockedUsersJoined = blockedUsers.join(',');
  setCookie(cookie_name, blockedUsersJoined, 30);
  console.log('Cookie name: ', cookie_name);
  console.log('As seen in cookie: ', blockedUsersJoined);
}

function loadBlockSettings(){
  var cookie_name = 'rphTools_IgnoreSettings';
  var blockedIds_cookieData = getCookie(cookie_name);

  console.log('RPH Tools - Getting blocked IDs');
  if(blockedIds_cookieData !== undefined){
    var blockedArray = blockedIds_cookieData.split(',');
    console.log('RPH Tools - Blocked IDs found - ', blockedArray);
    for (var i = 0; i < blockedArray.length; i++){
      if(blockedArray[i] !== "")
      {
        getUserById(blockedArray[i], function(User){
          blockUser(User);
        });
      }
    }
  }
  else{
    console.log('RPH Tools - No cookie found for', cookie_name);
  }
}
/****************************************************************************
* Modding functions
*****************************************************************************/
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
  
  $('#banButton').click(function(){
    banUnbanUser('ban');
  });
  
  $('#unbanButton').click(function(){
    banUnbanUser('unban');
  });
}

function banUnbanUser(action){
  var room = document.getElementById("banRoomTextInput").value;
  var userId = 0;
  var targetId = 0;
  var banMessage = '';
  
  console.log('RPH Tools - Ban/Unban parameters',
              action,
              document.getElementById("banRoomTextInput").value,
              document.getElementById("banTargetTextInput").value,
              document.getElementById("banFromTextInput").value,
              document.getElementById("banMessageTextInput").value);
  
  getUserByName(document.getElementById("banTargetTextInput").value, function(Target){
    targetId = Target.props.id;
    console.log('RPH Tools - Ban/Unban target: ', Target);
  });
  
  getUserByName(document.getElementById("banFromTextInput").value, function(User){
    userId = User.props.id;
    banMessage = document.getElementById("banMessageTextInput").value;
    console.log('RPH Tools - User who is issuing ban/unban: ', User);
    chatSocket.emit(action, {room:room, userid:userId, targetid:targetId, msg:banMessage});
  });
  
  if(action === 'ban'){
    banMessage = "Banning: " + target + " by: " + user + " In room: " + room;
    console.log('RPH Tools - ', banMessage);
  }
  else{
    banMessage = "Unbanning: " + target + " by: " + user + " In room: " + room;
    console.log('RPH Tools - ', banMessage);
  }
  document.getElementById("banMessage").value = banMessage;
}
//
// MESSAGE OUT FUNCTIONS
//
/****************************************************************************
 * @brief: Takes messages received from the chat and figures out if it needs
 *         to ping the user.
 **/
function doRoomJoinSetup(room){
	var thisRoom = getRoom(room.room);
  
  thisRoom.onMessage = function (data){
		var thisRoom = this;
		if( account.ignores.indexOf(data.userid) !== -1 ){
			return;
		}
		console.log('onMsg', data);
    postMessage(thisRoom, data);
	};
}

/****************************************************************************
 * @brief Takes a message received in the chat and modifies it if it has a match
 *        for pinging
 */
function postMessage(thisRoom, data){
  console.log('RPH Tools: postMessage', data);
  getUserById(data.userid, function(User){
    var timestamp = makeTimestamp(data.time);
		var msg = parseMsg(data.msg);
		var classes = '';
    var $el = '';
    
    if( User.blocked ){
      return;
    }
    
    classes = getClasses(User, thisRoom);
    
    /* Remove any room links. */
    if (pingSettings.flags & 32){
      var linkMatches = [];
      
      linkMatches = msg.match(new RegExp('<a class="room-link">(.*?)<\/a>','g'));
      console.log('RPH Tools - Link matches', linkMatches);
      
      if(linkMatches !== null){
        for(i = 0; i < linkMatches.length; i++){
          var prunedMsg = msg.match(new RegExp('>(.*?)<', ''))[1];
          msg = msg.replace(linkMatches[i], prunedMsg);
        }
      }
      console.log('RPH Tools - Processed message', msg);
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
      $el = thisRoom.appendMessage(
            '<span class="first">[' + timestamp + 
            ']</span>\n<span style="color:#' + User.props.color +
            '"><a class="name" title="[' + timestamp +
            ']" style="color:#' + User.props.color +
            '">'+ User.props.name + '</a>' + msg + '</span>'
          ).addClass(classes);
    } else {
      $el = thisRoom.appendMessage(
            '<span class="first">[' + timestamp + ']<a class="name" title="[' + 
            timestamp + ']" style="color:#' + User.props.color + '">' + 
            User.props.name + 
            '<span class="colon">:</span></a></span>\n<span style="color:#' + 
            User.props.color+'">' + msg +'</span>'
          ).addClass(classes);
    }
    $el.find('br:gt(7)').remove();
  });
}

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

function matchPing(msg){
  var pingNames = pingSettings.pings.split(',');
  var pingFlags = pingSettings.flags;
  var regexParam = "m";

  if((pingFlags & 8) > 0){
    regexParam = 'im';
  }
  
  for(i = 0; i < pingNames.length; i++){
    if(pingNames[i] !== ""){
      var regexPattern = pingNames[i].trim();
      var matchString = '';
      if((pingFlags & 16) > 0){
        regexPattern = "\\b" + pingNames[i].trim() + "\\b";
      }
      
      /* Check if search term is not in a link. */
      if (isInLink(pingNames[i], msg) === false){
        var testRegex = new RegExp(regexPattern, regexParam);
        if(msg.match(testRegex)){
          console.log('RPH Tools - name matched', i, pingNames[i]);
          return testRegex;
        }
      }
    }
  }
  
  return null;
}

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
  
  console.log('<span style="color: ' + pingColor + '; background: ' + pingHighlight +'; ' + boldEnabled + italicsEnabled + '">' + msg.match(testRegex) + '</span>');
  msg = msg.replace(testRegex, '<span style="color: ' + pingColor + '; background: ' + pingHighlight +'; ' + boldEnabled + italicsEnabled + '">' + msg.match(testRegex) + '</span>');
  console.log('RPH Tools - Pinged message', msg);
  
  return msg;
}

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

// UTILITY FUNCTIONS
/////////////////////////////////////////////////////////////////////////////
// @brief: Saves entry in a cookie for storage
//
function setCookie(c_name,value,exdays) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays===null) ? "" : ";     expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}

/////////////////////////////////////////////////////////////////////////////
// @brief: Gets an entry from a cookie
//
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

/////////////////////////////////////////////////////////////////////////////
// @brief: Marks if there's a problem or not.
//
function mark_problem(element, mark){
  if (mark === true){
    document.getElementById(element).style.background="#FF7F7F";
  }
  else{
    document.getElementById(element).style.background="#FFF";
  }
}

/////////////////////////////////////////////////////////////////////////////
// @brief: Checks if a search term is in an <a href=...> tag.
//
// @param searchTerm - String to look for
// @param msg - msg being searched.
//
function isInLink(searchTerm, msg){
    var match = false;
    var regexp = new RegExp('href=".*?' + searchTerm + '.*?"', '');

    if(regexp.test(msg) === true)
    {
      match = true;
    }
    
    return match;
}