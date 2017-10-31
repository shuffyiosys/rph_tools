
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
