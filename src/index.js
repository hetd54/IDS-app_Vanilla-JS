import "./styles.css";
import $ from "jquery";

/////////////////////////
/// Helper Functions
/////////////////////////
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const getCurrentDate = () => {
  let currentDate = new Date();
  let day = currentDate.getDate();
  let month = currentDate.getMonth() + 1;
  let year = currentDate.getFullYear();
  return month + "/" + day + "/" + year;
};

const getCurrentTime = () => {
  let currentTime = new Date();
  let hours = currentTime.getHours();
  let minutes = currentTime.getMinutes();
  if (minutes < 10) minutes = "0" + minutes;
  return hours + ":" + minutes;
};

const showVideo = (id) => {
  const video = document.getElementById(id);
  // Un-collapse the element
  video.style.visibility = "visible";
  // Slow fade in for flavor, then play the video
  video.animate({ opacity: 1, duration: 1400 }).then(() => video.play());
};

const swapSlide = (idShow, idHide) => {
  document.getElementById(idShow).style.display = "block";
  document.getElementById(idHide).style.display = "none";
};

const allowTap = () => {
  videoFinished = true;
  // Get current time for reaction time
  createdTime = Date.now();
};

// restart video function
function Restart() {
  if (experiment.video == null) {
    return false;
  }
  experiment.video.pause();
  const retVal = window.confirm("Do you want to restart the video?");
  if (retVal === true) {
    experiment.video.currentTime = 0;
    experiment.video.play();
    videoFinished = false;
    return true;
  } else {
    if (videoFinished === true) {
      return false;
    } else {
      experiment.video.play();
    }
  }
}

const processOneRow = () => {
  let fname = experiment.subid + ".csv";
  let dataforRound =
    experiment.device +
    "," +
    experiment.subid +
    "," +
    experiment.birthday +
    "," +
    experiment.term +
    "," +
    experiment.sex +
    "," +
    experiment.lang1 +
    "," +
    experiment.lang1hours +
    "," +
    experiment.lang2 +
    "," +
    experiment.lang2hours +
    "," +
    experiment.videorelease +
    "," +
    experiment.list +
    "," +
    experiment.version +
    "," +
    experiment.famtype +
    "," +
    experiment.trialnum +
    "," +
    experiment.trialtype +
    "," +
    experiment.color +
    "," +
    experiment.shownside +
    "," +
    experiment.targetside +
    "," +
    experiment.childside +
    "," +
    experiment.response +
    "," +
    experiment.date +
    "," +
    experiment.timestamp +
    "," +
    experiment.reactiontime;
  dataforRound += "\n";
  $.post(
    "http://pclpsrescit2.services.brown.edu/blt_lab/ids/data/tabletstudysave.php",
    { fname: fname, postresult_string: dataforRound }
  );
};

/////////////////////////
/// Experiment Setup and Experiment-Specific Functions
/////////////////////////
let videoFinished = false;
// list of possible reward videos, which we are not counterbalancing.
let reward = [
  "truck",
  "xyl",
  "water",
  "tramp",
  "truck",
  "xyl",
  "water",
  "tramp"
];
// Variables for reaction time
let createdTime = Date.now();
let clickedTime = Date.now();

let experiment = {
  //inputed at beginning of experiment
  subjectId: "",
  //inputed at beginning of experiment
  birthday: "",
  //term information (more than 36 weeks of age), yes/no
  term: "",
  //Sex of child
  sex: "",
  // No Inference or Inference condition
  condition: "",
  //trial number
  trialNumber: 0,
  //type of trial (warmup or main)
  trialType: "",
  //whether child received list 1, 2, 3, or 4
  list: 1,
  //current video id (used for restart function)
  video: "",
  //color of boxes shown
  color: "",
  //whether the shown box was on the left (L) or the right (R) side
  shownSide: "",
  //whether the ball is on the left (L) or the right (R) side
  targetSide: "",
  //whether the child picked the left (L) or the right (R) side
  chosenSide: "",
  //whether the response was the correct response (Y) or the incorrect response (N)
  response: "",
  //the date of the experiment
  date: getCurrentDate(),
  //the time that the trial was completed
  timestamp: getCurrentTime(),

  reactiontime: 0,

  warmupTrials: 2,

  maxtrial: 8
};

const preStudy = () => {
  console.log("show consent");
  experiment.subjectId = document.getElementById("subjectID").value;
  experiment.birthday = document.getElementById("birthDate").value;
  experiment.list = document.getElementById("list").value;
  experiment.condition = document.getElementById("condition").value;
  experiment.term = document.getElementById("term").value;
  experiment.sex = document.getElementById("sex").value;

  // Load video locations -- two warmup trials are constant between trials
  const warmupTrials = [
    "~/videos/Bucket/warmup/warmup-1.mp4",
    "~/videos/Bucket/warmup/warmup-2.mp4"
  ];

  const warmupBox = document.getElementById("warmup");
  for (let i = 0; i < warmupTrials.length; i++) {
    let video = document.createElement("video");
    video.preload = "auto";
    video.autoplay = false;
    video.src = warmupTrials[i];
    video.onended = allowTap();
    video.onclick = onTap("warmup");
    video.setAttribute("id", `warmup${i}`);
    if (warmupBox) {
      warmupBox.appendChild(video);
    }
  }

  // variables to use in creation of video source
  let conditionList;
  let targetSide = [
    "target-left",
    "target-right",
    "target-right",
    "target-left",
    "target-right",
    "target-left",
    "target-left",
    "target-right"
  ];

  //Set up color variable to be used later in the test trial videos
  let colorBlock1 = shuffle(["black", "red", "yellow", "green"]);
  let colorBlock2 = shuffle(["black", "red", "yellow", "green"]);
  if (colorBlock1[3] === colorBlock2[0]) {
    colorBlock2.push(colorBlock2.shift());
  }
  const color = colorBlock1.concat(colorBlock2);

  // There are currently two conditions -- one where the target box is shown to the baby (No-Inference) and one where the empty box is shown (Inference)
  if (experiment.condition === "No-Inference") {
    conditionList = [
      "noinf-right",
      "noinf-right",
      "noinf-left",
      "noinf-left",
      "noinf-left",
      "noinf-left",
      "noinf-right",
      "noinf-right"
    ];
  } else if (experiment.condition === "Inference") {
    conditionList = [
      "inf-right",
      "inf-right",
      "inf-left",
      "inf-left",
      "inf-left",
      "inf-left",
      "inf-right",
      "inf-right"
    ];
  }

  // For counterbalancing of which side is lifted first
  if (
    (experiment.condition === "No-Inference" && experiment.list === "2") ||
    (experiment.condition === "No-Inference" && experiment.list === "4")
  ) {
    conditionList = [
      "noinf-left",
      "noinf-left",
      "noinf-right",
      "noinf-right",
      "noinf-right",
      "noinf-right",
      "noinf-left",
      "noinf-left"
    ];
  } else if (
    (experiment.condition === "Inference" && experiment.list === "2") ||
    (experiment.condition === "Inference" && experiment.list === "4")
  ) {
    conditionList = [
      "inf-left",
      "inf-left",
      "inf-right",
      "inf-right",
      "inf-right",
      "inf-right",
      "inf-left",
      "inf-left"
    ];
  }

  // For counterbalancing of which side contains the ball (target)
  if (experiment.list === "2" || experiment.list === "3") {
    targetSide = targetSide.reverse();
  }

  /* Use the above information to create a list of videos to pre-load */
  const box = document.getElementById("videoBox");
  for (let i = 0; i < experiment.maxTrial; i++) {
    let video = document.createElement("video");
    video.setAttribute("id", `test${i}`);
    video.preload = "auto";
    video.autoplay = false;
    video.src = `~/videos/Bucket/${targetSide[i]}/${color[i]}/${conditionList[i]}.mp4`;
    video.onended = allowTap();
    video.onclick = onTap("main");
    console.log(video.src);
    if (box) {
      box.appendChild(video);
    }
  }

  //set headers for the CSV File on the server
  const fname = `${experiment.subjectId}_${getCurrentDate}_${getCurrentTime}.csv`;
  var dataforRound =
    "SubjectID,BirthDate,FullTerm,Sex,List,Condition,TrialNumber,TrialType,BoxColor,SideLiftedFirst,TargetSide,ChosenSide,Response,Date,Time,ReactionTime\n";
  $.post(
    "http://pclpsrescit2.services.brown.edu/blt_lab/ids/data/tabletstudysave.php",
    { fname: fname, postresult_string: dataforRound }
  );
  swapSlide("consent", "instructions");
};

const checkAudio = () => {
  const startWarmupButton = document.getElementById("startWarmup");
  swapSlide("audioCheck", "consent");
  // when the video finishes playing, show the button to continue
  document
    .getElementById("audioVideo")
    .addEventListener("oneneded", function () {
      startWarmupButton.display = "block";
    });
};

const startWarmup = () => {
  swapSlide("warmup", "audioCheck");
  showVideo("warmup1");
};

const onTap = (e, trialType) => {
  const clickedVideo = document.getElementById(e.target.id);
  experiment.trialType = trialType;

  // Set values for figuring out where the parent clicks
  var pWidth = $(clickedVideo).innerWidth();
  var pHeight = $(clickedVideo).innerHeight();
  var pOffset = $(clickedVideo).offset();
  var x = e.pageX - pOffset.left;
  var y = e.pageY - pOffset.top;

  if ((pWidth / 6 > x) & (pHeight / 5 > y)) {
    Restart();
  }
  // Only allow to continue if the video is finished playing
  if (videoFinished === true) {
    // Calculate reaction time
    clickedTime = Date.now();
    experiment.reactiontime = (clickedTime - createdTime) / 1000;
    // Figure out target side based on video
    if (trialType === "warmup") {
      experiment.targetSide = "middle";
    } else if (clickedVideo.src.includes("target-left")) {
      experiment.targetSide = "left";
    } else {
      experiment.targetSide = "right";
    }
    // Get which side was clicked on
    if (x > (pWidth / 5) * 2 && x < pWidth - (pWidth / 5) * 2) {
      console.log("middle");
      experiment.chosenSide = "middle";
    } else if (pWidth / 4 > x) {
      console.log("left");
      experiment.chosenSide = "left";
    } else if (pWidth - pWidth / 4 < x) {
      console.log("right");
      experiment.chosenSide = "right";
    }
    // Check if correct or incorrect
    if (experiment.chosenSide === experiment.targetSide) {
      experiment.response = "Y";
      videoFinished = false;

      if (trialType === "warmup") {
        // current source: "~/videos/Bucket/warmup/warmup-1.mp4"
        clickedVideo.src = `${clickedVideo.src.substring(
          0,
          clickedVideo.src.lastIndexOf("/")
        )}/test-${experiment.trialNumber}.mp4`;
        clickedVideo
          .play()
          .then(() => (clickedVideo.display = "none"))
          .then(() => {
            if (experiment.trialNumber === experiment.warmupTrials) {
              // reached max number of warmup trials
              experiment.trialNumber = 0;
              swapSlide("videoBox", "warmup");
              showVideo(`test${experiment.trialNumber}`);
            } else {
              showVideo(`warmup${experiment.trialNumber + 1}`);
            }
          });
      } else {
        clickedVideo.src = `${clickedVideo.src.substring(
          0,
          clickedVideo.src.lastIndexOf("/")
        )}/${reward[0]}.mp4`;
        reward.splice(0, 1);
        clickedVideo
          .play()
          .then(() => (clickedVideo.visibility = "collapse"))
          .then(() => {
            if (experiment.trialNumber === experiment.maxTrial) {
              // reached max number of trials
              swapSlide("thanks", "videoBox");
            } else {
              showVideo(`test${experiment.trialNumber + 1}`);
            }
          });
      }

      // Send data for this trial to the excel sheet
      processOneRow();
      experiment.trialNumber += 1;
    } else {
      experiment.response = "N";
      // Only move on if we are in the test trials
      if (trialType === "main") {
        videoFinished = false;
        clickedVideo.src = `${clickedVideo.src.substring(
          0,
          clickedVideo.src.lastIndexOf("/")
        )}/incorrect.mp4`;
        processOneRow();
        experiment.trialNumber += 1;
        clickedVideo
          .play()
          .then(() => (clickedVideo.visibility = "collapse"))
          .then(() => {
            if (experiment.trialNumber === experiment.maxTrial) {
              // reached max number of trials
              swapSlide("thanks", "videoBox");
            } else {
              showVideo(`test${experiment.trialNumber + 1}`);
            }
          });
      }
    }
  }
};

/////////////////////////
/// Control Flow
/////////////////////////

document.getElementById("showConsent").addEventListener("click", function () {
  preStudy();
});

document.getElementById("consented").addEventListener("click", function () {
  checkAudio();
});

document.getElementById("startWarmup").addEventListener("click", function () {
  startWarmup();
});

document.getElementById("signUp").addEventListener("click", function () {
  window.open(
    "https://brown.co1.qualtrics.com/jfe/form/SV_eM41Um0W2jdpXoh?Source=Website_Heather",
    "_blank"
  );
});
