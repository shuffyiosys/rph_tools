// ==UserScript==
// @name       RPH Extended Settings
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Pings_Test
// @version    1.1.0
// @description Pings and highlights entered usernames in RPH.
// @match      http://chat.rphaven.com/
// @copyright  Original script (c)2012+  nick_rp1986yahoo.com, Modifications (c)2014 shuffyiosys@github
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
  
// HTML code to be injected into the chat.
var html = '\
  <div id="settingsBox" style="display: none; position: absolute; top: 35px; z-index: 9999999; height: 360px; width: 480px; border-radius: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.7); right: 85px; background: url(&quot;http://www.rphaven.com/css/img/aero-bg.png&quot;) repeat scroll 0px 0px transparent; padding: 5px;" left="">\
    <h3 style="text-align: center; color:#000;">RPH Extended Settings</h3>\
    <div id="settingsContainer" style="height: 330px; width: 100%; overflow: auto; background: rgb(51, 51, 51); padding: 10px; border-radius: 5px; font-size: 0.8em;">\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="pingHeader">Pings</h3>\
      <form id="ping_form" style="display:none;">\
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
        <input style="width: 40px;" type="checkbox" id="pingBoldEnable" name="pingBoldEnable"><strong>Bold</strong>\
        <input style="width: 40px;" type="checkbox" id="pingItalicsEnable" name="pingItalicsEnable"><em>Italics</em>\
        <input style="width: 40px;" type="checkbox" id="pingExactMatch" name="pingExactMatch">Exact match\
        <input style="width: 40px;" type="checkbox" id="pingCaseSense" name="pingCaseSense">Case sensitive\
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
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="blockHeader">Blocking</h3>\
      <form id="blockForm" style="display:none;">\
        <br />\
        <select style="width: 100%;" id="blockedDropList"></select>\
        <br />\
        <button type="button" id="unblockButton">Unblock</button>\
      </form>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="modHeader">Mod Tools</h3>\
      <form id="modForm" style="display:none;">\
        <p>Users and their IDs</p>\
        <textarea name="idNamesTextarea" id="idNamesTextarea" style="background: rgb(255, 255, 255); height: 250px; width: 390px;"> </textarea>\
        <p>Autokick list</p>\
        <textarea name="autokickTextarea" id="autokickTextarea" style="background: rgb(255, 255, 255); height: 250px; width: 390px;"> </textarea>\
        <br />\
        <input style="width: 40px;" type="checkbox" id="floodCheckbox" name="floodCheckbox">Flood kicking\
        <input style="width: 40px;" type="checkbox" id="repeatCheckbox" name="repeatCheckbox">Repeat kicking\
      </form>\
      <br />\
      <h3 style="cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;" id="aboutHelpHeader">About/Help</h3>\
      <form id="aboutHelpForm" style="display:none;">\
        <br><p>Click on the "Pings" button again to save your settings!</p>\
        <p>You may need to refresh the chat for the settings to take effect.</p>\
        <br><p><a href="http://www.rphaven.com/topics.php?id=1" target="_blank">Report a problem</a> |\
        <a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Pings#troubleshooting" target=_blank">Troubleshooting Tips</a> | RPH Tools Demo</p>\
      </form>\
    </div>\
  </div>';


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

  _on('outgoing-change-active-window', function(data){
    console.log('stuff', data);
  });
  
  $('#top p.right').prepend('<a class="pings settings">More Settings</a>|');
  $('body').append(html);
  settingsTool.box = $('#settingsBox');
  settingsTool.button = $('#top a.pings');    
  SetUpPingDialog();
});

/****************************************************************************
 * @brief: Sets up all the ping dialog box GUI handling.
 **/
function SetUpPingDialog(){

  settingsTool.button.click(function(){
    if(settingsTool.state === false)
    {
      populateSettingsDialog();
      settingsTool.state = true;
      settingsTool.box.show();
    }
    else
    {
      if(validSettings === true)
      {
        return;
      }
      if((pingSettings.flags & 1) > 0){
        console.log('RPH Pings - Settings were changed');
        pingSettings.flags &= ~1;
        saveSettings(pingSettings);
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
  ModToolsSetup();
    
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
    }
  });
  
  $('#pingNames').blur(function(){
    pingSettings.pings = pingTool.input.val().replace('\n','').replace('\r','');
    pingSettings.flags |= 1;
    console.log("RPH Pings - Ping names changed.");
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
    var new_msg = '';
    var sides = parseInt($('#diceSides').val());
    var num = parseInt($('#diceNum').val());
    console.log('Rolling...');
    for(i = 0; i < num; i++){
      new_msg += Math.ceil(Math.random() * sides) + ' ';
    }
    
    console.log(new_msg);
  });
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
    
  $('#unblockButton').click(function(){
    alert('Press!');
  });  
}

/****************************************************************************
* Mod tools functions
*****************************************************************************/
function ModToolsSetup(){
  $('#modHeader').click(function(){
    if(modTool.state === true){
      $('#modForm').hide();
      modTool.state = false;
    }
    else{
      $('#modForm').show();
      modTool.state = true;
    }
  });
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
// @brief: Takes messages received from the chat and figures out if it needs
//         to ping the user.
//
function doRoomJoinSetup(roomName){
 
}
