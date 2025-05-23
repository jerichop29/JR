const Project = require('../models/project');
const multer = require('multer');
const path = require('path');

// Configure file upload to disk for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `image-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG and JPEG images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Controller functions
const createProject = async (req, res) => {
  try {
    const project = await Project.create({
      title: req.body.title,
      description: req.body.description,
      image: `/uploads/${req.file.filename}`
    });
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      description: req.body.description
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProjectCount = async (req, res) => {
  try {
    const count = await Project.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  upload,
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectCount
};
