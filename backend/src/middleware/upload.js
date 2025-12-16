import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import env from '../config/env.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration for photos
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(env.upload.uploadDir, 'photos'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Storage configuration for logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(env.upload.uploadDir, 'logos'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `logo-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|svg|heic|heif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, svg, heic, heif)'));
  }
};

// Multer upload configurations
export const uploadPhoto = multer({
  storage: photoStorage,
  limits: {
    fileSize: env.upload.maxFileSize,
  },
  fileFilter: imageFilter,
}).single('photo');

export const uploadLogo = multer({
  storage: logoStorage,
  limits: {
    fileSize: env.upload.maxFileSize,
  },
  fileFilter: imageFilter,
}).single('logo');
