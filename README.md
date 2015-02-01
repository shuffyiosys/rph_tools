================================================================================
RPH Tools
================================================================================

================================================================================
1. Description
================================================================================
RPH Tools is a custom user script for the Greasemonkey and Tampermonkey plugins.
This script is to fix issues and add features to RPHaven (www.rphaven.com). This
script only works however on the chat portion of the website (chat.rphaven.com)

================================================================================
2. Features
================================================================================
Chat room

- User inputted names and words to trigger pinging.
- Plays an audio ping upon matching.
  -  Supports only .wav, .mp3. and .ogg files
- Custom text and highlight colors
- Bold or italicize text
- Triggering on exact matching and case sensitivity
- Will save in a cookie to allow persistent changes
- Can change settings on the fly
- Room where the ping happened will be highlighted.
- Room links (where posting the name of the room creates a link to it) can be
  enabled or disabled in chats.

Random number generators

- Coin flipping
- Roll 1-10 dice with 2-100 sides.
- Generate a number between -2^32-1 and 2^32-1 (they're big numbers).

Friends list/Blocking

- Force block users. This will apply a "block" flag on a user every time you go
  on chat. However, since this script does not execute unless you're in
  chat.rphaven.com, be weary if you've decided to go somewhere else first.
  - You can unblock users if you want to as well.
  - There's a limit based on the cookie size.

Mod Tools
- Easier methods to perform modding actions in a room.

================================================================================
3. How to Use
================================================================================

Click on the "More Settings" text on the top right corner
Click on the tab setting/feature you want to change or use.

Chat room settings

- Enter all the names or words you want to be pinged by. Separate each entry
  with a comma.
- Enter the URL of the sound file to play when a ping is matched. It must be a
  WAV, MP3, or OGG file.
  - For ping names and URL, do not use the pipe ( | ), as this is the delimiter
    for the script's cookie saving. If you use it, your settings will be screwed
    up.
- Enter the text and highlight color as an RGB hex value. This uses HTML
  compatible hex codes, so you can enter #FFF for white instead of #FFFFFF.
- Check if you want the text in the to have bold and/or italics
- Check if you want words in the chat to exactly match the words on the list to
  get a ping.
  - e.g., if using "Mel", it must match that and will not trigger on "Melody" or
   "Melanie"
- Check if you want case sensitivity.
  - e.g., if using "Mel" with this checked, it will not ping on "mel".
- You can check if the ping is to your liking by putting one of the words on the
  list into the chat (it will not ping that word/name if it's been previously
  posted). To save your settings, you must press the "Pings" button again.
  - If a setting is invalid, it will mark the field red and the window will not
    close or save settings until it's fixed.
  - This script is designed to not need a page refresh, but in case the settings
    aren't taking, refresh the page anyway.
- If you don't want rooms to be linked if said in chat, check the "No room
  linking in chat" checkbox.

Random Number Generators

Coin toss
- Press "Flip coin!" to flip a coin.

Dice rolling
- Enter the number of die you want to roll
- Enter the number of sides per die you want to roll
- Press the "Let's Roll" button to generate a roll.

Generic RNG
- Enter a minimum number. The results will include this number
- Enter a maximum number. The results will exclude this number.
- Press "Randomize!" to get a number.

Friends List/Blocking
- Enter the user you want to block in the text box and press Enter.
- If the name does not come up, the box will be highlighted red, otherwise the
  name will appear in the drop down menu below.
- To unblock, select the name from the drop down menu and press the "Unblock"
  button.

Mod Tools
- Enter the room to perform the action
- Enter your user name of the room that has mod rights
- Enter the user name of whom the action is being performed on
- Enter a message that will be displayed (defaults to a generic one)
- Press the appropriate button to adminster the action.

================================================================================
4. Troubleshooting
================================================================================
Refresh the page after installing. Make sure you are using one version of this
script. If you installed the other versions, they probably won't play nice with
each other. Delete cookies related to pings. Go into your browser's options and
search for RPH's cookies. You can either delete them all (which will just make
it forget you were logged in) or find the cookies prepended with rphTools_.

================================================================================
5. Known Issues
================================================================================
- RPH has a quirk with how the chat is buffered. There's only one buffer (i.e.,
  place where all the messages get posted) and all your names that log into the
  chat room reference that. So expect funny things to happen.
- This script relies on account fetching callbacks. Under normal operation, RPH
  should send the user's account information once the PM server connection is
  established. This is needed to populate the drop list for names. So if there
  is some issues with getting account info, this script may not work.
- There's a layout quirk with the chat. If the message of the day is too long,
  it could block the button.

================================================================================
6. Limitations
================================================================================
- Offers no sanitizing of inputs, but I'm not sure how necessary this is.
- Greasemonkey/Tampermonkey has no access to local files for security reasons.
  Therefore, any audio you use for pings must be online somewhere.
- Do not use the pipe ( | ) in the text fields, I use that as the delimiter for
  cookie saving.

================================================================================
7. License/Disclaimer
================================================================================
Copyright (c) 2014 Shuffyiosys

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

================================================================================
8. Version History
================================================================================
1.1.0 - 02/01/2015
- Changed <form> tags in the HTML to <div> tags. This causes textboxes to invoke
  a submit action if enter is pressed.
- Uses local WebStorage now instead of cookies. Cookies will still be loaded if
  available and as a fallback.
- Removed PM text colors as they weren't working as intended.
- [DEPCRATED]Fixed a bug with blocking. Originally the script didn't touch the
  cookie that was saved and there wasn't a way to scrub names that no longer
  would respond to the getUserById. The script now saves every time you block
  someone to refresh the list. This could be a problem because if you block
  enough people whose names no longer respond, you could fill up the cookie and
  it will no longer save blocked people. However, in this version if you've
  blocked someone with a name that has disappeared and it reappears, you will
  have to reblock them.

  This is no longer an issue with WebStorage, however, unresponsive names will
  still be pruned to avoid memory leaks.
- Added per-username PM away messages. To use, select a name, set an away
  message, and press "Enable" or "Disable". Names that are away will be
  highlighted in the list and will auto-reply when someone PMs them.

1.0.1 - 01/04/2015
- Added a filter so small images will be posted as links instead of the image
  itself. (No PM filter yet)

1.0.0 - 12/20/2014
- Cleaned up the code a bit. Which is why it's now a 1.0.0
  - Removed some console dumps since they were not really important anymore
- Reorganized the UI to be consistent.
- Added away messages for PM. Set an away message and enable it and anyone who
  PMs you will get that message. If you respond in any way, it'll turn off
  auto-replying. Works across your account, but I'm considering it per-username
  since this is just a session only feature (as in, if you log out, it will
    reset).
- Fixed text color checking again. It didn't work on text inputs with three
  characters. Also changed the value limiting algorithm.
- Fixed bounds checking for the general RNG (also so it'd stop using Math.Pow)
- Blocking is now by way of a button instead of pressing enter on the text
  input. For some reason, pressing enter may make the browser think you're doing
  a URL request, which tries to redirect you the site with the request.

0.1.2 - 12/17/2014
- Limited text colors so bright colors are not available.
- Extended room link sanitizing on PMs to outgoing PMs. That was the problem I
  think, it works fine if the PM window isn't up.
- Added the option to include your text color in PMs. This only affects the
  client side end, so if you enable it but the recipient doesn't, the recipient
  doesn't see the colors, only you.
- For license reasons I reverted the room link sanitizing on the chat room end
  to what I originally did. Functionally it's the same.

0.1.1 - 12/15/2014
- Expanded disabling of room linking to PMs now.
- Minor cleanup with UI.

0.1.0 - 12/12/2014
- Added the ability to change a username's color by way of raw hex inputs.
- Script removes the quote/message of the day on the top header to fix an issue
  where the message would hide the top right section if the browser width was
  too low.
- Fixed a bug where exact matching and case sensitivity was not actually working
  properly.
- Fixed a bug that was causing the script to think the ping settings were
  invalid even though they were valid

0.0.8 - 12/10/2014
- Adding kick and modding actions in the modding section
- Fixed a loading bug when initializing blocked users.

0.0.7 - 12/08/2014
- Fixed a bug in the room link checkbox.

0.0.6 - 12/07/2014
- Added coin tossing and a general RNG
- Cleaned up the banning/unbanning in Mod Tools

0.0.5 - 12/06/2014
- Initial release. Implemented pinging, room link disabling, dice rolling,
  blocking, and banning.
