#!/usr/bin/env node
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

var sys = require('sys');
var fmamsg = require('./lib/diagcode');

console.log("Dictionary\tEntry No.\tID\t\t\tAwesome");
for (val = 1; val <= 18; val++) {
        var bc = fmamsg.encode("ZFS", val);
        var a = fmamsg.decode(bc);
        console.log("ZFS\t\t" + val + "\t\t" + bc + "\t\t" + sys.inspect(a));
}
