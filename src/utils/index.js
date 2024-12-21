export function getStrMiddle(str, before, after) {
	let m = str.match(new RegExp(before + "(.*?)" + after));
	return m ? m[1] : false;
}