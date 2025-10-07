// import mongoose, { Document, Model, Schema } from "mongoose";

// export interface IAppointment extends Document {
//   userId: string;
//   templateId: string;
//   title?: string;
//   subtitle?: string;
//   officeAddress?: string;
//   officeTime?: string;
//   backgroundImage?: string;
//   services?: string[];
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// const appointmentSchema = new Schema<IAppointment>(
//   {
//     userId: { type: String, required: true },
//     templateId: { type: String, required: true },
//     title: String,
//     subtitle: String,
//     officeAddress: String,
//     officeTime: String,
//     backgroundImage: String,
//     services: [String],
//   },
//   { timestamps: true }
// );

// const Appointment: Model<IAppointment> =
//   mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", appointmentSchema);

// export default Appointment;











import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAppointment extends Document {
  userId: string;
  templateId: string;
  title?: string;
  subtitle?: string;
  officeAddress?: string;
  officeTime?: string;
  backgroundImage?: string; // S3 key
  services?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    userId: { type: String, required: true, index: true },
    templateId: { type: String, required: true, index: true },
    title: String,
    subtitle: String,
    officeAddress: String,
    officeTime: String,
    backgroundImage: String,
    services: [String],
  },
  { timestamps: true }
);

// Optional: ensure quick lookups per user/template
appointmentSchema.index({ userId: 1, templateId: 1 }, { unique: true });

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", appointmentSchema);

export default Appointment;
