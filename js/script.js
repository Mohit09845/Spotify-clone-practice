console.log("hello");

let currentsong = new Audio(); //global variable
let songs;
let currFolder;

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        if (as[i].href.endsWith(".mp3")) {
            let songName = as[i].href.split(`/${folder}/`)[1];
            songs.push(songName);
        }
    }

    function formatSongName(songName) {
        let formattedNameWithSpaces = songName.replaceAll("%20", " ");
        let decimalremover= formattedNameWithSpaces.replaceAll("128-", "");
        let linkremover = decimalremover.replaceAll("(PagalWorld.com.so)", "");
        return linkremover;
    }

    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = "";
    let songhtml = '';
    for (const song of songs) {
        let formattedSong = formatSongName(song);
        songhtml += `<li> 
            <div class="musicinfo">
                <img src="./images/song.png" alt="img">
                <div>${formattedSong}</div>
            </div>
            <div class="playsongnow" data-original-name="${song}">
                <span>play now</span>
                <img class="invert" src="./images/songplay.svg" alt="play" style="width: 25px;">
            </div>
        </li>`;
    }
    songul.innerHTML = songhtml;

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let originalName = e.querySelector(".playsongnow").getAttribute("data-original-name");
            playmusic(originalName);
        });
    });
    return songs;
}

const playmusic = (track, pause = false) => {
    console.log("Playing track:", track);
    currentsong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentsong.play();
        document.querySelector("#play").src = "./images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
}

function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayalbum() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardSlot = document.querySelector(".cardslot");
    let array = Array.from(anchors);
    let htmlContent = '';
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            htmlContent += ` <div data-folder="${folder}" class="card">
            <div class="gbut">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                    </svg>
                </div>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <p>${response.title}</p>
            <a>${response.description}</a>
        </div>`;
        }
    }
    cardSlot.innerHTML = htmlContent;

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0]);
        });
    });
}

async function main() {
    await getsongs("songs/ektharaja");
    playmusic(songs[0], true);

    displayalbum();

    document.querySelector("#play").addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            document.querySelector("#play").src = "./images/pause.svg";
        } else {
            currentsong.pause();
            document.querySelector("#play").src = "./images/songplay.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentsong.currentTime)}/${convertSecondsToMinutes(currentsong.duration)}`;
        document.querySelector(".circleseek").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circleseek").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%";
    });

    document.querySelector("#prev").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        const imgElement = e.target;
        const volumeIconPath = "http://127.0.0.1:3000/images/volume.svg";
        const muteIconPath = "http://127.0.0.1:3000/images/mute.svg";

        if (imgElement.src.includes(volumeIconPath)) {
            imgElement.src = muteIconPath;
            currentsong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            imgElement.src = volumeIconPath;
            currentsong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
