
// import mongoose from "mongoose";

// const whyChooseUsSchema = new mongoose.Schema(
//   {
//     userId: { type: String, required: true },
//     templateId: { type: String, required: true },

//     description: String,
//     stats: [
//       {
//         label: String,
//         value: Number,
//       },
//     ],
//     progressBars: [
//       {
//         label: String,
//         percent: Number,
//       },
//     ],

//     // 👇 NEW
//     bgImageUrl: { type: String, default: "" },
//     bgImageAlt: { type: String, default: "" },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("WhyChooseUs", whyChooseUsSchema);





import mongoose from "mongoose";

const whyChooseUsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },

    description: { type: String, default: "" },

    stats: [
      {
        label: { type: String, default: "" },
        value: { type: Number, default: 0 },
      },
    ],

    progressBars: [
      {
        label: { type: String, default: "" },
        percent: { type: Number, default: 0 },
      },
    ],

    // store the S3 key here
    bgImageUrl: { type: String, default: "" },
    bgImageAlt: { type: String, default: "" },
  },
  { timestamps: true }
);

whyChooseUsSchema.index({ userId: 1, templateId: 1 }, { unique: false });

export default mongoose.model("WhyChooseUs", whyChooseUsSchema);
