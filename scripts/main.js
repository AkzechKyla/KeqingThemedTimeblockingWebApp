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
                $('#play-btn').html("Stop");
                $('#play-btn').toggleClass("active");
          } else {
                ctrlVideo.pause();
                ctrlVideo.currentTime = 0;
                $('#play-btn').html("Play");
                $('#play-btn').toggleClass("active");
            }
        });
    });
}

async function main() {
    const response = await fetch('data.json');
    const data = await response.json();

    generateHourIndicators(data);
    generateSchedule(data);
    setInterval(updateIndicator, 60000); // Update the indicator every minute
    playKeqingPedro();
}

main();
