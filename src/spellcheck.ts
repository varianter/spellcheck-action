const { Spellchecker, ALWAYS_USE_HUNSPELL } = require("spellchecker");

export interface Mispelled {
  text: string;
  start: number;
  end: number;
}

export default function initSpellchecker(
  language: string,
  dictionaryFolder: string,
  ignoredWords: string[]
) {
  const spellchecker = new Spellchecker();
  spellchecker.setSpellcheckerType(ALWAYS_USE_HUNSPELL);
  const subfolder = sanitizeDictionaryFolder(dictionaryFolder, language);
  spellchecker.setDictionary(language, `dictionaries/${subfolder}`);
  console.log(language, ":", subfolder, ":", ignoredWords)
  console.log(__dirname)
  ignoredWords = ignoredWords.map(t => t.toLowerCase());

  return function spellcheck(fullText: string): Array<Mispelled> {
    const result = spellchecker.checkSpelling(fullText);
    const mispellings = [] as Array<Mispelled>;
    for (let a = 0; a < result.length; a++) {
      const { start, end } = result[a];
      const text = fullText.substring(start, end);
      if (!ignoredWords.includes(text.toLowerCase())) {
        mispellings.push({ text, start, end });
      }
    }
    return mispellings;
  };
}

function sanitizeDictionaryFolder(
  dictionaryFolder: string,
  language: string
): string {
  if (!dictionaryFolder || dictionaryFolder.length == 0) {
    // Attempt to split and use first part of language
    return language.split("_")[0];
  }

  return dictionaryFolder;
}
