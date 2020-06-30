"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const cors_1 = __importDefault(require("cors"));
const typeorm_1 = require("typeorm");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const passport_1 = __importDefault(require("passport"));
const route_1 = __importDefault(require("./route"));
const logger_1 = require("./utils/logger");
const view_service_1 = require("./view/view.service");
const jwt_strategy_1 = require("./auth/strategy/jwt.strategy");
const booking_entity_1 = require("./entities/booking.entity");
const cartItem_entity_1 = require("./entities/cartItem.entity");
const payment_entity_1 = require("./entities/payment.entity");
const product_entity_1 = require("./entities/product.entity");
const service_entity_1 = require("./entities/service.entity");
const storeCategory_entity_1 = require("./entities/storeCategory.entity");
const storeTransaction_entity_1 = require("./entities/storeTransaction.entity");
const user_entity_1 = require("./entities/user.entity");
// library initializatio
view_service_1.buildViews();
aws_sdk_1.default.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
});
typeorm_1.createConnection({
    type: 'mysql',
    host: 'localhost',
    username: process.env.NODE_ENV === 'production' ? 'nolarhai_dev' : 'root',
    password: process.env.NODE_ENV === 'production' ? 'neVerland94@' : '',
    database: process.env.NODE_ENV === 'production' ? 'nolarhai_development' : 'nolar_dev',
    port: 3306,
    synchronize: true,
    entities: [booking_entity_1.Booking, cartItem_entity_1.CartItem, payment_entity_1.Payment, product_entity_1.Product, service_entity_1.Service, storeCategory_entity_1.StoreCategory, storeTransaction_entity_1.StoreTransaction, user_entity_1.User]
}).then((connection) => {
    logger_1.logger.info('MYSQL connected');
});
const app = express_1.default();
// Middlewares
app.use(cors_1.default());
app.use(express_1.default.json());
passport_1.default.use(jwt_strategy_1.jwtStrategy);
app.use(passport_1.default.initialize());
// Routes
app.use(express_1.default.static('public'));
app.use('/api', route_1.default);
app.get('/*', (req, res) => {
    res.sendFile(path_1.resolve('public', 'index.html'));
});
app.listen(process.env.PORT);
//# sourceMappingURL=app.js.map