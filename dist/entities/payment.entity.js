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
const typeorm_1 = require("typeorm");
const booking_entity_1 = require("./booking.entity");
let Payment = class Payment {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Payment.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Payment.prototype, "reference", void 0);
__decorate([
    typeorm_1.Column({
        type: 'varchar'
    }),
    __metadata("design:type", String)
], Payment.prototype, "authorizationUrl", void 0);
__decorate([
    typeorm_1.Column({
        type: 'int'
    }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    typeorm_1.Column({
        type: 'boolean',
        default: false
    }),
    __metadata("design:type", Boolean)
], Payment.prototype, "success", void 0);
__decorate([
    typeorm_1.Column({
        type: 'boolean',
        default: false
    }),
    __metadata("design:type", Boolean)
], Payment.prototype, "verified", void 0);
__decorate([
    typeorm_1.Column({
        type: 'boolean',
        default: false
    }),
    __metadata("design:type", Boolean)
], Payment.prototype, "refundInit", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "bookingId", void 0);
__decorate([
    typeorm_1.OneToOne(type => booking_entity_1.Booking, booking => booking.payment),
    typeorm_1.JoinColumn(),
    __metadata("design:type", booking_entity_1.Booking)
], Payment.prototype, "booking", void 0);
Payment = __decorate([
    typeorm_1.Entity()
], Payment);
exports.Payment = Payment;
//# sourceMappingURL=payment.entity.js.map