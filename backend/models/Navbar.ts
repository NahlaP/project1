import mongoose from "mongoose";

const NavbarItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  href: { type: String, required: true },         // ✅ use href instead of link
  type: { type: String, default: "link" },         // ✅ optional: link, button, dropdown, etc.
  dropdown: { type: Boolean, default: false },
  children: [
    {
      label: String,
      href: String,
    },
  ],
});

const NavbarSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  templateId: { type: String, required: true },
  items: [NavbarItemSchema],
});

export default mongoose.model("Navbar", NavbarSchema);
