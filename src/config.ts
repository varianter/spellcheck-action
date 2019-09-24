import * as core from '@actions/core';

interface Config {
  // The language to spellcheck
  language: string;
  // The folder the dictionary is located in
  dictionary_folder: string;
  // These words should not be marked as misspellings
  ignored_words: string[];
  // The main comment
  main_comment: string;
}

export const getConfig = async (): Promise<Config> => {
  let language: string = core.getInput('language')

  if (!language) {
    console.log(
      `Language was not set in input, defaulting to ${
        defaultConfig.language
      }`
    );
    language = defaultConfig.language;
  }

  return {
    language,
    dictionary_folder: getDictionaryFolder(language),
    main_comment: core.getInput('main-comment') || defaultConfig.main_comment,
    ignored_words: getIgnoredWords(core.getInput('ignored-words'))
  };
};

const getDictionaryFolder = (language: string): string => {
  return language == "nb_NO" ? "no" : "en";
}

const getIgnoredWords = (concattedIgnoredWords: string): string[] => {
  return !concattedIgnoredWords ? defaultConfig.ignored_words : concattedIgnoredWords.split(";"); 
}

const defaultConfig: Config = {
  language: "en_US",
  dictionary_folder: "en",
  main_comment: "I found one or more possible misspellings 😇",
  ignored_words: []
};
