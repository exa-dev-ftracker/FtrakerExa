import { Schema, Types, model, Document } from 'mongoose';


export interface User extends Document {
    name: string;
    email: string;
    token: string[];
    password?: string | null;
    blog: string[] | Types.ObjectId[];
    like: string[] | Types.ObjectId[];
    saveBlog: string[] | Types.ObjectId[];
    phone_number?: string;
    chatbot_enabled: boolean;
    google_id?: string | null;
    google_email?: string | null;
    apple_id?: string | null;
    apple_email?: string | null;
}

const userSchema = new Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    token: [{ type: String }],
    password: { type: String, required: false, default: null },
    phone_number: { type: String, sparse: true },
    chatbot_enabled: { type: Boolean, default: false },
    google_id: { type: String, default: null, sparse: true },
    google_email: { type: String, default: null },
    apple_id: { type: String, default: null, sparse: true },
    apple_email: { type: String, default: null },
});

export default model<User>('User', userSchema);

