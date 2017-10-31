***
#Description
RPH Tools is a userscript with a set of features that enriches the RPH
experience.

***
#How to Install and Update

## Installing RPH Tools
1. You must have (one or the other)
  - [Firefox](http://www.getfirefox.com) with the [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) extension installed
  - [Google Chrome](https://www.google.com/chrome/) or [Chromium](http://www.chromium.org/Home) with the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) extension installed.
  - [Opera](http://www.opera.com) with either the [TamperMonkey](https://addons.opera.com/en/extensions/details/tampermonkey-beta/?display=en) or [Violent monkey](https://addons.opera.com/en/extensions/details/violent-monkey/?display=en) extension installed.
2. Install using one of these two methods:
  - Go to the [Openuser JS site](https://openuserjs.org/scripts/shuffyiosys/RPH_Tools) and click on the "Install" button on top to add the script.
  - Click on the "Source Code" tab and copy the source code, then...
    - In Greasemonkey, select "Add new script", enter some information then press OK, then paste the code in there. Make sure to save it and enable it.
    - In Tampermonkey, select "Add a new script", then paste the code in there. Press the save icon and enable it.
5. Refresh RPH if you're on it already for the script to take effect.

##To update
Go to the [Openuser JS site](https://openuserjs.org/scripts/shuffyiosys/RPH_Tools) and click on the "Install" button on top to update the script. This will overwrite the version you currently have.

***
#Features
RPH Tools is a user script that adds additional features into RPH. These features were implemented to either enrich the user's experience to the website or to make certain commands easier to issue. The list of features is pretty long, so here it is in a convenient list form!

### General
- All of these settings can be changed and applied without on the fly refreshing the chat
- All persistent settings are saved under localStorage.

### Chat room and PM features
- Changing the text color of a user name with hex values instead of the slider.
- Custom pinging options. This allows a user to be given a visual and audio "ping" when someone types up a keyword.
  - Highlights will mark the keyword and the chat where the ping happened.
  - Audio pings can be customized to any audio you wish! .mp3, .ogg, or .wav is supported only.
- Custom PM audio sounds and a mute button to force mute.
- PM away message system for each user's name.
- ~~Room links (where posting the name of the room creates a link to it) can be enabled or disabled~~
  - RPH has disabled room links entirely, but this option is still around as it has a side effect of removing image icons in PMs.
- Image icons in chat can be enabled or disabled.
- Show the user name in the chat tab and text box for easy alt handling.
- Edit the number of lines in chat the browser will remember.

### Random number generators
- Coin flipping
- Roll 1-10 dice with 2-100 sides.
- Generate a number between -4294967295 and 4294967295.

### Blocking
- Force block users. This will apply a block flag to users of your choosing.
  - This only works in the chat.rphaven.com URL proper. Being outside of this URL will not apply this.

### Modding
- Helps owners and mods moderate their rooms with more explicit input.
- You can also moderate a room even if you're not in it.

***
#How to Use
**Note** Saved settings are automatically retrieved and populated.

1. Click on "Settings" to open up the main window.
  - Note: If this does not show "RPH Tools" on the top, the script is not working properly.
2. Click on the tab setting/feature you want to change or use.
3. When you're done, click on "More Settings" to close the window and save settings.

### Chat Room and PM Settings
- User name text color:
  - Enter a user name and color (6 or 3 digit hex code) to set the color for that user name.
  - Colors are limited per channel to D2 for 6 character codes and D for 3 character codes.
    - For example, #D2D2D3 is not valid and neither is #00E.
- Setting up pings:
  - **For ping names and URL**, do not use the pipe ( | ), this is used for separating entries when saving settings.
  - Enter all the names or words you want to be pinged by. Separate each entry with a comma, but leave no spaces.
    - e.g., Do "Alice,Bob" instead of "Alice, Bob"d
  - Enter the URL of the sound file to play when a ping is matched. It must be a WAV, MP3, or OGG file.
  - If you need a place to upload a sound clip:
    - Go to [Clyp.it](http://clyp.it) and upload your sound
    - When it's done, click on the "Advanced" tab and it'll give you a .mp3 and .ogg link you can use (see [image](http://i.imgur.com/xbmYLtG.png))
  - Enter the text and highlight color as an RGB hex value.
    - This uses HTML compatible hex codes, so you can enter #FFF for white instead of #FFFFFF.
  - Check if you want the text in the to have bold and/or italics
  - Check if you want words in the chat to exactly match the words on the list to get a ping.
    - e.g., if using "Mel", it must match that and will not trigger on "Melody" or "Melanie"
  - Check if you want case sensitivity.
    - e.g., if using "Mel" with this checked, it will not ping on "mel".
  - You can check if the ping is to your liking by putting one of the words on the list into the chat (it will not ping that word/name if it's been previously posted). To save your settings, you must press the "More Settings" button again.
  - If a setting is invalid, it will mark the field red and the window will not close or save settings until it's fixed.
- PM Away Messages (away messages are not persistent, they will disappear if you refresh the chat):
  - Select a user name you want to be "away"
  - Type in a message to send to anyone who PMs that name.
  - Press "Enable" to set that name as away. "[Away]" will be prepended to that name to indicate so.
  - To disable away messages, select the name from the list and press "Disable".
  - If you PM someone with a name that is away, that name will no longer be away.
- If you want to turn off image icons in PMs, check the "No image icons in PMs" check box.
- If you want to turn off image icons in chat, check the "No image icons in chat" check box.
- If you want the username to show up in the chat text input box and the chat tab, check the "Show username in tabs & textbox" check box
- To adjust the number of lines the browser will show per chatroom, enter a number in "Chat history"

### Random Number Generators
1. Check which type of RNG you want.

**Coin toss**
1. Press "Flip coin!" to flip a coin.

**Dice rolling**
1. Enter the number of die you want to roll
2. Enter the number of sides per die you want to roll
3. Press the "Let's Roll" button to generate a roll.

**Generic RNG**
1. Enter a minimum number. The results will include this number
2. Enter a maximum number. The results will exclude this number.
3. Press "Randomize!" to get a number.

### Blocking
1. Enter the user you want to block in the text box and press Enter.
2. If the name does not come up, the box will be highlighted red, otherwise the name will appear in the drop down menu below.
3. To unblock, select the name from the drop down menu and press the "Unblock" button.
4. This list is auto-populated when the chat loads. If for some reason the user name no longer exists or is unreachable, the script will not block that name and you will have to re-block the name if it comes back.

### Modding
1. Enter your user name of the room that has mod rights
2. Enter a message that will be displayed
3. Enter the user names that the action will be performed. Separate each name with a semicolon without spaces.
  - For example, do "User1;User2;User3", **not** "User1; User2; User3".
4. Press one of the buttons to perform the action.

### Import/Export
1. Press the "Export" button, this will populate the textbox with settings are saved.
2. To restore settings, input exported settings in the textbox and press the "Import" button. If there is something wrong with the settings, the textbox will show red.

***
# Troubleshooting
- Make sure you are using **one version** of this script. If you installed the other versions, they probably won't play nice with each other.
- RPH Tools has Javascript console logging at various places where a problem is more likely to happen. To open up the console:
  - Firefox: Ctrl + Shift + K if on Windows, or Cmd + Opt + K if on Mac OS
  - Chrome: Ctrl + Shift + J if on Windows, or Cmd + Opt + J if on Mac OS
  - Opera: Press CTRL + SHIFT + I to open Dragonfly. Click on the “console” tab.
- Refresh the page after installing. If you are on RPH and you install this script, then this is a must.
- Delete cookies related to pings
  - Go into your browser's options and search for RPH's cookies. You can either delete them all (which will just make it forget you were logged in) or find the cookies prepended with rphTools_.
- If your settings are out of whack...
    - Open up your browser's JavaScript console. In Firefox, either press F12 to bring up the developer's window and select the "Console" tab or go to Options > Developer > Web Console. In Chrome, either do CTRL (Command on Mac) + Shift + J or go to View > Developer > JavaScript Console.
    - Issue the command ```localStorage.removeItem('chatSettings');``` to delete chat and PM settings or ```localStorage.removeItem('blockedUsers');``` to delete blocked users.
    - Verify they have been deleted by issuing ```localStorage.getItem('chatSettings');``` or ```localStorage.getItem('blockedUsers');``` and seeing if the console posts ```null```.


***
#Known Issues
- Rooms share the same chat buffer if you connect to the same one with multiple alts. This may cause pings to be a bit overzealous.

***
#Limitations
- If you are running RPH on multiple tabs/windows, most settings will not propagate across all open instances.
- Greasemonkey/Tampermonkey has no access to local files for security reasons. Therefore, any audio you use for pings must be online somewhere.
- Do not use the pipe ( | ) or semicolon ( ; ) in text fields that allow multiple, separated entries.

***
#License/Disclaimer
Copyright (c) 2014 Shuffyiosys

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

***
