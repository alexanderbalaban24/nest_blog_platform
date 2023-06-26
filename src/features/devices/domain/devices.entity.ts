import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

export type DeviceModelType = Model<
  DeviceDocument,
  unknown,
  DeviceInstanceMethodsType
> &
  DeviceStaticMethod;

type DeviceStaticMethod = {
  makeInstance: (
    userId: string,
    ip: string,
    deviceName: string,
    DeviceModel: DeviceModelType,
  ) => DeviceDocument;
};

type DeviceInstanceMethodsType = {
  updateSession: () => void;
};

@Schema()
export class Device {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  deviceName: string;
  @Prop({ default: Date.now })
  issuedAt: Date;

  static makeInstance(
    userId: string,
    ip: string,
    deviceName: string,
    DeviceModel: DeviceModelType,
  ): DeviceDocument {
    return new DeviceModel({ userId, ip, deviceName });
  }

  updateSession() {
    this.issuedAt = new Date();
  }
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

const deviceStaticMethod: DeviceStaticMethod = {
  makeInstance: Device.makeInstance,
};
DeviceSchema.statics = deviceStaticMethod;

const deviceInstanceMethods: DeviceInstanceMethodsType = {
  updateSession: Device.prototype.updateSession,
};
DeviceSchema.methods = deviceInstanceMethods;
