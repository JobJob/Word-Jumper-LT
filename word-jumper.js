(function() {
  var DEBUG, defaultStopSymbols, capsNdimes, directions, findBreakSymbol, getEditor, getStopSymbols, move, moveCursors;

  DEBUG = false;


  /*
   * Direction of the movement.
   * @readonly
   * @enum {Number}
   */

  directions = {
    RIGHT: 1,
    LEFT: 2
  };


  /*
   * The string contains 'stop' symbols. In this string searching each letter
   * of the caret-line. Can be customized for language needs in plugin setting.
   * @readonly
   * @type {String}
   */

  capsNdimes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890"
  defaultStopSymbols = capsNdimes+" {}()[]?-`~\"'._=:;%|/\\";



  /*
   * Returns current editor.
   * @return {atom#workspaceView#Editor}
   */

  getEditor = function() {
    var _ref;
    return (_ref = atom.workspaceView.getActiveView()) != null ? _ref.editor : void 0;
  };


  /*
   * Returns stop symbols from the local settings or local scope.
   * @return {String}
   */

  getStopSymbols = function() {
    var _ref;
    return defaultStopSymbols
    //return ((_ref = atom.config.get("word-jumper")) != null ? _ref.stopSymbols : void 0) || defaultStopSymbols;
  };


  /*
   * Function returns sequence number of the first founded symbol in the
   * gived string. Using proprety `stopSymbols` of the plugin settings.
   * @param {String} text          - string in which searched substring
   * @param {String} stopSymbols   -
   * @example
   * findBreakSymbol("theCamelCaseString");   // returns 3
   * @example
   * findBreakSymbol("CaseString");   // returns 4
   * @example
   * findBreakSymbol("somestring");   // returns 11
   * @return {Number}   - position of the first founded 'stop' symbol.
   */

  findBreakSymbol = function(text, symbols) {
    var i, letter, _i, _len;
    symbols = symbols || getStopSymbols();
    for (i = _i = 0, _len = text.length; _i < _len; i = ++_i) {
      letter = text[i];
      if (symbols.indexOf(letter) !== -1 && i !== 0) {
        return i;
      }
    }
    return text.length;
  };


  /*
   * Function move cursor to given direction taking into account 'stop' symbols.
   * @param {atom#workspaceView#Editor#Cursor} cursor  - editor's cursor object
   * @param {Number} direction                         - movement direction
   * @param {Boolean} select                           - move cursor with selection
   * @param {Boolean} selection                        - selected range object
   */

  move = function(cm, cursor, direction, select, cur_selection) {
    var column, cursorPoint, offset, row, textFull, textLeft, textRight, _text, caps_offset;
    if (cur_selection == null) {
      cur_selection = false;
    }
    //DEBUG && console.group("Moving cursor #%d", cursor.marker.id);
    row = cursor.line;
    column = cursor.ch;
    DEBUG && console.log("initial pos",row,column)
    textFull = cm.doc.getLine(row);
    textLeft = textFull.substr(0, column);
    textRight = textFull.substr(column);
    _text = textRight;
    if (direction === directions.LEFT) {
      _text = textLeft.split("").reverse().join("");
      DEBUG && console.log("rev text", _text)
    }
    offset = findBreakSymbol(_text);
    DEBUG && console.log("offset init", offset)
    if (direction === directions.LEFT) {
      caps_offset = findBreakSymbol(_text, capsNdimes);
      DEBUG && console.log("caps_offset", caps_offset)
      if (caps_offset <= offset){
        offset = (caps_offset * (-1)) - 1;
      } else {
        offset = offset * (-1);
      }
    }
    if (column === 0 && direction === directions.LEFT) {
      offset = 0;
      row -= 1;
      column = cm.doc.getLine(row).length - 1; //getEditor().lineLengthForBufferRow(row) || 0;
    }
    /*if (cursor.isAtBeginningOfLine() && direction === directions.RIGHT) {
      if (!cursor.isInsideWord()) {
        offset = findBreakSymbol(_text, getStopSymbols().replace(/\s/, '') + "abcdefghijklmnopqrstuvwxyz");
      }
    }*/
    if (column === textFull.length -1 && direction === directions.RIGHT) {
      //end of (days) row
      row += 1;
      column = 0;
    }
    DEBUG && console.log("New Position ", row, column);
    DEBUG && console.log("TextLeft", textLeft);
    DEBUG && console.log("textRight", textRight);
    DEBUG && console.log("Offset by", offset);
    cursorPoint = [row, column + offset];
    column += offset;
    if (select) {
      new_selection = cur_selection.deepCopy()
      var anchor = cur_selection.ranges[0].anchor;
      var head = new_selection.ranges[0].head;
      DEBUG && console.log("anchor, head pre", anchor.ch, anchor.line, head.ch, head.line);
      head.ch = column;
      head.line = row;
      DEBUG && console.log("anchor, head post", anchor.ch, anchor.line, head.ch, head.line);
      cm.doc.setSelection(anchor, head);
    }else {
      cm.doc.setCursor(row, column);
    }
    //return DEBUG && console.groupEnd("Moving cursor #%d", cursor.marker.id);
  };


  /*
   * adsf_asdfa_asdl_asdfasdfa
   * Function iterate the list of cursors and moves each of them in
   * required direction considering spec. symbols desribed by
   * `stopSymbols` setting variable.
   * @param {Number} direction - movement direction
   * @param {Boolean} select   - move cursor with selection
   */

  moveCursors = function(cm, direction, select) {
    /*var cursor, i, selections, _i, _len, _ref, _ref1, _results;
    selections = getEditor().getSelections();
    _ref1 = (_ref = cm) != null ? _ref.getCursors() : void 0;
    _results = [];
    for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
      cursor = _ref1[i];
    }*/
    var _results = []
    var cursor = cm.doc.getCursor()
    _results.push(move(cm, cm.doc.getCursor(), direction, select, cm.doc.sel));
    return _results;
  };

  CodeMirror.commands.wjright = function(cm) {
        //console.log(cm)
        return typeof moveCursors === "function" ? moveCursors(cm, directions.RIGHT) : void 0;
      };
  CodeMirror.commands.wjleft = function(cm) {
        return typeof moveCursors === "function" ? moveCursors(cm, directions.LEFT) : void 0;
      };
  CodeMirror.commands.wjsright = function(cm) {
        return typeof moveCursors === "function" ? moveCursors(cm, directions.RIGHT, true) : void 0;
      };
  CodeMirror.commands.wjsleft = function(cm) {
        return typeof moveCursors === "function" ? moveCursors(cm, directions.LEFT, true) : void 0;
      };

}).call(this);

//console.log(Window.jbucm.doc.sel)
// console.log(Window.jbucm.doc.getRange())
// console.log(Window.jbucm.doc.getSelection(), Window.jbucm.doc.getCursor())
// Window.jbucm.doc.getSelection(), Window.jbucm.doc.getCursor()
// CodeMirror.commands.wjright
