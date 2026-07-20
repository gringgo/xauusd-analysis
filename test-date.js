const d = new Date();
const mytTime = new Date(d.getTime() + 8 * 3600 * 1000);
console.log(mytTime.toISOString());
if (mytTime.getUTCHours() < 6) {
    mytTime.setUTCDate(mytTime.getUTCDate() - 1);
}
console.log(mytTime.toISOString().split('T')[0]);
