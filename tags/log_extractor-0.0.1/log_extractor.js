// ==UserScript==
// @name       RPH Log Extractor
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Log_Extractor
// @match      http://indexeddb.storage.rphaven.com/
// @version    0.0.1
// @description Extracts logs from RPH's indexeddb page.
// @copyright  (c)2014 shuffyiosys@github
// @grant      none
// @license    MIT license (https://en.wikipedia.org/wiki/MIT_License)
// @require    http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// ==/UserScript==
/*jshint multistr: true */
/*jshint bitwise: false*/
/*global $:false */

var body = document.getElementsByTagName('body');

var db;
var store;
var request = indexedDB.open("RPHLogs");
var log_entries = {};

console.log('RPH Log Extractor start!');
$(function(){
  document.body.innerHTML = '<h2>RPH Log Extractor</h2><div style="position: absolute; width:100%; height:100%;">\
      <p style="font-family:Trebuchet MS;">Indexes (format is [Your Account ID].[Recipient ID])</p>\
      <select style="width: 300px;" id="userName" size="5"></select>&nbsp;&nbsp;\
      <input type="button" id="getLogs" onclick="getLogs()" value="Grab logs" disabled><br><br>\
      <textarea id="log-dump" style="width: 1024px; height: 640px;" placeholder="Logs"></textarea>\
    </div>';
  request.onerror = function(event) {
    alert("Why didn't you allow my web app to use IndexedDB?!");
  };
  request.onsuccess = function(event) {
    document.getElementById("getLogs").disabled = false;;
    db = event.target.result;
    console.log('Connection to DB success!');
  };

  $('#getLogs').click(function(){
    getLogs();
  });

  $('#userName').change(function(){
    nameListChange();
  });
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
      console.log("Key " + cursor.key + " is " + cursor.value);

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
