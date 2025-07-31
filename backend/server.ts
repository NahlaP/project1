import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; 
import uploadRoutes from "./routes/upload.routes";

import authRoutes from './routes/auth.routes';
import sectionRoutes from './routes/section.routes';
import topbarRoutes from "./routes/topbar.routes";
import navbarRoutes from './routes/navbar.routes';
import heroRoutes from './routes/hero.routes';
import aboutRoutes from "./routes/about.routes";
import whyChooseUsRoutes from './routes/whyChooseUs.routes';
import serviceRoutes from "./routes/service.routes";
import appointmentRoutes from "./routes/appointment.routes";
import teamRoutes from "./routes/team.routes";
import testimonialRoutes from "./routes/testimonial.routes";
import contactRoutes from './routes/contact.routes';

import pageRoutes from "./routes/page.routes";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("📂 Serving static HTML from:", path.join(__dirname, '..', 'frontend1html'));
app.use('/frontend1html', express.static(path.join(__dirname, '..', 'frontend1html')));

// ✅ Serve uploaded images
// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/upload", uploadRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);
app.use("/api/topbar", topbarRoutes);
app.use("/api/navbar", navbarRoutes);
app.use('/api/hero', heroRoutes);
app.use("/api/about", aboutRoutes);
app.use('/api/whychoose', whyChooseUsRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/testimonial", testimonialRoutes);
app.use('/api/contact-info', contactRoutes);

app.use("/api", pageRoutes);
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('✅ MongoDB connected!');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`✅ Server running at http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
