const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more tan 50 characters"],
    },

    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    district: {
      type: String,
      required: [true, "Please add a district"],
    },
    province: {
      type: String,
      required: [true, "Please add a province"],
    },
    postalcode: {
      type: String,
      required: [true, "Please add a postalcode"],
      maxlength: [5, "Postal Code can not be more than 5 digits"],
    },
    tel: {
      type: String,
    },
    availabletime: {
      type: Object,
      required: [true, "Please add restaurant's available times"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* Cascade delete appointments when a restaurant is deleted */
RestaurantSchema.pre("remove", async function (next) {
  console.log(`Appointments being removed from restaurants ${this._id}`);
  await this.model("Appointment").deleteMany({ restaurant: this._id });
  next();
});

/* Reverse populate with virtuals */
RestaurantSchema.virtual("appointments", {
  ref: "Appointment",
  localField: `_id`,
  foreignField: "restaurant",
  justOne: false,
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
