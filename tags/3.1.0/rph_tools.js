// ==UserScript==
// @name       RPH Tools
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Tools
// @version    3.1.0a
// @description Adds extended settings to RPH
// @match      http://chat.rphaven.com
// @copyright  (c)2014 shuffyiosys@github
// @grant      none
// @license    MIT license (https://en.wikipedia.org/wiki/MIT_License)
// ==/UserScript==
/*jshint multistr: true */
/*jshint bitwise: false*/
/*global $:false */

/* Template for Modules
var = (function(){
    html = '';
    return {
        init : function(){
        },

        getHtml : function(){
            return html;
        },

        toString : function(){
            return ' Module';
        },
    };
}());
*/

var VERSION_STRING = 'RPH Tools 3.1.0a';

var settingsDialog = {};

var GetInput = function(settingId) {
  return $('#' + settingId).val();
};

var GetCheckBox = function(settingId) {
  return $('#' + settingId).is(':checked');
};

var DialogToggle = function(event) {
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

var CreateDialog = function(element, form) {
  return {
    button: $(element),
    form: $(form),
    state: false
  };
};

var MarkProblem = function(element, mark) {
  if (mark === true) {
    $("#" + element).css('background', '#FF7F7F');
  } else {
    $("#" + element).css('background', '#FFF');
  }
};

var ValidateSetting = function(settingId, setting) {
  var validInput = false;
  var input = $('#' + settingId).val();

  switch (setting) {
    case "url":
      validInput = ValidateUrl(input);
      break;

    case "color":
      validInput = ValidateColor(input);
      break;
  }
  MarkProblem(settingId, !validInput);
  return validInput;
};

var ValidateColor = function(color) {
  var pattern = new RegExp(/(^#[0-9A-Fa-f]{6}$)|(^#[0-9A-Fa-f]{3}$)/i);
  return pattern.test(color);
};

var ValidateUrl = function(url) {
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
var ValidateColorRange = function(TextColor) {
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

  console.log('RPH Tools[ValidateColorRange]: Color check failed', rawHex, red, green, blue);
  return false;
};

/****************************************************************************
 * @brief Adds usernames to droplists.
 * @param user_id - ID of username
 ****************************************************************************/
var AddUserToDroplist = function(user_id, droplist) {
  getUserById(user_id, function(User) {
    $('#' + droplist).append('<option value="' + user_id + '">' +
      User.props.name + '</option>');
  });
};

/****************************************************************************
 * @brief Clears droplists.
 ****************************************************************************/
var ClearUsersDropLists = function(droplist) {
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
var ArrayObjectIndexOf = function(objArray, key, value) {
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
var IsInLink = function(searchTerm, msg) {
  var regexp = new RegExp('href=".*?' + searchTerm + '.*?"', '');
  return regexp.test(msg);
};

/****************************************************************************
 * @brief     Generates a hash value for a string
 *
 * @note      This was modified from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 ****************************************************************************/
String.prototype.hashCode = function() {
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
var IsModOfRoom = function(room){
  for(var idx = 0; idx < account.users.length; idx++){
    if (room.props.mods.indexOf(account.users[idx]) > -1 ||
        room.props.owners.indexOf(account.users[idx]) > -1 ){
      return true;
    }
  }
  return false;
};

/****************************************************************************
 * @brief:    Module for handling the chat functions of the script.
 ****************************************************************************/
var ChatModule = (function() {
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

  var pingSound = null;

  var autoJoinTimer = null;

  var updateSessionTimer = null;

  var waitForDialog = true;

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

  /**************************************************************************
   * @brief:    When user joins a room, do the following:
   *            - Set up the .onMessage function for pinging
   *            - Add the user's name to the chat tab and textarea
   *            - Create a room-pair name for the Modding section
   * @param:    room - Room that the user has joined
   **************************************************************************/
  var roomSetup = function(room) {
    var thisRoom = getRoom(room.room);
    var userId = GetIdFromChatTab(thisRoom);
    var moddingModule = RphToolsModule.GetModule('Modding Module');

    thisRoom.onMessage = function(data) {
      var thisRoom = this;
      if (account.ignores.indexOf(data.userid) !== -1) {
        return;
      }
      postMessage(thisRoom, data);
    };

    if (chatSettings.showNames) {
      AddNameToUI(thisRoom, userId);
    }

    if (moddingModule !== null) {
      getUserById(room.userid, function(User) {
        var classes = GetClasses(User, thisRoom);
        moddingModule.AddModFeatures(thisRoom, userId, classes);
      });
    }

    ResizeChatTabs();
    if (jQuery._data(window, "events").resize === undefined) {
      $(window).resize(ResizeChatTabs);
    }

    if (chatSettings.session === true) {
      if (ArrayObjectIndexOf(chatSettings.roomSession, 'roomname', room.room) === -1 ||
        ArrayObjectIndexOf(chatSettings.roomSession, 'user', room.userid) === -1) {
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
  var postMessage = function(thisRoom, data) {
    getUserById(data.userid, function(User) {
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

        if (ModdingModule !== null && IsModOfRoom(thisRoom) === true){
          var modSettings = ModdingModule.GetSettings();
          testRegex = MatchPing(msg, modSettings.alertWords, false, true);
          if (testRegex !== null) {
            msg = HighlightPing(msg, testRegex, "#EEE", "#E00", true, false);
            HighlightRoom(thisRoom, "#EEE", "#E00");
            if (pingSound !== null) {
              ModdingModule.PlayAlert();
            }
            ModdingModule.AutoKick(thisRoom, data.userid, msg);
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
  var GetClasses = function(User, thisRoom) {
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
  var MatchPing = function(msg, triggers, caseSensitive, exactMatch) {
    var testRegex = null;
    var pingNames = triggers.split(',');
    var regexParam = (caseSensitive ? "m" : 'im');
    if (triggers.length === 0) {
      return testRegex;
    }

    for (i = 0; i < pingNames.length; i++) {
      if (pingNames[i] !== "") {
        var regexPattern = pingNames[i].trim();
        if (exactMatch === true) {
          regexPattern = "\\b" + pingNames[i].trim() + "\\b";
        }

        /* Check if search term is not in a link. */
        if (IsInLink(pingNames[i], msg) === false) {
          testRegex = new RegExp(regexPattern, regexParam);
          if (msg.match(testRegex)) {
            return testRegex;
          }
        }
      }
    }
    return null;
  };

  /****************************************************************************
   * @brief:    Adds highlights to the ping term
   * @param:    msg - Message to be sent to the chat.
   * @param:    testRegex - Regular expression to use to match the term.
   *
   * @param:    Modified msg.
   ****************************************************************************/
  var HighlightPing = function(msg, testRegex, color, highlight, bold, italicize) {
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
  var HighlightRoom = function(thisRoom, color, highlight) {
    //Don't highlight chat tab if the chat is marked as active.
    var testRegex = new RegExp('active', 'im');
    var className = thisRoom.$tabs[0][0].className;

    if (className.search(testRegex) == -1) {
      thisRoom.$tabs[0].css('background-color', highlight);
      thisRoom.$tabs[0].css('color', color);

      thisRoom.$tabs[0].click(function() {
        thisRoom.$tabs[0].css('background-color', '#333');
        thisRoom.$tabs[0].css('color', '#6F9FB9');

        thisRoom.$tabs[0].hover(function() {
          thisRoom.$tabs[0].css('background-color', '#6F9FB9');
          thisRoom.$tabs[0].css('color', '#333');
        }, function() {
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
  var AddNameToUI = function(thisRoom, userId) {
    getUserById(userId, function(User) {
      var tabsLen = thisRoom.$tabs.length;
      var idRoomName = thisRoom.$tabs[tabsLen - 1][0].className.split(' ')[2];
      var newTabHtml = '<span>' + thisRoom.props.name + '</span><p style="font-size: x-small; position: absolute; top: 12px;">' + User.props.name + '</p>';
      thisRoom.$tabs[tabsLen - 1].html(newTabHtml);
      $('<a class="close ui-corner-all">x</a>').on('click', function(ev) {
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
  var GetIdFromChatTab = function(thisRoom) {
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
  var AppendMessageTextOnly = function(html, thisRoom) {
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
  var ResizeChatTabs = function() {
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

  var parseMsg_rpht = function(msg) {
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
    msg = msg.replace(/(?:\[i\]|\/\/)([^\/].*?)(?:\[\/i\]|\/\/)/g, function(str, p1, offset, s) {
      if (s.charAt(offset - 1) == ":") {
        return str;
      } else {
        return "<em>" + $('<div>' + p1 + '</div>').text() + "</em>";
      }
    });

    msg = msg.replace(regex_in_use,
      function(url) {
        var full_url = url;
        if (!full_url.match('^https?:\/\/')) {
          full_url = 'http://' + full_url;
        }
        return '<a href="' + $('<div>' + full_url + '</div>').text() + '" target="_blank">' + $('<div>' + url + '</div>').text() + '</a>';
      });

    return msg;
  };

  var autoJoiningHandler = function() {
    if (roomnames.length > 0) {
      if (waitForDialog === true) {
        $('<div id="rpht-autojoin" class="inner">' +
          '<p>Autojoining or restoring session.</p>' +
          '<p>Press "Cancel" to stop autojoin or session restore.</p>' +
          '</div>').dialog({
          open: function(event, ui) {
            setTimeout(function() {
              $('#rpht-autojoin').dialog('close');
            }, 10 * 1000);
          },
          buttons: {
            Cancel: function() {
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
          JoinFavoriteRooms();
        }
        if (chatSettings.session) {
          for (var i = 0; i < chatSettings.roomSession.length; i++) {
            var room = chatSettings.roomSession[i];
            var roomInFavs = ArrayObjectIndexOf(chatSettings.favRooms, 'room', room.roomname) > -1;
            var userInFavs = ArrayObjectIndexOf(chatSettings.favRooms, 'userId', room.user) > -1;
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

  var JoinFavoriteRooms = function() {
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

  var updateSession = function() {
    var tempSession = [];
    for (var i = 0; i < rph.roomsJoined.length; i++) {
      var roomname = rph.roomsJoined[i].roomname;
      if (ArrayObjectIndexOf(chatSettings.roomSession, 'roomname', roomname) !== -1) {
        tempSession.push(rph.roomsJoined[i]);
      }
    }
    chatSettings.roomSession = tempSession;
    SaveSettings();
  };

  var AddFavoriteRoom = function() {
    var room = getRoom($('#favRoom').val());

    if (room === undefined) {
      MarkProblem('favRoom', true);
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

      MarkProblem('favRoom', false);
      if (ArrayObjectIndexOf(chatSettings.favRooms, "_id", favRoomObj._id) === -1) {
        $('#favRoomsList').append(
          '<option value="' + favRoomObj._id + '">' +
          favRoomObj.user + ": " + favRoomObj.room + '</option>'
        );
        chatSettings.favRooms.push(favRoomObj);
        console.log('RPH Tools[AddFavoriteRoom]: Added favorite room', favRoomObj);
      }

      if (chatSettings.favRooms.length >= 10) {
        $('#favAdd').text("Favorites Full");
        $('#favAdd')[0].disabled = true;
      }
    }
  };

  var RemoveFavoriteRoom = function() {
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

  var ChangeTextColor = function() {
    var text_color = $('input#userNameTextColor').val();
    if (ValidateColor(text_color) === false ||
      ValidateColorRange(text_color) === false) {
      MarkProblem('userNameTextColor', true);
    } else {
      var userId = $('#userColorDroplist option:selected').val();

      text_color = text_color.substring(1, text_color.length);
      getUserById(userId, function(User) {
        MarkProblem('userNameTextColor', false);
        sendToSocket('modify', {
          userid: User.props.id,
          color: text_color
        });
      });
    }
  };

  var SaveSettings = function() {
    localStorage.setItem(localStorageName, JSON.stringify(GetSettings()));
  };

  var LoadSettings = function(storedSettings) {
    if (storedSettings !== null) {
      chatSettings = storedSettings.chatSettings;
      pingSettings = storedSettings.pingSettings;
    }
    PopulateSettings();
  };

  var LoadOldSettings = function() {
    var oldSettings = JSON.parse(localStorage.getItem("chatSettings"));
    if (oldSettings !== null) {
      pingSettings.triggers = oldSettings.pings;
      pingSettings.audioUrl = oldSettings.ping_url;
      pingSettings.color = oldSettings.color;
      pingSettings.highlight = oldSettings.highlight;
      pingSettings.bold = ((oldSettings.flags & 2) > 0);
      pingSettings.italics = ((oldSettings.flags & 4) > 0);
      pingSettings.exact = ((oldSettings.flags & 8) > 0);
      pingSettings.case = ((oldSettings.flags & 16) > 0);

      chatSettings.showNames = ((oldSettings.flags & 64) > 0);
      chatSettings.noIcons = ((oldSettings.flags & 128) > 0);
      chatSettings.session = oldSettings.session;
      chatSettings.strictUrl = oldSettings.strictUrl;
      chatSettings.canCancel = !oldSettings.alwaysJoin;
      chatSettings.favRooms = oldSettings.favRooms;
      chatSettings.autoJoin = oldSettings.autoJoin;
    }

    oldSettings = JSON.parse(localStorage.getItem("lastSession"));
    if (oldSettings !== null) {
      chatSettings.roomSession = oldSettings;
    }
    SaveSettings();
    PopulateSettings();
  };

  var DeleteSettings = function() {
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
    PopulateSettings();
  };

  var PopulateSettings = function() {
    ClearUsersDropLists('favUserList');

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

    for (var i = 0; i < chatSettings.favRooms.length; i++) {
      var favRoomObj = chatSettings.favRooms[i];
      $('#favRoomsList').append(
        '<option value="' + favRoomObj._id + '">' +
        favRoomObj.user + ": " + favRoomObj.room + '</option>'
      );
    }

    if (chatSettings.favRooms.length >= 10) {
      $('#favAdd').text("Favorites Full");
      $('#favAdd')[0].disabled = true;
    }

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
  var ProcessAccountEvt = function(account) {
    var users = account.users;
    ClearUsersDropLists('userColorDroplist');
    for (i = 0; i < users.length; i++) {
      AddUserToDroplist(users[i], 'userColorDroplist');
      AddUserToDroplist(users[i], 'favUserList');
    }
  };

  var GetSettings = function() {
    return {
      'chatSettings': chatSettings,
      'pingSettings': pingSettings
    };
  };

  return {
    init: function() {
      var autoJoining = false;
      var hasRooms = false;
      settingsDialog.chat = CreateDialog('#chatSettingsHeader', '#chatSettingsForm');
      settingsDialog.chat.button.click({
        dialog: settingsDialog.chat
      }, DialogToggle);

      $('#pingNames').blur(function() {
        var triggers = $('#pingNames').val().replace('\n', '').replace('\r', '');
        pingSettings.triggers = triggers;
        SaveSettings();
      });

      $('#pingURL').blur(function() {
        if (ValidateSetting('pingURL', 'url')) {
          pingSettings.audioUrl = GetInput('pingURL');
          SaveSettings();
        }
      });

      $('#pingTextColor').blur(function() {
        if (ValidateSetting('pingTextColor', 'color')) {
          pingSettings.color = GetInput('pingTextColor');
          SaveSettings();
        }
      });

      $('#pingHighlightColor').blur(function() {
        if (ValidateSetting('pingHighlightColor', 'color')) {
          pingSettings.highlight = GetInput('pingHighlightColor');
          SaveSettings();
        }
      });

      $('#pingBoldEnable').change(function() {
        pingSettings.bold = GetCheckBox('pingBoldEnable');
        SaveSettings();
      });

      $('#pingItalicsEnable').change(function() {
        pingSettings.italics = GetCheckBox('pingItalicsEnable');
        SaveSettings();
      });

      $('#pingExactMatch').change(function() {
        pingSettings.exact = GetCheckBox('pingExactMatch');
        SaveSettings();
      });

      $('#pingCaseSense').change(function() {
        pingSettings.case = GetCheckBox('pingCaseSense');
        SaveSettings();
      });

      $('#showUsername').change(function() {
        chatSettings.showNames = GetCheckBox('showUsername');
        SaveSettings();
      });

      $('#imgIconDisable').change(function() {
        chatSettings.noIcons = GetCheckBox('imgIconDisable');
        SaveSettings();
      });

      $('#favEnable').click(function() {
        chatSettings.autoJoin = GetCheckBox('favEnable');
        SaveSettings();
      });

      $('#roomSessioning').click(function() {
        chatSettings.session = GetCheckBox('roomSessioning');

        if (chatSettings.session) {
          updateSessionTimer = setInterval(updateSession, 30 * 1000);
        } else {
          clearTimeout(updateSessionTimer);
        }
        SaveSettings();
      });

      $('#canCancelJoining').click(function() {
        chatSettings.canCancel = GetCheckBox('canCancelJoining');
        SaveSettings();
      });

      $('#strictUrl').click(function() {
        chatSettings.strictUrl = GetCheckBox('strictUrl');
        SaveSettings();
      });

      $('#favAdd').click(function() {
        AddFavoriteRoom();
        SaveSettings();
      });

      $('#favRemove').click(function() {
        RemoveFavoriteRoom();
        SaveSettings();
      });

      $('#userNameTextColorButton').click(function() {
        ChangeTextColor();
      });

      $('#chatHistory').change(function() {
        rph.setSetting('maxHistory', parseInt($(this).val()));
      });

      if (JSON.parse(localStorage.getItem(localStorageName))) {
        LoadSettings(JSON.parse(localStorage.getItem(localStorageName)));
      } else {
        LoadOldSettings();
      }

      chatSocket.on('confirm-room-join', function(data) {
        roomSetup(data);
      });

      chatSocket.on('user-kicked', function(data) {
        for (var i = 0; i < account.users.length; i++) {
          if (data.targetid == account.users[i]) {
            $('<div class="inner"><p>You were kicked from ' +
              data.room + '.<br />' + ' Reason: ' + data.msg +
              '.</p></div>').dialog().dialog('open');
          }
        }
      });

      chatSocket.on('user-banned', function(data) {
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
    },

    getHtml: function() {
      return html;
    },

    toString: function() {
      return 'Chat Module';
    },

    GetSettings: GetSettings,
    SaveSettings: SaveSettings,
    LoadSettings: LoadSettings,
    DeleteSettings: DeleteSettings,
    ProcessAccountEvt: ProcessAccountEvt,
  };
}());

/****************************************************************************
 * @brief:    Handles the Private Messaging system.
 ****************************************************************************/
var PmModule = (function() {
  var pmSettings = {
    'audioUrl': 'http://chat.rphaven.com/sounds/imsound.mp3',
    'noIcons': false,
  };

  var awayMessages = {};

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

  /****************************************************************************
   * @brief Handles incoming PMs.
   *
   * @param data - Data containing the PM.
   ****************************************************************************/
  function HandleIncomingPm(data) {
    getUserById(data.to, function(fromUser) {
      /* Send away message. */
      if (awayMessages[data.from] !== undefined) {
        if (awayMessages[data.from].enabled === true) {
          var awayMsg = awayMessages[data.from].message;
          awayMessages[data.from].usedPmAwayMsg = true;
          sendToSocket('pm', {
            'from': data.from,
            'to': data.to,
            'msg': awayMsg,
            'target': 'all'
          });
        }
      }
    });
  }

  /****************************************************************************
   * @brief Handles outgoing PMs.
   *
   * @param data - Data containing the PM.
   ****************************************************************************/
  function HandleOutgoingPm(data) {
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
   * @brief:    Sets up PM Away Messages
   ****************************************************************************/
  var SetPmAway = function() {
    var userId = $('#pmNamesDroplist option:selected').val();
    var name = $("#pmNamesDroplist option:selected").html();
    if (awayMessages[userId] !== undefined) {
      if (awayMessages[userId].enabled === false) {
        $("#pmNamesDroplist option:selected").html("[Away]" + name);
      }
      awayMessages[userId].enabled = true;
      awayMessages[userId].message = $('input#awayMessageTextbox').val();
      $("#pmNamesDroplist option:selected").css("background-color", "#FFD800");
      $("#pmNamesDroplist option:selected").prop("selected", false);
    } else {
      var awayMsgObj = {
        "usedPmAwayMsg": false,
        "message": "",
        "enabled": true
      };
      awayMsgObj.message = $('input#awayMessageTextbox').val();
      awayMessages[userId] = awayMsgObj;

      $("#pmNamesDroplist option:selected").html("[Away]" + name);
      $("#pmNamesDroplist option:selected").css("background-color", "#FFD800");
      $("#pmNamesDroplist option:selected").prop("selected", false);
    }

    console.log('RPH Tools[SetPmAway]: Setting away message for',
      name, 'with message', awayMessages[userId].message);
  };

  /****************************************************************************
   * @brief:    Removes PM away message
   ****************************************************************************/
  var RemovePmAway = function() {
    var userId = $('#pmNamesDroplist option:selected').val();

    if (awayMessages[userId] !== undefined) {
      if (awayMessages[userId].enabled === true) {
        var name = $("#pmNamesDroplist option:selected").html();
        awayMessages[userId].enabled = false;
        $("#pmNamesDroplist option:selected").html(name.substring(6, name.length));
        $("#pmNamesDroplist option:selected").css("background-color", "");
        $('input#awayMessageTextbox').val("");
        console.log('RPH Tools[RemovePmAway]: Remove away message for', name);
      }
    }
  };

  var SaveSettings = function() {
    localStorage.setItem(localStorageName, JSON.stringify(pmSettings));
  };

  var LoadSettings = function(storedSettings) {
    if (storedSettings !== null) {
      pmSettings = storedSettings;
    }
    PopulateSettings();
  };

  var LoadOldSettings = function() {
    if (localStorage.getItem("chatSettings") !== null) {
      var oldSettings = JSON.parse(localStorage.getItem("chatSettings"));
      pmSettings.audioUrl = oldSettings.pmPingUrl;
      pmSettings.noIcons = ((oldSettings.flags & 32) > 0);
    }
    SaveSettings();
    PopulateSettings();
  };

  var DeleteSettings = function() {
    localStorage.removeItem(localStorageName);
    pmSettings = {
      'audioUrl': 'http://chat.rphaven.com/sounds/imsound.mp3',
      'noIcons': false,
    };
    PopulateSettings();
  };

  var PopulateSettings = function() {
    $('#pmPingURL').val(pmSettings.audioUrl);
    $('input#pmIconsDisable').prop("checked", pmSettings.noIcons);
  };

  /**************************************************************************
   * @brief Processes account events.
   *
   * @param account - Data blob countaining the user's account.
   **************************************************************************/
  var ProcessAccountEvt = function(account) {
    var users = account.users;
    ClearUsersDropLists('pmNamesDroplist');
    for (i = 0; i < users.length; i++) {
      AddUserToDroplist(users[i], 'pmNamesDroplist');
    }
  };

  return {
    init: function() {
      settingsDialog.pm = CreateDialog('#pmSettingsHeader', '#pmSettingsForm');
      settingsDialog.pm.button.click({
        dialog: settingsDialog.pm
      }, DialogToggle);

      $('#pmPingURL').change(function() {
        if (ValidateSetting('pmPingURL', 'url')) {
          pmSettings.audioUrl = GetInput('pmPingURL');
          $('#im-sound').children("audio").attr('src', pmSettings.audioUrl);
          SaveSettings();
        }
      });

      $('#pmMute').change(function() {
        if ($('#pmMute').is(":checked")) {
          $('#im-sound').children("audio").attr('src', '');
        } else {
          $('#im-sound').children("audio").attr('src', pmSettings.audioUrl);
        }
      });

      $('#pmIconsDisable').change(function() {
        pmSettings.noIcons = GetCheckBox('pmIconsDisable');
        SaveSettings();
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

      if (JSON.parse(localStorage.getItem(localStorageName))) {
        LoadSettings(JSON.parse(localStorage.getItem(localStorageName)));
      } else {
        LoadOldSettings();
      }

      _on('pm', function(data) {
        HandleIncomingPm(data);
      });

      _on('outgoing-pm', function(data) {
        HandleOutgoingPm(data);
      });
    },

    getHtml: function() {
      return html;
    },

    toString: function() {
      return 'PM Module';
    },

    GetSettings: function() {
      return pmSettings;
    },

    SaveSettings: SaveSettings,
    LoadSettings: LoadSettings,
    DeleteSettings: DeleteSettings,
    ProcessAccountEvt: ProcessAccountEvt,
  };
}());

var RngModule = (function() {
  var DIE_MIN = 1;
  var DIE_MAX = 10;
  var DIE_SIDE_MIN = 2;
  var DIE_SIDE_MAX = 100;
  var RNG_NUM_MIN = -4294967296;
  var RNG_NUM_MAX = 4294967296;

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

  /**************************************************************************
   * @brief:    Performs an RNG action
   * @param:    "action", Which RNG action to perform ('coin', 'dice', 'rng')
   **************************************************************************/
  var RunRNG = function(action) {
    var class_name = $('li.active')[0].className.split(" ");
    var room_name = "";
    var this_room = null;
    var userID = parseInt(class_name[2].substring(0, 6));
    var outcomeMsg = '';
    var chatModule = RphToolsModule.GetModule('Chat Module');

    /* Populate room name based on if showing usernames is checked. */
    if (chatModule !== null) {
      var chatSettings = chatModule.GetSettings();
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
      outcomeMsg = Rng_flipCoin();
    } else if (action == "dice") {
      var dieNum = parseInt($('#diceNum').val());
      var dieSides = parseInt($('#diceSides').val());
      var showTotals = GetCheckBox('showRollTotals');
      outcomeMsg = Rng_rollDice(dieNum, dieSides, showTotals);
    } else if (action == "rng") {
      var minNum = parseInt($('#rngMinNumber').val());
      var maxNum = parseInt($('#rngMaxNumber').val());
      outcomeMsg = Rng_randomNumber(minNum, maxNum);
    }
    outcomeMsg += '\u200b';
    this_room.sendMessage(outcomeMsg, userID);
    DisableRngButtons(action);
  };

  /****************************************************************************
   * @brief:    Generates a coin toss
   ****************************************************************************/
  var Rng_flipCoin = function() {
    var coinMsg = '(( Coin toss: ';
    if (Math.ceil(Math.random() * 2) == 2) {
      coinMsg += '**heads!**))';
    } else {
      coinMsg += '**tails!**))';
    }

    return coinMsg;
  };

  /**************************************************************************
   * @brief:    Generates a dice roll.
   **************************************************************************/
  var Rng_rollDice = function(dieNum, dieSides, showTotals) {
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
   * @brief:    Generates a random number
   **************************************************************************/
  var Rng_randomNumber = function(minNum, maxNum) {
    var ranNumMsg = '(( Random number generated (' + minNum + ' to ' + maxNum + '): **';
    ranNumMsg += Math.floor((Math.random() * (maxNum - minNum) + minNum)) + '** ))';
    return ranNumMsg;
  };

  /**************************************************************************
   * @brief:    Disables the RNG buttons for three seconds.
   **************************************************************************/
  var DisableRngButtons = function(action) {
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
  };

  /**************************************************************************
   * @brief:    Changes the RNG options being displayed
   * @param:    "option", option to be displayed ("coin", "dice", "rng")
   **************************************************************************/
  var ChangeRngDisplay = function(option) {
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

  return {
    init: function() {
      settingsDialog.rng = CreateDialog('#rngHeader', '#rngForm');
      settingsDialog.rng.button.click({
        dialog: settingsDialog.rng
      }, DialogToggle);

      $('#diceNum').blur(function() {
        var dieNum = parseInt($('#diceNum').val());
        if (dieNum < DIE_MIN) {
          $('#diceNum').val(DIE_MIN);
        } else if (DIE_MAX < dieNum) {
          $('#diceNum').val(DIE_MAX);
        }
      });

      $('#diceSides').blur(function() {
        var dieSides = parseInt($('#diceSides').val());
        if (dieSides < DIE_SIDE_MIN) {
          $('#diceSides').val(DIE_SIDE_MIN);
        } else if (DIE_SIDE_MAX < dieSides) {
          $('#diceSides').val(DIE_SIDE_MAX);
        }
      });

      $('#rngMinNumber').blur(function() {
        var minNum = parseInt($('#rngMinNumber').val());
        if (minNum < RNG_NUM_MIN) {
          $('#rngMinNumber').val(RNG_NUM_MIN);
        } else if (RNG_NUM_MAX < minNum) {
          $('#rngMinNumber').val(RNG_NUM_MAX);
        }
      });

      $('#rngMaxNumber').blur(function() {
        var maxNum = parseInt($('#rngMaxNumber').val());
        if (maxNum < RNG_NUM_MIN) {
          $('#rngMaxNumber').val(RNG_NUM_MIN);
        } else if (RNG_NUM_MAX < maxNum) {
          $('#rngMaxNumber').val(RNG_NUM_MAX);
        }
      });

      $('#rngButton').click(function() {
        if ($('#coinRadio')[0].checked) {
          RunRNG('coin');
        } else if ($('#diceRadio')[0].checked) {
          RunRNG('dice');
        } else if ($('#rngRadio')[0].checked) {
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
    },

    getHtml: function() {
      return html;
    },

    flipCoin: Rng_flipCoin,
    rollDice: Rng_rollDice,
    randNum: Rng_randomNumber,
  };
}());

var BlockingModule = (function() {
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

  /**************************************************************************
   * @brief:    Adds a user to the internal and dialog block list.
   * @param:    User - User object for the username being blocked
   *************************************************************************/
  var AddToBlockList = function(User) {
    /* Check if this user is already in the list. */
    var inList = false;

    for (var i = 0; i < blockedUsers.length; i++) {
      if (User.props.id == blockedUsers[i].id) {
        inList = true;
      }
    }

    if (inList === false) {
      blockedUsers.push({
        id: User.props.id,
        name: User.props.name
      });
      $('#blockedDropList').append('<option value="' + User.props.id + '">' +
        User.props.name + '</option>');
    }

    console.log('RPH Tools[BlockUser]: Blocking user', User.props.name);
    User.blocked = true;
  };

  /**************************************************************************
   * @brief:    Removes a user from the internal and dialog block list.
   **************************************************************************/
  var RemoveFromBlockList = function() {
    var names = document.getElementById("blockedDropList");
    var userId = $('#blockedDropList option:selected').val();
    UnblockUser(userId);
    names.remove(names.selectedIndex);
    blockedUsers.splice(blockedUsers.indexOf(userId), 1);
  };

  /**************************************************************************
   * @brief:    Sets the blocked flag to true for a user.
   * @param:    UserId - ID of the user whose ignore settings are being changed
   **************************************************************************/
  var BlockUser = function(UserId) {
    getUserById(UserId, function(User) {
      User.blocked = true;
    });
  };

  /**************************************************************************
   * @brief:    Sets the blocked flag to false for a user.
   * @param:    UserId - ID of the user whose ignore settings are being changed
   **************************************************************************/
  var UnblockUser = function(UserId) {
    getUserById(UserId, function(User) {
      User.blocked = false;
    });
  };

  /**************************************************************************
   * @brief:    Blocks a user by their ID
   * @param:    userID - ID of the using being blocked
   **************************************************************************/
  var BlockUserById = function(userID) {
    if (userID !== undefined) {
      getUserById(userID, function(User) {
        AddToBlockList(User);
      });
    }
  };

  /**************************************************************************
   * @brief:    Blocks a user by their name
   * @param:    username - username of the using being blocked
   **************************************************************************/
  var BlockUserByName = function(username) {
    if (username !== undefined) {
      getUserByName(username, function(user) {
        AddToBlockList(user);
      });
    }
  };

  /************************************************************************
   * @brief:   Blocks everyone on the list. Used to refresh blocking.
   ************************************************************************/
  var ReblockList = function() {
    for (var i = 0; i < blockedUsers.length; i++) {
      BlockUser(blockedUsers[i].id);
    }
  };

  var SaveSettings = function() {
    localStorage.setItem(localStorageName, JSON.stringify(blockedUsers));
  };

  var LoadSettings = function(storedSettings) {
    if (storedSettings !== null) {
      blockedUsers = storedSettings;
    }
    PopulateSettings(blockedUsers);
    ReblockList();
  };

  var LoadOldSettings = function() {
    var oldBlockedUsers = JSON.parse(localStorage.getItem("blockedUsers"));
    if (oldBlockedUsers !== null) {
      blockedUsers = oldBlockedUsers;
    }
    SaveSettings();
    PopulateSettings(blockedUsers);
    ReblockList();
  };

  var DeleteSettings = function() {
    localStorage.removeItem(localStorageName);
    blockedUsers = [];
    PopulateSettings(blockedUsers);
  };

  var PopulateSettings = function(blockedUsers) {
    ClearUsersDropLists('blockedDropList');

    for (var i = 0; i < blockedUsers.length; i++) {
      var user = blockedUsers[i];
      $('#blockedDropList').append('<option value="' + user.id + '">' +
        user.name + '</option>');
      console.log("RPH Tools[InitRphTools]: Blocking user ", blockedUsers[i]);
    }
  };

  return {
    init: function() {
      settingsDialog.blocking = CreateDialog('#blockHeader', '#blockForm');
      settingsDialog.blocking.button.click({
        dialog: settingsDialog.blocking
      }, DialogToggle);

      $('#blockButton').click(function() {
        var userName = $('#nameCheckTextbox').val();
        BlockUserByName(userName);
      });

      $('#unblockButton').click(function() {
        RemoveFromBlockList();
      });

      if (JSON.parse(localStorage.getItem(localStorageName))) {
        LoadSettings(JSON.parse(localStorage.getItem(localStorageName)));
      } else {
        LoadOldSettings();
      }

      _on('ignores', function(data) {
        if (data.ids[0] !== undefined) {
          BlockUserById(data.ids[0]);
        }
      });

      setInterval(ReblockList, 30 * 1000);
    },

    getHtml: function() {
      return html;
    },

    toString: function() {
      return 'Blocking Module';
    },

    GetSettings: function() {
      return blockedUsers;
    },

    SaveSettings: SaveSettings,
    LoadSettings: LoadSettings,
    DeleteSettings: DeleteSettings,
    ReblockList: ReblockList,
  };
}());

var ModdingModule = (function() {
  var settings = {
    'alertWords': [],
    'alertUrl': 'http://chat.rphaven.com/sounds/boop.mp3',
    'autoKick': false,
  };

  var roomNamePairs = {};

  var localStorageName = "rpht_modSettings";

  var alertSound = null;

  var suppressAutoKick = false;

  var supressTimer = null;

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

  /****************************************************************************
   * @brief:    Performs a modding action
   * @param:    action - string command that has the action.
   ****************************************************************************/
  var ModAction = function(action) {
    var targets = $('#modTargetTextInput').val().replace('\n', '').replace('\r', '');
    targets = targets.split(';');
    console.log('RPH Tools[ModAction]: Performing', action, 'on', targets);

    for (var i = 0; i < targets.length; i++) {
      EmitModAction(action, targets[i]);
    }
  };

  /****************************************************************************
   * @brief:    Sends off the mod action
   * @param:    action - string command that has the action.
   * @param:    targetName - user name that the action is meant for.
   ****************************************************************************/
  var EmitModAction = function(action, targetName) {
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
      chatSocket.emit(action, {
        room: room,
        userid: userId,
        targetid: targetId,
        msg: modMessage
      });

      if (action === 'ban') {
        modMessage = "Banning: " + target + " by: " + user + " In room: " + room;
      } else if (action === 'unban') {
        modMessage = "Unbanning: " + target + " by: " + user + " In room: " + room;
      } else if (action === 'add-mod') {
        modMessage = "Modding: " + target + " by: " + user + " In room: " + room;
      } else if (action === 'remove-mod') {
        modMessage = "Unmodding: " + target + " by: " + user + " In room: " + room;
      } else if (action === 'kick') {
        modMessage = "Kicking: " + target + " by: " + user + " In room: " + room;
      }
      console.log('RPH Tools[EmitModAction]:', modMessage);
    });
  };

  /****************************************************************************
   * @brief:  Initializes extra features if user is a mod of the room.
   * @param:  thisRoom - Room that was entered
   * @param:  userId - ID of the user that entered
   ****************************************************************************/
  var AddModFeatures = function(thisRoom, userId, classes) {
    getUserById(userId, function(User) {
      if (classes.indexOf("mod") > -1 || classes.indexOf("owner") > -1) {
        var userId = User.props.id;
        var userName = User.props.name;
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

        suppressAutoKick = true;
        suppressTimer = setTimeout(function(){suppressAutoKick = false; console.log("Suppression disabled", suppressAutoKick);}, 3 * 1000);
      }
    });
  };

  /****************************************************************************
   * @brief:  Plays the alert sound
   ****************************************************************************/
  var PlayAlert = function(){
    if (alertSound !== null){
      alertSound.play();
    }
  };

  /****************************************************************************
   * @brief:  Kicks a user due to saying something inappropriate.
   ****************************************************************************/
  var AutoKick = function(room, targetId, msg){
    if (settings.autoKick && suppressAutoKick === false){
      for(var idx in roomNamePairs){
        var roomNameObj = roomNamePairs[idx];
        console.log(roomNameObj, room.props);
        if (roomNameObj.room === room.props.name &&
            account.users.indexOf(targetId) === -1){
          console.log('Auto kicking user');
          chatSocket.emit('kick', {
            room: room.props.name,
            userid: roomNameObj.modId,
            targetid: targetId,
            msg: "You've been kicked for saying: " + msg
          });
        }
      }
    }
  };

  /****************************************************************************
   * @brief:  Saves settings to local storage
   ****************************************************************************/
  var SaveSettings = function() {
    localStorage.setItem(localStorageName, JSON.stringify(settings));
  };

  /****************************************************************************
   * @brief:  Loads settings, if they exist.
   ****************************************************************************/
  var LoadSettings = function() {
    var storedSettings = JSON.parse(localStorage.getItem(localStorageName));

    if (storedSettings !== null) {
      settings = storedSettings;
      PopulateSettings();
    }
  };

  /****************************************************************************
   * @brief:  Deleting settings.
   ****************************************************************************/
  var DeleteSettings = function() {
    localStorage.removeItem(localStorageName);
    settings = {
      'alertWords': [],
      'alertUrl': 'http://chat.rphaven.com/sounds/boop.mp3',
      'autoKick': false,
    };
    PopulateSettings();
  };

  /****************************************************************************
   * @brief:  Populates the GUI
   ****************************************************************************/
  var PopulateSettings = function() {
    $('#modAlertWords').val(settings.alertWords);
    $('#modAlertUrl').val(settings.alertUrl);
    $('input#modAutoKick').prop("checked", settings.autoKick);
    alertSound = new Audio(settings.alertUrl);
  };

  return {
    init: function() {
      settingsDialog.modding = CreateDialog('#moddingHeader', '#moddingForm');
      settingsDialog.modding.button.click({
        dialog: settingsDialog.modding
      }, DialogToggle);

      $('#roomModSelect').change(function() {
        var roomModPair_sel = document.getElementById("roomModSelect");
        var roomModVal = roomModPair_sel.options[roomModPair_sel.selectedIndex].value;
        if (roomNamePairs[roomModVal] !== undefined) {
          $('input#modRoomTextInput').val(roomNamePairs[roomModVal].room);
          $('input#modFromTextInput').val(roomNamePairs[roomModVal].modName);
        } else {
          $('input#modRoomTextInput').val("");
          $('input#modFromTextInput').val("");
        }
      });

      $('#resetPassword').click(function() {
        var room = $('input#modRoomTextInput').val();
        var user = $('input#modFromTextInput').val();
        getUserByName($('input#modFromTextInput').val(), function(User) {
          var userId = User.props.id;
          chatSocket.emit('modify', {
            room: room,
            userid: userId,
            props: {
              pw: false
            }
          });
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

      $('#modAlertWords').blur(function() {
        settings.alertWords = $('#modAlertWords').val().replace('\n', '').replace('\r', '');
        SaveSettings();
      });

      $('#modAlertUrl').blur(function() {
        if (ValidateSetting('modAlertUrl', 'url')) {
          settings.alertUrl = GetInput('modAlertUrl');
          SaveSettings();
          alertSound = new Audio(settings.alertUrl);
        }
      });

      $('#modAutoKick').click(function() {
        settings.autoKick = GetCheckBox('modAutoKick');
        SaveSettings();
      });

      LoadSettings();
      PopulateSettings();
    },

    getHtml: function() {
      return html;
    },

    toString: function() {
      return 'Modding Module';
    },

    AddModFeatures: AddModFeatures,
    SaveSettings: SaveSettings,
    GetSettings: function() {return settings;},
    PlayAlert: PlayAlert,
    AutoKick: AutoKick,
  };
}());

var SettingsModule = (function() {
  var confirmDelete = false;

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

  /****************************************************************************
   * @brief:    Imports settings from the textarea.
   ****************************************************************************/
  var ImportSettings = function() {
    var settings = $('textarea#importExportTextarea').val().split("|");
    try {
      for (var i = 0; i < settings.length - 1; i++) {
        var settings_json = JSON.parse(settings[i]);
        console.log('RPHT [Setting Module]: Importing...', settings_json);
        RphToolsModule.ImportSettings(settings_json);
      }
    } catch (err) {
      console.log('RPH Tools[ImportSettings]: Error importing settings', err);
      MarkProblem("importExportTextarea", true);
    }
  };

  /****************************************************************************
   * @brief:    Prints out the settings into the main textbox for exporting.
   ****************************************************************************/
  var ExportSettings = function() {
    var settingsString = RphToolsModule.ExportAllSettings();
    $('textarea#importExportTextarea').val(settingsString);
  };

  /****************************************************************************
   * @brief:    Prints out settings in the console.
   ****************************************************************************/
  var PrintSettings = function() {
    var modules = RphToolsModule.GetModules();
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].GetSettings !== undefined) {
        console.log(modules[i].toString(), modules[i].GetSettings);
      }
    }
  };

  /****************************************************************************
   * @brief:     Deletes settings.
   * @note:      The user has to press the button twice to delete.
   ****************************************************************************/
  var DeleteSettings = function() {
    if (confirmDelete === false) {
      $('#deleteSettingsButton').text('Press again to delete');
      confirmDelete = true;
    } else if (confirmDelete === true) {
      console.log('RPH Tools[Settings Module]: Deleting settings');
      $('#deleteSettingsButton').text('Delete Settings');
      confirmDelete = false;
      RphToolsModule.DeleteAllSettings();
    }
  };

  return {
    init: function() {
      settingsDialog.settings = CreateDialog('#settingsHeader', '#settingsForm');
      settingsDialog.settings.button.click({
        dialog: settingsDialog.settings
      }, DialogToggle);

      $('#importButton').click(function() {
        ImportSettings();
      });

      $('#exportButton').click(function() {
        ExportSettings();
      });

      $('#printSettingsButton').click(function() {
        PrintSettings();
      });

      $('#deleteSettingsButton').click(function() {
        DeleteSettings();
      });
    },

    getHtml: function() {
      return html;
    },

    toString: function() {
      return 'Settings Module';
    },
  };
}());

var AboutModule = (function() {
  var html =
    '<h3 class="rpht_headers" id="aboutHeader">About</h3>' +
    '<div id="aboutHelpForm" style="display:none;">' +
    '<br><p>Click on the "Settings" button again to save your settings!</p>' +
    '<p>You may need to refresh the chat for the settings to take effect.</p>' +
    '<br><p><a href="http://www.rphaven.com/topics.php?id=1#topic=1883&page=1" target="_blank">Report a problem</a> |' +
    '<a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Tools#troubleshooting" target=_blank">Troubleshooting Tips</a> | ' + VERSION_STRING + '</p><br>' +
    '<br>' +
    '</div>' +
    '<br />';

  return {
    init: function() {
      settingsDialog.about = CreateDialog('#aboutHeader', '#aboutHelpForm');
      settingsDialog.about.button.click({
        dialog: settingsDialog.about
      }, DialogToggle);
    },

    getHtml: function() {
      return html;
    },

    toString: function() {
      return 'About Module';
    },
  };
}());

/*****************************************************************************
    THIS MODULE MUST EXIST FOR THE SCRIPT TO WORK.
******************************************************************************/
var RphToolsModule = (function() {
  var modules = [];

  var style =
    '<style>' +
    '.rpht_headers{cursor: pointer; padding-left: 5px; background: #43698D; width: 99%; border-radius: 3px; color:#FFF;}' +
    '.rpht_textarea{background: rgb(255, 255, 255); height: 80px; width: 403px;}' +
    '.rpht-block {text-align: right; margin-top: 10px;}' +
    '.rpht-block label { display: inline-block; font-size: 1em; margin-right: 10px; }' +
    '.rpht-block input[type=checkbox] { width: 14px; margin-right: 286px;}' +
    '</style>';

  var html =
    style +
    '<div id="settingsBox" style="display: none; position: absolute; top: 35px; z-index: 9999999; height: 500px; width: 450px; border-radius: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.7); right: 85px; background: url(&quot;http://www.rphaven.com/css/img/aero-bg.png&quot;) repeat scroll 0px 0px transparent; padding: 5px;" left="">' +
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

  var DialogCloseEvt = function() {
    SaveModuleSettings();
  };

  var GetModule = function(name) {
    var module = null;
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].toString() === name) {
        module = modules[i];
        break;
      }
    }
    return module;
  };

  var GetModules = function() {
    return modules;
  };

  var ImportSettings = function(settings_json) {
    var module = GetModule(settings_json.name);

    if (module !== null) {
      module.LoadSettings(settings_json.settings);
    }
  };

  /****************************************************************************
   * @brief:    Prints out the settings into the main textbox for exporting.
   ****************************************************************************/
  var ExportAllSettings = function() {
    var settingsString = "";
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].GetSettings !== undefined) {
        var modSettings = {
          name: modules[i].toString(),
          settings: modules[i].GetSettings(),
        };
        settingsString += JSON.stringify(modSettings) + "|";
      }
    }
    return settingsString;
  };

  var DeleteAllSettings = function() {
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].DeleteSettings !== undefined) {
        modules[i].DeleteSettings();
      }
    }
  };

  var SaveModuleSettings = function() {
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].SaveSettings !== undefined) {
        modules[i].SaveSettings();
      }
    }
  };

  var ProcessAccountEvt = function(account) {
    for (var i = 0; i < modules.length; i++) {
      if (modules[i].ProcessAccountEvt !== undefined) {
        modules[i].ProcessAccountEvt(account);
      }
    }
  };

  return {
    init: function(addonModules) {
      var i;
      modules = addonModules;
      for (i = 0; i < modules.length; i++) {
        if (modules[i].getHtml) {
          html += modules[i].getHtml();
        }
      }
      html += '</div></div>';
      $('#random-quote').hide();
      $('a.settings').hide();
      $('#top p.right').prepend('<a class="rph-tools settings">Settings</a>');
      $('body').append(html);
      $('head').append(rpht_css);

      settingsDialog.dialog = CreateDialog('#top a.rph-tools', '#settingsBox');
      settingsDialog.dialog.button.click({
        dialog: settingsDialog.dialog,
        onClose: DialogCloseEvt
      }, DialogToggle);

      for (i = 0; i < modules.length; i++) {
        modules[i].init();
      }

      _on('accounts', function() {
        var users = account.users;
        ProcessAccountEvt(account);
        console.log('RPH Tools[_on.accounts]: Account data blob received', users);
      });
    },

    getHtml: function() {
      return html;
    },

    toString: function() {
      return 'RPH Tools Module';
    },

    GetModule: GetModule,
    GetModules: GetModules,
    ExportAllSettings: ExportAllSettings,
    ImportSettings: ImportSettings,
    DeleteAllSettings: DeleteAllSettings
  };
}());

$(function() {
  console.log(VERSION_STRING, 'start');
  var modules = [
    ChatModule,
    PmModule,
    RngModule,
    BlockingModule,
    ModdingModule,
    SettingsModule,
    AboutModule,
  ];
  RphToolsModule.init(modules);
});
