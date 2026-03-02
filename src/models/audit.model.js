const mongoose = require('mongoose');

// Schema Validation inside NoSQL for Audit logs
// Embedded document approach for historical integrity
const auditSchema = new mongoose.Schema({
    entity: { type: String, required: true },
    deletedId: { type: String, required: true },
    deletedData: { type: Object, required: true },
    deletedAt: { type: Date, default: Date.now },
    deletedBy: { type: String, default: 'System' }
});

module.exports = mongoose.model('AuditLog', auditSchema);