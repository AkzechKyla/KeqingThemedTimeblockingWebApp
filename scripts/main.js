function formatTime(hour) {
    return moment().startOf('day').add(moment.duration(hour, 'h')).format('h:mm A');
}

function countTotalHours(hourData) {
    let totalHours = 0;

    hourData.blocks.forEach(block => {
        totalHours += block.hours;
    });

    return totalHours;
}

function generateHourIndicators(data) {
    const hourIndicatorsContainer = document.getElementById('hour-indicators');
    let currentHour = data.start;
    let totalHours = countTotalHours(data);

    for (let i = 0; i <= totalHours; i++) {
        const hourElement = document.createElement('div');
        hourElement.className = 'hour';
        hourElement.innerHTML = `${formatTime(currentHour)}`;
        hourIndicatorsContainer.appendChild(hourElement);
        currentHour++;
    }
}

function generateSchedule(data) {
    const scheduleContainer = document.getElementById('schedule');
    const startHour = data.start;
    let currentHour = startHour;

    data.blocks.forEach(block => {
        const blockElement = document.createElement('div');
        blockElement.className = 'block';

        const startTime = formatTime(currentHour);
        const endTime = formatTime(currentHour + block.hours);

        blockElement.style.height = `${block.hours * 30}px`; // 30px per hour
        blockElement.innerHTML = `
        <div class="description">${block.text}</div>
        <div class="time">${startTime} - ${endTime}</div>
    `;

        scheduleContainer.appendChild(blockElement);

        currentHour += block.hours;
    });

    updateIndicator(data);
}

function updateIndicator(data) {
    const now = moment();
    const currentHour = now.hour() + now.minute() / 60;
    const scheduleContainer = document.getElementById('schedule');
    const indicator = document.getElementById('indicator');

    let totalHeight = 0;
    let indicatorPosition = 0;

    let startHour = data.start;

    Array.from(scheduleContainer.children).forEach(block => {
        const blockHours = parseInt(block.style.height) / 30;
        const blockStartHour = startHour;
        const blockEndHour = startHour + blockHours;

        // if (currentHour >= blockStartHour && currentHour < blockEndHour) {
        //     indicatorPosition = totalHeight + (currentHour - blockStartHour) * 30;
        // }
        indicatorPosition = totalHeight + (currentHour - blockStartHour) * 30;

        totalHeight += blockHours * 30;
        startHour = blockEndHour;
    });

    indicator.style.transform = `translateY(${indicatorPosition + 10}px)`;
}

async function playKeqingPedro() {
    $(document).ready(function() {
        const ctrlVideo = document.getElementById("pedro-keqing-video");

        $('#play-btn').click(function(){
          if ($('#play-btn').hasClass("active")){
                ctrlVideo.play();
                $('#play-btn').html(`<i id="stop-btn-icon" class="fa-solid fa-stop fa-2x"></i>`);
                $('#play-btn').toggleClass("active");
          } else {
                ctrlVideo.pause();
                ctrlVideo.currentTime = 0;
                $('#play-btn').html(`<i id="play-btn-icon" class="fa-solid fa-play fa-2x"></i>`);
                $('#play-btn').toggleClass("active");
            }
        });
    });
}

async function setDate() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let currentDate = new Date();

    document.getElementById('date').innerHTML = `${dayNames[currentDate.getDay()]}, ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
}

async function setTime() {
    let hours = document.getElementById('hours');
    let minutes = document.getElementById('minutes');
    let seconds = document.getElementById('seconds');

    setInterval(function() {
        let currentTime = new Date();

        let h = currentTime.getHours();
        let m = currentTime.getMinutes();
        let s = currentTime.getSeconds();

        // if time is less than 10, add leading zero
        h = h<10? '0'+h: h;
        m = m<10? '0'+m: m;
        s = s<10? '0'+s: s;

        hours.innerHTML = h;
        minutes.innerHTML = m;
        seconds.innerHTML = s;
    }, 1000);
}

async function playVoicelines(data) {
    const keqingElements = document.getElementsByClassName('keqing');
    let voiceline;
    let thought = document.getElementById('speech-bubble');

    Array.from(keqingElements).forEach(keqing => {
        keqing.addEventListener('click', function() {
            if (voiceline) {
                voiceline.pause();
                voiceline.currentTime = 0;
            }

            let random = Math.floor(Math.random() * 10);
            let voicelineLength = Object.keys(data.voicelines).length;
            let randomVoiceline = random % voicelineLength;

            voiceline = new Audio(data.voicelines[randomVoiceline].audio);
            voiceline.play();

            thought.innerHTML = `<div id="thought" class="thought"></div>`;
            typeWriter(data.voicelines[randomVoiceline].line);

            // remove speech bubble after voice line is done
            voiceline.addEventListener('ended', function() {
                this.currentTime = 0;

                setTimeout(function() {
                    thought.innerHTML = ``;
                }, 1000);
            });
        });
    });
}

function typeWriter(textContent) {
    let speed = 50;
    let i = 0;

    function type() {
        if (i < textContent.length) {
            document.getElementById("thought").innerHTML += textContent.charAt(i);
            i++;
            setTimeout(type, speed);
          }
    }

    type();
}

async function setToNightMode() {
    let currentTime = new Date();
    let currentHour = currentTime.getHours();

    /* 6PM onwards */
    if (currentHour > 17) {
        document.getElementById("keqing-day").style.display = "none";
        document.getElementById("keqing-night").style.display = "block";
    }
}

async function main() {
    const response = await fetch('data.json');
    const data = await response.json();

    generateHourIndicators(data);
    generateSchedule(data);
    setInterval(updateIndicator, 60000); // Update the indicator every minute
    // playKeqingPedro();
    setDate();
    setTime();
    playVoicelines(data);
    setToNightMode();
}

main();
