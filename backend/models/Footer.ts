import mongoose, { Schema } from 'mongoose';

const footerSchema = new Schema(
  {
    userId:     { type: String, required: true },  // <-- no index: true here
    templateId: { type: String, required: true },  // <-- no index: true here

    topSubtitle: { type: String, default: 'we would love to hear from you.' },
    emailLabel:  { type: String, default: 'hello@Bayone.com' },
    emailHref:   { type: String, default: 'mailto:hello@bayone.com' },

    logoUrl:     { type: String, default: 'assets/imgs/logo-light.png' },

    social: [{ label: String, href: String }],

    officeAddress: String,
    officePhone: String,
    officePhoneHref: String,

    links: [{ label: String, href: String }],

    copyrightHtml: {
      type: String,
      default:
        '© 2023 Bayone is Proudly Powered by <span class="underline"><a href="https://themeforest.net/user/ui-themez" target="_blank">Ui-ThemeZ</a></span>'
    }
  },
  { timestamps: true, minimize: false }
);

// single compound unique index (no duplicates)
footerSchema.index({ userId: 1, templateId: 1 }, { unique: true });

export default mongoose.models.Footer || mongoose.model('Footer', footerSchema);
