let wasm;

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_3.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}
/**
 * Initialize WASM module with panic hook for better error messages
 */
export function main() {
    wasm.main();
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_3.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}
/**
 * Convenience function to create a new Shlesha instance
 *
 * @returns {WasmShlesha} New transliterator instance
 *
 * @example
 * ```javascript
 * import { createTransliterator } from 'shlesha';
 * const transliterator = createTransliterator();
 * ```
 * @returns {WasmShlesha}
 */
export function createTransliterator() {
    const ret = wasm.createTransliterator();
    return WasmShlesha.__wrap(ret);
}

/**
 * Convenience function for direct transliteration
 *
 * @param {string} text - Text to transliterate
 * @param {string} fromScript - Source script name
 * @param {string} toScript - Target script name
 * @returns {string} Transliterated text
 * @throws {Error} If transliteration fails
 *
 * @example
 * ```javascript
 * import { transliterate } from 'shlesha';
 * const result = transliterate("धर्म", "devanagari", "iast");
 * console.log(result); // "dharma"
 * ```
 * @param {string} text
 * @param {string} from_script
 * @param {string} to_script
 * @returns {string}
 */
export function transliterate(text, from_script, to_script) {
    let deferred5_0;
    let deferred5_1;
    try {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(from_script, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(to_script, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.transliterate(ptr0, len0, ptr1, len1, ptr2, len2);
        var ptr4 = ret[0];
        var len4 = ret[1];
        if (ret[3]) {
            ptr4 = 0; len4 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred5_0 = ptr4;
        deferred5_1 = len4;
        return getStringFromWasm0(ptr4, len4);
    } finally {
        wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
    }
}

/**
 * Get list of all supported scripts as JavaScript Array
 *
 * @returns {Array<string>} Array of supported script names
 *
 * @example
 * ```javascript
 * import { getSupportedScripts } from 'shlesha';
 * const scripts = getSupportedScripts();
 * console.log(scripts.includes("devanagari")); // true
 * ```
 * @returns {Array<any>}
 */
export function getSupportedScripts() {
    const ret = wasm.getSupportedScripts();
    return ret;
}

/**
 * Get the library version
 *
 * @returns {string} Version string
 * @returns {string}
 */
export function getVersion() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.getVersion();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

const WasmShleshaFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmshlesha_free(ptr >>> 0, 1));
/**
 * WASM wrapper for the Shlesha transliterator
 */
export class WasmShlesha {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmShlesha.prototype);
        obj.__wbg_ptr = ptr;
        WasmShleshaFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmShleshaFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmshlesha_free(ptr, 0);
    }
    /**
     * Create a new Shlesha transliterator instance
     *
     * @returns {WasmShlesha} New transliterator instance
     *
     * @example
     * ```javascript
     * const transliterator = new WasmShlesha();
     * ```
     */
    constructor() {
        const ret = wasm.createTransliterator();
        this.__wbg_ptr = ret >>> 0;
        WasmShleshaFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Transliterate text from one script to another
     *
     * @param {string} text - Text to transliterate
     * @param {string} fromScript - Source script name
     * @param {string} toScript - Target script name
     * @returns {string} Transliterated text
     * @throws {Error} If transliteration fails
     *
     * @example
     * ```javascript
     * const transliterator = new WasmShlesha();
     * const result = transliterator.transliterate("धर्म", "devanagari", "iast");
     * console.log(result); // "dharma"
     * ```
     * @param {string} text
     * @param {string} from_script
     * @param {string} to_script
     * @returns {string}
     */
    transliterate(text, from_script, to_script) {
        let deferred5_0;
        let deferred5_1;
        try {
            const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(from_script, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(to_script, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            const ret = wasm.wasmshlesha_transliterate(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
            var ptr4 = ret[0];
            var len4 = ret[1];
            if (ret[3]) {
                ptr4 = 0; len4 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred5_0 = ptr4;
            deferred5_1 = len4;
            return getStringFromWasm0(ptr4, len4);
        } finally {
            wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
        }
    }
    /**
     * Transliterate text with metadata collection for unknown tokens
     *
     * @param {string} text - Text to transliterate
     * @param {string} fromScript - Source script name
     * @param {string} toScript - Target script name
     * @returns {WasmTransliterationResult} Result with output and metadata
     * @throws {Error} If transliteration fails
     *
     * @example
     * ```javascript
     * const transliterator = new WasmShlesha();
     * const result = transliterator.transliterateWithMetadata("धर्मkr", "devanagari", "iast");
     * console.log(result.getOutput()); // "dharmakr"
     * console.log(result.getUnknownTokenCount()); // 2 (for 'k' and 'r')
     * ```
     * @param {string} text
     * @param {string} from_script
     * @param {string} to_script
     * @returns {WasmTransliterationResult}
     */
    transliterateWithMetadata(text, from_script, to_script) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(from_script, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(to_script, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.wasmshlesha_transliterateWithMetadata(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return WasmTransliterationResult.__wrap(ret[0]);
    }
    /**
     * Get list of supported scripts as JavaScript Array
     *
     * @returns {Array<string>} Array of supported script names
     *
     * @example
     * ```javascript
     * const transliterator = new WasmShlesha();
     * const scripts = transliterator.listSupportedScripts();
     * console.log(scripts.includes("devanagari")); // true
     * ```
     * @returns {Array<any>}
     */
    listSupportedScripts() {
        const ret = wasm.wasmshlesha_listSupportedScripts(this.__wbg_ptr);
        return ret;
    }
    /**
     * Check if a script is supported
     *
     * @param {string} script - Script name to check
     * @returns {boolean} True if script is supported
     *
     * @example
     * ```javascript
     * const transliterator = new WasmShlesha();
     * console.log(transliterator.supportsScript("devanagari")); // true
     * console.log(transliterator.supportsScript("unknown"));     // false
     * ```
     * @param {string} script
     * @returns {boolean}
     */
    supportsScript(script) {
        const ptr0 = passStringToWasm0(script, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmshlesha_supportsScript(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * Load a new script schema at runtime
     *
     * @param {string} schemaPath - Path to YAML schema file
     * @throws {Error} If schema loading fails
     *
     * @example
     * ```javascript
     * const transliterator = new WasmShlesha();
     * transliterator.loadSchema("custom_script.yaml");
     * ```
     * @param {string} schema_path
     */
    loadSchema(schema_path) {
        const ptr0 = passStringToWasm0(schema_path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmshlesha_loadSchema(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Get script information as JavaScript Object
     *
     * @returns {Object} Object mapping script names to descriptions
     *
     * @example
     * ```javascript
     * const transliterator = new WasmShlesha();
     * const info = transliterator.getScriptInfo();
     * console.log(info.devanagari); // "Devanagari script (देवनागरी)"
     * ```
     * @returns {any}
     */
    getScriptInfo() {
        const ret = wasm.wasmshlesha_getScriptInfo(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Get the number of supported scripts
     *
     * @returns {number} Number of supported scripts
     * @returns {number}
     */
    getSupportedScriptCount() {
        const ret = wasm.wasmshlesha_getSupportedScriptCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Load a schema from a file path for runtime script support
     * Note: In WASM context, this would typically load from a URL or local storage
     *
     * @param {string} filePath - Path to YAML schema file
     * @throws {Error} If schema loading fails
     *
     * @example
     * ```javascript
     * const transliterator = new WasmShlesha();
     * await transliterator.loadSchemaFromFile("/schemas/custom.yaml");
     * ```
     * @param {string} file_path
     */
    loadSchemaFromFile(file_path) {
        const ptr0 = passStringToWasm0(file_path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmshlesha_loadSchemaFromFile(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Load a schema from YAML content string
     *
     * @param {string} yamlContent - YAML schema content
     * @param {string} schemaName - Name for the schema
     * @throws {Error} If schema loading fails
     *
     * @example
     * ```javascript
     * const yamlContent = `
     * metadata:
     *   name: "custom"
     *   script_type: "roman"
     * mappings:
     *   vowels:
     *     "a": "a"
     * `;
     * const transliterator = new WasmShlesha();
     * transliterator.loadSchemaFromString(yamlContent, "custom");
     * ```
     * @param {string} yaml_content
     * @param {string} schema_name
     */
    loadSchemaFromString(yaml_content, schema_name) {
        const ptr0 = passStringToWasm0(yaml_content, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(schema_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.wasmshlesha_loadSchemaFromString(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Get information about a loaded runtime schema
     *
     * @param {string} scriptName - Name of the script
     * @returns {Object|undefined} Schema information object or undefined if not found
     *
     * @example
     * ```javascript
     * const info = transliterator.getSchemaInfo("custom");
     * if (info) {
     *     console.log(info.description);
     *     console.log(info.mapping_count);
     * }
     * ```
     * @param {string} script_name
     * @returns {object | undefined}
     */
    getSchemaInfo(script_name) {
        const ptr0 = passStringToWasm0(script_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmshlesha_getSchemaInfo(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Remove a runtime loaded schema
     *
     * @param {string} scriptName - Name of the script to remove
     * @returns {boolean} True if schema was removed, false if not found
     *
     * @example
     * ```javascript
     * const success = transliterator.removeSchema("custom");
     * console.log(success); // true if removed
     * ```
     * @param {string} script_name
     * @returns {boolean}
     */
    removeSchema(script_name) {
        const ptr0 = passStringToWasm0(script_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.wasmshlesha_removeSchema(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * Clear all runtime loaded schemas
     *
     * @example
     * ```javascript
     * transliterator.clearRuntimeSchemas();
     * ```
     */
    clearRuntimeSchemas() {
        wasm.wasmshlesha_clearRuntimeSchemas(this.__wbg_ptr);
    }
}

const WasmTransliterationMetadataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmtransliterationmetadata_free(ptr >>> 0, 1));
/**
 * WASM wrapper for transliteration metadata
 */
export class WasmTransliterationMetadata {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTransliterationMetadataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtransliterationmetadata_free(ptr, 0);
    }
}

const WasmTransliterationResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmtransliterationresult_free(ptr >>> 0, 1));
/**
 * WASM wrapper for transliteration result with metadata
 */
export class WasmTransliterationResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(WasmTransliterationResult.prototype);
        obj.__wbg_ptr = ptr;
        WasmTransliterationResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmTransliterationResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmtransliterationresult_free(ptr, 0);
    }
    /**
     * Get the transliterated output text
     *
     * @returns {string} Transliterated text
     * @returns {string}
     */
    getOutput() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.wasmtransliterationresult_getOutput(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Check if metadata is available
     *
     * @returns {boolean} True if metadata is present
     * @returns {boolean}
     */
    hasMetadata() {
        const ret = wasm.wasmtransliterationresult_hasMetadata(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Get the source script name from metadata
     *
     * @returns {string|null} Source script name or null if no metadata
     * @returns {string | undefined}
     */
    getSourceScript() {
        const ret = wasm.wasmtransliterationresult_getSourceScript(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * Get the target script name from metadata
     *
     * @returns {string|null} Target script name or null if no metadata
     * @returns {string | undefined}
     */
    getTargetScript() {
        const ret = wasm.wasmtransliterationresult_getTargetScript(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * Get the number of unknown tokens
     *
     * @returns {number} Number of unknown tokens (0 if no metadata)
     * @returns {number}
     */
    getUnknownTokenCount() {
        const ret = wasm.wasmtransliterationresult_getUnknownTokenCount(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Get unknown tokens as JavaScript Array
     *
     * @returns {Array<Object>} Array of unknown token objects
     * @returns {Array<any>}
     */
    getUnknownTokens() {
        const ret = wasm.wasmtransliterationresult_getUnknownTokens(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}

const WasmUnknownTokenFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmunknowntoken_free(ptr >>> 0, 1));
/**
 * WASM wrapper for unknown token information
 */
export class WasmUnknownToken {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmUnknownTokenFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmunknowntoken_free(ptr, 0);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_new_405e22f390576ce2 = function() {
        const ret = new Object();
        return ret;
    };
    imports.wbg.__wbg_new_78feb108b6472713 = function() {
        const ret = new Array();
        return ret;
    };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
        const ret = new Error();
        return ret;
    };
    imports.wbg.__wbg_push_737cfc8c1432c2c6 = function(arg0, arg1) {
        const ret = arg0.push(arg1);
        return ret;
    };
    imports.wbg.__wbg_set_bb8cecf6a62b9f46 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(arg0, arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = arg1.stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_3;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('shlesha_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
