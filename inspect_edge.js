import * as tts from 'edge-tts-universal';
console.log('Exports:', Object.keys(tts));
if (tts.UniversalEdgeTTS) {
    console.log('UniversalEdgeTTS prototype:', Object.keys(tts.UniversalEdgeTTS.prototype));
}
