// types/dictionary.ts

import { PartOfSpeech } from ".";

export interface License {
  name: string;
  url: string;
}

export enum AccentType {
  US = "us",
  UK = "uk",
  AU = "au",
}

export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: License;
}

export interface Definition {
  definition: string;
  synonyms: string[];
  antonyms: string[];
  example?: string;
}

export interface Meaning {
  partOfSpeech: PartOfSpeech;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string; // Đôi khi field này có, đôi khi nằm trong mảng phonetics
  phonetics: Phonetic[];
  meanings: Meaning[];
  license: License;
  sourceUrls: string[];
}

export type DictionaryResponse = DictionaryEntry[];

// types/vocabulary.ts

export interface PhoneticData {
  text: string; // Ví dụ: /wɜːd/
  audio?: string; // Link mp3
  accent?: AccentType; // Field mới
}

export interface DefinitionData {
  definition: string;
  example?: string;
}

export interface MeaningData {
  partOfSpeech: PartOfSpeech; // noun, verb...
  definitions: DefinitionData[];
}

export interface WordData {
  word: string;
  phonetics: PhoneticData[];
  meanings: MeaningData[];
}
