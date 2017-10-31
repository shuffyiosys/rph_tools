// ==UserScript==
// @name       RPH Tools
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Tools
// @version    3.2.0
// @description Adds extended settings to RPH
// @match      http://chat.rphaven.com/
// @copyright  (c)2014 shuffyiosys@github
// @grant      none
// @license    MIT license (https://en.wikipedia.org/wiki/MIT_License)
// ==/UserScript==
/*jshint multistr: true */
/*jshint bitwise: false*/
/*global $:false */

var VERSION_STRING = 'RPH Tools 3.2.0';

var settingsDialog = {};var getInput = function (settingId) {
  return $('#' + settingId).val();
};

var getCheckBox = function (settingId) {
  return $('#' + settingId).is(':checked');
};

var dialogToggle = function (event) {
  var dialog = event.data.dialog;
  if (dialog.state === false) {
    if (event.data.onOpen !== undefined) {
      event.data.onOpen();
    }
    dialog.form.show();
    dialog.state = true;
  } else {
    if (event.data.onClose !== undefined) {
      event.data.onClose();
    }
    dialog.form.hide();
    dialog.state = false;
  }
};

var createDialog = function (element, form) {
  return {
    button: $(element),
    form: $(form),
    state: false
  };
};

var markProblem = function (element, mark) {
  if (mark === true) {
    $("#" + element).css('background', '#FF7F7F');
  } else {
    $("#" + element).css('background', '#FFF');
  }
};

var validateSetting = function (settingId, setting) {
  var validInput = false;
  var input = $('#' + settingId).val();

  switch (setting) {
    case "url":
      validInput = validateUrl(input);
      break;

    case "color":
      validInput = validateColor(input);
      break;
  }
  markProblem(settingId, !validInput);
  return validInput;
};

var validateColor = function (color) {
  var pattern = new RegExp(/(^#[0-9A-Fa-f]{6}$)|(^#[0-9A-Fa-f]{3}$)/i);
  return pattern.test(color);
};

var validateUrl = function (url) {
  var match = false;
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  var pingExt = url.slice((url.length - 4), (url.length));

  if (url === '') {
    match = true;
  } else if (regexp.test(url) === true) {
    if (pingExt == ".wav" || pingExt == ".ogg" || pingExt == ".mp3") {
      match = true;
    }
  }
  return match;
};

/****************************************************************************
 * @brief:    Tests the color range of the color to ensure its valid
 * @param:    TextColor - String representation of the color.
 *
 * @return:   True if the color is within range, false otherwise.
 ****************************************************************************/
var validateColorRange = function (TextColor) {
  var rawHex = TextColor.substring(1, TextColor.length);
  var red = 255;
  var green = 255;
  var blue = 255;

  /* If the color text is 3 characters, limit it to #DDD */
  if (rawHex.length == 3) {
    red = parseInt(rawHex.substring(0, 1), 16);
    green = parseInt(rawHex.substring(1, 2), 16);
    blue = parseInt(rawHex.substring(2, 3), 16);

    if ((red <= 13) && (green <= 13) && (blue <= 13)) {
      return true;
    }
  }
  /* If the color text is 6 characters, limit it to #D2D2D2 */
  else if (rawHex.length == 6) {
    red = parseInt(rawHex.substring(0, 2), 16);
    green = parseInt(rawHex.substring(2, 4), 16);
    blue = parseInt(rawHex.substring(4, 6), 16);
    if ((red <= 210) && (green <= 210) && (blue <= 210)) {
      return true;
    }
  }

  console.log('RPH Tools[validateColorRange]: Color check failed', rawHex, red, green, blue);
  return false;
};

/****************************************************************************
 * @brief Adds usernames to droplists.
 * @param user_id - ID of username
 ****************************************************************************/
var addUserToDroplist = function (user_id, droplist) {
  getUserById(user_id, function (User) {
    $('#' + droplist).append('<option value="' + user_id + '">' +
      User.props.name + '</option>');
  });
};

/****************************************************************************
 * @brief Clears droplists.
 ****************************************************************************/
var clearUsersDropLists = function (droplist) {
  $('#' + droplist).empty();
};

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
var arrayObjectIndexOf = function (objArray, key, value) {
  for (var i = 0; i < objArray.length; i++) {
    if (objArray[i][key] === value) {
      return i;
    }
  }
  return -1;
};

/****************************************************************************
 * @brief:    Checks if a search term is in an <a href=...> tag.
 * @param:    searchTerm - String to look for
 * @param:    msg - msg being searched.
 *
 * @return:   True or false if there's a match.
 ****************************************************************************/
var isInLink = function (searchTerm, msg) {
  var regexp = new RegExp('href=".*?' + searchTerm + '.*?"', '');
  return regexp.test(msg);
};

/****************************************************************************
 * @brief     Generates a hash value for a string
 *
 * @note      This was modified from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 ****************************************************************************/
String.prototype.hashCode = function () {
  var hash = 0,
    i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 31) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

/****************************************************************************
 * @brief:    Checks if the current account is a mod of the room.
 *
 * @param:    roomName: Name of the room.
 ****************************************************************************/
var isModOfRoom = function (room) {
  for (var idx = 0; idx < account.users.length; idx++) {
    if (room.props.mods.indexOf(account.users[idx]) > -1 ||
      room.props.owners.indexOf(account.users[idx]) > -1) {
      return true;
    }
  }
  return false;
};

function parseMsg_fixed(msg) {
  msg = msg.replace(/</g, '&lt;');
  msg = msg.replace(/>/g, '&gt;');
  msg = msg.replace(/\n/g, '<br />');
  msg = msg.replace(/="/g, '');
  msg = msg.replace(/(\[b\]|\*\*)(.*?)(\[\/b\]|\*\*)/g, '<strong>$2</strong>');
  msg = msg.replace(/(\-\-\-)/g, '&mdash;');
  msg = msg.replace(/(\[s\]|\-\-)(.*?)(\[\/s\]|\-\-)/g, '<strike>$2</strike>');
  msg = msg.replace(/(?:\[i\]|\/\/)([^\/].*?)(?:\[\/i\]|\/\/)/g, function (str, p1, offset, s) {
    if (s.charAt(offset - 1) == ":") {
      return str
    } else {
      return "<em>" + $('<div>' + p1 + '</div>').text() + "</em>"
    }
  });
  msg = msg.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?|^([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+.*)$)/gi, function (url) {
    var full_url = url;
    var extra = '';
    if (!full_url.match('^https?:\/\/')) {
      full_url = 'http://' + full_url;
    }
    if (url.match(/\.(jpg|jpeg|png|gif)/i)) {
      extra = 'class="img-wrapper"';
    } else if (url.match(/\S*youtube\.com\S*v=([\w-]+)/i)) {
      extra = 'class="vid-wrapper"';
    }
    return '<a href="' + $('<div>' + full_url + '</div>').text() + '" target="_blank" ' + extra + '>' + $('<div>' + url + '</div>').text() + '</a>';
  });
  return msg;
}

/****************************************************************************
 * This module handles the chat functions of the script.
 ****************************************************************************/
var chatModule = (function () {
  var pingSettings = {
    'triggers': [],
    'audioUrl': 'http://chat.rphaven.com/sounds/boop.mp3',
    'color': '#000',
    'highlight': '#FFA',
    'bold': false,
    'italics': false,
    'exact': false,
    'case': false,
  };

  var chatSettings = {
    'showNames': true,
    'noIcons': false,
    'strictUrl': false,
    'canCancel': false,
    'autoJoin': false,
    'session': false,
    'roomSession': [],
    'favRooms': [],
  };

  var localStorageName = "rpht_ChatModule";

  var html =
    '<h3 class="rpht_headers" id="chatSettingsHeader">Chat room</h3>' +
    '<div id="chatSettingsForm" style="display:none;">' +
    '<p style="border-bottom: 2px solid #EEE;">' +
    '<span style="background: #333; position: relative; top: 0.7em;"><strong>User text color</strong>&nbsp;</span>' +
    '</p>' +
    '<div class="rpht-block"><label>Username:</label><select  style="width: 300px;" id="userColorDroplist"></select></div>' +
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
    '<span style="background: #333; position: relative; top: 0.7em;"><strong>Auto Joining</strong>&nbsp; </span>' +
    '</p>' +
    '<div class="rpht-block"><label>Can Cancel:           </label><input type="checkbox" id="canCancelJoining" name="canCancelJoining" checked></div>' +
    '<div class="rpht-block"><label>Room Sessioning:      </label><input type="checkbox" id="roomSessioning" name="roomSessioning"></div>' +
    '<div class="rpht-block"><label>Join favorites:       </label><input type="checkbox" id="favEnable" name="favEnable"></div>' +
    '<div class="rpht-block"><label>Username: </label><select style="width: 300px;" id="favUserList"></select></div>' +
    '<div class="rpht-block"><label>Room:     </label><input style="width: 370px;" type="text" id="favRoom" name="favRoom"></div>' +
    '<div class="rpht-block"><label>Password: </label><input style="width: 370px;" type="text" id="favRoomPw" name="favRoomPw"></div>' +
    '<div class="rpht-block"><button type="button" id="favAdd">Add</button></div>' +
    '<p>Favorite rooms</p>' +
    '<select style="width: 403px;" id="favRoomsList" size="5"></select><br><br>' +
    '<div class="rpht-block"><button type="button" id="favRemove">Remove</button></div>' +
    '<br>' +
    '<p style="border-bottom: 2px solid #EEE;">' +
    '<span style="background: #333; position: relative; top: 0.7em;"><strong>Other Settings</strong>&nbsp; </span>' +
    '</p><br />' +
    '<div class="rpht-block"><label>Chat history: </label><input style="width: 300px;" type="number" id="chatHistory" name="chatHistory" max="65535" min="10" value="300"><br /><br /></div>' +
    '<div class="rpht-block"><label>No image icons in chat</label><input style="margin-right: 10px;" type="checkbox" id="imgIconDisable" name="imgIconDisable"></div>' +
    '<div class="rpht-block"><label>Show username in tabs & textbox (requires rejoin)</label><input style="margin-right: 10px;" type="checkbox" id="showUsername" name="showUsername"></div>' +
    '<div class="rpht-block"><label>Strict URL parser</label><input style="margin-right: 10px;" type="checkbox" id="strictUrl" name="strictUrl"></div>' +
    '</div>' +
    '<br />';

  var pingSound = null;

  var autoJoinTimer = null;

  var updateSessionTimer = null;

  var waitForDialog = true;

  const FAV_ROOM_MAX = 10;

  var init = function () {
    var autoJoining = false;
    var hasRooms = false;
    settingsDialog.chat = createDialog('#chatSettingsHeader', '#chatSettingsForm');
    settingsDialog.chat.button.click({
      dialog: settingsDialog.chat
    }, dialogToggle);

    $('#pingNames').blur(function () {
      var triggers = $('#pingNames').val().replace('\n', '').replace('\r', '');
      pingSettings.triggers = triggers;
      saveSettings();
    });

    $('#pingURL').blur(function () {
      if (validateSetting('pingURL', 'url')) {
        pingSettings.audioUrl = getInput('pingURL');
        saveSettings();
      }
    });

    $('#pingTextColor').blur(function () {
      if (validateSetting('pingTextColor', 'color')) {
        pingSettings.color = getInput('pingTextColor');
        saveSettings();
      }
    });

    $('#pingHighlightColor').blur(function () {
      if (validateSetting('pingHighlightColor', 'color')) {
        pingSettings.highlight = getInput('pingHighlightColor');
        saveSettings();
      }
    });

    $('#pingBoldEnable').change(function () {
      pingSettings.bold = getCheckBox('pingBoldEnable');
      saveSettings();
    });

    $('#pingItalicsEnable').change(function () {
      pingSettings.italics = getCheckBox('pingItalicsEnable');
      saveSettings();
    });

    $('#pingExactMatch').change(function () {
      pingSettings.exact = getCheckBox('pingExactMatch');
      saveSettings();
    });

    $('#pingCaseSense').change(function () {
      pingSettings.case = getCheckBox('pingCaseSense');
      saveSettings();
    });

    $('#showUsername').change(function () {
      chatSettings.showNames = getCheckBox('showUsername');
      saveSettings();
    });

    $('#imgIconDisable').change(function () {
      chatSettings.noIcons = getCheckBox('imgIconDisable');
      saveSettings();
    });

    $('#favEnable').click(function () {
      chatSettings.autoJoin = getCheckBox('favEnable');
      saveSettings();
    });

    $('#roomSessioning').click(function () {
      chatSettings.session = getCheckBox('roomSessioning');

      if (chatSettings.session) {
        updateSessionTimer = setInterval(updateSession, 30 * 1000);
      } else {
        clearTimeout(updateSessionTimer);
      }
      saveSettings();
    });

    $('#canCancelJoining').click(function () {
      chatSettings.canCancel = getCheckBox('canCancelJoining');
      saveSettings();
    });

    $('#strictUrl').click(function () {
      chatSettings.strictUrl = getCheckBox('strictUrl');
      saveSettings();
    });

    $('#favAdd').click(function () {
      addFavoriteRoom();
      saveSettings();
    });

    $('#favRemove').click(function () {
      removeFavoriteRoom();
      saveSettings();
    });

    $('#userNameTextColorButton').click(function () {
      changeTextColor();
    });

    $('#chatHistory').change(function () {
      rph.setSetting('maxHistory', parseInt($(this).val()));
    });

    loadSettings(JSON.parse(localStorage.getItem(localStorageName)));

    chatSocket.on('confirm-room-join', function (data) {
      roomSetup(data);
    });

    chatSocket.on('user-kicked', function (data) {
      for (var i = 0; i < account.users.length; i++) {
        if (data.targetid == account.users[i]) {
          $('<div class="inner"><p>You were kicked from ' +
            data.room + '.<br />' + ' Reason: ' + data.msg +
            '.</p></div>').dialog().dialog('open');
        }
      }
    });

    chatSocket.on('user-banned', function (data) {
      for (var i = 0; i < account.users.length; i++) {
        if (data.targetid == account.users[i]) {
          $('<div class="inner"><p>You were banned from ' +
            data.room + '.<br />' + ' Reason: ' + data.msg +
            '.</p></div>').dialog().dialog('open');
        }
      }
    });

    autoJoining = (chatSettings.autoJoin || chatSettings.session);
    hasRooms = (chatSettings.favRooms.length > 0 || chatSettings.roomSession.length > 0);
    if (autoJoining && hasRooms) {
      waitForDialog = chatSettings.canCancel;
      autoJoinTimer = setInterval(autoJoiningHandler, 2 * 1000);
    }
  }
  /**************************************************************************
   * @brief:    When user joins a room, do the following:
   *            - Set up the .onMessage function for pinging
   *            - Add the user's name to the chat tab and textarea
   *            - Create a room-pair name for the Modding section
   * @param:    room - Room that the user has joined
   **************************************************************************/
  var roomSetup = function (room) {
    var thisRoom = getRoom(room.room);
    var userId = GetIdFromChatTab(thisRoom);
    var moddingModule = rphToolsModule.getModule('Modding Module');

    thisRoom.onMessage = function (data) {
      if (account.ignores.indexOf(data.userid) > -1) {
        postMessage(this, data);
      }
    };

    if (chatSettings.showNames) {
      AddNameToUI(thisRoom, userId);
    }

    if (moddingModule !== null) {
      getUserById(room.userid, function (user) {
        var classes = GetClasses(user, thisRoom);
        if (classes.indexOf("mod") > -1 || classes.indexOf("owner") > -1){
          moddingModule.AddModFeatures(thisRoom, user);
        }
      });
    }

    ResizeChatTabs();
    if (jQuery._data(window, "events").resize === undefined) {
      $(window).resize(ResizeChatTabs);
    }

    if (chatSettings.session === true) {
      if (arrayObjectIndexOf(chatSettings.roomSession, 'roomname', room.room) === -1 ||
        arrayObjectIndexOf(chatSettings.roomSession, 'user', room.userid) === -1) {
        var tempData = {
          'roomname': room.room,
          'user': room.userid
        };
        chatSettings.roomSession.push(tempData);
      }
    }
  };

  /****************************************************************************
   * @brief:    Takes a message received in the chat and modifies it if it has
   *            a match for pinging
   * @param:    thisRoom - The room that the message is for.
   * @param:    data - The message for the room
   ****************************************************************************/
  var postMessage = function (thisRoom, data) {
    getUserById(data.userid, function (User) {
      var timestamp = makeTimestamp(data.time);
      var msg = parseMsg_rpht(data.msg);
      var classes = '';
      var $el = '';
      var msgHtml = '';

      if (User.blocked) {
        return;
      }

      classes = GetClasses(User, thisRoom);

      /* Check if this is a valid RNG */
      if (msg[msg.length - 1] === '\u200b') {
        msg += '&nbsp;<span style="background:#4A4; color: #000;">☑</span>';
      }

      /* Add pinging higlights */
      try {
        var testRegex = null;
        testRegex = MatchPing(msg, pingSettings.triggers, pingSettings.case,
          pingSettings.exact);
        if (testRegex !== null) {
          msg = HighlightPing(msg, testRegex, pingSettings.color,
            pingSettings.highlight, pingSettings.bold,
            pingSettings.italics);
          HighlightRoom(thisRoom, pingSettings.color, pingSettings.highlight);
          if (pingSound !== null) {
            pingSound.play();
          }
        }

        if (moddingModule !== null && isModOfRoom(thisRoom) === true) {
          var modSettings = moddingModule.getSettings();
          testRegex = MatchPing(msg, modSettings.alertWords, false, true);
          if (testRegex !== null) {
            msg = HighlightPing(msg, testRegex, "#EEE", "#E00", true, false);
            HighlightRoom(thisRoom, "#EEE", "#E00");
            if (pingSound !== null) {
              moddingModule.playAlert();
            }
            moddingModule.autoKick(thisRoom, data.userid, msg);
          }
        }
      } catch (err) {
        console.log('RPH Tools[postMessage]: I tried pinging D:', err);
        msg = parseMsg_rpht(data.msg);
      }

      if (msg.charAt(0) === '/' && msg.slice(1, 3) === 'me') {
        classes += 'action ';
        msg = msg.slice(3);
        msgHtml = '<span class="first">[' + timestamp +
          ']</span>\n<span style="color:#' + User.props.color +
          '"><a class="name" title="[' + timestamp +
          ']" style="color:#' + User.props.color +
          '">' + User.props.name + '</a>' + msg + '</span>';
      } else {
        msgHtml = '<span class="first">[' + timestamp + ']<a class="name" title="[' +
          timestamp + ']" style="color:#' + User.props.color + '">' +
          User.props.name +
          '<span class="colon">:</span></a></span>\n<span style="color:#' +
          User.props.color + '">' + msg + '</span>';
      }

      if (chatSettings.noIcons) {
        $el = AppendMessageTextOnly(msgHtml, thisRoom).addClass(classes);
      } else {
        $el = thisRoom.appendMessage(msgHtml).addClass(classes);
      }
      $el.find('br:gt(7)').remove();
    });
  };

  /****************************************************************************
   * @brief:    Gets the user name's classes that are applicable to it
   * @param:    User - User of the message
   * @param:    thisRoom - Room that the message is being sent to
   ****************************************************************************/
  var GetClasses = function (User, thisRoom) {
    var classes = '';
    if (User.friendOf) {
      classes += 'friend ';
    }
    if (isOwnUser(User)) {
      classes += 'self ';
    }
    if (isOwnerOf(thisRoom, User)) {
      classes += 'owner ';
    } else if (isModOf(thisRoom, User)) {
      classes += 'mod ';
    }
    if (isInGroup(thisRoom, User)) {
      classes += 'group-member ';
    }

    return classes;
  };

  /****************************************************************************
   * @brief:    Checks if the message has any ping terms
   * @param:    msg - The message for the chat as a string.
   *
   * @return:   Returns the match or null
   ****************************************************************************/
  var MatchPing = function (msg, triggers, caseSensitive, exactMatch) {
    if (!triggers) {
      return null;
    } else if (triggers.length === 0) {
      return null;
    }

    var testRegex = null;
    var pingNames = triggers.split(',');
    var regexParam = (caseSensitive ? "m" : 'im');
    if (triggers.length === 0) {
      return testRegex;
    }

    pingNames.forEach(function(pingName, index){
      if (pingName) {
        var regexPattern = pingNames[i].trim();
        if (exactMatch === true) {
          regexPattern = "\\b" + pingNames[i].trim() + "\\b";
        }

        /* Check if search term is not in a link. */
        if (isInLink(pingNames[i], msg) === false) {
          testRegex = new RegExp(regexPattern, regexParam);
          if (msg.match(testRegex)) {
            return testRegex;
          }
        }
      }
    });
    return testRegex;
  };

  /****************************************************************************
   * @brief:    Adds highlights to the ping term
   * @param:    msg - Message to be sent to the chat.
   * @param:    testRegex - Regular expression to use to match the term.
   *
   * @param:    Modified msg.
   ****************************************************************************/
  var HighlightPing = function (msg, testRegex, color, highlight, bold, italicize) {
    var boldEnabled = "";
    var italicsEnabled = "";

    if (bold === true) {
      boldEnabled = "font-weight: bold; ";
    }

    if (italicize === true) {
      italicsEnabled = "font-style:italic; ";
    }
    msg = msg.replace(testRegex, '<span style="color: ' + color +
      '; background: ' + highlight + '; ' + boldEnabled +
      italicsEnabled + '">' + msg.match(testRegex) + '</span>');

    return msg;
  };

  /****************************************************************************
   * @brief:  Adds a highlight to the room's tab
   * @param:  thisRoom - Room where the ping happened.
   ****************************************************************************/
  var HighlightRoom = function (thisRoom, color, highlight) {
    //Don't highlight chat tab if the chat is marked as active.
    var testRegex = new RegExp('active', 'im');
    var className = thisRoom.$tabs[0][0].className;

    if (className.search(testRegex) == -1) {
      thisRoom.$tabs[0].css('background-color', highlight);
      thisRoom.$tabs[0].css('color', color);

      thisRoom.$tabs[0].click(function () {
        thisRoom.$tabs[0].css('background-color', '#333');
        thisRoom.$tabs[0].css('color', '#6F9FB9');

        thisRoom.$tabs[0].hover(function () {
          thisRoom.$tabs[0].css('background-color', '#6F9FB9');
          thisRoom.$tabs[0].css('color', '#333');
        }, function () {
          thisRoom.$tabs[0].css('background-color', '#333');
          thisRoom.$tabs[0].css('color', '#6F9FB9');
        });
      });
    }
  };

  /****************************************************************************
   * @brief:  Adds user name to chat tab and chat textarea
   * @param:  thisRoom - Room that was entered
   * @param:  userId - ID of the user that entered
   ****************************************************************************/
  var AddNameToUI = function (thisRoom, userId) {
    getUserById(userId, function (User) {
      var tabsLen = thisRoom.$tabs.length;
      var idRoomName = thisRoom.$tabs[tabsLen - 1][0].className.split(' ')[2];
      var newTabHtml = '<span>' + thisRoom.props.name + '</span><p style="font-size: x-small; position: absolute; top: 12px;">' + User.props.name + '</p>';
      thisRoom.$tabs[tabsLen - 1].html(newTabHtml);
      $('<a class="close ui-corner-all">x</a>').on('click', function (ev) {
        ev.stopPropagation();
        chatSocket.emit('leave', {
          userid: User.props.id,
          name: thisRoom.props.name
        });
      }).appendTo(thisRoom.$tabs[tabsLen - 1]);
      $('textarea.' + idRoomName).prop('placeholder', 'Post as ' + User.props.name);
      $('textarea.' + idRoomName).css('color', "#" + User.props.color);
    });
  };

  /****************************************************************************
   * @brief:    Gets the user's ID from the chat tab (it's in the class)
   * @param:    thisRoom - Room to get the ID from
   ****************************************************************************/
  var GetIdFromChatTab = function (thisRoom) {
    var tabsLen = thisRoom.$tabs.length;
    var className = thisRoom.$tabs[tabsLen - 1][0].className;
    var charID = className.match(new RegExp(' [0-9]+', ''))[0];
    charID = charID.substring(1, charID.length);
    return parseInt(charID);
  };

  /****************************************************************************
   * @brief     Appends message to a room without adding an image icon
   * @param     html - HTML to add to the room.
   * @param     thisRoom - Object to the room receiving the message.
   *
   * @note      This was modified from RPH's original code, which is not covered
   *            by this license.
   ****************************************************************************/
  var AppendMessageTextOnly = function (html, thisRoom) {
    var $el = $('<div>\n' + html + '\n</div>').appendTo(thisRoom.$el);
    var extra = 5; //add more if near the bottom
    if (thisRoom.$el[0].scrollHeight - thisRoom.$el.scrollTop() < 50) {
      extra = 60;
    }
    thisRoom.$el.animate({
      scrollTop: '+=' + ($el.outerHeight() + extra)
    }, 180);

    if (thisRoom.$el.children('div').length > account.settings.maxHistory) {
      thisRoom.$el.children('div:not(.sys):lt(3)').remove();
    }

    return $el;
  };

  /****************************************************************************
   * @brief:   Resizes chat tabs accordingly
   ****************************************************************************/
  var ResizeChatTabs = function () {
    $('#chat-tabs').addClass('rpht_chat_tab');

    if ($('#chat-tabs')[0].clientWidth < $('#chat-tabs')[0].scrollWidth ||
      $('#chat-tabs')[0].clientWidth + 200 > $('#chat-bottom')[0].clientWidth) {
      $('#chat-top .inner').css('height', 'calc(100% - 20px)');
      $('#chat-bottom').css({
        'margin-top': '-160px',
        'height': '120px'
      });
      $('#chat-tabs').addClass('rpht_chat_tab_scroll');
      $('#chat-tabs').css('width', $('#chat-bottom')[0].clientWidth - 200);
    } else {
      $('#chat-top .inner').removeAttr('style');
      $('#chat-bottom').css({
        'margin-top': '-140px'
      });
      $('#chat-tabs').removeClass('rpht_chat_tab_scroll');
      $('#chat-tabs').css('width', 'auto');
    }
  };

  var parseMsg_rpht = function (msg) {
    var regex_html_loose = /((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?|^([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+.*)$)/gi;
    var regex_html_strict = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex_in_use = (chatSettings.strictUrl ? regex_html_strict : regex_html_loose);
    msg = msg.replace(/</g, '&lt;');
    msg = msg.replace(/>/g, '&gt;');
    msg = msg.replace(/\n/g, '<br />');
    msg = msg.replace(/="/g, '');
    msg = msg.replace(/(\[b\]|\*\*)(.*?)(\[\/b\]|\*\*)/g, '<strong>$2</strong>');
    msg = msg.replace(/(\-\-\-)/g, '&mdash;');
    msg = msg.replace(/(\[s\]|\-\-)(.*?)(\[\/s\]|\-\-)/g, '<strike>$2</strike>');
    msg = msg.replace(/(?:\[i\]|\/\/)([^\/].*?)(?:\[\/i\]|\/\/)/g, function (str, p1, offset, s) {
      if (s.charAt(offset - 1) == ":") {
        return str;
      } else {
        return "<em>" + $('<div>' + p1 + '</div>').text() + "</em>";
      }
    });

    msg = msg.replace(regex_in_use,
      function (url) {
        var full_url = url;
        if (!full_url.match('^https?:\/\/')) {
          full_url = 'http://' + full_url;
        }
        return '<a href="' + $('<div>' + full_url + '</div>').text() + '" target="_blank">' + $('<div>' + url + '</div>').text() + '</a>';
      });

    return msg;
  };

  var autoJoiningHandler = function () {
    if (roomnames.length > 0) {
      if (waitForDialog === true) {
        $('<div id="rpht-autojoin" class="inner">' +
          '<p>Autojoining or restoring session.</p>' +
          '<p>Press "Cancel" to stop autojoin or session restore.</p>' +
          '</div>').dialog({
          open: function (event, ui) {
            setTimeout(function () {
              $('#rpht-autojoin').dialog('close');
            }, 10 * 1000);
          },
          buttons: {
            Cancel: function () {
              clearTimeout(autoJoinTimer);
              $(this).dialog("close");
            }
          },
        }).dialog('open');

        waitForDialog = false;
        clearTimeout(autoJoinTimer);
        autoJoinTimer = setTimeout(autoJoiningHandler, 10 * 1000);
      } else {
        if (chatSettings.autoJoin === true) {
          joinFavoriteRooms();
        }
        if (chatSettings.session) {
          for (var i = 0; i < chatSettings.roomSession.length; i++) {
            var room = chatSettings.roomSession[i];
            var roomInFavs = arrayObjectIndexOf(chatSettings.favRooms, 'room', room.roomname) > -1;
            var userInFavs = arrayObjectIndexOf(chatSettings.favRooms, 'userId', room.user) > -1;
            var canJoin = (roomInFavs != userInFavs) || chatSettings.autoJoin;

            /* Restore session if:
                User xor room are not in favorites
                Autojoin is not enabled.
            */
            if (canJoin) {
              chatSocket.emit('join', {
                name: room.roomname,
                userid: room.user
              });
            }
          }
        }
        chatSettings.roomSession = [];
        clearTimeout(autoJoinTimer);
      }
    }
  };

  var joinFavoriteRooms = function () {
    console.log('Joining favorite rooms');
    for (var i = 0; i < chatSettings.favRooms.length; i++) {
      var favRoom = chatSettings.favRooms[i];
      console.log('Joining favorite room', favRoom);
      chatSocket.emit('join', {
        name: favRoom.room,
        userid: favRoom.userId,
        pw: favRoom.roomPw
      });
    }
  };

  var updateSession = function () {
    var tempSession = [];
    rph.roomsJoined.forEach(function(room, index){
      if (arrayObjectIndexOf(chatSettings.roomSession, 'roomname', room.roomname) > -1) {
        tempSession.push(rph.roomsJoined[i]);
      }
    });

    chatSettings.roomSession = tempSession;
    saveSettings();
  };

  var addFavoriteRoom = function () {
    var room = getRoom($('#favRoom').val());

    if (room === undefined) {
      markProblem('favRoom', true);
      return;
    }

    if (chatSettings.favRooms.length < 10) {
      var favExists = false;
      var hashStr = $('#favRoom').val() + $('#favUserList option:selected').html();
      var favRoomObj = {
        _id: hashStr.hashCode(),
        user: $('#favUserList option:selected').html(),
        userId: parseInt($('#favUserList option:selected').val()),
        room: $('#favRoom').val(),
        roomPw: $('#favRoomPw').val()
      };

      markProblem('favRoom', false);
      if (arrayObjectIndexOf(chatSettings.favRooms, "_id", favRoomObj._id) === -1) {
        $('#favRoomsList').append(
          '<option value="' + favRoomObj._id + '">' +
          favRoomObj.user + ": " + favRoomObj.room + '</option>'
        );
        chatSettings.favRooms.push(favRoomObj);
        console.log('RPH Tools[addFavoriteRoom]: Added favorite room', favRoomObj);
      }

      if (chatSettings.favRooms.length >= FAV_ROOM_MAX) {
        $('#favAdd').text("Favorites Full");
        $('#favAdd')[0].disabled = true;
      }
    }
  };

  var removeFavoriteRoom = function () {
    var favItem = document.getElementById("favRoomsList");
    var favItemId = $('#favRoomsList option:selected').val();
    favItem.remove(favItem.selectedIndex);

    for (var favs_i = 0; favs_i < chatSettings.favRooms.length; favs_i++) {
      if (chatSettings.favRooms[favs_i]._id == favItemId) {
        chatSettings.favRooms.splice(favs_i, 1);
        break;
      }
    }

    if (chatSettings.favRooms.length < 10) {
      $('#favAdd').text("Add");
      $('#favAdd')[0].disabled = false;
    }
  };

  var changeTextColor = function () {
    var text_color = $('input#userNameTextColor').val();
    if (validateColor(text_color) === false ||
      validateColorRange(text_color) === false) {
      markProblem('userNameTextColor', true);
    } else {
      var userId = $('#userColorDroplist option:selected').val();

      text_color = text_color.substring(1, text_color.length);
      getUserById(userId, function (User) {
        markProblem('userNameTextColor', false);
        sendToSocket('modify', {
          userid: User.props.id,
          color: text_color
        });
      });
    }
  };

  var saveSettings = function () {
    localStorage.setItem(localStorageName, JSON.stringify(getSettings()));
  };

  var loadSettings = function (storedSettings) {
    if (storedSettings !== null) {
      chatSettings = storedSettings.chatSettings;
      pingSettings = storedSettings.pingSettings;
    }
    populateSettings();
  };

  var deleteSettings = function () {
    localStorage.removeItem(localStorageName);
    pingSettings = {
      'triggers': [],
      'audioUrl': 'http://chat.rphaven.com/sounds/boop.mp3',
      'color': '#000',
      'highlight': '#FFA',
      'bold': false,
      'italics': false,
      'exact': false,
      'case': false,
    };

    chatSettings = {
      'showNames': true,
      'noIcons': false,
      'strictUrl': false,
      'canCancel': false,
      'autoJoin': false,
      'session': false,
      'favRooms': [],
      'RoomSession': [],
    };
    populateSettings();
  };

  var populateSettings = function () {
    clearUsersDropLists('favUserList');

    $('#pingNames').val(pingSettings.triggers);
    $('#pingURL').val(pingSettings.audioUrl);
    $('#pingTextColor').val(pingSettings.color);
    $('#pingHighlightColor').val(pingSettings.highlight);
    $('input#pingBoldEnable').prop("checked", pingSettings.bold);
    $('input#pingItalicsEnable').prop("checked", pingSettings.italics);
    $('input#pingExactMatch').prop("checked", pingSettings.exact);
    $('input#pingCaseSense').prop("checked", pingSettings.case);


    $('input#favEnable').prop("checked", chatSettings.autoJoin);
    $('input#showUsername').prop("checked", chatSettings.showNames);
    $('inputimgIconDisable').prop("checked", chatSettings.noIcons);
    $('#roomSessioning').prop("checked", chatSettings.session);
    $('#canCancelJoining').prop("checked", chatSettings.canCancel);
    $('#strictUrl').prop("checked", chatSettings.strictUrl);

    chatSettings.favRooms.forEach(function(favRoom, index){
      if (chatSettings.favRooms.length >= FAV_ROOM_MAX) {
        $('#favAdd').text("Favorites Full");
        $('#favAdd')[0].disabled = true;
      }
      else {
        $('#favRoomsList').append(
          '<option value="' + favRoom._id + '">' +
          favRoom.user + ": " + favRoom.room + '</option>'
        );
      }
    });

    pingSound = new Audio(pingSettings.audioUrl);

    if (chatSettings.session) {
      updateSessionTimer = setInterval(updateSession, 30 * 1000);
    }
  };

  /**************************************************************************
   * @brief Processes account events.
   *
   * @param account - Data blob countaining the user's account.
   **************************************************************************/
  var processAccountEvt = function (account) {
    var users = account.users;
    clearUsersDropLists('userColorDroplist');
    users.forEach(function(user, index){
      addUserToDroplist(user, 'userColorDroplist');
      addUserToDroplist(user, 'favUserList');
    });
  };

  var getSettings = function () {
    return {
      'chatSettings': chatSettings,
      'pingSettings': pingSettings
    };
  };

  return {
    init: init,

    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'Chat Module';
    },

    getSettings: getSettings,
    saveSettings: saveSettings,
    loadSettings: loadSettings,
    deleteSettings: deleteSettings,
    processAccountEvt: processAccountEvt,
  };
}());
var pmModule = (function () {
  var pmSettings = {
    'audioUrl': 'http://chat.rphaven.com/sounds/imsound.mp3',
    'noIcons': false,
  };

  var localStorageName = "rpht_PmModule";

  var html =
    '<h3 class="rpht_headers" id="pmSettingsHeader">PM</h3>' +
    '<div id="pmSettingsForm" style="display:none;">' +
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
    '<br />';

  var awayMessages = {};

  var init = function () {
    settingsDialog.pm = createDialog('#pmSettingsHeader', '#pmSettingsForm');
    settingsDialog.pm.button.click({
      dialog: settingsDialog.pm
    }, dialogToggle);

    $('#pmPingURL').change(function () {
      if (validateSetting('pmPingURL', 'url')) {
        pmSettings.audioUrl = getInput('pmPingURL');
        $('#im-sound').children("audio").attr('src', pmSettings.audioUrl);
        saveSettings();
      }
    });

    $('#pmMute').change(function () {
      if ($('#pmMute').is(":checked")) {
        $('#im-sound').children("audio").attr('src', '');
      } else {
        $('#im-sound').children("audio").attr('src', pmSettings.audioUrl);
      }
    });

    $('#pmIconsDisable').change(function () {
      pmSettings.noIcons = getCheckBox('pmIconsDisable');
      saveSettings();
    });

    $('#pmNamesDroplist').change(function () {
      var userId = $('#pmNamesDroplist option:selected').val();
      var message = '';

      if (awayMessages[userId] !== undefined) {
        message = awayMessages[userId].message;
      }
      $('input#awayMessageTextbox').val(message);
    });

    $('#setAwayButton').click(function () {
      setPmAway();
    });

    $('#removeAwayButton').click(function () {
      removePmAway();
    });

    loadSettings(JSON.parse(localStorage.getItem(localStorageName)));

    _on('pm', function (data) {
      handleIncomingPm(data);
    });

    _on('outgoing-pm', function (data) {
      handleOutgoingPm(data);
    });
  }

  /****************************************************************************
   * Handles incoming PMs.
   * @param data - Data containing the PM.
   ****************************************************************************/
  function handleIncomingPm(data) {
    getUserById(data.to, function (fromUser) {
      if (!awayMessages[data.from]) {
        return;
      }

      if (awayMessages[data.from].enabled) {
        awayMessages[data.from].usedPmAwayMsg = true;
        sendToSocket('pm', {
          'from': data.from,
          'to': data.to,
          'msg': awayMessages[data.from].message,
          'target': 'all'
        });
      }
    });
  }

  /****************************************************************************
   * Handles outgoing PMs.
   * @param data - Data containing the PM.
   ****************************************************************************/
  function handleOutgoingPm(data) {
    getUserById(data.from, function (fromUser) {
      if (!awayMessages[data.from]) {
        return;
      }

      if (!awayMessages[data.from].usedPmAwayMsg) {
        awayMessages[data.from].enabled = false;
        $('#pmNamesDroplist option').filter(function () {
          return this.value == data.from;
        }).css("background-color", "");
      }
      awayMessages[data.from].usedPmAwayMsg = false;
    });
  }

  /****************************************************************************
   * Sets up PM Away Messages
   ****************************************************************************/
  var setPmAway = function () {
    var userId = $('#pmNamesDroplist option:selected').val();
    var name = $("#pmNamesDroplist option:selected").html();
    if (!awayMessages[userId]) {
      var awayMsgObj = {
        "usedPmAwayMsg": false,
        "message": "",
        "enabled": true
      };
      awayMessages[userId] = awayMsgObj;
    } 

    if (!awayMessages[userId].enabled) {
      $("#pmNamesDroplist option:selected").html("[Away]" + name);
    }
    awayMessages[userId].enabled = true;
    awayMessages[userId].message = $('input#awayMessageTextbox').val();
    $("#pmNamesDroplist option:selected").css("background-color", "#FFD800");
    $("#pmNamesDroplist option:selected").prop("selected", false);

    console.log('RPH Tools[setPmAway]: Setting away message for',
      name, 'with message', awayMessages[userId].message);
  };

  /****************************************************************************
   * Removes PM away message
   ****************************************************************************/
  var removePmAway = function () {
    var userId = $('#pmNamesDroplist option:selected').val();

    if (!awayMessages[userId]) {
      return;
    }

    if (awayMessages[userId].enabled) {
      var name = $("#pmNamesDroplist option:selected").html();
      awayMessages[userId].enabled = false;
      $("#pmNamesDroplist option:selected").html(name.substring(6, name.length));
      $("#pmNamesDroplist option:selected").css("background-color", "");
      $('input#awayMessageTextbox').val("");
      console.log('RPH Tools[removePmAway]: Remove away message for', name);
    }
  };

  /****************************************************************************
   * Saves settings into the browser's local storage.
   ****************************************************************************/
  var saveSettings = function () {
    localStorage.setItem(localStorageName, JSON.stringify(pmSettings));
  };

  /****************************************************************************
   * Load settings from the browser's local storage.
   ****************************************************************************/
  var loadSettings = function (storedSettings) {
    if (storedSettings !== null) {
      pmSettings = storedSettings;
    }
    populateSettings();
  };

  /****************************************************************************
   * Deletes the local storage settings
   ****************************************************************************/
  var deleteSettings = function () {
    localStorage.removeItem(localStorageName);
    pmSettings = {
      'audioUrl': 'http://chat.rphaven.com/sounds/imsound.mp3',
      'noIcons': false,
    };
    populateSettings();
  };

  /****************************************************************************
   * Populate the GUI with settings from the browser's local storage
   ****************************************************************************/
  var populateSettings = function () {
    $('#pmPingURL').val(pmSettings.audioUrl);
    $('input#pmIconsDisable').prop("checked", pmSettings.noIcons);
  };

  /**************************************************************************
   * Processes account events.
   * @param account - Data blob countaining the user's account.
   **************************************************************************/
  var processAccountEvt = function (account) {
    var users = account.users;
    clearUsersDropLists('pmNamesDroplist');
    for (i = 0; i < users.length; i++) {
      addUserToDroplist(users[i], 'pmNamesDroplist');
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
      return 'PM Module';
    },

    getSettings: function () {
      return pmSettings;
    },

    saveSettings: saveSettings,
    loadSettings: loadSettings,
    deleteSettings: deleteSettings,
    processAccountEvt: processAccountEvt,
  };
}());
/*****************************************************************************
 * This module handles random number generation.
 *****************************************************************************/
var rngModule = (function () {
  const DIE_MIN = 1;
  const DIE_MAX = 10;
  const DIE_SIDE_MIN = 2;
  const DIE_SIDE_MAX = 100;
  const RNG_NUM_MIN = -4294967296;
  const RNG_NUM_MAX = 4294967296;

  var html =
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
    '<div class="rpht-block"><label>Number of die </label><input style="width: 300px;" type="number" id="diceNum" name="diceNum" max="10" min="1" value="2"></div>' +
    '<div class="rpht-block"><label>Sides </label><input style="width: 300px;" type="number" id="diceSides" name="diceSides" max="100" min="2" value="6"></div>' +
    '<div class="rpht-block"><label>Show Totals:</label><input type="checkbox" id="showRollTotals" name="showRollTotals"></div>' +
    '</div>' +
    '<div id="rngOptions" style="display: none;">' +
    '<div class="rpht-block"><label>Minimum: </label><input style="width: 300px;" type="number" id="rngMinNumber" name="rngMinNumber" max="4294967295" min="-4294967296" value="0"></div>' +
    '<div class="rpht-block"><label>Maximum: </label><input style="width: 300px;" type="number" id="rngMaxNumber" name="rngMaxNumber" max="4294967295" min="-4294967296" value="10"></div>' +
    '</div>' +
    '<div class="rpht-block"><button type="button" id="rngButton">Let\'s roll!</button></div>' +
    '</div>' +
    '<br />';

  var init = function () {
    settingsDialog.rng = createDialog('#rngHeader', '#rngForm');
    settingsDialog.rng.button.click({
      dialog: settingsDialog.rng
    }, dialogToggle);

    $('#diceNum').blur(function () {
      var dieNum = parseInt($('#diceNum').val());
      if (dieNum < DIE_MIN) {
        $('#diceNum').val(DIE_MIN);
      } else if (DIE_MAX < dieNum) {
        $('#diceNum').val(DIE_MAX);
      }
    });

    $('#diceSides').blur(function () {
      var dieSides = parseInt($('#diceSides').val());
      if (dieSides < DIE_SIDE_MIN) {
        $('#diceSides').val(DIE_SIDE_MIN);
      } else if (DIE_SIDE_MAX < dieSides) {
        $('#diceSides').val(DIE_SIDE_MAX);
      }
    });

    $('#rngMinNumber').blur(function () {
      var minNum = parseInt($('#rngMinNumber').val());
      if (minNum < RNG_NUM_MIN) {
        $('#rngMinNumber').val(RNG_NUM_MIN);
      } else if (RNG_NUM_MAX < minNum) {
        $('#rngMinNumber').val(RNG_NUM_MAX);
      }
    });

    $('#rngMaxNumber').blur(function () {
      var maxNum = parseInt($('#rngMaxNumber').val());
      if (maxNum < RNG_NUM_MIN) {
        $('#rngMaxNumber').val(RNG_NUM_MIN);
      } else if (RNG_NUM_MAX < maxNum) {
        $('#rngMaxNumber').val(RNG_NUM_MAX);
      }
    });

    $('#rngButton').click(function () {
      if ($('#coinRadio')[0].checked) {
        runRng('coin');
      } else if ($('#diceRadio')[0].checked) {
        runRng('dice');
      } else if ($('#rngRadio')[0].checked) {
        runRng('rng');
      }
    });

    $('#coinRadio').change(function () {
      changeRngPage('coin');
    });
    $('#diceRadio').change(function () {
      changeRngPage('dice');
    });
    $('#rngRadio').change(function () {
      changeRngPage('rng');
    });
  }

  /**************************************************************************
   * Performs an RNG action
   * @param:    "action", Which RNG action to perform ('coin', 'dice', 'rng')
   **************************************************************************/
  var runRng = function (action) {
    var class_name = $('li.active')[0].className.split(" ");
    var room_name = "";
    var this_room = null;
    var userID = parseInt(class_name[2].substring(0, 6));
    var outcomeMsg = '';
    var chatModule = rphToolsModule.getModule('Chat Module');

    /* Populate room name based on if showing usernames is checked. */
    if (chatModule) {
      var chatSettings = chatModule.getSettings();
      if (chatSettings.chatSettings.showNames) {
        room_name = $('li.active').find("span:first").text();
      } else {
        room_name = $('li.active')[0].textContent.slice(0, -1);
      }
    } else {
      room_name = $('li.active')[0].textContent.slice(0, -1);
    }

    this_room = getRoom(room_name);

    if (action == "coin") {
      outcomeMsg = genCoinFlip();
    } else if (action == "dice") {
      var dieNum = parseInt($('#diceNum').val());
      var dieSides = parseInt($('#diceSides').val());
      var showTotals = getCheckBox('showRollTotals');
      outcomeMsg = getDiceRoll(dieNum, dieSides, showTotals);
    } else if (action == "rng") {
      var minNum = parseInt($('#rngMinNumber').val());
      var maxNum = parseInt($('#rngMaxNumber').val());
      outcomeMsg = genRandomNum(minNum, maxNum);
    }
    outcomeMsg += '\u200b';
    this_room.sendMessage(outcomeMsg, userID);
    disableRngButtons(action);
  };

  /****************************************************************************
   * Generates a coin toss
   ****************************************************************************/
  var genCoinFlip = function () {
    var coinMsg = '(( Coin toss: ';
    if (Math.ceil(Math.random() * 2) == 2) {
      coinMsg += '**heads!**))';
    } else {
      coinMsg += '**tails!**))';
    }

    return coinMsg;
  };

  /**************************************************************************
   * Generates a dice roll.
   **************************************************************************/
  var getDiceRoll = function (dieNum, dieSides, showTotals) {
    var totals = 0;
    var dieMsg = '/me rolled ' + dieNum + 'd' + dieSides + ':';
    for (i = 0; i < dieNum; i++) {
      var result = Math.ceil(Math.random() * dieSides);
      if (showTotals) {
        totals += result;
      }
      dieMsg += ' ';
      dieMsg += result;
    }
    if (showTotals) {
      dieMsg += " (Total amount: " + totals + ")";
    }
    return dieMsg;
  };

  /**************************************************************************
   * Generates a random number
   **************************************************************************/
  var genRandomNum = function (minNum, maxNum) {
    var ranNumMsg = '(( Random number generated (' + minNum + ' to ' + maxNum + '): **';
    ranNumMsg += Math.floor((Math.random() * (maxNum - minNum) + minNum)) + '** ))';
    return ranNumMsg;
  };

  /**************************************************************************
   * Disables the RNG buttons for three seconds.
   **************************************************************************/
  var disableRngButtons = function (action) {
    $('#rngButton').text('Wait...');
    $('#rngRadio')[0].disabled = true;
    $('#diceRadio')[0].disabled = true;
    $('#coinRadio')[0].disabled = true;
    $('#rngButton')[0].disabled = true;

    setTimeout(function () {
      $('#rngRadio')[0].disabled = false;
      $('#diceRadio')[0].disabled = false;
      $('#coinRadio')[0].disabled = false;
      $('#rngButton')[0].disabled = false;
      changeRngPage(action);
    }, 3000);
  };

  /**************************************************************************
   * Changes the RNG options being displayed
   * @param:    "option", option to be displayed ("coin", "dice", "rng")
   **************************************************************************/
  var changeRngPage = function (option) {
    if (option === 'coin') {
      $('#diceOptions').hide();
      $('#rngOptions').hide();
      $('#rngButton').text('Flip it!');
    } else if (option === 'dice') {
      $('#diceOptions').show();
      $('#rngOptions').hide();
      $('#rngButton').text('Let\'s roll!');
    } else if (option === 'rng') {
      $('#diceOptions').hide();
      $('#rngOptions').show();
      $('#rngButton').text('Randomize!');
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
  };
}());
/******************************************************************************
 * This module handles adding blocking of users. This is meant to supersede
 * RPH's blocking mechanisms since it isn't always reliable.
 *****************************************************************************/
var blockingModule = (function () {
  var blockedUsers = [];

  var localStorageName = 'rpht_BlockingModule';

  var html =
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
    '<br />';

  var init = function () {
    settingsDialog.blocking = createDialog('#blockHeader', '#blockForm');
    settingsDialog.blocking.button.click({
      dialog: settingsDialog.blocking
    }, dialogToggle);

    $('#blockButton').click(function () {
      var username = $('#nameCheckTextbox').val();
      if (username) {
        getUserByName(username, function (user) {
          addToBlockList(user);
          user.blocked = true;
        });
      }
    });

    $('#unblockButton').click(function () {
      var names = document.getElementById("blockedDropList");
      var userId = $('#blockedDropList option:selected').val();
      getUserById(UserId, function (user) {
        user.blocked = false;
        names.remove(names.selectedIndex);
        blockedUsers.splice(blockedUsers.indexOf(userId), 1);
      });
    });

    _on('ignores', function (data) {
      getUserById(data.ids[0], function (user) {
        addToBlockList(user);
        user.blocked = true;
      });
    });

    loadSettings();

    setInterval(reblockList, 30 * 1000);
  };

  /**************************************************************************
   * Adds a user to the internal and dialog block list.
   * @param:    user - User object for the username being blocked
   *************************************************************************/
  var addToBlockList = function (user) {
    var inList = false;

    for (var i = 0; i < blockedUsers.length && !inList; i++) {
      if (user.props.id == blockedUsers[i].id) {
        inList = true;
      }
    }

    if (!inList) {
      blockedUsers.push({
        id: user.props.id,
        name: user.props.name
      });
      $('#blockedDropList').append('<option value="' + user.props.id + '">' +
        user.props.name + '</option>');
    }
  };

  /************************************************************************
   * @brief:   Blocks everyone on the list. Used to refresh blocking.
   ************************************************************************/
  var reblockList = function () {
    blockedUsers.forEach(function(blockedUser, index){
      getUserByName(blockedUser.id, function (user) {
        addToBlockList(user);
        user.blocked = true;
      });
    });
  };

  /*************************************************************************
   * Saves settings into the browser's local storage
   *************************************************************************/
  var saveSettings = function () {
    localStorage.setItem(localStorageName, JSON.stringify(blockedUsers));
  };

  /*************************************************************************
   * Loads settings from the browser's local storage
   *************************************************************************/
  var loadSettings = function () {
    var storedSettings = JSON.parse(localStorage.getItem(localStorageName));
    if (storedSettings !== null) {
      blockedUsers = storedSettings;
    }

    clearUsersDropLists('blockedDropList');
    blockedUsers.forEach(function(blockedUser, index){
      $('#blockedDropList').append('<option value="' + blockedUser.id + '">' +
      blockedUser.name + '</option>');
    });
    reblockList();
  };

  /*************************************************************************
   * Deletes settings from the browser's local storage
   *************************************************************************/
  var deleteSettings = function () {
    localStorage.removeItem(localStorageName);
    blockedUsers = [];
    clearUsersDropLists('blockedDropList');
  };

  return {
    init: init,

    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'Blocking Module';
    },

    getSettings: function () {
      return blockedUsers;
    },

    saveSettings: saveSettings,
    loadSettings: loadSettings,
    deleteSettings: deleteSettings,
  };
}());
/******************************************************************************
 * This module handles chat modding features. These include an easier way to
 * issue kicks, bans, promotions and demotions. It also can set up monitoring
 * of certain words and kick the person automatically.
 *****************************************************************************/
var moddingModule = (function () {
  var settings = {
    'alertWords': [],
    'alertUrl': 'http://chat.rphaven.com/sounds/boop.mp3',
    'autoKick': false,
  };
  
  var localStorageName = "rpht_modSettings";
  
  var html =
    '<h3 class="rpht_headers" id="moddingHeader">Modding</h3>' +
    '<div id="moddingForm" style="display:none;">' +
    '<p style="border-bottom: 2px solid #EEE;">' +
    '<span style="background: #333; position: relative; top: 0.7em;"><strong>Mod Commands</strong>&nbsp;</span>' +
    '</p><br />' +
    '<p>This will only work if you\'re actually a mod and you own the user name.</p>' +
    '<br />' +
    '<div class="rpht-block">' +
    '<label>Room-Name pair</label>' +
    '<select style="width: 300px;" id="roomModSelect">' +
    '<option value=""></option>' +
    '</select>' +
    '</div>' +
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
    '<button style="margin-left: 6px;" type="button" id="unmodButton">Unmod</button>' +
    '</div>' +
    '<p style="border-bottom: 2px solid #EEE;">' +
    '<span style="background: #333; position: relative; top: 0.7em;"><strong>Word Alerter</strong>&nbsp;</span>' +
    '</p><br />' +
    '<p>Words to trigger alert (comma separated, no spaces)</p>' +
    '<textarea name="modAlertWords" id="modAlertWords" class="rpht_textarea"></textarea>' +
    '<div class="rpht-block"><label>Alert URL:   </label><input style="width: 370px;" type="text" id="modAlertUrl" name="modAlertUrl"></div>' +
    '<div class="rpht-block"><label>Autokick: </label><input style="margin-right: 10px;" type="checkbox" id="modAutoKick" name="modAutoKick"></div>' +
    '</div>' +
    '<br />';
    
  var alertSound = null;
  
  var suppressautoKick = false;
  
  var supressTimer = null;
  
  var roomNamePairs = {};

  const actionToString = {
    'ban': 'Banning: ',
    'unban': 'Unbanning: ',
    'add-mod': 'Adding mod: ',
    'rmeove-mod': 'Removing mod: ',
    'kick': 'Kicking: '
  };

  var init = function () {
    settingsDialog.modding = createDialog('#moddingHeader', '#moddingForm');
    settingsDialog.modding.button.click({
      dialog: settingsDialog.modding
    }, dialogToggle);

    $('#roomModSelect').change(function () {
      var roomModeIdx = $('#roomModSelect')[0].selectedIndex;
      var roomModVal = $('#roomModSelect')[0].options[roomModeIdx].value;
      if (!roomNamePairs[roomModVal]) {
        $('input#modRoomTextInput').val(roomNamePairs[roomModVal].room);
        $('input#modFromTextInput').val(roomNamePairs[roomModVal].modName);
      } else {
        $('input#modRoomTextInput').val("");
        $('input#modFromTextInput').val("");
      }
    });

    $('#resetPassword').click(function () {
      var room = $('input#modRoomTextInput').val();
      var user = $('input#modFromTextInput').val();
      getUserByName($('input#modFromTextInput').val(), function (user) {
        var userId = user.props.id;
        chatSocket.emit('modify', {
          room: room,
          userid: userId,
          props: {
            pw: false
          }
        });
      });
    });

    $('#kickButton').click(function () {
      modAction('kick');
    });

    $('#banButton').click(function () {
      modAction('ban');
    });

    $('#unbanButton').click(function () {
      modAction('unban');
    });

    $('#modButton').click(function () {
      modAction('add-mod');
    });

    $('#unmodButton').click(function () {
      modAction('remove-mod');
    });

    $('#modAlertWords').blur(function () {
      settings.alertWords = $('#modAlertWords').val().replace(/\r?\n|\r/, '');
      saveSettings();
    });

    $('#modAlertUrl').blur(function () {
      if (validateSetting('modAlertUrl', 'url')) {
        settings.alertUrl = getInput('modAlertUrl');
        saveSettings();
        alertSound = new Audio(settings.alertUrl);
      }
    });

    $('#modAutoKick').click(function () {
      settings.autoKick = getCheckBox('modAutoKick');
      saveSettings();
    });

    loadSettings();
    populateSettings();
  };
  /****************************************************************************
   * Performs a modding action
   * @param:    action - string command that has the action.
   ****************************************************************************/
  var modAction = function (action) {
    var targets = $('#modTargetTextInput').val().replace(/\r?\n|\r/, '');
    targets = targets.split(';');
    console.log('RPH Tools[modAction]: Performing', action, 'on', targets);

    targets.forEach(function(target, index){
      emitModAction(action, target);
    });
  };

  /****************************************************************************
   * Sends off the mod action
   * @param:    action - string command that has the action.
   * @param:    targetName - user name that the action is meant for.
   ****************************************************************************/
  var emitModAction = function (action, targetName) {
    getUserByName(targetName, function (target) {
      getUserByName($('input#modFromTextInput').val(), function (user) {
        var modMessage = ' ';
        modMessage += $("input#modMessageTextInput").val();
  
        if (action === 'add-mod' || action === 'remove-mod') {
          modMessage = '';
        }
        chatSocket.emit(action, {
          room: $('input#modFromTextInput').val(),
          userid: user.props.id,
          targetid: target.props.id,
          msg: modMessage
        });
  
        //modMessage = actionToString[action] + target.props.name + ' by: ' + 
        //  $('input#modFromTextInput').val() + ' in room: ' + 
        //  $('input#modRoomTextInput').val();
        //console.log('RPH Tools[emitModAction]:', modMessage);
      });
    });
  };

  /****************************************************************************
   * Initializes extra features if user is a mod of the room.
   * @param:  thisRoom - Room that was entered
   * @param:  userId - ID of the user that entered
   ****************************************************************************/
  var addModFeatures = function (thisRoom, user) {
    var userName = user.props.name;
    var roomNamePair = thisRoom.props.name + ': ' + userName;
    var roomNameValue = thisRoom.props.name + '.' + userId;
    var roomNameObj = {
      'roomName': thisRoom.props.name,
      'modName': userName,
      'modId': userId
    };

    if (roomNamePairs[roomNameValue] === undefined) {
      roomNamePairs[roomNameValue] = roomNameObj;
      $('#roomModSelect').append('<option value="' + roomNameValue + '">' + 
        roomNamePair + '</option>');
      console.log("RPH Tools[addModFeatures]: Added room mod pair", roomNamePairs);
    }

    suppressAutoKick = true;
    suppressTimer = setTimeout(function () {
      suppressAutoKick = false;
    }, 3 * 1000);
  };

  /****************************************************************************
   * Plays the alert sound
   ****************************************************************************/
  var playAlert = function () {
    if (alertSound !== null) {
      alertSound.play();
    }
  };

  /****************************************************************************
   * Kicks a user due matching an alert word
   ****************************************************************************/
  var autoKick = function (room, targetId, msg) {
    if (settings.autoKick && suppressAutoKick === false) {
      roomNamePairs.forEach(function(pairObj, index){
        if (pairObj.roomName === room.props.name && 
            account.users.indexOf(targetId) === -1) {
          chatSocket.emit('kick', {
            room: room.props.name,
            userid: pairObj[idx].modId,
            targetid: targetId,
            msg: "You've been kicked for saying: " + msg
        });
      }
      });
    }
  };

  /****************************************************************************
   * Saves settings to local storage
   ****************************************************************************/
  var saveSettings = function () {
    localStorage.setItem(localStorageName, JSON.stringify(settings));
  };

  /****************************************************************************
   * Loads settings, if they exist.
   ****************************************************************************/
  var loadSettings = function () {
    var storedSettings = JSON.parse(localStorage.getItem(localStorageName));

    if (storedSettings) {
      settings = storedSettings;
      populateSettings();
    }
  };

  /****************************************************************************
   * Deleting settings.
   ****************************************************************************/
  var deleteSettings = function () {
    localStorage.removeItem(localStorageName);
    settings = {
      'alertWords': [],
      'alertUrl': 'http://chat.rphaven.com/sounds/boop.mp3',
      'autoKick': false,
    };
    populateSettings();
  };

  /****************************************************************************
   * Populates the GUI
   ****************************************************************************/
  var populateSettings = function () {
    $('#modAlertWords').val(settings.alertWords);
    $('#modAlertUrl').val(settings.alertUrl);
    $('input#modAutoKick').prop("checked", settings.autoKick);
    alertSound = new Audio(settings.alertUrl);
  };

  return {
    init: init,

    getHtml: function () {
      return html;
    },

    toString: function () {
      return 'Modding Module';
    },

    getSettings: function () {
      return settings;
    },

    addModFeatures: addModFeatures,
    saveSettings: saveSettings,
    playAlert: playAlert,
    autoKick: autoKick,
  };
}());/******************************************************************************
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

/*****************************************************************************
    THIS MODULE MUST EXIST FOR THE SCRIPT TO WORK.
******************************************************************************/
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

/****************************************************************************
 * Script initializations to execute after the page loads
 ***************************************************************************/
$(function () {
  console.log(VERSION_STRING, 'start');
  var modules = [
    chatModule,
    pmModule,
    rngModule,
    blockingModule,
    moddingModule,
    settingsModule,
    aboutModule,
  ];
  
  rphToolsModule.init(modules);
  unsafeWindow.parseMsg = parseMsg_fixed;
});