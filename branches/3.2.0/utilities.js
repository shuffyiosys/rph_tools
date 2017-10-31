var getInput = function (settingId) {
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
