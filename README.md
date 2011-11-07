# node-fmamsg: Sun FMA Message ID Library

## Introduction

This library parses Sun FMA Message IDs of the following form:

    ZFS-8000-HC

It validates the identifier and returns a hash:

```javascript
{ name: 'ZFS', value: 16 }
```

Exceptions are thrown for malformed identifiers, checksum errors, etc.  The library can also encode name-value pairs back into strings.

## Installation

    npm install fmamsg

## Usage

```javascript
var fmamsg = require('fmamsg');

/* Decode: */
var obj = fmamsg.decode('ZFS-8000-HC');
console.log('Dictionary = ' + obj.name + ', Entry = ' + obj.value);

/* Encode: */
var str = fmamsg.encode(obj.name, obj.value);
console.log('Message ID = ' + str);
```
