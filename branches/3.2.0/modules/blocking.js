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
