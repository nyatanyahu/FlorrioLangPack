// ==UserScript==
// @name         Florr.io - Langpack
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  langpack for florr.io using wasm
// @author       somebigballs
// @match        https://florr.io
// @grant        unsafeWindow
// @run-at       document-start
// @require      https://cdn.ably.io/lib/vcdiff-decoder.min-1.js
// ==/UserScript==

(async () => {
    const URL = 'https://raw.githubusercontent.com/nyatanyahu/FlorrioLangPack/aa48c2f87b2c856713e787fedecc44fb58297391/wasm/langpack.patch';
    const diffBuffer = await fetch(URL).then(res => res.arrayBuffer());
    const wasm = unsafeWindow.WebAssembly;
    const _instantiate = wasm.instantiate;

    function patchBytes(oldBytes, diffBytes) {
        const patched = vcdiffDecoder.decode(diffBytes, oldBytes);
        return patched.buffer.slice(patched.byteOffset, patched.byteOffset + patched.byteLength);
    }

    wasm.instantiateStreaming = async function(source, imports) {
        try {
            const response = await source;
            const oldBuffer = await response.arrayBuffer();
            const oldBytes = new Uint8Array(oldBuffer);
            const diffBytes = new Uint8Array(diffBuffer);
            const patchedBytes = patchBytes(oldBytes, diffBytes);

            return _instantiate.call(wasm, patchedBytes, imports);
        } catch (error) {
            console.error(error);
        }
    }

    wasm.instantiate = async function(source, imports) {
        try {
            const oldBuffer = await source;
            const oldBytes = new Uint8Array(oldBuffer);
            const diffBytes = new Uint8Array(diffBuffer);
            const patchedBytes = patchBytes(oldBytes, diffBytes);

            return _instantiate.call(wasm, patchedBytes, imports);
        } catch (error) {
            console.error(error);
        }
    }
})();