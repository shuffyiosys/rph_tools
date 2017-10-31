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
}());