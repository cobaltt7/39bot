import mongoose from "mongoose";

const ThirtyNines = new mongoose.Schema({
	guild: String,
	user: String,
	hour: Number,
	seconds: Number,
	missed: Boolean,
});

ThirtyNines.index({ guild: 1, user: 1, hour: 1 }, { unique: true });
export const ThirtyNine = mongoose.model("39", ThirtyNines);
