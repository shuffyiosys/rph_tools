// ==UserScript==
// @name       RPH Dice Roller
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Pings_Test
// @version    0.0.1
// @description Dice roller
// @match      http://chat.rphaven.com/
// @copyright  Original script (c)2012+  nick_rp1986yahoo.com, Modifications (c)2014 shuffyiosys@github
// @grant   none
// ==/UserScript==
var userIds = [
];
//If this doesn't print, something obviously happened with the global vars
console.log('RPH dice roller start');
$(function () {
  chatSocket.on('confirm-room-join', function (data) {
    doRoomJoinSetup(data.room);
  });
});
function doRoomJoinSetup(roomName) {
  getRoom(roomName).onMessage = function (data) {
    var thisRoom = this;
    if (account.ignores.indexOf(data.userid) !== - 1) {
      console.log('Return!');
      return;
    }
    postMessage(thisRoom, data);
  };
}
function postMessage(thisRoom, data) {
  getUserById(data.userid, function (User) {
    var timestamp = makeTimestamp(data.time);
    var msg = parseMsg(data.msg);
    var classes = '';
    var $el = '';
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
    console.log('Here\'s a message!', msg);
    if ((msg.charAt(0) === '/') && (msg.slice(1, 3) === 'me')) {
      classes += 'action ';
      msg = msg.slice(3);
      $el = thisRoom.appendMessage('<span class="first">[' + timestamp + ']</span>\n<span style="color:#' + User.props.color + '"><a class="name" title="[' + timestamp + ']" style="color:#' + User.props.color + '">' + User.props.name + '</a>' + msg + '</span>'
      ).addClass(classes);
    } 
    else if (msg.slice(0, 5) === '/roll') {
      console.log('Starting the dice roll');
      var testRegex = new RegExp('[0-9]+d[0-9]+', 'm');
      var dice_param = [];
      var new_msg = ' Rolled ';
      msg = msg.slice(6);
      dice_param = msg.split('d');
      if (msg.match(testRegex)) {
        console.log('Success!');
        if(dice_param.length == 2){
          if( (0 < dice_param[0] && dice_param[0] <= 100) &&
              (1 < dice_param[1] && dice_param[1] <= 1000))
          {
            new_msg += dice_param[0] + 'd' +dice_param[1] + ': '
            for(i = 0; i < dice_param[0]; i++){
              new_msg += Math.ceil(Math.random() * dice_param[1]) + ' ';
            }
          }
        }
        console.log('Rolling the dice', dice_param, new_msg);
      }
      $el = thisRoom.appendMessage('<span class="first">[' + timestamp + ']<a class="name" title="[' + timestamp + ']" style="color:#' + User.props.color + '">' + User.props.name + '<span class="colon">:</span></a></span>\n<span style="color:#'+ User.props.color + '">' + new_msg + '</span>'
      ).addClass(classes);
    } 
    else {
      $el = thisRoom.appendMessage('<span class="first">[' + timestamp + ']<a class="name" title="[' + timestamp + ']" style="color:#' + User.props.color + '">' + User.props.name + '<span class="colon">:</span></a></span>\n<span style="color:#'+ User.props.color + '">' + msg + '</span>'
      ).addClass(classes);
    }
    $el.find('br:gt(7)').remove();
  });
}
