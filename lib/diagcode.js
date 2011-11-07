/*
 * CDDL HEADER START
 *
 * The contents of this file are subject to the terms of the
 * Common Development and Distribution License (the "License").
 * You may not use this file except in compliance with the License.
 *
 * You can obtain a copy of the license at usr/src/OPENSOLARIS.LICENSE
 * or http://www.opensolaris.org/os/licensing.
 * See the License for the specific language governing permissions
 * and limitations under the License.
 *
 * When distributing Covered Code, include this CDDL HEADER in each
 * file and include the License file at usr/src/OPENSOLARIS.LICENSE.
 * If applicable, add the following below this CDDL HEADER, with the
 * fields enclosed by brackets "[]" replaced with your own identifying
 * information: Portions Copyright [yyyy] [name of copyright owner]
 *
 * CDDL HEADER END
 *
 * Copyright 2007 Sun Microsystems, Inc.
 * Copyright 2011 Joshua M. Clulow <josh@sysmgr.org>
 *
 */

var bigdecimal = require('bigdecimal');
var sys = require('sys');
var crc = require('./crc').crc;

/* the FMA Diagnostic Code Alphabet... */
var ALPHABET = "0123456789ACDEFGHJKLMNPQRSTUVWXY";

/* the four message formats */
var FORMATS = [
	{    /* DICT-XXXX-XX */
	  codelen: 0,
	  cap: new bigdecimal.BigInteger('2097152'),
	  datalen: 21, /* bits */
	  csumlen: 5, /* bits */
	  codelenbits: '00'
	}, { /* DICT-XXXX-XXXX-XX */
	  codelen: 1,
	  cap: new bigdecimal.BigInteger('274880004096'),
	  datalen: 38,
	  csumlen: 8,
	  codelenbits: '01'
	}, { /* DICT-XXXX-XXXX-XXXX-XX */
	  codelen: 2,
	  cap: new bigdecimal.BigInteger('36029071898968064'),
	  datalen: 55,
	  csumlen: 11,
	  codelenbits: '10'
	}, { /* DICT-XXXX-XXXX-XXXX-XXXX-XX */
	  codelen: 3,
	  cap: new bigdecimal.BigInteger('4722402511941544181759'),
	  datalen: 72,
	  csumlen: 14,
	  codelenbits: '11'
	}
];

function zeroExtend(str, len) {
	while (str.length < len)
		str = "0" + str;
	return (str);
}

function add_checksum(dict, databits, sumbitslen) {
	/* add zeroed out checksum bits */
	var bits = databits + zeroExtend("", sumbitslen);

	/* checksum the dictname */
	var csum = new bigdecimal.BigInteger("0", 16);
	for (i = 0; i < dict.length; i++)
		csum = crc(csum, dict.charCodeAt(i));

	/* checksum the data stream 5 bits at a time */
	for (i = 0; i < (bits.length / 5); i++) {
		var ss = bits.substr(i * 5, 5);
		var bi = new bigdecimal.BigInteger(ss, 2);
		csum = crc(csum, bi);
	}

	/* select the required number of csum bits: */
	var csumbits = zeroExtend(csum.toString(2).substr(-sumbitslen),
	    sumbitslen);

	/* replace the zeroed pre-csum bits with the real csum bits: */
	bits = bits.substr(0, bits.length - sumbitslen) + csumbits;

	return (bits);
}

module.exports.decode = function decode(code) {
	/* break up into DICT and DVAL portions, checking for format: */
	var mat = code.match(/^(\w+)-(([a-zA-Z0-9]{4}-){1,4}[a-zA-Z0-9]{2})$/);
	if (!mat)
		throw ("malformed code");

	var dict = mat[1];
	var dvalstr = mat[2].toUpperCase().
	    replace(/B/g, "8").
	    replace(/I/g, "1").
	    replace(/O/g, "0").
	    replace(/Z/g, "2").
	    replace(/-/g, "");

	/* convert DVAL from alphabet encoding to binary string */
	var dval = "";
	for (i = 0; i < dvalstr.length; i++) {
		var n = ALPHABET.indexOf(dvalstr[i]);
		if (n == -1)
			throw ("malformed code");
		var bi = bigdecimal.BigInteger.valueOf(n);
		dval += zeroExtend(bi.toString(2), 5);
	}

	var codelen, fmt;
	for (codelen = 0; codelen < FORMATS.length; codelen++) {
		fmt = FORMATS[codelen];
		var expected = 4 + fmt.datalen + fmt.csumlen;
		if (dval.length == expected)
			break;
	}
	if (codelen >= FORMATS.length)
		throw ("data value of unexpected size");

	/* extract fields */
	var type = dval.substr(0, 2);
	var size = dval.substr(2, 2);

	if (type !== '01') {
		throw ("unexpected type value");
	}
	if (size !== fmt.codelenbits) {
		throw ("incorrect size value");
	}

	/* get data bits */
	var databits = dval.substr(4, fmt.datalen);
	var csumbits = dval.substr(4 + fmt.datalen, fmt.csumlen);

	/* checksum: generate, compare */
	var testval = add_checksum(dict, type + size + databits, fmt.csumlen);

	if (testval !== dval) {
		throw ("checksum mismatch");
	}

	/* convert to int */
	var bi = new bigdecimal.BigInteger(databits, 2);
	if (codelen > 0) {
		bi = bi.add(FORMATS[codelen - 1].cap);
	}

	return ({
		name: dict,
		value: bi.toString(10)
	});
}

module.exports.encode = function encode(dict, dval) {

	if (typeof(dval) === "number")
		dval = bigdecimal.BigInteger.valueOf(dval);

	/* force dictionary name to uppercase */
	dict = dict.toUpperCase();

	var codelen, fmt;
	for (codelen = 0; codelen < FORMATS.length; codelen++) {
		fmt = FORMATS[codelen];
		/*
		 * break out if we're under this cap,
		 * or move on to higher cap
		 */
		if (dval.compareTo(fmt.cap) < 0) {
			if (codelen > 0)
				/* subtract the previous cap if there is one */
				dval = dval.subtract(FORMATS[codelen - 1].cap);
			break;
		}
	}
	if (codelen >= FORMATS.length) {
		throw ("value is too large");
	}

	var bits = "01"; /* code type (2bit) */

	bits += fmt.codelenbits; /* code size (2bit) */

	/* data bits */
	var databits = zeroExtend(dval.toString(2), fmt.datalen);
	bits += databits;

	bits = add_checksum(dict, bits, fmt.csumlen);

	/* convert it into the diagcode alphabet */
	var alphastr = "";
	for (i = 0; i < (bits.length / 5); i++) {
		var ss = bits.substr(i * 5, 5);
		var idx = new bigdecimal.BigInteger(ss, 2).intValue();
		var as = ALPHABET.substr(idx, 1);
		alphastr += as;
	}

	/* place dashes after every four digit group: */
	for (i = 0; i < codelen + 1; i++) {
		alphastr = alphastr.replace(/([^-]{4})([^-])/, "$1-$2");
	}

	return (dict + "-" + alphastr);
}
