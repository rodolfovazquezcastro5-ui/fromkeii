/* ================================================================
   UN PEQUEÑO UNIVERSO
   JAVASCRIPT - EXPERIENCIA ASTRONOMICA
   ================================================================

   DISEÑO:
   - Sin canvas
   - Sin sistema de particulas generado por JS
   - Sin setInterval
   - IntersectionObserver para revelados
   - requestAnimationFrame solo cuando realmente hace falta
   - Parallax muy ligero
   - Animaciones principales controladas por CSS
   - Mantiene los IDs y clases del HTML original
================================================================ */


/* ================================================================
   INICIO
================================================================ */

document.addEventListener("DOMContentLoaded", () => {

    document.documentElement.classList.add("js-ready");

    initIntro();
    initRevealAnimations();
    initSmoothNavigation();
    initMusicPlayer();
    initFlowers();
    initDrawings();
    initPhoto();
    initVideo();
    initParallax();
    initAstronomyInteraction();
    initCursorGlow();
    initActiveSection();

});


/* ================================================================
   UTILIDADES
================================================================ */

function prefersReducedMotion() {

    return window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

}


function isMobileDevice() {

    return window.matchMedia(
        "(max-width: 700px)"
    ).matches;

}


/* ================================================================
   INTRO
================================================================ */

function initIntro() {

    const intro =
        document.getElementById("intro");

    const main =
        document.getElementById("mainExperience");

    const progress =
        document.querySelector(".loader-progress");

    const loaderText =
        document.querySelector(".loader-text");


    if (!intro) return;


    /*
       El CSS hace la mayor parte del trabajo visual.
       JS solo activa estados.
    */

    requestAnimationFrame(() => {

        intro.classList.add("intro-active");

    });


    if (main) {

        main.classList.add(
            "experience-hidden"
        );

    }


    /*
       Tiempo total del intro.
    */

    const INTRO_TIME = 3200;


    const finishIntro = () => {

        if (
            intro.classList.contains(
                "intro-finished"
            )
        ) {

            return;

        }


        intro.classList.add(
            "intro-finished"
        );


        if (main) {

            main.classList.remove(
                "experience-hidden"
            );

            main.classList.add(
                "experience-visible"
            );

        }


        if (loaderText) {

            loaderText.textContent = "listo";

        }


        if (progress) {

            progress.style.width = "100%";

        }

    };


    const introTimer =
        window.setTimeout(
            finishIntro,
            INTRO_TIME
        );


    /*
       Permite saltar el intro.
    */

    intro.addEventListener(
        "click",
        () => {

            window.clearTimeout(
                introTimer
            );

            finishIntro();

        },
        {
            passive: true
        }
    );

}


/* ================================================================
   REVEAL AL HACER SCROLL
================================================================ */

function initRevealAnimations() {

    const elements =
        document.querySelectorAll(
            [
                ".experience-section",
                ".flowers-heading",
                ".flower-card",
                ".drawings-heading",
                ".drawing-card",
                ".letter-wrapper",
                ".memory-transition",
                ".main-photo-section",
                ".video-section",
                ".final-section"
            ].join(", ")
        );


    if (!elements.length) return;


    /*
       Si el usuario pide menos movimiento,
       mostramos todo directamente.
    */

    if (prefersReducedMotion()) {

        elements.forEach(
            element => {

                element.classList.add(
                    "revealed"
                );

            }
        );

        return;

    }


    /*
       Observer eficiente.
    */

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {

                            return;

                        }


                        entry.target.classList.add(
                            "revealed"
                        );


                        observer.unobserve(
                            entry.target
                        );

                    }
                );

            },
            {
                threshold: 0.10,
                rootMargin:
                    "0px 0px -80px 0px"
            }
        );


    elements.forEach(
        element => {

            element.classList.add(
                "reveal-ready"
            );

            observer.observe(
                element
            );

        }
    );

}


/* ================================================================
   NAVEGACION SUAVE
================================================================ */

function initSmoothNavigation() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    if (!links.length) return;


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    const targetID =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetID ||
                        targetID === "#"
                    ) {

                        return;

                    }


                    let target;


                    try {

                        target =
                            document.querySelector(
                                targetID
                            );

                    } catch {

                        return;

                    }


                    if (!target) return;


                    event.preventDefault();


                    target.scrollIntoView({

                        behavior:
                            prefersReducedMotion()
                                ? "auto"
                                : "smooth",

                        block: "start"

                    });


                    /*
                       Actualizamos la URL sin
                       provocar un salto.
                    */

                    try {

                        history.replaceState(
                            null,
                            "",
                            targetID
                        );

                    } catch {

                        /* Sin accion */

                    }

                }
            );

        }
    );

}


/* ================================================================
   MUSIC EXPERIENCE
   Reactive player + synchronized LRC
================================================================ */

function initMusicPlayer() {

    const audio = document.getElementById("audioPlayer");
    const player = document.querySelector(".player");
    const playButton = document.getElementById("playButton");
    const playIcon = document.getElementById("playIcon");
    const progressBar = document.getElementById("progressBar");
    const progressLine = document.querySelector(".progress-line");

    const previousButton = document.getElementById("prevTrack");
    const nextButton = document.getElementById("nextTrack");

    const trackNumber = document.getElementById("trackNumber");
    const titleElement = document.querySelector(".track-title");
    const artistElement = document.querySelector(".track-artist");

    const currentTimeElement = document.getElementById("currentTime");
    const durationElement = document.getElementById("duration");

    const waveform = document.getElementById("waveform");

    const lyricsWindow = document.getElementById("lyricsWindow");
    const lyricsContainer = document.getElementById("lyricsContainer");


    if (
        !audio ||
        !player ||
        !playButton ||
        !playIcon ||
        !progressBar
    ) {
        console.warn("Music Player: faltan elementos HTML.");
        return;
    }


    /* ============================================================
       TRACKS
    ============================================================ */

    const tracks = [
        {
            number: "01",
            title: "i love kei",
            artist: "para escuchar mientras sigues",
            source: "cancioncita.mp3",
            lyrics: "far-away-from-home.lrc"
        }
    ];


    let currentTrack = 0;
    let progressFrame = null;
    let isChangingTrack = false;


    /* ============================================================
       LYRICS
    ============================================================ */

    let lyrics = [];
    let currentLyricIndex = -1;


    /* ============================================================
       AUDIO ANALYZER
    ============================================================ */

    let audioContext = null;
    let analyser = null;
    let sourceNode = null;
    let frequencyData = null;
    let analyzerReady = false;


    function setupAudioAnalyzer() {

        if (analyzerReady) {
            return true;
        }

        try {

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) {
                return false;
            }

            audioContext =
                new AudioContextClass();

            analyser =
                audioContext.createAnalyser();

            analyser.fftSize = 64;

            analyser.smoothingTimeConstant = .84;

            sourceNode =
                audioContext.createMediaElementSource(audio);

            sourceNode.connect(analyser);

            analyser.connect(
                audioContext.destination
            );

            frequencyData =
                new Uint8Array(
                    analyser.frequencyBinCount
                );

            analyzerReady = true;

            return true;

        } catch (error) {

            console.warn(
                "Audio analyzer no disponible.",
                error
            );

            return false;
        }
    }


    /* ============================================================
       AUDIO VISUAL REACTION
    ============================================================ */

    function updateAudioVisuals() {

        if (
            !analyser ||
            !frequencyData ||
            audio.paused
        ) {
            return;
        }

        analyser.getByteFrequencyData(
            frequencyData
        );


        let total = 0;

        for (
            let i = 0;
            i < frequencyData.length;
            i++
        ) {
            total += frequencyData[i];
        }


        const average =
            total /
            frequencyData.length /
            255;


        const previousEnergy =
            parseFloat(
                player.style.getPropertyValue(
                    "--audio-energy"
                ) || "0"
            );


        const smoothEnergy =
            previousEnergy +
            (average - previousEnergy) * .18;


        player.style.setProperty(
            "--audio-energy",
            smoothEnergy.toFixed(3)
        );


        updateReactiveWaveform();
    }


    /* ============================================================
       WAVEFORM
    ============================================================ */

    function updateReactiveWaveform() {

        if (
            !analyser ||
            !frequencyData ||
            !waveform ||
            audio.paused
        ) {
            return;
        }


        const bars =
            waveform.querySelectorAll("span");


        if (!bars.length) {
            return;
        }


        const step =
            Math.max(
                1,
                Math.floor(
                    frequencyData.length /
                    bars.length
                )
            );


        bars.forEach(
            (bar, index) => {

                const dataIndex =
                    Math.min(
                        index * step,
                        frequencyData.length - 1
                    );


                const value =
                    frequencyData[dataIndex] / 255;


                const previous =
                    parseFloat(
                        bar.dataset.level || "0"
                    );


                const smooth =
                    previous +
                    (value - previous) * .3;


                bar.dataset.level =
                    smooth.toFixed(3);


                const scale =
                    .32 +
                    smooth * 2.4;


                bar.style.transform =
                    `scaleY(${scale})`;


                bar.style.opacity =
                    `${.28 + smooth * .72}`;
            }
        );
    }


    /* ============================================================
       TIME
    ============================================================ */

    function formatTime(seconds) {

        if (
            !isFinite(seconds) ||
            seconds < 0
        ) {
            return "0:00";
        }


        const minutes =
            Math.floor(seconds / 60);


        const remainingSeconds =
            Math.floor(seconds % 60);


        return (
            `${minutes}:` +
            `${remainingSeconds
                .toString()
                .padStart(2, "0")}`
        );
    }


    /* ============================================================
       LRC PARSER
    ============================================================ */

    function parseLRC(text) {

        const result = [];


        const lines =
            text
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(Boolean);


        lines.forEach(line => {

            const match =
                line.match(
                    /^\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/
                );


            if (!match) {
                return;
            }


            const minutes =
                parseInt(match[1], 10);

            const seconds =
                parseInt(match[2], 10);


            let milliseconds = 0;


            if (match[3]) {

                const fraction = match[3];


                if (fraction.length === 1) {

                    milliseconds =
                        parseInt(
                            fraction,
                            10
                        ) * 100;

                } else if (
                    fraction.length === 2
                ) {

                    milliseconds =
                        parseInt(
                            fraction,
                            10
                        ) * 10;

                } else {

                    milliseconds =
                        parseInt(
                            fraction.slice(0, 3),
                            10
                        );
                }
            }


            const time =
                minutes * 60 +
                seconds +
                milliseconds / 1000;


            const lyric =
                match[4].trim();


            if (lyric) {

                result.push({
                    time,
                    text: lyric
                });
            }
        });


        result.sort(
            (a, b) =>
                a.time - b.time
        );


        return result;
    }


    /* ============================================================
       LOAD LYRICS
    ============================================================ */

    async function loadLyrics(lyricsFile) {

        lyrics = [];
        currentLyricIndex = -1;


        if (!lyricsWindow) {
            return;
        }


        lyricsWindow.innerHTML = `
            <div class="lyrics-empty">
                <span>♡</span>
                <small>loading lyrics</small>
            </div>
        `;


        try {

            const response =
                await fetch(
                    lyricsFile,
                    {
                        cache: "no-cache"
                    }
                );


            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }


            const text =
                await response.text();


            lyrics =
                parseLRC(text);


            if (!lyrics.length) {

                showLyricsMessage(
                    "no lyrics"
                );

                return;
            }


            lyricsWindow.innerHTML = "";


            lyrics.forEach(
                (lyric, index) => {

                    const element =
                        document.createElement(
                            "div"
                        );


                    element.className =
                        "lyric-item";


                    element.dataset.index =
                        index;


                    element.textContent =
                        lyric.text;


                    lyricsWindow.appendChild(
                        element
                    );
                }
            );


            updateLyrics(
                audio.currentTime,
                true
            );

        } catch (error) {

            console.warn(
                "No se pudo cargar el archivo LRC.",
                error
            );


            showLyricsMessage(
                "lyrics unavailable"
            );
        }
    }


    /* ============================================================
       LYRICS MESSAGE
    ============================================================ */

    function showLyricsMessage(message) {

        if (!lyricsWindow) {
            return;
        }


        lyricsWindow.innerHTML = `
            <div class="lyrics-empty">
                <span>♡</span>
                <small>${message}</small>
            </div>
        `;
    }


    /* ============================================================
       FIND LYRIC
    ============================================================ */

    function findLyricIndex(time) {

        if (!lyrics.length) {
            return -1;
        }


        let index = -1;


        for (
            let i = 0;
            i < lyrics.length;
            i++
        ) {

            if (
                time >= lyrics[i].time
            ) {
                index = i;
            } else {
                break;
            }
        }


        return index;
    }


    /* ============================================================
       UPDATE LYRICS
    ============================================================ */

    function updateLyrics(
        time,
        force = false
    ) {

        if (!lyrics.length || !lyricsWindow) {
            return;
        }


        const newIndex =
            findLyricIndex(time);


        if (
            !force &&
            newIndex === currentLyricIndex
        ) {
            return;
        }


        currentLyricIndex =
            newIndex;


        const elements =
            lyricsWindow.querySelectorAll(
                ".lyric-item"
            );


        elements.forEach(
            (element, index) => {

                element.classList.remove(
                    "previous",
                    "current",
                    "next",
                    "entering"
                );


                if (
                    currentLyricIndex === -1
                ) {
                    return;
                }


                if (
                    index <
                    currentLyricIndex
                ) {

                    element.classList.add(
                        "previous"
                    );

                } else if (
                    index ===
                    currentLyricIndex
                ) {

                    element.classList.add(
                        "current"
                    );


                    if (!force) {

                        element.classList.add(
                            "entering"
                        );
                    }

                } else {

                    element.classList.add(
                        "next"
                    );
                }
            }
        );
    }


    /* ============================================================
       LOAD TRACK
    ============================================================ */

    function loadTrack(
        index,
        autoplay = false
    ) {

        const track =
            tracks[index];


        if (!track) {
            return;
        }


        isChangingTrack = true;


        audio.pause();


        audio.src =
            track.source;


        if (trackNumber) {
            trackNumber.textContent =
                track.number;
        }


        if (titleElement) {
            titleElement.textContent =
                track.title;
        }


        if (artistElement) {
            artistElement.textContent =
                track.artist;
        }


        if (currentTimeElement) {
            currentTimeElement.textContent =
                "0:00";
        }


        if (durationElement) {
            durationElement.textContent =
                "0:00";
        }


        progressBar.style.width =
            "0%";


        player.classList.remove(
            "playing"
        );


        player.style.setProperty(
            "--audio-energy",
            "0"
        );


        playIcon.textContent =
            "▶";


        currentLyricIndex =
            -1;


        audio.load();


        if (track.lyrics) {

            loadLyrics(
                track.lyrics
            );

        } else {

            showLyricsMessage(
                "lyrics unavailable"
            );
        }


        isChangingTrack = false;


        if (autoplay) {
            playAudio();
        }
    }


    /* ============================================================
       PLAY
    ============================================================ */

    async function playAudio() {

        if (isChangingTrack) {
            return;
        }


        try {

            setupAudioAnalyzer();


            if (
                audioContext &&
                audioContext.state ===
                "suspended"
            ) {

                await audioContext.resume();
            }


            await audio.play();

        } catch (error) {

            console.warn(
                "No se pudo reproducir el audio.",
                error
            );


            player.classList.remove(
                "playing"
            );


            playIcon.textContent =
                "▶";
        }
    }


    /* ============================================================
       PAUSE
    ============================================================ */

    function pauseAudio() {
        audio.pause();
    }


    /* ============================================================
       TOGGLE
    ============================================================ */

    function toggleAudio() {

        if (audio.paused) {
            playAudio();
        } else {
            pauseAudio();
        }
    }


    /* ============================================================
       PLAY BUTTON
    ============================================================ */

    playButton.addEventListener(
        "click",
        toggleAudio
    );


    /* ============================================================
       AUDIO PLAY
    ============================================================ */

    audio.addEventListener(
        "play",
        () => {

            player.classList.add(
                "playing"
            );


            playIcon.textContent =
                "Ⅱ";


            startProgressLoop();
        }
    );


    /* ============================================================
       AUDIO PAUSE
    ============================================================ */

    audio.addEventListener(
        "pause",
        () => {

            player.classList.remove(
                "playing"
            );


            playIcon.textContent =
                "▶";


            player.style.setProperty(
                "--audio-energy",
                "0"
            );


            stopProgressLoop();
        }
    );


    /* ============================================================
       AUDIO ENDED
    ============================================================ */

    audio.addEventListener(
        "ended",
        () => {

            player.classList.remove(
                "playing"
            );


            playIcon.textContent =
                "▶";


            player.style.setProperty(
                "--audio-energy",
                "0"
            );


            progressBar.style.width =
                "0%";


            if (currentTimeElement) {
                currentTimeElement.textContent =
                    "0:00";
            }


            currentLyricIndex =
                -1;


            if (lyricsWindow) {

                const elements =
                    lyricsWindow.querySelectorAll(
                        ".lyric-item"
                    );


                elements.forEach(
                    element => {

                        element.classList.remove(
                            "previous",
                            "current",
                            "next",
                            "entering"
                        );
                    }
                );
            }


            stopProgressLoop();
        }
    );


    /* ============================================================
       PROGRESS LOOP
    ============================================================ */

    function updateProgress() {

        if (
            audio.duration &&
            isFinite(audio.duration)
        ) {

            const percentage =
                (
                    audio.currentTime /
                    audio.duration
                ) * 100;


            progressBar.style.width =
                `${percentage}%`;


            if (currentTimeElement) {

                currentTimeElement.textContent =
                    formatTime(
                        audio.currentTime
                    );
            }


            if (durationElement) {

                durationElement.textContent =
                    formatTime(
                        audio.duration
                    );
            }


            updateLyrics(
                audio.currentTime
            );


            updateAudioVisuals();
        }


        progressFrame =
            requestAnimationFrame(
                updateProgress
            );
    }


    function startProgressLoop() {

        if (progressFrame !== null) {
            return;
        }


        progressFrame =
            requestAnimationFrame(
                updateProgress
            );
    }


    function stopProgressLoop() {

        if (progressFrame === null) {
            return;
        }


        cancelAnimationFrame(
            progressFrame
        );


        progressFrame = null;
    }


    /* ============================================================
       SEEK
    ============================================================ */

    if (progressLine) {

        progressLine.addEventListener(
            "click",
            event => {

                if (
                    !audio.duration ||
                    !isFinite(audio.duration)
                ) {
                    return;
                }


                const rect =
                    progressLine.getBoundingClientRect();


                if (!rect.width) {
                    return;
                }


                const position =
                    event.clientX -
                    rect.left;


                const percentage =
                    Math.min(
                        1,
                        Math.max(
                            0,
                            position /
                            rect.width
                        )
                    );


                audio.currentTime =
                    audio.duration *
                    percentage;


                updateLyrics(
                    audio.currentTime,
                    true
                );
            }
        );
    }


    /* ============================================================
       PREVIOUS
    ============================================================ */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                if (
                    audio.currentTime > 3 ||
                    tracks.length === 1
                ) {

                    audio.currentTime =
                        0;


                    updateLyrics(
                        0,
                        true
                    );


                    return;
                }


                currentTrack =
                    (
                        currentTrack -
                        1 +
                        tracks.length
                    ) %
                    tracks.length;


                loadTrack(
                    currentTrack,
                    true
                );
            }
        );
    }


    /* ============================================================
       NEXT
    ============================================================ */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                if (
                    tracks.length === 1
                ) {

                    audio.currentTime =
                        0;


                    updateLyrics(
                        0,
                        true
                    );


                    if (audio.paused) {
                        playAudio();
                    }


                    return;
                }


                currentTrack =
                    (
                        currentTrack +
                        1
                    ) %
                    tracks.length;


                loadTrack(
                    currentTrack,
                    true
                );
            }
        );
    }


    /* ============================================================
       KEYBOARD
    ============================================================ */

    document.addEventListener(
        "keydown",
        event => {

            const active =
                document.activeElement;


            const isTyping =
                active &&
                (
                    active.tagName === "INPUT" ||
                    active.tagName === "TEXTAREA" ||
                    active.isContentEditable
                );


            if (isTyping) {
                return;
            }


            if (
                event.code === "Space"
            ) {

                event.preventDefault();

                toggleAudio();
            }
        }
    );


    /* ============================================================
       METADATA
    ============================================================ */

    audio.addEventListener(
        "loadedmetadata",
        () => {

            if (durationElement) {

                durationElement.textContent =
                    formatTime(
                        audio.duration
                    );
            }
        }
    );


    /* ============================================================
       ERROR
    ============================================================ */

    audio.addEventListener(
        "error",
        () => {

            player.classList.remove(
                "playing"
            );


            playIcon.textContent =
                "▶";


            player.style.setProperty(
                "--audio-energy",
                "0"
            );


            stopProgressLoop();


            console.error(
                "No se pudo cargar:",
                audio.src
            );
        }
    );


    /* ============================================================
       INITIALIZE
    ============================================================ */

    loadTrack(
        0,
        false
    );


    /* ============================================================
       API
    ============================================================ */

    window.musicExperience = {

        play:
            playAudio,

        pause:
            pauseAudio,

        toggle:
            toggleAudio,

        restart: () => {

            audio.currentTime =
                0;


            updateLyrics(
                0,
                true
            );


            playAudio();
        },

        element:
            audio
    };
}

/* =========================================================
   MUSICA DE LA CARTA
   REPRODUCTOR TOTALMENTE INDEPENDIENTE
========================================================= */

function initLetterMusic() {

    const player =
        document.querySelector(".letter-music");

    const audio =
        document.getElementById("letterAudio");

    const button =
        document.getElementById("letterMusicPlay");

    const icon =
        document.getElementById("letterMusicIcon");

    const progress =
        document.getElementById("letterMusicProgress");

    const point =
        document.getElementById("letterMusicPoint");

    const progressContainer =
        document.querySelector(
            ".letter-music-progress"
        );

    const current =
        document.getElementById(
            "letterMusicCurrent"
        );

    const duration =
        document.getElementById(
            "letterMusicDuration"
        );

    const state =
        document.getElementById(
            "letterMusicState"
        );


    /* =====================================================
       COMPROBAR ELEMENTOS
    ===================================================== */

    if (
        !player ||
        !audio ||
        !button ||
        !icon ||
        !progress ||
        !point ||
        !progressContainer ||
        !current ||
        !duration ||
        !state
    ) {
        return;
    }


    /* =====================================================
       CANCION DE LA CARTA
       
       ESTE REPRODUCTOR USA SOLAMENTE BWU.MP3
       Y NO TOCA EL AUDIO DEL REPRODUCTOR PRINCIPAL.
    ===================================================== */

    audio.src = "bwu.mp3";
    audio.load();


    /* =====================================================
       UTILIDAD
    ===================================================== */

    function formatTime(seconds) {

        if (!Number.isFinite(seconds)) {
            return "0:00";
        }

        const minutes =
            Math.floor(
                seconds / 60
            );

        const secondsPart =
            Math.floor(
                seconds % 60
            )
            .toString()
            .padStart(2, "0");

        return (
            minutes +
            ":" +
            secondsPart
        );
    }


    /* =====================================================
       PLAY / PAUSE
    ===================================================== */

    button.addEventListener(
        "click",
        async () => {

            if (audio.paused) {

                try {

                    await audio.play();

                } catch (error) {

                    console.warn(
                        "No se pudo reproducir bwu.mp3.",
                        error
                    );

                    state.textContent =
                        "SIGNAL ERROR";

                }

            } else {

                audio.pause();

            }

        }
    );


    /* =====================================================
       REPRODUCIENDO
    ===================================================== */

    audio.addEventListener(
        "play",
        () => {

            player.classList.add(
                "is-playing"
            );

            icon.textContent =
                "Ⅱ";

            state.textContent =
                "SIGNAL CONNECTED";

        }
    );


    /* =====================================================
       PAUSADO
    ===================================================== */

    audio.addEventListener(
        "pause",
        () => {

            player.classList.remove(
                "is-playing"
            );

            icon.textContent =
                "▶";

            /*
             * Si termino, dejamos el estado
             * de transmision completa.
             */
            if (
                audio.currentTime <
                audio.duration
            ) {

                state.textContent =
                    "SIGNAL PAUSED";

            }

        }
    );


    /* =====================================================
       DURACION
    ===================================================== */

    audio.addEventListener(
        "loadedmetadata",
        () => {

            duration.textContent =
                formatTime(
                    audio.duration
                );

        }
    );


    /* =====================================================
       PROGRESO
    ===================================================== */

    audio.addEventListener(
        "timeupdate",
        () => {

            if (
                !Number.isFinite(
                    audio.duration
                ) ||
                audio.duration <= 0
            ) {
                return;
            }


            const percent =
                (
                    audio.currentTime /
                    audio.duration
                ) * 100;


            progress.style.width =
                percent + "%";


            point.style.left =
                percent + "%";


            current.textContent =
                formatTime(
                    audio.currentTime
                );

        }
    );


    /* =====================================================
       CLICK EN LA TRAYECTORIA
    ===================================================== */

    progressContainer.addEventListener(
        "click",
        event => {

            if (
                !Number.isFinite(
                    audio.duration
                ) ||
                audio.duration <= 0
            ) {
                return;
            }


            const rect =
                progressContainer
                    .getBoundingClientRect();


            const position =
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width;


            const safePosition =
                Math.max(
                    0,
                    Math.min(
                        1,
                        position
                    )
                );


            audio.currentTime =
                safePosition *
                audio.duration;

        }
    );


    /* =====================================================
       TERMINO DE LA CANCION
    ===================================================== */

    audio.addEventListener(
        "ended",
        () => {

            player.classList.remove(
                "is-playing"
            );

            icon.textContent =
                "▶";

            state.textContent =
                "TRANSMISSION COMPLETE";

            progress.style.width =
                "100%";

            point.style.left =
                "100%";

            current.textContent =
                formatTime(
                    audio.duration
                );

        }
    );


    /* =====================================================
       API DEL SEGUNDO REPRODUCTOR
       
       window.letterMusicExperience
       ES INDEPENDIENTE DEL PLAYER PRINCIPAL.
    ===================================================== */

    window.letterMusicExperience = {

        audio: audio,

        play: () => {

            return audio.play();

        },

        pause: () => {

            audio.pause();

        },

        toggle: () => {

            if (audio.paused) {

                return audio.play();

            } else {

                audio.pause();

            }

        }

    };

}


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initLetterMusic();

    }
);

/* ================================================================
   FLORES + DIBUJOS
   INTERACCIONES CINEMATICAS
================================================================ */


/* ================================================================
   UTILIDAD
================================================================ */

function initGalleryMotion() {

    const supportsHover =
        window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!supportsHover) return;

    const cards = document.querySelectorAll(
        ".flower-card, .drawing-card"
    );

    if (!cards.length) return;

    cards.forEach(card => {

        let frame = null;
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;

        const update = () => {

            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;

            card.style.setProperty(
                "--card-x",
                `${currentX.toFixed(2)}deg`
            );

            card.style.setProperty(
                "--card-y",
                `${currentY.toFixed(2)}deg`
            );

            frame = requestAnimationFrame(update);
        };


        card.addEventListener("pointerenter", () => {

            card.classList.add("gallery-hover");

            if (!frame) {
                frame = requestAnimationFrame(update);
            }

        });


        card.addEventListener("pointermove", event => {

            const rect = card.getBoundingClientRect();

            const x =
                (event.clientX - rect.left) / rect.width;

            const y =
                (event.clientY - rect.top) / rect.height;

            targetY =
                (x - 0.5) * 5;

            targetX =
                (0.5 - y) * 5;

            card.style.setProperty(
                "--mouse-x",
                `${(x * 100).toFixed(1)}%`
            );

            card.style.setProperty(
                "--mouse-y",
                `${(y * 100).toFixed(1)}%`
            );

        });


        card.addEventListener("pointerleave", () => {

            card.classList.remove("gallery-hover");

            targetX = 0;
            targetY = 0;

            setTimeout(() => {

                if (frame) {
                    cancelAnimationFrame(frame);
                    frame = null;
                }

                currentX = 0;
                currentY = 0;

                card.style.setProperty(
                    "--card-x",
                    "0deg"
                );

                card.style.setProperty(
                    "--card-y",
                    "0deg"
                );

            }, 250);

        });

    });

}


/* ================================================================
   FLORES
================================================================ */

function initFlowers() {

    const cards =
        document.querySelectorAll(".flower-card");

    if (!cards.length) return;


    cards.forEach((card, index) => {

        card.dataset.flowerIndex =
            String(index + 1).padStart(2, "0");


        /* --------------------------------------------------------
           ENTRADA
        -------------------------------------------------------- */

        card.style.setProperty(
            "--flower-delay",
            `${index * 90}ms`
        );


        /* --------------------------------------------------------
           HOVER
        -------------------------------------------------------- */

        card.addEventListener(
            "mouseenter",
            () => {

                if (isMobileDevice()) return;

                card.classList.add(
                    "flower-hover"
                );

            },
            {
                passive: true
            }
        );


        card.addEventListener(
            "mouseleave",
            () => {

                if (isMobileDevice()) return;

                card.classList.remove(
                    "flower-hover"
                );

            },
            {
                passive: true
            }
        );


        /* --------------------------------------------------------
           CLICK / SELECCION
        -------------------------------------------------------- */

        card.addEventListener(
            "click",
            () => {

                const wasSelected =
                    card.classList.contains(
                        "flower-selected"
                    );


                cards.forEach(other => {

                    other.classList.remove(
                        "flower-selected"
                    );

                });


                if (!wasSelected) {

                    card.classList.add(
                        "flower-selected"
                    );

                }

            }
        );

    });


    /* ------------------------------------------------------------
       SELECCION GLOBAL
    ------------------------------------------------------------ */

    cards.forEach(card => {

        card.addEventListener(
            "focusin",
            () => {

                card.classList.add(
                    "flower-selected"
                );

            }
        );

    });

}


/* ================================================================
   DIBUJOS
================================================================ */

function initDrawings() {

    const drawings =
        document.querySelectorAll(
            ".drawing-card"
        );

    if (!drawings.length) return;


    drawings.forEach((drawing, index) => {

        const number =
            String(index + 1).padStart(2, "0");


        /* --------------------------------------------------------
           NUMERO
        -------------------------------------------------------- */

        drawing.dataset.index =
            number;


        drawing.style.setProperty(
            "--drawing-delay",
            `${index * 100}ms`
        );


        /* --------------------------------------------------------
           CLICK
        -------------------------------------------------------- */

        drawing.addEventListener(
            "click",
            () => {

                const wasSelected =
                    drawing.classList.contains(
                        "drawing-selected"
                    );


                drawings.forEach(other => {

                    other.classList.remove(
                        "drawing-selected"
                    );

                });


                if (!wasSelected) {

                    drawing.classList.add(
                        "drawing-selected"
                    );

                }

            }
        );


        /* --------------------------------------------------------
           HOVER
        -------------------------------------------------------- */

        drawing.addEventListener(
            "mouseenter",
            () => {

                if (isMobileDevice()) return;

                drawing.classList.add(
                    "drawing-hover"
                );

            },
            {
                passive: true
            }
        );


        drawing.addEventListener(
            "mouseleave",
            () => {

                if (isMobileDevice()) return;

                drawing.classList.remove(
                    "drawing-hover"
                );

            },
            {
                passive: true
            }
        );

    });

}


/* ================================================================
   OBSERVER DE ENTRADA
================================================================ */

function initGalleryReveal() {

    const items = document.querySelectorAll(
        ".flower-card, .drawing-card"
    );

    if (!items.length) return;


    if (
        !("IntersectionObserver" in window)
    ) {

        items.forEach(item => {

            item.classList.add(
                "gallery-visible"
            );

        });

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add(
                        "gallery-visible"
                    );

                    observer.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -40px 0px"
            }
        );


    items.forEach(item => {

        observer.observe(item);

    });

}


/* ================================================================
   INICIALIZACION
================================================================ */

function initFlowersAndDrawings() {

    initFlowers();

    initDrawings();

    initGalleryMotion();

    initGalleryReveal();

}


/* ================================================================
   AUTO INIT
================================================================ */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initFlowersAndDrawings,
        {
            once: true
        }
    );

} else {

    initFlowersAndDrawings();

}


/* ================================================================
   FOTO PRINCIPAL
================================================================ */

function initPhoto() {

    const photoSection =
        document.getElementById(
            "mainPhotoSection"
        );


    if (!photoSection) return;


    photoSection.addEventListener(
        "click",
        () => {

            photoSection.classList.toggle(
                "photo-focused"
            );

        }
    );

}


/* ================================================================
   VIDEO - CON TEMPORIZADOR DE MENSAJE SORPRESA
================================================================ */

function initVideo() {

    const video =
        document.getElementById(
            "finalVideo"
        );

    // NUEVO: Seleccionamos la cajita de tu dedicatoria
    const mensajeSorpresa = 
        document.getElementById(
            "mensajeSorpresa"
        );

    if (!video) return;

    // NUEVO: Variable para controlar que el mensaje aparezca una sola vez
    let mensajeMostrado = false;


    video.setAttribute(
        "playsinline",
        ""
    );


    video.addEventListener(
        "play",
        () => {

            video.classList.add(
                "video-playing"
            );

        }
    );


    video.addEventListener(
        "pause",
        () => {

            video.classList.remove(
                "video-playing"
            );

        }
    );


    video.addEventListener(
        "ended",
        () => {

            video.classList.remove(
                "video-playing"
            );

        }
    );


    // ============================================================
    // NUEVO: Escuchamos el avance del video segundo a segundo
    // ============================================================
    video.addEventListener(
        "timeupdate",
        () => {
            
            // 2 minutos y 14 segundos equivalen exactamente a 134 segundos
            if (video.currentTime >= 134 && !mensajeMostrado && mensajeSorpresa) {
                
                // Activa la clase de CSS para que el mensaje aparezca suavemente
                mensajeSorpresa.classList.add("mostrar-suave");
                mensajeMostrado = true; 
                
            }
            
        }
    );

    // NUEVO: Si ella regresa el video al inicio, reiniciamos el mensaje
    video.addEventListener(
        "seeked",
        () => {
            
            if (video.currentTime < 134 && mensajeSorpresa) {
                mensajeSorpresa.classList.remove("mostrar-suave");
                mensajeMostrado = false;
            }
            
        }
    );

}



/* ================================================================
   PARALLAX ULTRALIGERO
================================================================ */

function initParallax() {

    if (
        prefersReducedMotion() ||
        isMobileDevice()
    ) {

        return;

    }


    const elements =
        document.querySelectorAll(
            [
                ".hero-light",
                ".intro-glow",
                ".photo-light",
                ".transition-glow"
            ].join(", ")
        );


    if (!elements.length) return;


    let ticking = false;


    window.addEventListener(
        "scroll",
        () => {

            if (ticking) return;


            ticking = true;


            requestAnimationFrame(
                () => {

                    const scrollY =
                        window.scrollY;


                    const offset =
                        Math.min(
                            scrollY * 0.018,
                            22
                        );


                    elements.forEach(
                        (
                            element,
                            index
                        ) => {

                            const direction =
                                index % 2 === 0
                                    ? 1
                                    : -1;


                            element.style.transform =
                                `translate3d(0, ${offset * direction}px, 0)`;

                        }
                    );


                    ticking = false;

                }
            );

        },
        {
            passive: true
        }
    );

}


/* ================================================================
   INTERACCION ASTRONOMICA
================================================================ */

function initAstronomyInteraction() {

    if (
        prefersReducedMotion() ||
        isMobileDevice()
    ) {

        return;

    }


    const solarSystem =
        document.querySelector(
            ".solar-system"
        );


    if (!solarSystem) return;


    /*
       Movimiento minimo basado en el cursor.

       No modifica top/left.
       Solo usa transform.
    */

    let pointerX = 0;

    let pointerY = 0;

    let targetX = 0;

    let targetY = 0;

    let frame = null;


    function animate() {

        const deltaX =
            targetX - pointerX;

        const deltaY =
            targetY - pointerY;


        pointerX +=
            deltaX * 0.035;


        pointerY +=
            deltaY * 0.035;


        solarSystem.style.transform =
            `translate3d(${pointerX}px, ${pointerY}px, 0)`;


        if (
            Math.abs(deltaX) > 0.05 ||
            Math.abs(deltaY) > 0.05
        ) {

            frame =
                requestAnimationFrame(
                    animate
                );

        } else {

            frame = null;

        }

    }


    window.addEventListener(
        "pointermove",
        event => {

            const x =
                (
                    event.clientX /
                    window.innerWidth
                ) - 0.5;


            const y =
                (
                    event.clientY /
                    window.innerHeight
                ) - 0.5;


            targetX =
                x * 10;


            targetY =
                y * 10;


            if (
                frame === null
            ) {

                frame =
                    requestAnimationFrame(
                        animate
                    );

            }

        },
        {
            passive: true
        }
    );

}


/* ================================================================
   GLOW DEL CURSOR
================================================================ */

function initCursorGlow() {

    if (
        prefersReducedMotion() ||
        isMobileDevice()
    ) {

        return;

    }


    const root =
        document.documentElement;


    let frame = null;

    let mouseX = 50;

    let mouseY = 50;

    let currentX = 50;

    let currentY = 50;


    function animate() {

        currentX +=
            (
                mouseX -
                currentX
            ) * 0.08;


        currentY +=
            (
                mouseY -
                currentY
            ) * 0.08;


        root.style.setProperty(
            "--mouse-x",
            `${currentX}%`
        );


        root.style.setProperty(
            "--mouse-y",
            `${currentY}%`
        );


        if (
            Math.abs(
                mouseX -
                currentX
            ) > 0.05 ||
            Math.abs(
                mouseY -
                currentY
            ) > 0.05
        ) {

            frame =
                requestAnimationFrame(
                    animate
                );

        } else {

            frame = null;

        }

    }


    window.addEventListener(
        "pointermove",
        event => {

            mouseX =
                (
                    event.clientX /
                    window.innerWidth
                ) * 100;


            mouseY =
                (
                    event.clientY /
                    window.innerHeight
                ) * 100;


            if (
                frame === null
            ) {

                frame =
                    requestAnimationFrame(
                        animate
                    );

            }

        },
        {
            passive: true
        }
    );

}


/* ================================================================
   SECCION ACTIVA
================================================================ */

function initActiveSection() {

    const sections =
        document.querySelectorAll(
            "section[id]"
        );


    if (!sections.length) return;


    if (
        prefersReducedMotion()
    ) {

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "section-active"
                            );

                        } else {

                            entry.target.classList.remove(
                                "section-active"
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.35
            }
        );


    sections.forEach(
        section => {

            observer.observe(
                section
            );

        }
    );

}


/* ================================================================
   LIMPIEZA
================================================================ */

window.addEventListener(
    "pagehide",
    () => {

        if (
            window.musicExperience &&
            window.musicExperience.element
        ) {

            window.musicExperience.element.pause();

        }

    }
);