import * as tts from 'msedge-tts';
console.log('Exports:', Object.keys(tts));
if (tts.MsEdgeTTS) {
    console.log('MsEdgeTTS prototype:', Object.keys(tts.MsEdgeTTS.prototype));
}
