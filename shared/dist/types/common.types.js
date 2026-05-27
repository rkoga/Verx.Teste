"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsolidationStatus = exports.TransactionStatus = exports.TransactionType = exports.Failure = exports.Success = void 0;
class Success {
    value;
    isSuccess = true;
    isFailure = false;
    constructor(value) {
        this.value = value;
    }
    static of(value) {
        return new Success(value);
    }
}
exports.Success = Success;
class Failure {
    error;
    isSuccess = false;
    isFailure = true;
    constructor(error) {
        this.error = error;
    }
    static of(error) {
        return new Failure(error);
    }
}
exports.Failure = Failure;
// Enum types
var TransactionType;
(function (TransactionType) {
    TransactionType["CREDIT"] = "CREDIT";
    TransactionType["DEBIT"] = "DEBIT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["ACTIVE"] = "ACTIVE";
    TransactionStatus["CANCELLED"] = "CANCELLED";
    TransactionStatus["CONSOLIDATED"] = "CONSOLIDATED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var ConsolidationStatus;
(function (ConsolidationStatus) {
    ConsolidationStatus["PENDING"] = "PENDING";
    ConsolidationStatus["PROCESSING"] = "PROCESSING";
    ConsolidationStatus["COMPLETED"] = "COMPLETED";
    ConsolidationStatus["FAILED"] = "FAILED";
    ConsolidationStatus["REPROCESSING"] = "REPROCESSING";
})(ConsolidationStatus || (exports.ConsolidationStatus = ConsolidationStatus = {}));
// Made with Bob
//# sourceMappingURL=common.types.js.map