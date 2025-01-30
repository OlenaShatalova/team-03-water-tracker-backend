import { Schema, model } from 'mongoose';
import { handleSaveError, setUpdateSettings } from './hooks.js';

const waterSchema = new Schema(
  {
    waterVolume: {
      type: Number,
      required: true,
    },
    dailyNorm: {
      type: Number,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, timestamps: true },
);

waterSchema.post('save', handleSaveError);
waterSchema.pre('findOneAndUpdate', setUpdateSettings);
waterSchema.post('findOneAndUpdate', handleSaveError);

export const WaterCollection = model('water', waterSchema);
