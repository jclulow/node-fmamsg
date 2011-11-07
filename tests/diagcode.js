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
 * Copyright 2011 Joshua M. Clulow <josh@sysmgr.org>
 *
 */

var diagcode = require('../lib/diagcode');

var GOOD = [
	{ msgid: "ZFS-8000-14", obj: { name: 'ZFS', value: '1' } },
	{ msgid: "ZFS-8000-2Q", obj: { name: 'ZFS', value: '2' } },
	{ msgid: "ZFS-8000-3C", obj: { name: 'ZFS', value: '3' } },
	{ msgid: "ZFS-8000-4J", obj: { name: 'ZFS', value: '4' } },
	{ msgid: "ZFS-8000-5E", obj: { name: 'ZFS', value: '5' } },
	{ msgid: "ZFS-8000-6X", obj: { name: 'ZFS', value: '6' } },
	{ msgid: "ZFS-8000-72", obj: { name: 'ZFS', value: '7' } },
	{ msgid: "ZFS-8000-8A", obj: { name: 'ZFS', value: '8' } },
	{ msgid: "ZFS-8000-9P", obj: { name: 'ZFS', value: '9' } },
	{ msgid: "ZFS-8000-A5", obj: { name: 'ZFS', value: '10' } },
	{ msgid: "ZFS-8000-CS", obj: { name: 'ZFS', value: '11' } },
	{ msgid: "ZFS-8000-D3", obj: { name: 'ZFS', value: '12' } },
	{ msgid: "ZFS-8000-EY", obj: { name: 'ZFS', value: '13' } },
	{ msgid: "ZFS-8000-FD", obj: { name: 'ZFS', value: '14' } },
	{ msgid: "ZFS-8000-GH", obj: { name: 'ZFS', value: '15' } },
	{ msgid: "ZFS-8000-HC", obj: { name: 'ZFS', value: '16' } },
	{ msgid: "ZFS-8000-JQ", obj: { name: 'ZFS', value: '17' } },
	{ msgid: "ZFS-8000-K4", obj: { name: 'ZFS', value: '18' } },
	{ msgid: "SENSOR-8000-09", obj: { name: 'SENSOR', value: '0' } },
	{ msgid: "SENSOR-8000-1N", obj: { name: 'SENSOR', value: '1' } },
	{ msgid: "SENSOR-8000-26", obj: { name: 'SENSOR', value: '2' } },
	{ msgid: "SENSOR-8000-3T", obj: { name: 'SENSOR', value: '3' } },
	{ msgid: "SENSOR-8000-40", obj: { name: 'SENSOR', value: '4' } },
	{ msgid: "SENSOR-8000-5V", obj: { name: 'SENSOR', value: '5' } },
	{ msgid: "SENSOR-8000-6G", obj: { name: 'SENSOR', value: '6' } },
	{ msgid: "SENSOR-8000-7L", obj: { name: 'SENSOR', value: '7' } },
];

module.exports.encode_success = function(test) {
	test.expect(GOOD.length * 2);
	for (var i = 0; i < GOOD.length; i++) {
		var g = GOOD[i];
		test.doesNotThrow(function() {
			var out = diagcode.encode(g.obj.name, Number(g.obj.value));
			test.strictEqual(out, g.msgid);
		});
	}
	test.done();
}

module.exports.decode_success = function(test) {
	test.expect(GOOD.length * 2);
	for (var i = 0; i < GOOD.length; i++) {
		var g = GOOD[i];
		test.doesNotThrow(function() {
			var out = diagcode.decode(g.msgid);
			test.deepEqual(out, g.obj);
		});
	}
	test.done();
}

module.exports.decode_fail_checksum_error = function(test) {
	test.expect(1);
	/* XXX should check for correct exception */
	test.throws(function() {
		diagcode.decode("ZFS-8000-15");
	});
	test.done();
}

module.exports.decode_fail_malformed_code = function(test) {
	test.expect(1);
	/* XXX should check for correct exception */
	test.throws(function() {
		diagcode.decode("ZFS-8000-140");
	});
	test.done();
}

