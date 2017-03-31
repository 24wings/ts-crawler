import mongoose = require('mongoose');

var ririluSchema = new mongoose.Schema({
    url: String,
    filename: String,
    success: Boolean
});

export interface IRirilu extends mongoose.Document {
    url: string;
    filename: string;
    succcess: boolean;
}

export var ririluModel = mongoose.model<IRirilu>('Ririlu', ririluSchema);