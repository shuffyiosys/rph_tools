/****************************************************************************
 * Script initializations to execute after the page loads
 ***************************************************************************/
$(function () {
  console.log(VERSION_STRING, 'start');
  var modules = [
    chatModule,
    pmModule,
    rngModule,
    blockingModule,
    moddingModule,
    settingsModule,
    aboutModule,
  ];
  
  rphToolsModule.init(modules);
  unsafeWindow.parseMsg = parseMsg_fixed;
});