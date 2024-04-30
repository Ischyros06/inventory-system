const mongoose = require('mongoose');

const changeLogSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: [ 'edited', 'added', 'deducted', 'undid', 'created', 'sent'],
        required: true
    },
    product: {
        type: String,
        required: function() {
            return this.action === 'added' || this.action === 'deducted'|| this.action === 'undid' || this.action === 'created' || this.action === 'edited';
        }
    },
    count: { //this will be used only when the action is manipulated
        type: Number,
        required: function() {
            return this.action === 'added' || this.action === 'deducted'|| this.action === 'undid';
        },
    },
    maxLimit: {
        type: Number,
        required: function() {
            return this.action === 'created' || this.action === 'edited';
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const changeLog = new mongoose.model("ChangeLog", changeLogSchema);

module.exports = { changeLog };
