import Project from '../models/Project.js';

// @desc    Get all active public projects
// @route   GET /api/projects
// @access  Public
export const getProjects = async (req, res, next) => {
  try {
    const { keyword, skill } = req.query;

    const query = { status: 'open', assignmentType: 'public' };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (skill) {
      query.skills = { $in: [skill] };
    }

    const projects = await Project.find(query)
      .populate('postedBy', 'name avatar rating')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('postedBy', 'name avatar rating')
      .populate('assignedTo', 'name avatar rating');

    if (project) {
      res.json(project);
    } else {
      res.status(404);
      throw new Error('Project not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Artist)
export const createProject = async (req, res, next) => {
  try {
    const { title, description, fullDescription, budget, timeline, skills, deliverables, assignmentType } = req.body;

    const project = new Project({
      title,
      description,
      fullDescription,
      budget,
      timeline,
      skills,
      deliverables,
      assignmentType: assignmentType || 'public',
      postedBy: req.user._id,
    });

    const createdProject = await project.save();

    // Notify admin
    // Note for real code: sendEmail here using emailService if needed. For now just placeholder
    
    res.status(201).json(createdProject);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's projects
// @route   GET /api/projects/my
// @access  Private
export const getMyProjects = async (req, res, next) => {
  try {
    let projects = [];
    if (req.user.role === 'artist') {
      projects = await Project.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    } else if (req.user.role === 'provider') {
      projects = await Project.find({ assignedTo: req.user._id }).sort({ createdAt: -1 });
    }

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Artist/Owner)
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      // Check if user is owner
      if (project.postedBy.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this project');
      }

      project.title = req.body.title || project.title;
      project.description = req.body.description || project.description;
      project.fullDescription = req.body.fullDescription || project.fullDescription;
      project.budget = req.body.budget || project.budget;
      project.timeline = req.body.timeline || project.timeline;
      project.skills = req.body.skills || project.skills;
      project.deliverables = req.body.deliverables || project.deliverables;
      project.status = req.body.status || project.status;

      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404);
      throw new Error('Project not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Artist/Owner)
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      if (project.postedBy.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this project');
      }

      await Project.deleteOne({ _id: project._id });
      res.json({ message: 'Project removed' });
    } else {
      res.status(404);
      throw new Error('Project not found');
    }
  } catch (error) {
    next(error);
  }
};
