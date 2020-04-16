var span = document.getElementById('span');

function time(){
    var clockTime = new Date().toLocaleTimeString("en-GB");
    span.textContent = clockTime;
}

setInterval(time,1000);