// import mongoose from "mongoose";

// const whyChooseUsSchema = new mongoose.Schema(
//   {
//     userId: { type: String, required: true },
//     templateId: { type: String, required: true },
//     title: { type: String, required: true },
//     description: { type: String },
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
//   },
//   { timestamps: true }
// );

// export default mongoose.model("WhyChooseUs", whyChooseUsSchema);
import mongoose from "mongoose";

const whyChooseUsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    templateId: { type: String, required: true },

    description: String,
    stats: [
      {
        label: String,
        value: Number,
      },
    ],
    progressBars: [
      {
        label: String,
        percent: Number,
      },
    ],

    // 👇 NEW
    bgImageUrl: { type: String, default: "" },
    bgImageAlt: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("WhyChooseUs", whyChooseUsSchema);
