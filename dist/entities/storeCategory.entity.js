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
exports.StoreCategory = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
let StoreCategory = class StoreCategory {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", String)
], StoreCategory.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({
        type: 'varchar',
        unique: true
    }),
    __metadata("design:type", String)
], StoreCategory.prototype, "categoryName", void 0);
__decorate([
    typeorm_1.OneToMany(type => product_entity_1.Product, product => product.storeCategory),
    __metadata("design:type", Array)
], StoreCategory.prototype, "products", void 0);
StoreCategory = __decorate([
    typeorm_1.Entity()
], StoreCategory);
exports.StoreCategory = StoreCategory;
//# sourceMappingURL=storeCategory.entity.js.map