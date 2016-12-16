// ==UserScript==
// @name       RPH Tools LFRP
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Tools_LFRP
// @version    0.0.1
// @description Replaces the old "Krieglist" RP finder with another one that
//              isn't as buggy.
// @match      http://chat.rphaven.com/
// @copyright  (c)2014 shuffyiosys@github
// @grant      none
// @license    MIT license (https://en.wikipedia.org/wiki/MIT_License)
// ==/UserScript==
/*jshint multistr: true */
/*jshint bitwise: false*/
/*global $:false */
var rphtLfrpDialog;

$(function(){
  $('#top p.right').append('<a class="rpht-lfrp-button">Find RP</a>');
  $('#top p.right a.open-lfrp').remove();

  createLfrpAds();

  $('.rpht-lfrp-refresh-button').click(function(){
    sendToSocket('get-lfrp-ads');
    removeAds();
    getLfrpAds();
  });

  $('.rpht-lfrp-button').click(function(){
    sendToSocket('get-lfrp-ads');
    rphtLfrpDialog.dialog('open');
  });

  console.log(messenger.users);
});

var createLfrpAds = function(){
  var dialogHtml = '<div id="rpht-lfrp" class="inner">' +
    '<h2>Looking for RP (LFRP) Ads</h2>' +
    '<button aria-disabled="false" role="button" class="manage ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only rpht-lfrp-refresh-button" style="float: left;">Refresh List</button>'+
    '<p style="height: 40px;"></p>' +
    '<h3 style="color: #FFF; style="height: 40px;"">Clean Ads</h3><hr />' +
    '<div class="rpht-clean-ads" style="background: #FFF;"/>' +
    '<h3 style="color: #FFF;" style="height: 40px;">Smut Ads</h3>' +
    '<div class="rpht-smut-ads" style="background: #FFF;"/>' +
    '</div>';

  rphtLfrpDialog = $(dialogHtml).dialog();

  getLfrpAds();
};

var removeAds = function(){
  console.log('Removing ads');
  $('.rpht-clean-ads').empty();
  $('.rpht-smut-ads').empty();
};

var getLfrpAds = function(){
  console.log('Grabbing ads');
  var lightStyle = 'style="background: #DDD;"';
  var darkStyle = 'style="background: #EEE;"';
  var backgroundStyle = lightStyle;

  for (var idx in messenger.users){
    var user = messenger.users[idx];

    if (user.props.lfrpAd !== ''){
      var $el;

      if (user.props.lfrpAdType === 0)
        $el = $('<div class="lfrp-ad lfrp-'+user.props.id+'" '+backgroundStyle+'><div class="user-box" /><div class="ad-box" style="color: #000;" /></div>').appendTo('.rpht-clean-ads');
      else
        $el = $('<div class="lfrp-ad lfrp-'+user.props.id+'" '+backgroundStyle+'><div class="user-box" /><div class="ad-box" style="color: #000;" /></div>').appendTo('.rpht-smut-ads');

      $el.find('.user-box').append( user.$createEl().prepend( user.$createThumb() ) );
      $el.find('.ad-box').append( '<p>'+ parseMsg(user.props.lfrpAd) +'</p>' );

      if (backgroundStyle === lightStyle)
        backgroundStyle = darkStyle;
      else
        backgroundStyle = lightStyle;
    }
  }

  $('#rpht-lfrp').on('contextmenu', 'a.name', function(ev){
    ev.preventDefault();
    var $this = $(this);
    var name = $this.text();
    name = name.slice(-1) === ':' ? name.slice(0, name.length-1) : name;
    getUserByName(name, function(User){
      userContextMenu($this, User);
    });
  });
};
