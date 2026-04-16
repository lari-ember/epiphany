    var currentTime = new Date().getHours();
if (currentTime < 6 || currentTime >= 18) {

    document.body.style.backgroundColor = "rgb(51, 51, 51)";

}
else if ((6 < currentTime && currentTime < 7) || (16 <= currentTime && currentTime < 17)) {

document.body.style.backgroundColor = "rgb(64, 64, 64)";

}
else if ((7 <= currentTime && currentTime < 8) || (15 <= currentTime && currentTime < 16)) {

document.body.style.backgroundColor = "rgb(95, 95, 95)";

}
else if ((8 <= currentTime && currentTime < 9) || (14 <= currentTime && currentTime < 15)) {

document.body.style.backgroundColor = "rgb(126, 126, 126)";

}
else if ((9 <= currentTime && currentTime < 11) || (13 <= currentTime && currentTime < 14)) {

document.body.style.backgroundColor = "rgb(157, 157, 157)";

}
else if (11 <= currentTime && currentTime < 13) {

document.body.style.backgroundColor = "rgb(188, 188, 188)";

}
else {

    document.body.style.backgroundColor = "rgb(51, 51, 51)";

}
  
