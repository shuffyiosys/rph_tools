// ==UserScript==
// @name       RPH Log Extractor
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Log_Extractor
// @match      http://chat.rphaven.com/
// @version    0.0.1
// @description Extracts logs from RPH's indexeddb page.
// @copyright  (c)2014 shuffyiosys@github
// @grant      none
// @license    MIT license (https://en.wikipedia.org/wiki/MIT_License)
// ==/UserScript==
/*jshint multistr: true */
/*jshint bitwise: false*/
/*global $:false */

var extract_display = false;
var db;
var store;
var request = indexedDB.open("RPHLogs");
var log_entries = {};

// HTML code to be injected into the chat.
var html = '\
<div id="logExtractor" style="display: none; position: absolute; top: 35px; z-index: 9999999; height: 720px; width: 1260px; border-radius: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.7); background: url(&quot;http://www.rphaven.com/css/img/aero-bg.png&quot;) repeat scroll 0px 0px transparent; padding: 5px;" left="">\
  <h2>RPH Log Extractor</h2><div style="position: absolute; width:100%; height:100%;">\
    <p style="font-family:Trebuchet MS;">Indexes (format is [Your Account ID].[Recipient ID])</p>\
    <select style="width: 300px;" id="userName" size="5"></select>&nbsp;&nbsp;\
    <input type="button" id="getLogs" value="Grab logs" disabled><br><br>\
    <textarea id="log-dump" style="width: 1024px; height: 640px;" placeholder="Logs"></textarea>\
  </div>\
 </div>';

console.log('RPH Log Extractor start!');
$(function(){
  $('#top p.right').prepend('<a class="log_extractor settings">Log Extractor</a>');
  $('body').append(html);
  $('#top a.log_extractor').click(function(){
    if(extract_display === false){
      $('#logExtractor').show();
      extract_display = true;
    }
    else{
      $('#logExtractor').hide();
      extract_display = false;
    }
  });
  request.onerror = function(event) {
    alert("Why didn't you allow my web app to use IndexedDB?!");
  };
  request.onsuccess = function(event) {
    document.getElementById("getLogs").disabled = false;
    db = event.target.result;
    console.log('Connection to DB success!');
  };

  $('#getLogs').click(function(){
    getLogs();
  });

  $('#userName').change(function(){
    nameListChange();
  });

  console.log('RPH Log extractor setup done.')
});

function getLogs(){
  var getButton = document.getElementById("getLogs");
  getButton.value = "Working...";
  getButton.disabled = true;
  store = db.transaction(['logs']).objectStore('logs');
  store.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
      var log_entry = cursor.value;

      if( log_entries[log_entry.i] === undefined){
        var entry = [];
        entry.push(log_entry);
        log_entries[log_entry.i] = entry;
      }
      else{
        log_entries[log_entry.i].push(log_entry);
      }
      cursor.continue();
    }
    else {
      alert("Done finding entries!");
      getButton.style.display="none";
      populateIndex();
    }
  };
}

function dumpLogs(log_key){
  document.getElementById("log-dump").value = "";
  for(var i = 0; i < log_entries[log_key].length; i++)
  {
    var timestamp = new Date(log_entries[log_key][i].d * 1000);
    var timestamp_str = (timestamp.getMonth() + 1) + "-" + (timestamp.getDate() + 1) + "-";
    timestamp_str += timestamp.getUTCFullYear() + " " + timestamp.getHours() + ":";
    timestamp_str += timestamp.getMinutes() + ":" + timestamp.getSeconds();

    document.getElementById("log-dump").value += timestamp_str + " - ";
    document.getElementById("log-dump").value += log_entries[log_key][i].f + ": ";
    document.getElementById("log-dump").value += log_entries[log_key][i].m ;
    document.getElementById("log-dump").value += " \n";
  }
}

function populateIndex(){
  for(var entry in log_entries){
    if(entry !== undefined){
      var nameList = document.getElementById("userName");
      var option = document.createElement("option");
      option.text = entry;
      nameList.add(option);
    }
  }
}

function nameListChange()
{
  var list = document.getElementById('userName');
  dumpLogs(list.selectedOptions[0].innerHTML);
}
