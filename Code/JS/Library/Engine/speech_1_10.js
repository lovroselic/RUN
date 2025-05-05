//////////////////speech.js/////////////////////////
//                                                //
//       SPEECH               by LS               //
//                                                //
////////////////////////////////////////////////////
/*  

TODO:
    
*/
////////////////////////////////////////////////////

const SPEECH = {
  VERSION: "1.10",
  CSS: "color: #0A0",
  VERBOSE: true,
  browserSupport: true,
  voices: null,
  voice: null,
  settings: null,
  ready: false,
  init(rate = 0.5, pitch = 0.9, volume = 1) {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        SPEECH.browserSupport = false;
        console.log(`%cInitializing SPEECH failed. Browser not supported!`, "color: #F00");
        reject("Browser not supported");
        return;
      }

      Promise.all([SPEECH.getVoices()]).then(function () {
        SPEECH.ready = true;
        console.log(`%cSPEECH ${SPEECH.VERSION}: ready`, SPEECH.CSS);
        //SPEECH.voice = SPEECH.voices[1];
      
        let def = new VoiceSetting(rate, pitch, volume);
        SPEECH.settings = def;
        SPEECH.reMapVoices();
        SPEECH.use("Princess");
        resolve();
      });
    });
  },
  reMapVoices() {
    const sources = [];
    const mappedVoices = new DefaultArrayDict();
    for (const [index, tts] of SPEECH.voices.entries()) {
      const name = tts.name.extractGroup(/Microsoft\s(\w+)/);
      tts.voiceName = name;
      tts.index = index;
      mappedVoices[name].push(index);
    }

    for (const voice in VOICE) {
      for (const source of VOICE[voice].source) {
        if (mappedVoices[source]) {
          VOICE[voice].voice = mappedVoices[source][0];
          sources.push(source);
          break;
        }
      }
    }

    $("#speech_sources").html(`The game uses the following text to speech voices: ${Array.from(new Set(sources))}. To assure the best game playing experience, install the required English based voices packages in Windows (Time and Language > Speech).
     Failing to find the required voices, the game will default to available voices - regardless of sex.`);
    if (SPEECH.VERBOSE) console.table(VOICE);
  },
  use(voice) {
    voice = VOICE[voice];
    SPEECH.voice = SPEECH.voices[voice.voice];
    if (SPEECH.VERBOSE) console.info(`%cSPEECH voice used ${JSON.stringify(SPEECH.voice)}, voice: ${JSON.stringify(voice)}`, SPEECH.CSS);
    for (const setting in voice.setting) {
      SPEECH.settings[setting] = voice.setting[setting];
    }
  },
  silence() {
    speechSynthesis.cancel();
  },
  speak(txt) {
    if (!SPEECH.ready) {
      console.log(`%cSPEECH not ready ....`, "color: #A00");
      return;
    }

    if (speechSynthesis.speaking || speechSynthesis.pending) {
      if (SPEECH.VERBOSE) console.log(`%cSPEECH interrupted. Starting new text.`, "color: #A00");
      this.silence();
    }

    let msg = new SpeechSynthesisUtterance();
    msg.text = txt;
    msg.pitch = SPEECH.settings.pitch;
    msg.rate = SPEECH.settings.rate;
    msg.volume = SPEECH.settings.volume;
    msg.voice = SPEECH.voice;

    speechSynthesis.speak(msg);
  },
  speakWithArticulation(txt) {
    if (!SPEECH.ready) {
      console.log(`%cSPEECH not ready ....`, "color: #A00");
      return;
    }

    if (speechSynthesis.speaking || speechSynthesis.pending) {
      if (SPEECH.VERBOSE) console.log(`%cSPEECH interrupted. Starting new text.`, "color: #A00");
      this.silence();
    }

    const articulations = ".!?<>+-";
    let sentences = txt.split(new RegExp(`([${articulations}])`, "g"));
    let i = 0;
    speakSentence();

    function speakSentence() {
      if (i >= sentences.length) {
        return;
      }

      let sentence = sentences[i];
      let punctuation = sentences[i + 1];
      const descriptor = punctuation;

      let msg = new SpeechSynthesisUtterance();
      if (!["!", "?", "."].includes(punctuation)) punctuation = ".";

      msg.text = sentence + (punctuation || '');
      msg.voice = SPEECH.voice;
      msg.volume = SPEECH.settings.volume;

      switch (descriptor) {
        case "?":
          msg.rate = SPEECH.settings.rate * 0.8;
          msg.pitch = SPEECH.settings.pitch * 1.5;
          break;
        case "!":
          msg.rate = SPEECH.settings.rate * 1.2;
          msg.pitch = SPEECH.settings.pitch * 0.8;
          break;
        case "<":
          SPEECH.settings.rate *= 0.667;
          msg.rate = SPEECH.settings.rate;
          msg.pitch = SPEECH.settings.pitch;
          break;
        case ">":
          SPEECH.settings.rate *= 1.5;
          msg.rate = SPEECH.settings.rate;
          msg.pitch = SPEECH.settings.pitch;
          break;
        case "-":
          SPEECH.settings.pitch *= 0.667;
          msg.rate = SPEECH.settings.rate;
          msg.pitch = SPEECH.settings.pitch;
          break;
        case "#":
          SPEECH.settings.pitch *= 1.5;
          msg.rate = SPEECH.settings.rate;
          msg.pitch = SPEECH.settings.pitch;
          break;
        default:
          msg.rate = SPEECH.settings.rate;
          msg.pitch = SPEECH.settings.pitch;
          break;
      }

      msg.onend = () => {
        i += 2;
        speakSentence();
      };
      speechSynthesis.speak(msg);
    }
  },
  async getVoices() {
    const voices = await new Promise((resolve) => {
      const available = speechSynthesis.getVoices();
      if (available.length) {
        resolve(available);
      } else {
        const fallbackTimeout = setTimeout(() => {
          const retry = speechSynthesis.getVoices();
          if (retry.length) {
            resolve(retry);
          } else {
            resolve([]);
          }
        }, 500);

        speechSynthesis.onvoiceschanged = () => {
          clearTimeout(fallbackTimeout);
          const updated = speechSynthesis.getVoices();
          resolve(updated);
        };
      }
    });

    this.voices = voices;
    return voices;
  }
};

class VoiceSetting {
  constructor(rate, pitch, volume) {
    this.rate = rate;
    this.pitch = pitch;
    this.volume = volume;
  }
}

const VOICE = {
  'MaleLow': {
    source: ["David"],
    voice: 0,
    setting: new VoiceSetting(0.75, 0.5, 1.0)
  },
  'Male': {
    source: ["David"],
    voice: 0,
    setting: new VoiceSetting(0.75, 1.0, 1.0)
  },
  'Strange': {
    source: ["David"],
    voice: 0,
    setting: new VoiceSetting(0.5, 0.2, 0.9)
  },
  'StrangeFemale': {
    source: ["Hazel"],
    voice: 0,
    setting: new VoiceSetting(0.5, 0.2, 0.9)
  },
  'MaleQ': {
    source: ["David"],
    voice: 0,
    setting: new VoiceSetting(1.3, 0.8, 1.0)
  },
  'Female': {
    source: ["Hazel"],
    voice: 0,
    setting: new VoiceSetting(0.75, 1.0, 1.0)
  },
  'Female2': {
    source: ["Hazel"],
    voice: 0,
    setting: new VoiceSetting(1.0, 1.0, 1.0)
  },
  'FemaleLow': {
    source: ["Hazel"],
    voice: 0,
    setting: new VoiceSetting(0.8, 0.7, 1.0)
  },
  'FemaleLow2': {
    source: ["Zira"],
    voice: 0,
    setting: new VoiceSetting(0.7, 0.6, 1.0)
  },
  'MaleLowSlow': {
    source: ["David"],
    voice: 0,
    setting: new VoiceSetting(0.75, 0.6, 1.0)
  },
  'FemHighQuick': {
    source: ["Hazel"],
    voice: 0,
    setting: new VoiceSetting(1.4, 2.0, 1.0)
  },
  'GlaDOS': {
    source: ["Hazel"],
    voice: 0,
    setting: new VoiceSetting(0.5, 0.9, 1.0)
  },
  'Princess': {
    source: ["Zira"],
    voice: 0,
    setting: new VoiceSetting(1.2, 2.0, 1.0)
  },
  'GhostFace': {
    source: ["Hazel"],
    voice: 0,
    setting: new VoiceSetting(2.0, 0.0, 1.0)
  },
  'Apparitia': {
    source: ["Hazel"],
    voice: 0,
    setting: new VoiceSetting(1.65, 1.8, 1.0)
  },
  'Hauntessa': {
    source: ["Hazel"],
    voice: 0,
    setting: new VoiceSetting(0.85, 0.02, 1.0)
  },
  'Female3': {
    source: ["Linda", "Hazel"],
    voice: 0,
    setting: new VoiceSetting(1.0, 1.0, 1.0)
  },
  'Female4': {
    source: ["Susan", "Hazel"],
    voice: 0,
    setting: new VoiceSetting(1.0, 1.0, 1.0)
  },
  'Female5': {
    source: ["Heera", "Hazel"],
    voice: 0,
    setting: new VoiceSetting(1.0, 1.0, 1.0)
  },
  'Female6': {
    source: ["Catherine", "Hazel"],
    voice: 0,
    setting: new VoiceSetting(1.0, 1.0, 1.0)
  },
};
console.log(`%cSPEECH ${SPEECH.VERSION} loaded.`, SPEECH.CSS);