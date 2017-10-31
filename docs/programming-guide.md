# RPH Tools Programming Guide
***
## The Module Paradigm
RPH tools is built off the idea that each component is built into self-contained modules. The paradigm is similar to classes in OOP. While it's understood that JavaScript as of ECMAScript 2015 has classes, this style provides the facility to encaspulate "private" members of the module and allows the developer to only expose what they want.

**Note:** RPH Tools modules have no relation to any other use of the term in JavaScript based languages.

The module template is as follows:
```Javascript
var [ModuleName] = (function(){
  /* Declare module members here */
  html = '';

  /* Initializes the module */
  var init = function(){
  };

  /* Exposes the following to the rest of the script. i.e, anything you want 
      public must be declared here. */
  return {
      init : init,

      getHtml : function(){
          return html;
      },

      toString : function(){
          return '[Module Name] Module';
      },
  };
}());
```

RPH Tools has been developed with the following rules for modules:
* It _must_ have a function tied to ```init``` in the return blob. This initializes the module. 
* If the module contains HTML code, it must also have the ```getHtml``` function. The init function is meant to register HTML handlers with jQuery or the native ```document``` object.

While there is a main ```RPH Tools``` module, this is not necessarily required for RPH Tools to work, provided similar functionality is offered. In addition, the ```init``` function need not exist either, as long as there's no real need to initialize anything with the module. Just note that the main ```RPH Tools``` module was made to execute the script.

## Build Script
The build script calls a way to concatonate the JavaScript files into one file. The order of modules does not matter with the exception of:
* The first file _must_ be rph\_tools\_header.js
* If using ./modules/rph-tools.js, it _must_ be second to last
* The last file _must_ be main.js

## Considerations when creating or modifying modules
### Remember to add your module to main.js
```main.js``` contains an array of all modules that will be active in the script. If you want the main ```RPH Tools``` module to run your module, it must be inlcuded in that array.

### Modules do not need GUI components (HTML)
While all of RPH Tool's default modules are GUI components of the script, they need not contain any GUI or HTML functions to work. If all a module is doing is listening on client events, then it can do so without the need for HTML. If there are any settings that need configuring though, it's recommended to add a GUI component.

### Cross Module Dependency
The main consideration when creating or modify modules is that the module may or may not exist. Always check if the module exists. Also the existance of another module _should not_ be mandatory. **Always** make module dependencies optional. In the event a module is not available, a default operation should be used instead.

For example in RPH Tool's default setup, the ```Chat``` module has this:

```Javascript
if (moddingModule !== null) {
  getUserById(room.userid, function (user) {
    var classes = GetClasses(user, thisRoom);
    if (classes.indexOf("mod") > -1 || classes.indexOf("owner") > -1){
      moddingModule.AddModFeatures(thisRoom, user);
    }
  });
}
```
If the existance of the ```Modding``` module is true, then a feature can be used in conjunction with the ```Chat``` module. However this is not an essential function, so no default action is needed.