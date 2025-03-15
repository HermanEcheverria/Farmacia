const mongoose = require("mongoose");

const layoutDraftSchema = new mongoose.Schema({
  navbarPosition: {
    type: String,
    enum: ["top", "left", "right", "bottom"],
    required: true
  },
  sections: {
    type: [String],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"  // Asumiendo que tienes un modelo de Usuario
  },
  moderationComment: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("LayoutDraft", layoutDraftSchema);
