"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importStar(require("multer"));
exports.imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
};
exports.multerStorage = multer_1.diskStorage({
    destination: './public/images',
    filename: (req, file, cb) => {
        const fileName = file.originalname.split('.');
        const extension = fileName[fileName.length - 1];
        const oldFileNameModified = fileName[0].length > 10 ? fileName[0].substr(0, 10) : fileName[0];
        const newFileName = Array(16)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
        cb(null, `${oldFileNameModified}-${newFileName}.${extension}`);
    }
});
exports.upload = multer_1.default({
    storage: exports.multerStorage,
    fileFilter: exports.imageFileFilter
});
//# sourceMappingURL=multer.js.map