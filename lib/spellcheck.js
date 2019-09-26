"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Spellchecker, ALWAYS_USE_HUNSPELL } = require("spellchecker");
function initSpellchecker(language, dictionaryFolder, ignoredWords) {
    const spellchecker = new Spellchecker();
    spellchecker.setSpellcheckerType(ALWAYS_USE_HUNSPELL);
    const subfolder = sanitizeDictionaryFolder(dictionaryFolder, language);
    spellchecker.setDictionary(language, `dictionaries/${subfolder}`);
    console.log(language, ":", subfolder, ":", ignoredWords);
    console.log(__dirname);
    ignoredWords = ignoredWords.map(t => t.toLowerCase());
    return function spellcheck(fullText) {
        const result = spellchecker.checkSpelling(fullText);
        const mispellings = [];
        for (let a = 0; a < result.length; a++) {
            const { start, end } = result[a];
            const text = fullText.substring(start, end);
            console.log("Added line: ", text)
            if (!ignoredWords.includes(text.toLowerCase())) {
                mispellings.push({ text, start, end });
            }
        }
        return mispellings;
    };
}
exports.default = initSpellchecker;
function sanitizeDictionaryFolder(dictionaryFolder, language) {
    if (!dictionaryFolder || dictionaryFolder.length == 0) {
        // Attempt to split and use first part of language
        return language.split("_")[0];
    }
    return dictionaryFolder;
}
