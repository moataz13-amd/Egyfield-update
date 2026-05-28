const mongoose = require('mongoose');

const localizedStringSchema = {
  en: { type: String, default: '' },
  ar: { type: String, default: '' },
  fr: { type: String, default: '' },
  it: { type: String, default: '' },
  tr: { type: String, default: '' },
};

const aboutContentSchema = new mongoose.Schema(
  {
    // Story section
    storyText1: localizedStringSchema,
    storyText2: localizedStringSchema,
    storyImage: { type: String, default: '' },
    storyBadge: localizedStringSchema,

    // Mission & Vision
    missionText: localizedStringSchema,
    visionText: localizedStringSchema,

    // Timeline events
    timeline: [
      {
        year: { type: String, required: true },
        title: localizedStringSchema,
        description: localizedStringSchema,
      },
    ],

    // Certifications
    certifications: [
      {
        name: { type: String, required: true },
        description: localizedStringSchema,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AboutContent', aboutContentSchema);
