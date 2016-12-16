// ==UserScript==
// @name       RPH Unofficial Patch
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_UP
// @version    0.0.1
// @description Patches issues with RPH
// @match      http://chat.rphaven.com/
// @copyright  (c)2014 shuffyiosys@github
// @grant      none
// @license    MIT license (https://en.wikipedia.org/wiki/MIT_License)
// ==/UserScript==
/*jshint multistr: true */
/*jshint bitwise: false*/
/*global $:false */

parseMsg = function(msg){
  msg = msg.replace(/</g, '&lt;');
  msg = msg.replace(/>/g, '&gt;');
  msg = msg.replace(/\n/g, '<br />');
  msg = msg.replace(/="/g, '');
  msg = msg.replace(/(\[b\]|\*\*)(.*?)(\[\/b\]|\*\*)/g, '<strong>$2</strong>');
  msg = msg.replace(/(\-\-\-)/g, '&mdash;');
  msg = msg.replace(/(\[s\]|\-\-)(.*?)(\[\/s\]|\-\-)/g, '<strike>$2</strike>');
  msg = msg.replace(/(?:\[i\]|\/\/)([^\/].*?)(?:\[\/i\]|\/\/)/g, function ( str, p1, offset, s ){
    if (s.charAt(offset-1) == ":" ) {
      return str;
    }
    else {
      return "<em>" + $('<div>'+p1+'</div>').text() + "</em>";
    }
  });
  msg = msg.replace(/((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?|^([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+.*)$)/gi,
    function(url){
      var full_url = url;
      var extra = '';
      if( !full_url.match('^https?:\/\/') ) {
        full_url = 'http://' + full_url;
      }
      if( url.match(/\.(jpg|jpeg|png|gif)/i) ){
        extra = 'class="img-wrapper"';
      }
      else if( url.match(/\S*youtube\.com\S*v=([\w-]+)/i) ){
        extra = 'class="vid-wrapper"';
      }
      return '<a href="' + $('<div>'+full_url+'</div>').text() + '" target="_blank" '+extra+'>' + $('<div>'+url+'</div>').text() + '</a>';
    });

  return msg;
};

console.log('RPH Unofficial Patch Version 0.0.1 - Successfully applied');
