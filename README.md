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
#Version History
**12/15/2016**
- Updated the blocking mechanism.
- Added a custom chat message parser.

**06/25/2016 (2.3.4)**
- Redid the chat tab scrolling feature so it creates a horizontal scroll rather than a vertical scroll, as there were cases where the chat tabs could break on a vertical scroll.

**06/21/2016 (2.3.3)**
- Added a feature that when entering so many rooms that the chat tabs overflow, a scroll bar will appear so you can scroll through the other tabs.

**04/24/2016 (2.3.2a)**
- Made the pop up only show for the intended user.

**2.3.2**
- When you are kicked or banned from a room while in it, a pop-up shows up that shows which room you were evicted from and the reason.
- Added a min and max range indicator on the generic RNG with the result.

**02/04/2016 (2.3.1a)**
- Fixed a problem where the settings won't be saved when adding more names to ping or updating PM settings
- Fixed a problem where PM audio pings don't work.

**02/01/2016 (2.3.0)**
- Re-released 2.3.0 after much needed testing.
- Separated the chat and PM settings into their own sections
- Added a function to auto join rooms on login.
- Added a button in the Modding section to reset the chat's password if you forget it.
- Renamed "Import/Export" to "Script Settings"
- Added a button to delete chat and PM settings in the "Script Settings" section

**01/21/2016**
- Reverted script to 2.2.1 pending issues to be resolved.

**01/20/2016: 2.3.0**
- Separated the chat and PM settings into their own sections
- Added a function to auto join rooms on login.

**2.2.0 - 12/05/2015**
- All console prints use "RPH Tools [<function>]:"
- Removed flood and clone detection, as RPH addressed these.
- Redid the HTML such that it's now uniform and lines up properly.
- Changed "No room links" to "No image icons in PM", as room link removal was done in RPH and this had a side effect of removing image icons in PM too. However, the internal name is still kept for compatibility purposes.

**2.1.4 - 12/03/2015**
- Fixed an issue where RPH would block "undefined" at the start of the chat if the user's block list was empty, which would cause RPH Tools to save an empty block list.
  - RPH Tools checks if RPH is trying to block "undefined"
  - RPH Tools copies what's saved in the block list immediately into the main list and issues a block using UserChangeIgnore instead of blockUserById.s
  - RPH Tools blocks the entire list after a minute of launching or if the user opens up the dialog to force blocking.
- RPH Tools ignores RPH's unblock event to prevent the client from randomly unblocking (if possible)

**2.1.2 - 11/16/2015**
- Added the ability to use a custom sound for PM notifications.
- Added a mute option for PM sounds.

**2.1.0 - 06/26/2015**
 - Added an option to show dice roll totals.

**2.0.3 - 05/24/2015**
- Showing your character name in the tab and text box is switchable.

**2.0.2 - 05/07/2015**
- Fixed how room links are removed from PMs. This won't muck with regular links anymore. It also has a side effect of removing image icons from PMs.

**2.0.1 - 03/14/2015**
- ~~Added cloning detection~~
- ~~Fixed how RPH Tools handles the account data blob to prevent it from populating dropdown lists in the event the PM system restarts~~
- Fixed an issue where if you input an invalid text color, the red highlight doesn't go away. It does now when the color is valid.
- Added a "Print settings" button in "About/Help". This will dump the settings of RPH Tools into the console.
- Removed loading settings from cookies.

**2.0.0 - 02/25/2015**
- Refactored the layout of the HTML to remove execessive help text.
- Changed the RNG layout to use radio style selection.
- Added a room-name pair list in Modding to make it easier to fill out which mod and room to perform the action. The user must enter the room first as a mod for the list to populate.

**1.4.1 - 02/21/2015**
- ~~Fine tuned flood detection.~~

**1.4.0 - 02/21/2015**
- ~~Added flood detection~~

**1.3.0 - 02/17/2015**
- RPH Tools now takes over the official "Settings" link (until it gets used for something useful again)
- Moved the chat history setting into RPH Tools
- Changed the RNG button label behavior to say "Wait..." while the buttons are disabled.

**1.2.7 - 02/16/2015**
- Fixed a layout issue with the import/export settings.
- Fixed an issue where the URL for pings would not work until the ping URL is re-entered again. Issue was that it wasn't loaded after getting chat settings.

**1.2.6 - 02/15/2015**
- Resized the dialog window to 480x500.
- Tied RPH Tools to the official blocking mechanism.
- Added placeholder text and changed the text color in the chat input textbox.

**1.2.5 - 02/11/2015**
- Changed the mod target separated to semicolon, as commas are valid in character names.

**1.2.4 - 02/10/2015**
- Added multitarget option for mod commands

**1.2.3 - 02/04/2015**
- Added Import/Export settings.
- Fixed the issue where blocked usernames would fill up the localStorage. There was a problem when loading, it would call "blockUser" which would add the user ID to the blocked users array. But the loading also added it. This fixes the issue supposedly fixed in

**1.2.1
- Fixed an issue with the away message system where if you attempt to enable away on a name already away, it will add another [Away] block.

**1.2.2 - 02/04/2015**
- Fixed a problem with the random number generator relying on chat tab contents to know which room to post in.

**1.2.1 - 02/03/2015**
- (Fixed the issue where blocked usernames would fill up the localStorage.)

**1.2.0 - 02/02/2015**
- Fixed a bug with the PM Away Message system where if you enable it for a name, disable it, then disable it again, the username gets eaten up.
- Your username will be inserted below the chat name to help keep track of alts

**1.1.0 - 02/01/2015**
- Changed <form> tags in the HTML to <div> tags. This causes textboxes to invoke a submit action if enter is pressed.
- Uses local WebStorage now instead of cookies. Cookies will still be loaded if available and as a fallback.
- Removed PM text colors as they weren't working as intended.
- ~~Fixed a bug with blocking. Originally the script didn't touch the cookie that was saved and there wasn't a way to scrub names that no longer would respond to the getUserById. The script now saves every time you block someone to refresh the list. This could be a problem because if you block enough people whose names no longer respond, you could fill up the cookie and it will no longer save blocked people. However, in this version if you've blocked someone with a name that has disappeared and it reappears, you will have to reblock them.~~

  This is no longer an issue with WebStorage, however, unresponsive names will still be pruned to avoid memory leaks.
- Added per-username PM away messages. To use, select a name, set an away message, and press "Enable" or "Disable". Names that are away will be highlighted in the list and will auto-reply when someone PMs them.

**1.0.1 - 01/04/2015**
- Added a filter so small images will be posted as links instead of the image itself. (No PM filter yet)

**1.0.0 - 12/20/2014**
- Cleaned up the code a bit. Which is why it's now a 1.0.0
  - Removed some console dumps since they were not really important anymore
- Reorganized the UI to be consistent.
- Added away messages for PM. Set an away message and enable it and anyone who PMs you will get that message. If you respond in any way, it'll turn off
  auto-replying. Works across your account, but I'm considering it per-username since this is just a session only feature (as in, if you log out, it will
    reset).
- Fixed text color checking again. It didn't work on text inputs with three characters. Also changed the value limiting algorithm.
- Fixed bounds checking for the general RNG (also so it'd stop using Math.Pow)
- Blocking is now by way of a button instead of pressing enter on the text input. For some reason, pressing enter may make the browser think you're doing a URL request, which tries to redirect you the site with the request.

**0.1.2 - 12/17/2014**
- Limited text colors so bright colors are not available.
- Extended room link sanitizing on PMs to outgoing PMs.
- ~~Added the option to include your text color in PMs. This only affects the client side end, so if you enable it but the recipient doesn't, the recipient doesn't see the colors, only you.~~
- For license reasons I reverted the room link sanitizing on the chat room end to what I originally did. Functionally it's the same.

**0.1.1 - 12/15/2014**
- Expanded disabling of room linking to PMs now.
- Minor cleanup with UI.

**0.1.0 - 12/12/2014**
- Added the ability to change a username's color by way of raw hex inputs.
- Script removes the quote/message of the day on the top header to fix an issue
  where the message would hide the top right section if the browser width was too low.
- Fixed a bug where exact matching and case sensitivity was not actually working properly.
- Fixed a bug that was causing the script to think the ping settings were invalid even though they were valid

**0.0.8 - 12/10/2014**
- Adding kick and modding actions in the modding section
- Fixed a loading bug when initializing blocked users.

**0.0.7 - 12/08/2014**
- Fixed a bug in the room link checkbox.

**0.0.6 - 12/07/2014**
- Added coin tossing and a general RNG
- Cleaned up the banning/unbanning in Mod Tools

**0.0.5 - 12/06/2014**
- Initial release. Implemented pinging, room link disabling, dice rolling, blocking, and banning.
