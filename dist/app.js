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
// library initializatio
view_service_1.buildViews();
aws_sdk_1.default.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
});
typeorm_1.createConnection().then((connection) => {
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