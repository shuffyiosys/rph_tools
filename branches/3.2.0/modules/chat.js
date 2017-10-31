
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
