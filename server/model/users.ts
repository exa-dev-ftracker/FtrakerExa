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
}

const userSchema = new Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    token: [{ type: String }],
    password: { type: String, required: false, default: null },
    phone_number: { type: String, sparse: true },
    chatbot_enabled: { type: Boolean, default: false },
});

export default model<User>('User', userSchema);

