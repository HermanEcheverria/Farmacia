const mongoose = require("mongoose");

const layoutSchema = new mongoose.Schema({
  navbarPosition: {
    type: String,
    enum: ["top", "left", "right", "bottom"],
    default: "top"
  },
  sections: {
    type: [String],
    default: ["heroSection", "featuresSection", "footerSection"]
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Layout", layoutSchema);
