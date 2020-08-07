"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreTransaction = void 0;
const typeorm_1 = require("typeorm");
const cartItem_entity_1 = require("./cartItem.entity");
const payment_entity_1 = require("./payment.entity");
let StoreTransaction = class StoreTransaction {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], StoreTransaction.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], StoreTransaction.prototype, "name", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], StoreTransaction.prototype, "email", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], StoreTransaction.prototype, "amount", void 0);
__decorate([
    typeorm_1.Column({ default: 0 }),
    __metadata("design:type", Number)
], StoreTransaction.prototype, "amountPaid", void 0);
__decorate([
    typeorm_1.Column({ default: 0 }),
    __metadata("design:type", Number)
], StoreTransaction.prototype, "amountRefunded", void 0);
__decorate([
    typeorm_1.Column({ default: null }),
    __metadata("design:type", String)
], StoreTransaction.prototype, "refundStatus", void 0);
__decorate([
    typeorm_1.Column(),
    typeorm_1.Generated('uuid'),
    __metadata("design:type", String)
], StoreTransaction.prototype, "reference", void 0);
__decorate([
    typeorm_1.Column({ default: false }),
    __metadata("design:type", Boolean)
], StoreTransaction.prototype, "paid", void 0);
__decorate([
    typeorm_1.OneToMany(type => cartItem_entity_1.CartItem, cartItem => cartItem.storeTransaction),
    __metadata("design:type", Array)
], StoreTransaction.prototype, "cartItems", void 0);
__decorate([
    typeorm_1.OneToOne(type => payment_entity_1.Payment),
    typeorm_1.JoinColumn(),
    __metadata("design:type", payment_entity_1.Payment)
], StoreTransaction.prototype, "payment", void 0);
StoreTransaction = __decorate([
    typeorm_1.Entity()
], StoreTransaction);
exports.StoreTransaction = StoreTransaction;
//# sourceMappingURL=storeTransaction.entity.js.map