import { Document, model, Schema, Types } from 'mongoose';

export interface ResetToken extends Document {
    id_user: string | Types.ObjectId;
    token: string;
    createdAt: Date;
    expireAt: Date;
    isUsed: boolean;
}

const resetTokenSchema = new Schema<ResetToken>({
    id_user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '1d' }, // Otomatis hapus riwayat setelah 1 hari
    expireAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false }
});

export default model<ResetToken>('ResetToken', resetTokenSchema);
