export interface VocabFieldsConfig {
  meaning: boolean;
  partOfSpeech: boolean;
  wordTypes: boolean;
  phonetics: boolean;
  topic: boolean;
  note: boolean;
  image: boolean;
}

export const DEFAULT_VOCAB_FIELDS_CONFIG: VocabFieldsConfig = {
  meaning: true,
  partOfSpeech: true,
  phonetics: true,
  note: true,
  wordTypes: false,
  topic: false,
  image: false,
};

export const VOCAB_FIELD_KEYS: (keyof VocabFieldsConfig)[] = [
  "meaning",
  "partOfSpeech",
  "wordTypes",
  "phonetics",
  "topic",
  "note",
  "image",
];
