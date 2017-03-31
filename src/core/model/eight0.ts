import mongoose = require('mongoose');

var eight0Schema = new mongoose.Schema({
    url: String,
    filename: String,
    success: Boolean
});

export interface IEight0 extends mongoose.Document {
    url: string;
    filename: string;
    succcess: boolean;
}

export var eight0Model = mongoose.model<IEight0>('Eight0', eight0Schema);