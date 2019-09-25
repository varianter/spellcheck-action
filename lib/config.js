"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
exports.getConfig = () => __awaiter(void 0, void 0, void 0, function* () {
    let language = core.getInput('language');
    if (!language) {
        console.log(`Language was not set in input, defaulting to ${defaultConfig.language}`);
        language = defaultConfig.language;
    }
    return {
        language,
        dictionary_folder: getDictionaryFolder(language),
        main_comment: core.getInput('main-comment') || defaultConfig.main_comment,
        ignored_words: getIgnoredWords(core.getInput('ignored-words'))
    };
});
const getDictionaryFolder = (language) => {
    return language == "nb_NO" ? "no" : "en";
};
const getIgnoredWords = (concattedIgnoredWords) => {
    return !concattedIgnoredWords ? defaultConfig.ignored_words : concattedIgnoredWords.split(";");
};
const defaultConfig = {
    language: "en_US",
    dictionary_folder: "en",
    main_comment: "I found one or more possible misspellings 😇",
    ignored_words: []
};
