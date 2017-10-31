// ==UserScript==
// @name       RPH Extended Settings
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Pings_Test
// @version    0.0.3
// @description Adds extended settings to RPH
// @match      http://chat.rphaven.com/
// @copyright  (c)2014 shuffyiosys@github
// @grant   none
// ==/UserScript==
/*jshint multistr: true */
/*jshint bitwise: false*/
/*global $:false */

// ==/UserScript==
/*jshint multistr: true */
/*jshint bitwise: false*/
/*global $:false */

// Object to hold the audio.
var snd;

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
    <h3 style="text-align: center; color:#000;">RPH Extended Settings</h3>\
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
        <p><strong>Other room options</strong></p>\
        <input style="width: 40px;" type="checkbox" id="roomLinksDisable" name="roomLinksDisable" checked>No room links\
      </form>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="diceHeader">Dice Roller</h3>\
      <form id="diceForm" style="display:none;">\
        <br />\
      <label>Count</label>\
        <input style="width: 80px;" type="number" id="diceNum" name="diceNum" max="10" min="1" value="2">\
        <label>Sides</label>\
        <input style="width: 80px;" type="number" id="diceSides" name="diceSides" max="100" min="2" value="6">\
        <button type="button" id="diceButton">Let\'s Roll!</button>\
      </form>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="blockHeader">Friends/Blocking</h3>\
      <form id="blockForm" style="display:none;">\
        <br>\
        <p>Block user:</p>\
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
        <p>Room</p>\
        <input style="width: 100%;" type="text" id="banRoomTextInput">\
        <br />\
        <p>User</p>\
        <input style="width: 100%;" type="text" id="banFromTextInput">\
        <br />\
        <p>User to ban</p>\
        <input style="width: 100%;" type="text" id="banTargetTextInput">\
        <br />\
        <p id="banMessage">&nbsp;</p>\
        <br />\
        <button type="button" id="banButton">Ban</button>\
      </form>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="aboutHelpHeader">About/Help</h3>\
      <form id="aboutHelpForm" style="display:none;">\
        <br><p>Click on the "More Settings" button again to save your settings!</p>\
        <p>You may need to refresh the chat for the settings to take effect.</p>\
        <br><p><a href="http://www.rphaven.com/topics.php?id=1" target="_blank">Report a problem</a> |\
        <a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Pings#troubleshooting" target=_blank">Troubleshooting Tips</a> | RPH Tools Demo</p>\
        <br>\
      </form>\
    </div>\
  </div>';

var blockedUsers = [];

var userIds = [];
var usersInRooms = [];

//If this doesn't print, something obviously happened with the global vars
console.log('RPH pings start'); 

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
  
  loadPingSettings();
  loadBlockSettings();
  
  console.log('RPH Pings - Init complete, setting up dialog box');
  SetUpPingDialog();
});

/****************************************************************************
 * @brief: Sets up all the ping dialog box GUI handling.
 **/
function SetUpPingDialog(){

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
        console.log('RPH Pings - Settings were changed');
        pingSettings.flags &= ~1;
        savePingSettings(pingSettings);
      }
      else{
        console.log('RPH Pings - No settings were changed');
      }
      settingsTool.box.hide();
      settingsTool.state = false;
      console.log('RPH Pings - Settings', pingSettings);
    }
  });
  
  PingsSetup();
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
*
*
*/
function PingsSetup(){
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
    console.log("RPH Pings - Ping names changed.");
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
      pingSettings.flags |= 1;
      mark_problem('pingURL', false);
      validSettings = true;
      console.log("RPH Pings - URL changed.");
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
      console.log("RPH Pings - Text color changed.");
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
      console.log("RPH Pings - Highlight color changed");
    }
  });
  
  $('#pingBoldEnable').change(function(){
    pingSettings.flags ^= 2;
    pingSettings.flags |= 1;
    console.log("RPH Pings - Text bold changed.");
  });
  
  $('#pingItalicsEnable').change(function(){
    pingSettings.flags ^= 4;
    pingSettings.flags |= 1;
    console.log("RPH Pings - Text italicize changed.");
  });
  
  $('#pingExactMatch').change(function(){
    pingSettings.flags ^= 8;
    pingSettings.flags |= 1;
    console.log("RPH Pings - Exact match changed.");
  });
  
  $('#pingCaseSense').change(function(){
    pingSettings.flags ^= 16;
    pingSettings.flags |= 1;
    console.log("RPH Pings - Case sensitivity changed.");
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
    
    if(PingURL == '')
    {
      match = true;
    }
    else if(regexp.test(PingURL) === true)
    {
      console.log('url ext ' + pingExt );
      if(pingExt == ".wav" || pingExt == ".ogg" || pingExt == ".mp3"){
        console.log('RPH Pings - Ping URL is good.');
        match = true;
      }
    }
    else
    {
      console.log('RPH Pings - Ping URL is bad');
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

function loadPingSettings(){
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
    console.log('RPH Pings - Found cookie for', cookie_name);
    
    //Refresh the cookie
    savePingSettings(pingSettings);
    console.log('RPH Pings - Refreshing cookie');
  }
  else{
    console.log('RPH Pings - No cookie found for', cookie_name);
  }
}

function savePingSettings(){
  var settings_array = [];
  var settings_joined = "";
  var cookie_name = "rphTools_PingSettings";
  console.log('RPH Pings - Saving settings');
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
  
  $('#diceButton').click(function(){
    RollDice();
  });
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
  
  for(i = 0; i < dieNum; i++){
    new_msg += Math.ceil(Math.random() * dieSides);
    new_msg += ' ';
  }
  this_room.sendMessage(new_msg, userID);
  
  document.getElementById("diceButton").value = "Wait...";
  document.getElementById("diceButton").disabled = true;
  setTimeout(function(){
      document.getElementById("diceButton").value = "Let's roll!";
      document.getElementById("diceButton").disabled = false;
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
      var userName = $('#nameCheckTextbox').val();
      getUserByName(userName, function(User){ 
        blockedUsers.push(User.props.id);
        $('#blockedDropList').append('<option value="' + User.props.id + '">' + User.props.name + '</option>');
        UserChangeIgnore(User.props.id, true);
        saveBlockSettings();
        console.log('RPH Tools - Blocking user', User.props.name);
        console.log('RPH Tools - Blocked users', blockedUsers);
        
      });
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
      blockedUsers.push(blockedArray[i]);
      getUserById(blockedArray[i], function(User){
        $('#blockedDropList').append('<option value="' + User.props.id + '">' + User.props.name + '</option>');
        UserChangeIgnore(User.props.id, true);
        console.log('RPH Tools - Blocking user', User.props.name);
        
      });
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
    var room = document.getElementById("banRoomTextInput").value;
    var userId = 0;
    var targetId = 0;
    
    console.log('Banning...', 
                document.getElementById("banRoomTextInput").value,
                document.getElementById("banTargetTextInput").value,
                document.getElementById("banFromTextInput").value);
    
    getUserByName(document.getElementById("banTargetTextInput").value, function(Target){
      targetId = Target.props.id;
      console.log('RPH Tools - Ban target: ', Target);
    });
    
    getUserByName(document.getElementById("banFromTextInput").value, function(User){
      userId = User.props.id;
      console.log('RPH Tools - User: ', User);
      chatSocket.emit('ban', {room:room, userid:userId, targetid:targetId, msg:'You have been banned'});
    });
    
    console.log('RPH Tools - Banning', room, user, target);
    document.getElementById("banMessage").value = room + "Banning: " + target + " by: " + user;
  });
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
  console.log('RPH Pings: postMessage', data);
  getUserById(data.userid, function(User){
    var usersInRoom = thisRoom.users;
    var timestamp = makeTimestamp(data.time);
		var msg = parseMsg(data.msg);
		var classes = '';    
    var hasMatch = false;
    var $el = '';
    var flood_pass = true;
    var repeat_pass = true;
    var linkMatches = [];
    
    if( User.blocked ){
      return;
    }
    
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
    
    console.log('RPH Tools - Classes', classes);
    
    /* Process the message before posting */
    /* Need an if check if the user is a mod/owner of the room here... */
    if (classes.match('mod') || classes.match('owner')){
      flood_pass = true; //check_for_flood(User, data);
      repeat_pass = true; //check_for_repeat(User, msg);
    }
    /* Prune all room links (have a check for this) */
    
    linkMatches = msg.match(new RegExp('<a class="room-link">(.*?)<\/a>','g'));
    console.log('RPH Tools - Link matches', linkMatches);
  
    if(linkMatches != null){
      for(i = 0; i < linkMatches.length; i++){
        var prunedMsg = msg.match(new RegExp('>(.*?)<', ''))[1];
        msg = msg.replace(linkMatches[i], prunedMsg);
      }
    }
    console.log('RPH Tools - Processed message', msg);
    
    if( flood_pass === true && repeat_pass === true)
    {    
      try{
        var pingNames = pingSettings.pings.split(',');
        var pingUrl = pingSettings.ping_url;
        var pingColor = pingSettings.color;
        var pingHighlight =  pingSettings.highlight;
        var pingFlags = pingSettings.flags;
        
        var testRegex;
        var boldEnabled = "";
        var italicsEnabled = "";
        var regexParam = "m";
        
        if((pingFlags & 2) > 0){
          boldEnabled = "font-weight: bold; ";
        }
        
        if((pingFlags & 4) > 0){
          italicsEnabled = "font-style:italic; ";
        }
        
        if((pingFlags & 8) > 0){
          regexParam = 'im';
        }
        
        for(i = 0; i < pingNames.length; i++){
          //console.log('RPH Tools - Testing name: ', pingNames[i]);
          if(pingNames[i] !== ""){
              var regexPattern = pingNames[i].trim();
              if((pingFlags & 16) > 0){
                regexPattern = "\\b" + pingNames[i].trim() + "\\b";
              }
              testRegex = new RegExp(regexPattern, regexParam);
              if(msg.match(testRegex)){
                  console.log('name matched', i, pingNames[i]);
                  console.log('<span style="color: ' + pingColor + '; background: ' + pingHighlight +'; ' + boldEnabled + italicsEnabled + '">' + msg.match(testRegex) + '</span>');
                  msg = msg.replace(testRegex, '<span style="color: ' + pingColor + '; background: ' + pingHighlight +'; ' + boldEnabled + italicsEnabled + '">' + msg.match(testRegex) + '</span>');
                  hasMatch = true;
              }
          }
        }

        if(hasMatch){
          //Don't highlight chat tab if the chat is marked as active.
          testRegex = new RegExp('active', 'im');
          var className = thisRoom.$tabs[0][0].className;
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
          if(pingUrl !== ''){
            console.log('Ping');
            snd = new Audio(pingUrl);
            snd.play();
            console.log(snd);
          }
        }
      }
      catch (err){
        console.log('RPH Pings - I tried D:', err);
        msg = parseMsg(data.msg);
      }
      finally{
        if( msg.charAt(0) === '/' && msg.slice(1,3) === 'me'){
          classes += 'action ';
          msg = msg.slice(3);
          $el = thisRoom.appendMessage(
                '<span class="first">['+timestamp+']</span>\n\
                <span style="color:#'+User.props.color+'"><a class="name" title="['+timestamp+']" style="color:#'+User.props.color+'">'+User.props.name+'</a>'+msg+'</span>'
              ).addClass(classes);
        } else {
          $el = thisRoom.appendMessage(
                '<span class="first">['+timestamp+']<a class="name" title="['+timestamp+']" style="color:#'+User.props.color+'">'+User.props.name+'<span class="colon">:</span></a></span>\n\
                <span style="color:#'+User.props.color+'">'+msg+'</span>'
              ).addClass(classes);
        }
        $el.find('br:gt(7)').remove();
      }
    }
  });
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
    document.getElementById("namesDroplist").disabled=true;
  }
  else{
    document.getElementById(element).style.background="#FFF";
    document.getElementById("namesDroplist").disabled=false;
  }
}

/////////////////////////////////////////////////////////////////////////////
// @brief: Check flood condition
//
function check_for_flood(User, data){
  var name = User.props.name;
  if(flood_detect_users[name] === undefined){
    console.log('RPH Tools - Creating flood entry for: ', name);
    var temp_user_stat = {
      "count": 0,
      "last_time": 0};
    flood_detect_users[name] = temp_user_stat;
    
    console.log('RPH Tools - created flood entry ', flood_detect_users[name]);
  }
  else{
    if(data.time - flood_detect_users[name].last_time > 3)
    {
      flood_detect_users[name].count = 0;
      flood_detect_users[name].last_time = data.time;
      console.log('RPH Tools - Entry time lapsed. ', flood_detect_users[name]);
    }
    else{
      flood_detect_users[name].count += 1;
      
      console.log('RPH Tools - user is flooding ', flood_detect_users[name]);
      if(flood_detect_users[name].count == 3){
        console.log('RPH Tools - User flooded', flood_detect_users[name]);
        flood_detect_users[name].count = 0;
        return false;
      }
    }   
  }
  
  return true;
}

function check_for_repeat(User, msg){
  var name = User.props.name;
  if(repeat_detect_users[name] === undefined){
    console.log('RPH Tools - Creating repeat entry for: ', name);
    var temp_user_stat = {
      "last_msg": '',
      "count": 1};
    temp_user_stat.last_msg = msg;
    repeat_detect_users[name] = temp_user_stat;
    console.log('RPH Tools - created flood entry ', repeat_detect_users[name]);
  }
  else{
    console.log('RPH Tools - Checking repeat entry.', 
                repeat_detect_users[name].last_msg,
                msg);
    if(repeat_detect_users[name].last_msg.match(msg))
    {
      console.log('RPH Tools - User repeated', name);
      repeat_detect_users[name].count += 1;
      
      if(repeat_detect_users[name].count >= 3){
        console.log('RPH tools - user repeated message 3 times:', name, repeat_detect_users[name].count, msg);
        repeat_detect_users[name].count = 0;
        
        return false;
      }
    }
    else{
      console.log('RPH Tools - User did not repeat', name);
      repeat_detect_users[name].last_msg = msg;
    }
  }
  
  return true;
}