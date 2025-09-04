import mongoose, { Document, Schema } from 'mongoose';

export interface IRecord extends Document {
  name: string;
  mac: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecordSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    mac: {
      type: String,
      required: [true, 'MAC address is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^[a-fA-F0-9]{2}([:\-]?[a-fA-F0-9]{2}){5}$/.test(v.replace(/\s+/g, ''));
        },
        message: 'Invalid MAC address format'
      }
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          return v.trim().length >= 6 && v.trim().length <= 20;
        },
        message: 'Phone number must be between 6 and 20 characters'
      }
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
RecordSchema.index({ name: 1 });
RecordSchema.index({ phone: 1 });
RecordSchema.index({ mac: 1 }, { unique: true });

export default mongoose.models.Record || mongoose.model<IRecord>('Record', RecordSchema);
