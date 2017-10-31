// ==UserScript==
// @name       RPH Extended Settings
// @namespace  https://openuserjs.org/scripts/shuffyiosys/RPH_Pings_Test
// @version    1.1.0
// @description Pings and highlights entered usernames in RPH.
// @match      http://chat.rphaven.com/
// @copyright  Original script (c)2012+  nick_rp1986yahoo.com, Modifications (c)2014 shuffyiosys@github
// @grant   none
// ==/UserScript==

  // Array that holds all of the user name settings. The settings itself are
  // stored in a JSON like object.
  // "id":          ID number of the user name
  // "name":        User name itself
  // "pings":       Names/Words/etc. to use for pinging
  // "ping_url":    URL to the audio source for pinging
  // "color":       Text color to use when a match is found
  // "highlight":   background color to use when a match is found
  // "flags":       Bitmask of option flags.
  //                0 - Settings have been modified
  //                1 - Bold text
  //                2 - Italicize text
  //                3 - Use exact matching
  //                4 - Case sensitive matching

  // Object for dialog box
  var pingTool = {state: false};

  var blockedUsers = [];
  
  // HTML code to be injected into the chat.
  var html = '\
    <div id="pingBox" \
      style="display: none; position: absolute; top: 35px; z-index: 9999999; \
             width: 420px;\
             border-radius: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.7);\
             right: 85px; background: url(&quot;http://www.rphaven.com/css/img/aero-bg.png&quot;)\
             repeat scroll 0px 0px transparent; padding: 5px;" \
      left="">\
          <div id="ping-box-content"\
               style="background: rgb(51, 51, 51); width: 410px; padding: 10px; \
                      border-radius: 5px; font-size: 0.8em;">\
          <p>\
            Enter names you want to be pinged. Split them with commas.<br>\
            e.g. Character Name,Example,John Smith\
          </p>\
          <textarea name="pingNames"\
                    id="pingNames"\
                    style="background: rgb(255, 255, 255); height: 250px; width: 390px;">\
          </textarea>\
          <br>\
          <form>\
            <p>Ping URL (must be WAV, MP3, or OGG file):</p>\
            <input style="width: 370px;" type="text" id="pingURL" name="pingURL"><br>\
            <p>Text Color (RGB hex value with hashtag, E.g., #ABCDEF):</p>\
            <input style="width: 370px;"type="text" id="pingTextColor" name="pingTextColor"\
                     value="#000"><br>\
            <p>Highlight Color (RGB hex value with hashtag, E.g., #ABCDEF):</p>\
            <input style="width: 370px;" type="text" id="pingHighlightColor" name="pingHighlightColor"\
                     value="#FFA"><br>\
            <input style="width: 40px;" type="checkbox" id="pingBoldEnable" name="pingBoldEnable"><strong>Bold</strong>\
            <input style="width: 40px;" type="checkbox" id="pingItalicsEnable" name="pingItalicsEnable"><em>Italics</em>\
            <input style="width: 40px;" type="checkbox" id="pingExactMatch" name="pingExactMatch">Exact match\
            <input style="width: 40px;" type="checkbox" id="pingCaseSense" name="pingCaseSense">Case sensitive\
            <br><p>Click on the "Pings" button again to save your settings!</p>\
            <p>You may need to refresh the chat for the settings to take effect.</p>\
            <br><p><a href="http://www.rphaven.com/topics.php?id=1" target="_blank">Report a problem</a> |\
            <a href="https://openuserjs.org/scripts/shuffyiosys/RPH_Pings#troubleshooting" target=_blank">Troubleshooting Tips</a> | RPH Pings Legacy 1.0.1</p>\
          </form>\
       </div>\
    </div>';


  //If this doesn't print, something obviously happened with the global vars
  console.log('RPH pings start'); 

  /////////////////////////////////////////////////////////////////////////////
  // @brief: Called when connection to chat is established. If it is, it will
  //         inject the ping settings form to the chat and restore any saved
  //         settings
  //
  $(function(){
    $('#top p.right').prepend('<a class="pings settings">Test</a>|');
    $('body').append(html);
    pingTool.box = $('#pingBox');
    pingTool.input = $('#pingNames');
    pingTool.button = $('#top a.pings');
    console.log('RPH Pings - Init complete, setting up dialog box');
    SetUpPingDialog();
  });

  /////////////////////////////////////////////////////////////////////////////
  // @brief: Sets up all the ping dialog box GUI handling.
  //
  function SetUpPingDialog(){
    pingTool.button.click(function(){
      //sendToSocket('pm', {'from':279883, 'to':241192, 'msg':'This is a test, did I hjiack the PM system?', 'target':'all'});
      console.log('RPH Extended Settings: blocked users', blockedUsers);
    });
        
    _on('pm', function(data){
      getUserById(data.to, function(fromUser){
        console.log('Tester', fromUser);
      });
    });
    
    $(buttonhtml).text('Block').bind('click', function(ev){
        sendToSocket('block', {'id':User.props.id});
      }).appendTo( $menu.find('.inner') );
        
    _on('ignores', function(data){
      var i;
      console.log('RPH Extended Settings: Blocking user', data.ids);
      for(i = 0; i < data.ids.length; i++){
          blockedUsers.push(data.ids[i]);
      }
      getUserById(data.ids, function(User){
        User.blocked = true;
      });
    });
  }
