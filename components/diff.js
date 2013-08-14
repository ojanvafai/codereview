var diff = (function() {
  var kFileHeaderBegin = 'Index: ';
  var kFileHeaderEnd = '+++ ';

  function startsWith(string, text) {
    return string.slice(0, text.length) == text;
  }

  function classifyLine(line) {
    if (!line.length)
      return 'empty';
    var c = line[0];
    if (c == '@')
      return 'header';
    if (c == '+')
      return 'add';
    if (c == '-')
      return 'remove';
    if (c == 'I')
      return 'index';
    if (c == ' ')
      return 'both';
    throw 'Parse error: Unable to classify line: "' + line + '"';
  }

  function trimLine(type, line) {
    if (type == 'add' || type == 'remove')
      return line.slice(1);
    return line;
  }

  // FIXME: Parse the chunk header.

  // var kChunkHeaderStart = '@@ ';
  // var kChunkHeaderEnd = ' @@';

  // function parseChunkDescriptor(descriptor) {
  //   var pieces = descriptor.split(',');
  //   if (pieces.length != 2)
  //     throw 'Parse error: Expected exactly one comma: ' + descriptor;
  //   return {
  //     offset: parseInt(pieces[0]),
  //     length: parseInt(pieces[1]).
  //   }
  // }

  // function parseChunkHeader(line) {
  //   if (!startsWith(line, kChunkHeaderStart))
  //     throw 'Parse error: Expected "' + kChunkHeaderStart + '": ' + line;
  //   var end = line.indexOf(kChunkHeaderEnd, kChunkHeaderStart.length);
  //   if (end == -1)
  //     throw 'Parse error: Missing terminating "' + kChunkHeaderEnd + '": ' + line;
  //   var combinedDescriptor = line.slice(kChunkHeaderStart.length, end);
  //   var descriptors = combinedDescriptor.split(' ');
  //   if (descriptors.length != 2)
  //     throw 'Parse error: Expected exactly one space: ' + combinedDescriptor;
  //   return {
  //     before: parseChunkDescriptor(descriptors[0]),
  //     after: parseChunkDescriptor(descriptors[1]),
  //   };
  // }

  function Parser(diff) {
    this.lines = diff.split('\n');
    this.currentLine = 0;
  }

  Parser.prototype.peekLine = function() {
    return this.lines[this.currentLine];
  }

  Parser.prototype.takeLine = function() {
    return this.lines[this.currentLine++];
  }

  Parser.prototype.haveLines = function() {
    return this.currentLine != this.lines.length;
  };

  Parser.prototype.parseFile = function() {
    var groups = [];
    var currentGroupType = null;
    var currentGroup = [];
    while (this.haveLines()) {
      var type = classifyLine(this.peekLine());
      if (type == 'index' || type == 'empty')
        break; // We're done with this file.
      var groupType = type;
      if (groupType == 'add' || groupType == 'remove')
        groupType = 'delta';
      if (groupType != currentGroupType) {
        if (currentGroup.length)
          groups.push(currentGroup);
        currentGroupType = groupType;
        currentGroup = [];
      }
      currentGroup.push({
        type: type,
        text: trimLine(type, this.takeLine()),
      });
    }
    if (currentGroup.length)
      groups.push(currentGroup);
    return groups;
  }

  Parser.prototype.parseHeader = function() {
    while (this.haveLines()) {
      var line = this.takeLine();
      if (startsWith(line, kFileHeaderEnd)) {
        return;
      }
    }
    throw 'Parse error: Filed to find "' + kHeaderStop + '"';
  };

  Parser.prototype.parse = function() {
    var files = [];
    while (this.haveLines()) {
      var line = this.takeLine();
      if (!startsWith(line, kFileHeaderBegin))
        continue;
      var name = line.slice(kFileHeaderBegin.length);
      this.parseHeader();
      files.push({
        name: name,
        groups: this.parseFile(),
      })
    }
    return files;
  };

  function parse(diff) {
    if (!diff)
      return null;
    return (new Parser(diff)).parse();
  }

  return {
    parse: parse,
  }

}());
