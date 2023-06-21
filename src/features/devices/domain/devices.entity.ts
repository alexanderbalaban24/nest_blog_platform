import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

export type DeviceModelType = Model<DeviceDocument> & DeviceStaticMethod;

type DeviceStaticMethod = {
  makeInstance: (
    userId: Types.ObjectId,
    ip: string,
    deviceName: string,
    DeviceModel: DeviceModelType,
  ) => DeviceDocument;
};

@Schema()
export class Device {
  @Prop({ required: true })
  userId: Types.ObjectId;
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  deviceName: string;
  @Prop({ default: Date.now })
  issuedAt: Date;

  static makeInstance(
    userId: Types.ObjectId,
    ip: string,
    deviceName: string,
    DeviceModel: DeviceModelType,
  ): DeviceDocument {
    return new DeviceModel({ userId, ip, deviceName });
  }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

const deviceStaticMethod: DeviceStaticMethod = {
  makeInstance: Device.makeInstance,
};
DeviceSchema.statics = deviceStaticMethod;
